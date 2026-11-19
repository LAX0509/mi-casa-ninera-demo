import { CAREGIVERS, PARENT, type Caregiver, type ChildProfile, type Specialty } from "./data";
import { distanceMeters } from "./geo";

export function neededSpecialties(child: ChildProfile): Specialty[] {
  const needs = new Set<Specialty>();
  if (child.age <= 7) needs.add("Educación Infantil");
  if (child.allergies.trim() && !/ningun|no tiene|n\/a/i.test(child.allergies)) needs.add("Primeros Auxilios");
  if (child.pedagogy.includes("Refuerzo de matemáticas") || /matem/i.test(child.recommendations)) needs.add("Tutoría de Matemáticas");
  return [...needs];
}

/** Algoritmo de Matchmaking: compatibilidad por necesidades del niño + cercanía + reputación. */
export function matchScore(c: Caregiver, child: ChildProfile) {
  const needs = neededSpecialties(child);
  const fit = needs.length ? c.specialties.filter((s) => needs.includes(s)).length / needs.length : 0.5;
  const km = distanceMeters(c.base, PARENT.home) / 1000;
  const near = Math.max(0, 1 - km / 12);
  const rep = (c.rating - 4.5) / 0.5;
  const score = 0.55 * fit + 0.25 * near + 0.2 * rep;
  return Math.round(68 + score * 31);
}

export function topMatches(child: ChildProfile, n = 3) {
  return CAREGIVERS.map((c) => ({ c, score: matchScore(c, child) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n);
}

export function kmFromHome(c: Caregiver) {
  return distanceMeters(c.base, PARENT.home) / 1000;
}
