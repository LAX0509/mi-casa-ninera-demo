export type Specialty = "Educación Infantil" | "Primeros Auxilios" | "Tutoría de Matemáticas";
export const SPECIALTIES: Specialty[] = ["Educación Infantil", "Primeros Auxilios", "Tutoría de Matemáticas"];

export type LatLng = [number, number];

export interface Review {
  author: string;
  rating: number;
  text: string;
  date: string;
}

export interface Caregiver {
  id: string;
  name: string;
  title: string;
  photo: string;
  specialties: Specialty[];
  years: number;
  rating: number;
  reviewsCount: number;
  services: number;
  hourlyRate: number;
  zone: string;
  base: LatLng;
  languages: string[];
  ageRange: string;
  bio: string;
  certifications: string[];
  reviews: Review[];
  phone: string;
}

const u = (id: string, w = 400) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${w}&q=80`;

export const CAREGIVERS: Caregiver[] = [
  {
    id: "c1",
    name: "Valentina Ríos",
    title: "Licenciada en Educación Infantil",
    photo: u("photo-1494790108377-be9c29b29330"),
    specialties: ["Educación Infantil", "Primeros Auxilios"],
    years: 6,
    rating: 4.9,
    reviewsCount: 128,
    services: 412,
    hourlyRate: 32000,
    zone: "El Poblado",
    base: [6.221, -75.576],
    languages: ["Español", "Inglés B2"],
    ageRange: "0 – 8 años",
    bio: "Apasionada por la estimulación temprana y el juego como herramienta de aprendizaje. Trabajo con rutinas claras, lectura en voz alta y actividades sensoriales.",
    certifications: ["Licenciatura U. de Antioquia", "Primeros Auxilios Pediátricos – Cruz Roja", "Antecedentes verificados 2026"],
    reviews: [
      { author: "Laura G.", rating: 5, text: "Sofía la adora. Puntual, cariñosa y siempre nos manda fotos y la bitácora al final.", date: "Sep 2026" },
      { author: "Felipe M.", rating: 5, text: "Excelente manejo de rutinas de sueño. Muy profesional.", date: "Ago 2026" },
      { author: "Catalina P.", rating: 4.8, text: "Muy creativa con las actividades, mis hijos aprendieron canciones en inglés.", date: "Jul 2026" },
    ],
    phone: "+57 300 555 0101",
  },
  {
    id: "c2",
    name: "Camila Restrepo",
    title: "Enfermera Pediátrica",
    photo: u("photo-1438761681033-6461ffad8d80"),
    specialties: ["Primeros Auxilios", "Educación Infantil"],
    years: 8,
    rating: 4.95,
    reviewsCount: 203,
    services: 580,
    hourlyRate: 38000,
    zone: "Laureles",
    base: [6.2447, -75.597],
    languages: ["Español"],
    ageRange: "0 – 5 años",
    bio: "Enfermera con experiencia en UCI neonatal. Ideal para bebés, niños con alergias severas o necesidades médicas especiales.",
    certifications: ["Enfermería – U. CES", "Soporte Vital Pediátrico (PALS)", "Manejo de anafilaxia"],
    reviews: [
      { author: "Andrea V.", rating: 5, text: "Mi hijo tiene alergia al maní y con Camila estamos 100% tranquilos.", date: "Sep 2026" },
      { author: "Juan D.", rating: 5, text: "Súper profesional, nos enseñó a manejar los cólicos del bebé.", date: "Ago 2026" },
    ],
    phone: "+57 300 555 0102",
  },
  {
    id: "c3",
    name: "Andrés Montoya",
    title: "Licenciado en Matemáticas",
    photo: u("photo-1507003211169-0a1dd7228f2d"),
    specialties: ["Tutoría de Matemáticas"],
    years: 5,
    rating: 4.85,
    reviewsCount: 96,
    services: 301,
    hourlyRate: 40000,
    zone: "Envigado",
    base: [6.1719, -75.5866],
    languages: ["Español", "Inglés C1"],
    ageRange: "7 – 16 años",
    bio: "Hago que las matemáticas sean divertidas con retos, juegos de lógica y material concreto. Preparación para pruebas Saber y olimpiadas.",
    certifications: ["Lic. Matemáticas – U. de Medellín", "Metodología Singapur", "Antecedentes verificados 2026"],
    reviews: [
      { author: "Mónica R.", rating: 5, text: "Mi hija pasó de 3.2 a 4.5 en matemáticas en un semestre.", date: "Sep 2026" },
      { author: "Esteban L.", rating: 4.7, text: "Paciente y muy claro explicando fracciones.", date: "Jun 2026" },
    ],
    phone: "+57 300 555 0103",
  },
  {
    id: "c4",
    name: "Mariana Ochoa",
    title: "Psicopedagoga",
    photo: u("photo-1544005313-94ddf0286df2"),
    specialties: ["Educación Infantil"],
    years: 7,
    rating: 4.9,
    reviewsCount: 141,
    services: 455,
    hourlyRate: 36000,
    zone: "Belén",
    base: [6.231, -75.603],
    languages: ["Español", "Lengua de señas"],
    ageRange: "3 – 10 años",
    bio: "Acompaño procesos de lectoescritura, manejo emocional y hábitos de estudio. Experiencia con niños con TDAH.",
    certifications: ["Psicopedagogía – U. Pontificia Bolivariana", "Disciplina Positiva", "Primeros Auxilios básicos"],
    reviews: [
      { author: "Natalia S.", rating: 5, text: "Nos ayudó muchísimo con las rabietas y las rutinas de tareas.", date: "Ago 2026" },
    ],
    phone: "+57 300 555 0104",
  },
  {
    id: "c5",
    name: "Santiago Vélez",
    title: "Ingeniero y Tutor STEM",
    photo: u("photo-1500648767791-00dcc994a43e"),
    specialties: ["Tutoría de Matemáticas"],
    years: 4,
    rating: 4.8,
    reviewsCount: 74,
    services: 210,
    hourlyRate: 42000,
    zone: "Sabaneta",
    base: [6.1515, -75.6166],
    languages: ["Español", "Inglés C1"],
    ageRange: "10 – 17 años",
    bio: "Tutorías de álgebra, física y robótica básica. Enfoque práctico con proyectos y simulaciones.",
    certifications: ["Ing. Mecatrónica – EIA", "Instructor de robótica educativa"],
    reviews: [{ author: "Diana C.", rating: 4.8, text: "Mi hijo ahora ama la física. Muy recomendado.", date: "Sep 2026" }],
    phone: "+57 300 555 0105",
  },
  {
    id: "c6",
    name: "Daniela Cardona",
    title: "Auxiliar de Enfermería y Niñera",
    photo: u("photo-1534528741775-53994a69daeb"),
    specialties: ["Primeros Auxilios", "Educación Infantil"],
    years: 9,
    rating: 4.92,
    reviewsCount: 176,
    services: 640,
    hourlyRate: 34000,
    zone: "Envigado",
    base: [6.175, -75.59],
    languages: ["Español"],
    ageRange: "0 – 10 años",
    bio: "Más de 9 años cuidando niños. Experta en primeros auxilios, alimentación complementaria y cuidado nocturno.",
    certifications: ["Auxiliar de Enfermería – SENA", "Primeros Auxilios Pediátricos – Cruz Roja", "Manipulación de alimentos"],
    reviews: [{ author: "Pablo Q.", rating: 5, text: "Confianza total. Llevamos 2 años con ella.", date: "Sep 2026" }],
    phone: "+57 300 555 0106",
  },
  {
    id: "c7",
    name: "Juliana Zapata",
    title: "Docente Bilingüe",
    photo: u("photo-1517841905240-472988babdf9"),
    specialties: ["Educación Infantil", "Tutoría de Matemáticas"],
    years: 5,
    rating: 4.88,
    reviewsCount: 89,
    services: 260,
    hourlyRate: 37000,
    zone: "Laureles",
    base: [6.248, -75.59],
    languages: ["Español", "Inglés C2", "Francés B1"],
    ageRange: "4 – 12 años",
    bio: "Docente de primaria bilingüe. Combino apoyo en tareas, matemáticas y conversación en inglés.",
    certifications: ["Lic. en Lenguas – EAFIT", "TKT Cambridge", "Antecedentes verificados 2026"],
    reviews: [{ author: "Sara M.", rating: 4.9, text: "Hace las tareas en inglés súper divertidas.", date: "Ago 2026" }],
    phone: "+57 300 555 0107",
  },
  {
    id: "c8",
    name: "Isabela Arango",
    title: "Tecnóloga en Atención a la Primera Infancia",
    photo: u("photo-1580489944761-15a19d654956"),
    specialties: ["Primeros Auxilios", "Educación Infantil"],
    years: 3,
    rating: 4.75,
    reviewsCount: 52,
    services: 148,
    hourlyRate: 28000,
    zone: "Ciudad del Río",
    base: [6.2236, -75.5745],
    languages: ["Español"],
    ageRange: "1 – 6 años",
    bio: "Juegos sensoriales, arte y música para los más pequeños. Disponibilidad nocturna y fines de semana.",
    certifications: ["Tecnología en Primera Infancia – SENA", "Primeros Auxilios – Cruz Roja"],
    reviews: [{ author: "Valeria T.", rating: 4.7, text: "Muy dulce con mi bebé de 18 meses.", date: "Jul 2026" }],
    phone: "+57 300 555 0108",
  },
];

export const getCaregiver = (id: string) => CAREGIVERS.find((c) => c.id === id) ?? CAREGIVERS[0];

export const PARENT = {
  name: "Laura Gómez",
  phone: "+57 310 555 2233",
  address: "Cra. 43A #7-50, El Poblado",
  home: [6.2088, -75.5682] as LatLng,
};

export interface ChildProfile {
  name: string;
  age: number;
  allergies: string;
  likes: string;
  routines: string;
  recommendations: string;
  pedagogy: string[];
  emergencyContact: string;
}

export const DEFAULT_CHILD: ChildProfile = {
  name: "Sofía",
  age: 6,
  allergies: "Maní y frutos secos (tiene EpiPen en el cajón de la cocina)",
  likes: "Dinosaurios, pintar con acuarelas, canciones en inglés",
  routines: "Merienda 4:00 p.m. · Tareas 4:30 p.m. · Baño 6:30 p.m. · Dormir 8:00 p.m.",
  recommendations: "Máximo 30 min de pantallas. Le cuesta concentrarse en matemáticas: usar juegos.",
  pedagogy: ["Juego guiado", "Refuerzo de matemáticas", "Bilingüismo"],
  emergencyContact: "Carlos Gómez (papá) · +57 311 555 8899",
};

export const PEDAGOGY_OPTIONS = [
  "Juego guiado",
  "Refuerzo de matemáticas",
  "Lectoescritura",
  "Bilingüismo",
  "Arte y música",
  "Motricidad",
  "Manejo emocional",
];

export const SERVICE_TYPES = [
  { id: "cuidado", label: "Cuidado Infantil", price: 30000, desc: "Cuidado en casa con actividades pedagógicas" },
  { id: "tutoria", label: "Tutoría Académica", price: 40000, desc: "Refuerzo escolar personalizado" },
  { id: "nocturno", label: "Cuidado Nocturno", price: 36000, desc: "Para salidas, eventos o turnos de noche" },
] as const;

export const KID_PHOTOS = [
  u("photo-1503454537195-1dcabb73ffb9", 600),
  u("photo-1587654780291-39c9404d746b", 600),
  u("photo-1596464716127-f2a82984de30", 600),
  u("photo-1515488042361-ee00e0ddd4e4", 600),
];

export const HERO_PHOTO = u("photo-1503454537195-1dcabb73ffb9", 1000);

/** Servicios de otras familias para poblar la torre de control. */
export interface ExternalService {
  id: string;
  caregiverId: string;
  family: string;
  child: string;
  type: string;
  zone: string;
  center: LatLng;
  startedMinAgo: number;
  hours: number;
  price: number;
}

export const EXTERNAL_SERVICES: ExternalService[] = [
  { id: "x1", caregiverId: "c6", family: "Familia Restrepo", child: "Tomás (4)", type: "Cuidado Infantil", zone: "Envigado", center: [6.1695, -75.5832], startedMinAgo: 95, hours: 4, price: 136000 },
  { id: "x2", caregiverId: "c3", family: "Familia Henao", child: "Mateo (11)", type: "Tutoría Académica", zone: "Envigado", center: [6.1765, -75.5925], startedMinAgo: 40, hours: 2, price: 80000 },
  { id: "x3", caregiverId: "c2", family: "Familia Uribe", child: "Emma (1)", type: "Cuidado Infantil", zone: "Laureles", center: [6.2465, -75.5935], startedMinAgo: 150, hours: 6, price: 228000 },
  { id: "x4", caregiverId: "c5", family: "Familia Posada", child: "Simón (14)", type: "Tutoría Académica", zone: "Sabaneta", center: [6.1528, -75.6125], startedMinAgo: 20, hours: 2, price: 84000 },
];

export const MEDELLIN_CENTER: LatLng = [6.2, -75.585];

export const AGENCY = {
  name: "Mi Casa Niñera",
  tagline: "Cuidado y tutoría infantil con tranquilidad en tiempo real",
  whatsapp: "+57 300 555 0000",
  city: "Medellín, Colombia",
};
