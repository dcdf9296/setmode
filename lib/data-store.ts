// Helper to generate unique IDs
export const generateId = (): string => {
  // Works in both Node (web crypto) and browser; fallback if unavailable
  const g = (globalThis as any)?.crypto
  if (g?.randomUUID) return g.randomUUID()
  // Simple fallback, not cryptographically secure
  return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36)
}

// --- Interfaces ---
export interface Talent {
  id: string
  slug: string
  name: string
  role: string // e.g., "Hair Stylist", "Makeup Artist", "Photographer"
  location: string // e.g., "Milan", "Paris", "London"
  rate: number
  rating: number
  avatar: string
  bio: string
  skills: string[]
  languages: string[]
  experience: string
  verified: boolean
  certifications: string[]
  portfolio: PortfolioItem[]
  cv: CVItem[]
  contactInfo: {
    email: string
    phone: string
    instagram: string
  }
  availability: {
    startDate: string
    endDate: string
  }
}

export interface PortfolioItem {
  id: string
  title: string
  description: string
  thumbnailUrl: string
  category: string // e.g., "Editorial", "Runway", "Bridal"
  date: string // YYYY-MM-DD
  type: "single" | "carousel"
  imageUrls: string[]
  year: string
  role: string
}

export interface CVItem {
  id: string
  year: string
  project: string
  role: string
  producer: string
}

export interface JobRole {
  id: string
  role: string // e.g., "hair-stylist", "makeup-artist"
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
  budget: number // numeric value per day
}

export interface Job {
  id: string
  title: string
  description: string
  location: string
  createdAt: string // YYYY-MM-DD
  roles: JobRole[]
  hirerId: string
  invitedTalentIds?: string[]
  status?: "active" | "inactive" | "completed"
}

export interface Application {
  id: string
  jobId: string
  talentId: string
  roleId: string
  status: "applied" | "confirmed" | "rejected"
  createdAt: string // YYYY-MM-DD
}

export interface Invitation {
  id: string
  jobId: string
  talentId: string
  roleId: string
  status: "pending" | "accepted" | "declined"
  comment?: string
  createdAt: string // YYYY-MM-DD
}

export interface ChatMessage {
  id: string
  chatId: string
  senderId: string // talentId or hirerId
  text: string
  timestamp: string // ISO string
}

export interface Chat {
  id: string
  participantIds: string[] // [talentId, hirerId]
  jobId?: string
  messages: ChatMessage[]
  lastMessageAt: string
}

export interface TalentList {
  id: string
  name: string
  description: string
  talentIds: string[]
  createdAt: string
}

export interface Hirer {
  id: string
  name: string
  avatar: string
  company: string
  location: string
}

export interface HirerList {
  id: string
  name: string
  hirerIds: string[]
}

// --- Mock Data ---

const talents: Talent[] = [
  {
    id: "1",
    slug: "vittoria-rossi",
    name: "Vittoria Rossi",
    role: "Hair Stylist",
    location: "Milan, Italy",
    rate: 350,
    rating: 4.9,
    avatar: "/images/avatars/vittoria-avatar.png",
    bio: "Award-winning hair stylist with over 10 years of experience in high-fashion editorials and runway shows. Specializes in avant-garde and intricate styling.",
    skills: ["Avant-garde Styling", "Editorial Hair", "Runway Hair", "Braiding", "Extensions"],
    languages: ["Italian", "English"],
    experience: "10 years",
    verified: true,
    certifications: [
      "Advanced Hair Styling - Milan Beauty Academy",
      "Color Specialist Certification",
      "Editorial Styling Masterclass",
    ],
    portfolio: [
      {
        id: "p1",
        title: "Photoshooting Gucci",
        description: "Hair styling for Gucci's latest fragrance campaign, featuring floral and ethereal looks.",
        imageUrls: [
          "/images/portfolio/gucci-bloom-hairstylist.png",
          "/images/portfolio/vintage-glamour-hairstylist.png",
          "/images/portfolio/avant-garde-hairshow.png",
          "/images/portfolio/editorial-beauty-shot.png",
          "/images/portfolio/bridal-hairstyling-session.png",
        ],
        thumbnailUrl: "/images/portfolio/thumbnails/gucci-bloom-thumb.png",
        category: "Editorial",
        date: "2025-03-10",
        type: "carousel",
        year: "2025",
        role: "Hair Stylist",
      },
      {
        id: "p2",
        title: "Vogue Italia Editorial",
        description: "Created dramatic and sculptural hairstyles for a conceptual spread in Vogue Italia.",
        imageUrls: ["/images/portfolio/vogue-italia-makeup.png"],
        thumbnailUrl: "/images/portfolio/thumbnails/vogue-italia-makeup-thumb.png",
        category: "Editorial",
        date: "2023-11-20",
        type: "single",
        year: "2023",
        role: "Hair Stylist",
      },
      {
        id: "p3",
        title: "Avant-Garde Hair Show",
        description: "Lead stylist for a futuristic hair show, pushing boundaries with innovative designs.",
        imageUrls: ["/images/portfolio/avant-garde-hairshow.png"],
        thumbnailUrl: "/images/portfolio/thumbnails/avant-garde-hairshow-thumb.png",
        category: "Runway",
        date: "2024-01-05",
        type: "single",
        year: "2024",
        role: "Lead Stylist",
      },
    ],
    cv: [
      {
        id: "cv1",
        year: "2024",
        project: "Here After - L'aldilà",
        role: "Hair Stylist",
        producer: "Netflix Studios",
      },
      { id: "cv2", year: "2024", project: "Fashion Week Milano", role: "Lead Stylist", producer: "Versace" },
      { id: "cv3", year: "2024", project: "Versace Campaign", role: "Hair Stylist", producer: "Versace" },
      { id: "cv4", year: "2023", project: "Vogue Photoshoot", role: "Hair Stylist", producer: "Condé Nast" },
    ],
    contactInfo: {
      email: "vittoria.rossi@example.com",
      phone: "+39 333 1234567",
      instagram: "@vittoria_hair",
    },
    availability: { startDate: "2025-07-15", endDate: "2025-08-30" },
  },
  {
    id: "2",
    slug: "lucia-bianchi",
    name: "Lucia Bianchi",
    role: "Makeup Artist",
    location: "Rome, Italy",
    rate: 300,
    rating: 4.7,
    avatar: "/images/avatars/lucia-avatar.png",
    bio: "Creative makeup artist specializing in natural beauty and special effects for film and fashion.",
    skills: ["Natural Makeup", "SFX Makeup", "Bridal Makeup", "Airbrushing", "Prosthetics"],
    languages: ["Italian", "English", "Spanish"],
    experience: "8 years",
    verified: true,
    certifications: ["Professional Makeup Artistry - Rome Beauty Institute", "SFX Makeup Masterclass"],
    portfolio: [
      {
        id: "p4",
        title: "Milan Fashion Week",
        description:
          "Key makeup artist for several designers at Milan Fashion Week, focusing on bold and artistic looks.",
        imageUrls: ["/images/portfolio/milan-fashion-week-hair-makeup.png"],
        thumbnailUrl: "/images/portfolio/thumbnails/milan-fashion-week-thumb.png",
        category: "Runway",
        date: "2024-02-28",
        type: "single",
        year: "2024",
        role: "Key Makeup Artist",
      },
      {
        id: "p5",
        title: "Vintage Glamour Shoot",
        description: "Recreated classic Hollywood glamour for a vintage-themed editorial photoshoot.",
        imageUrls: ["/images/portfolio/vintage-glamour-hairstylist.png"],
        thumbnailUrl: "/images/portfolio/thumbnails/vintage-glamour-thumb.png",
        category: "Editorial",
        date: "2023-10-15",
        type: "single",
        year: "2023",
        role: "Hair Stylist",
      },
    ],
    cv: [],
    contactInfo: {
      email: "lucia.bianchi@example.com",
      phone: "+39 339 9876543",
      instagram: "@lucia_mua",
    },
    availability: { startDate: "2025-07-20", endDate: "2025-09-10" },
  },
  {
    id: "3",
    slug: "marco-ricci",
    name: "Marco Ricci",
    role: "Photographer",
    location: "Florence, Italy",
    rate: 500,
    rating: 4.9,
    avatar: "/placeholder.svg?height=100&width=100",
    bio: "Fashion photographer known for capturing raw emotion and dynamic movement. Extensive experience with international campaigns.",
    skills: ["Fashion Photography", "Portrait Photography", "Studio Lighting", "Post-production"],
    languages: ["Italian", "English", "French"],
    experience: "12 years",
    verified: true,
    certifications: ["Fashion Photography Certification", "Advanced Studio Lighting Techniques"],
    portfolio: [
      {
        id: "p6",
        title: "Artistic Makeup Portrait Series",
        description: "A series of striking portraits showcasing intricate makeup artistry.",
        imageUrls: ["/images/portfolio/artistic-makeup-portrait-series.png"],
        thumbnailUrl: "/images/portfolio/thumbnails/artistic-makeup-thumb.png",
        category: "Portrait",
        date: "2024-04-01",
        type: "single",
        year: "2024",
        role: "Photographer",
      },
    ],
    cv: [],
    contactInfo: {
      email: "marco.ricci@example.com",
      phone: "+39 347 1122334",
      instagram: "@marcoricci_photo",
    },
    availability: { startDate: "2025-08-01", endDate: "2025-09-20" },
  },
  {
    id: "4",
    slug: "sofia-moretti",
    name: "Sofia Moretti",
    role: "Hair Stylist",
    location: "Milan, Italy",
    rate: 320,
    rating: 4.6,
    avatar: "/placeholder.svg?height=100&width=100",
    bio: "Versatile hair stylist with a passion for creating elegant and modern looks for editorial and commercial projects.",
    skills: ["Modern Styling", "Updos", "Coloring", "Hair Treatments"],
    languages: ["Italian", "English"],
    experience: "7 years",
    verified: true,
    certifications: ["Advanced Hair Cutting Techniques", "Color Expertise Certification"],
    portfolio: [
      {
        id: "p7",
        title: "Editorial Beauty Shot",
        description: "Clean and sophisticated hair styling for a beauty editorial.",
        imageUrls: ["/images/portfolio/editorial-beauty-shot.png"],
        thumbnailUrl: "/images/portfolio/thumbnails/editorial-beauty-thumb.png",
        category: "Editorial",
        date: "2024-05-01",
        type: "single",
        year: "2024",
        role: "Hair Stylist",
      },
    ],
    cv: [],
    contactInfo: {
      email: "sofia.moretti@example.com",
      phone: "+39 338 5566778",
      instagram: "@sofia_hairart",
    },
    availability: { startDate: "2025-07-10", endDate: "2025-08-25" },
  },
  {
    id: "5",
    slug: "giovanni-leone",
    name: "Giovanni Leone",
    role: "Makeup Artist",
    location: "Milan, Italy",
    rate: 280,
    rating: 4.5,
    avatar: "/placeholder.svg?height=100&width=100",
    bio: "Emerging makeup artist with a fresh perspective on contemporary beauty. Strong portfolio in fashion and bridal.",
    skills: ["Contemporary Makeup", "Bridal Makeup", "Fashion Makeup", "Skincare Prep"],
    languages: ["Italian", "English"],
    experience: "4 years",
    verified: false,
    certifications: ["Basic Makeup Artistry Certification", "Bridal Makeup Workshop"],
    portfolio: [
      {
        id: "p8",
        title: "Bridal Hairstyling Session",
        description: "Elegant and timeless bridal makeup for a summer wedding.",
        imageUrls: ["/images/portfolio/bridal-hairstyling-session.png"],
        thumbnailUrl: "/images/portfolio/thumbnails/bridal-hairstyling-thumb.png",
        category: "Bridal",
        date: "2024-06-01",
        type: "single",
        year: "2024",
        role: "Makeup Artist",
      },
    ],
    cv: [],
    contactInfo: {
      email: "giovanni.leone@example.com",
      phone: "+39 340 9988776",
      instagram: "@giovanni_mua",
    },
    availability: { startDate: "2025-07-01", endDate: "2025-08-15" },
  },
  {
    id: "6",
    slug: "chiara-romano",
    name: "Chiara Romano",
    role: "Photographer",
    location: "Milan, Italy",
    rate: 480,
    rating: 4.8,
    avatar: "/placeholder.svg?height=100&width=100",
    bio: "Dynamic fashion photographer with a keen eye for detail and storytelling. Specializes in high-concept shoots.",
    skills: ["Fashion Photography", "Conceptual Photography", "Digital Retouching", "Art Direction"],
    languages: ["Italian", "English", "German"],
    experience: "9 years",
    verified: true,
    certifications: ["Advanced Fashion Photography", "Digital Art Direction Certification"],
    portfolio: [
      {
        id: "p9",
        title: "Futuristic Fashion Shoot",
        description: "Captured cutting-edge designs in a futuristic urban setting.",
        imageUrls: ["/images/portfolio/futuristic-fashion-shoot.png"],
        thumbnailUrl: "/images/portfolio/thumbnails/futuristic-fashion-thumb.png",
        category: "Editorial",
        date: "2024-03-20",
        type: "single",
        year: "2024",
        role: "Photographer",
      },
    ],
    cv: [],
    contactInfo: {
      email: "chiara.romano@example.com",
      phone: "+39 335 1122334",
      instagram: "@chiara_romano_photo",
    },
    availability: { startDate: "2025-08-10", endDate: "2025-09-30" },
  },
  {
    id: "7",
    slug: "alessia-conti",
    name: "Alessia Conti",
    role: "Makeup Artist",
    location: "Paris, France",
    rate: 380,
    rating: 4.9,
    avatar: "/placeholder.svg?height=100&width=100",
    bio: "Renowned makeup artist in Paris, specializing in celebrity and red carpet looks. Known for flawless skin and captivating eyes.",
    skills: ["Red Carpet Makeup", "Celebrity Styling", "Beauty Makeup", "Contouring"],
    languages: ["French", "English", "Italian"],
    experience: "15 years",
    verified: true,
    certifications: ["Celebrity Makeup Artistry Diploma", "Advanced Contouring Techniques"],
    portfolio: [
      {
        id: "p10",
        title: "Red Carpet Celebrity Styling",
        description: "Provided makeup for a major celebrity at the Cannes Film Festival.",
        imageUrls: ["/images/portfolio/red-carpet-celebrity-styling.png"],
        thumbnailUrl: "/images/portfolio/thumbnails/red-carpet-celebrity-thumb.png",
        category: "Celebrity",
        date: "2024-05-20",
        type: "single",
        year: "2024",
        role: "Makeup Artist",
      },
    ],
    cv: [],
    contactInfo: {
      email: "alessia.conti@example.com",
      phone: "+33 6 12345678",
      instagram: "@alessia_mua_paris",
    },
    availability: { startDate: "2025-07-25", endDate: "2025-09-05" },
  },
  {
    id: "8",
    slug: "luca-ferrari",
    name: "Luca Ferrari",
    role: "Hair Stylist",
    location: "London, UK",
    rate: 400,
    rating: 4.7,
    avatar: "/placeholder.svg?height=100&width=100",
    bio: "London-based hair stylist with a strong background in commercial and editorial work. Expert in modern cuts and vibrant colors.",
    skills: ["Modern Cuts", "Hair Coloring", "Editorial Hair", "Commercial Styling"],
    languages: ["English", "Italian"],
    experience: "10 years",
    verified: true,
    certifications: ["Modern Hair Design Certification", "Vibrant Color Specialist"],
    portfolio: [
      {
        id: "p11",
        title: "Fantasy Makeup Art",
        description: "Collaborated on a fantasy-themed photoshoot, creating elaborate hairstyles.",
        imageUrls: ["/images/portfolio/fantasy-makeup-art.png"],
        thumbnailUrl: "/images/portfolio/thumbnails/fantasy-makeup-thumb.png",
        category: "Editorial",
        date: "2024-04-15",
        type: "single",
        year: "2024",
        role: "Hair Stylist",
      },
    ],
    cv: [],
    contactInfo: {
      email: "luca.ferrari@example.com",
      phone: "+44 7700 900123",
      instagram: "@luca_hair_london",
    },
    availability: { startDate: "2025-08-05", endDate: "2025-09-15" },
  },
  {
    id: "9",
    slug: "giulia-esposito",
    name: "Giulia Esposito",
    role: "Makeup Artist",
    location: "Milan, Italy",
    rate: 250,
    rating: 4.4,
    avatar: "/placeholder.svg?height=100&width=100",
    bio: "Passionate makeup artist focusing on clean beauty and natural enhancements. Available for commercial and private clients.",
    skills: ["Clean Beauty", "Natural Makeup", "Bridal Makeup", "Event Makeup"],
    languages: ["Italian", "English"],
    experience: "3 years",
    verified: false,
    certifications: ["Clean Beauty Fundamentals", "Natural Makeup Techniques"],
    portfolio: [],
    cv: [],
    contactInfo: {
      email: "giulia.esposito@example.com",
      phone: "+39 345 1122334",
      instagram: "@giulia_mua_milano",
    },
    availability: { startDate: "2025-07-05", endDate: "2025-08-20" },
  },
  {
    id: "10",
    slug: "davide-gallo",
    name: "Davide Gallo",
    role: "Assistant",
    location: "Milan, Italy",
    rate: 150,
    rating: 4.2,
    avatar: "/placeholder.svg?height=100&width=100",
    bio: "Dedicated and organized assistant ready to support hair and makeup teams on set. Eager to learn and grow in the industry.",
    skills: ["Set Assistance", "Organization", "Equipment Handling", "Basic Styling"],
    languages: ["Italian", "English"],
    experience: "1 year",
    verified: false,
    certifications: ["Set Etiquette and Safety", "Basic Hair Styling Assistant"],
    portfolio: [],
    cv: [],
    contactInfo: {
      email: "davide.gallo@example.com",
      phone: "+39 320 9988776",
      instagram: "@davide_assistant",
    },
    availability: { startDate: "2025-07-01", endDate: "2025-09-30" },
  },
]

const hirers: Hirer[] = [
  {
    id: "hirer-1",
    name: "Flashcrew Studios",
    avatar: "/placeholder.svg?height=100&width=100", // Placeholder for hirer avatar
    company: "Production Studio",
    location: "Milan, Italy",
  },
]

const hirerLists: HirerList[] = [
  { id: "hlist-1", name: "Top Hirers", hirerIds: ["hirer-1"] },
  { id: "hlist-2", name: "Potential Gigs", hirerIds: [] },
]

const jobs: Job[] = [
  {
    id: "gucci-project",
    title: "Gucci Fall/Winter 2025 Campaign Shoot",
    description:
      "Gucci is seeking top-tier talent for its upcoming Fall/Winter 2025 campaign. This high-profile project requires exceptional creativity and precision. We are looking for a lead hair stylist and a lead makeup artist to create iconic looks that embody the essence of Gucci's new collection. The shoot will take place over two weeks in a luxurious villa outside Milan, with a focus on capturing both studio and on-location shots. Attention to detail, ability to work under pressure, and a strong portfolio in high-fashion are essential. Collaboration with our creative director and photography team will be key to bringing our vision to life.",
    location: "Milan, Italy",
    createdAt: "2025-06-20",
    roles: [
      {
        id: "gucci-hair-stylist",
        role: "hair-stylist",
        startDate: "2025-07-15",
        endDate: "2025-07-29",
        budget: 400,
      },
      {
        id: "gucci-makeup-artist",
        role: "makeup-artist",
        startDate: "2025-07-15",
        endDate: "2025-07-29",
        budget: 380,
      },
    ],
    hirerId: "hirer-1",
  },
  {
    id: "prada-editorial",
    title: "Prada Magazine Editorial",
    description:
      "We are producing an exclusive editorial for Prada Magazine, focusing on minimalist yet impactful beauty. We need a skilled makeup artist and a hair stylist who can execute sophisticated, understated looks that complement the architectural designs of the new collection. The shoot will be in a contemporary studio in Milan. Experience with editorial work and a clean aesthetic is highly valued.",
    location: "Milan, Italy",
    createdAt: "2025-06-25",
    roles: [
      {
        id: "prada-makeup-artist",
        role: "makeup-artist",
        startDate: "2025-08-01",
        endDate: "2025-08-05",
        budget: 320,
      },
      {
        id: "prada-hair-stylist",
        role: "hair-stylist",
        startDate: "2025-08-01",
        endDate: "2025-08-05",
        budget: 300,
      },
    ],
    hirerId: "hirer-1",
  },
  {
    id: "versace-runway",
    title: "Versace SS26 Fashion Show",
    description:
      "Versace is seeking a dynamic team for the Spring/Summer 2026 runway show during Milan Fashion Week. We require experienced hair stylists and makeup artists capable of working in a fast-paced, high-pressure environment. The looks will be bold and glamorous, reflecting Versace's iconic style. Teamwork and efficiency are crucial.",
    location: "Milan, Italy",
    createdAt: "2025-06-28",
    roles: [
      {
        id: "versace-hair-stylist-1",
        role: "hair-stylist",
        startDate: "2025-09-20",
        endDate: "2025-09-22",
        budget: 450,
      },
      {
        id: "versace-makeup-artist-1",
        role: "makeup-artist",
        startDate: "2025-09-20",
        endDate: "2025-09-22",
        budget: 420,
      },
      {
        id: "versace-assistant-1",
        role: "assistant",
        startDate: "2025-09-20",
        endDate: "2025-09-22",
        budget: 200,
      },
    ],
    hirerId: "hirer-1",
  },
  {
    id: "dolce-gabbana-campaign",
    title: "Dolce & Gabbana Alta Moda Lookbook",
    description:
      "Seeking an exceptional makeup artist and photographer for our exclusive Alta Moda lookbook. This project demands a refined aesthetic and an understanding of traditional Italian beauty. The shoot will be in a historic palazzo in Venice.",
    location: "Venice, Italy",
    createdAt: "2025-07-01",
    roles: [
      {
        id: "d&g-makeup-artist",
        role: "makeup-artist",
        startDate: "2025-08-15",
        endDate: "2025-08-18",
        budget: 400,
      },
      {
        id: "d&g-photographer",
        role: "photographer",
        startDate: "2025-08-15",
        endDate: "2025-08-18",
        budget: 600,
      },
    ],
    hirerId: "hirer-1",
  },
  {
    id: "giorgio-armani-commercial",
    title: "Giorgio Armani Fragrance Commercial",
    description:
      "Casting for a hair stylist and makeup artist for a new Giorgio Armani fragrance commercial. We need a team that can create elegant, timeless looks that resonate with the brand's sophisticated image. Filming will take place in a studio in Rome.",
    location: "Rome, Italy",
    createdAt: "2025-07-05",
    roles: [
      {
        id: "armani-hair-stylist",
        role: "hair-stylist",
        startDate: "2025-09-01",
        endDate: "2025-09-03",
        budget: 370,
      },
      {
        id: "armani-makeup-artist",
        role: "makeup-artist",
        startDate: "2025-09-01",
        endDate: "2025-09-03",
        budget: 350,
      },
    ],
    hirerId: "hirer-1",
  },
  {
    id: "valentino-couture",
    title: "Valentino Couture Show Paris",
    description:
      "Valentino is looking for an elite hair stylist and makeup artist for their upcoming couture show in Paris. This is a highly prestigious event requiring exceptional skill and experience with haute couture. Must be able to travel to Paris.",
    location: "Paris, France",
    createdAt: "2025-07-10",
    roles: [
      {
        id: "valentino-hair-stylist",
        role: "hair-stylist",
        startDate: "2025-10-01",
        endDate: "2025-10-05",
        budget: 500,
      },
      {
        id: "valentino-makeup-artist",
        role: "makeup-artist",
        startDate: "2025-10-01",
        endDate: "2025-10-05",
        budget: 480,
      },
    ],
    hirerId: "hirer-1",
  },
]

const applications: Application[] = [
  {
    id: generateId(),
    jobId: "gucci-project",
    talentId: "1", // Vittoria Rossi
    roleId: "gucci-hair-stylist",
    status: "applied",
    createdAt: "2025-06-21T10:00:00Z",
  },
  {
    id: generateId(),
    jobId: "gucci-project",
    talentId: "2", // Lucia Bianchi
    roleId: "gucci-makeup-artist",
    status: "applied",
    createdAt: "2025-06-21T11:00:00Z",
  },
  {
    id: generateId(),
    jobId: "prada-editorial",
    talentId: "2", // Lucia Bianchi
    roleId: "prada-makeup-artist",
    status: "confirmed",
    createdAt: "2025-06-26T09:00:00Z",
  },
  {
    id: generateId(),
    jobId: "versace-runway",
    talentId: "1", // Vittoria Rossi
    roleId: "versace-hair-stylist-1",
    status: "applied",
    createdAt: "2025-06-29T14:00:00Z",
  },
  {
    id: generateId(),
    jobId: "versace-runway",
    talentId: "5", // Giovanni Leone
    roleId: "versace-makeup-artist-1",
    status: "applied",
    createdAt: "2025-06-29T15:00:00Z",
  },
  {
    id: generateId(),
    jobId: "dolce-gabbana-campaign",
    talentId: "2", // Lucia Bianchi
    roleId: "d&g-makeup-artist",
    status: "applied",
    createdAt: "2025-07-02T10:00:00Z",
  },
  {
    id: generateId(),
    jobId: "giorgio-armni-commercial",
    talentId: "4", // Sofia Moretti
    roleId: "armani-hair-stylist",
    status: "applied",
    createdAt: "2025-07-06T11:00:00Z",
  },
]

let invitations: Invitation[] = [
  {
    id: generateId(),
    jobId: "gucci-project",
    talentId: "1", // Vittoria Rossi
    roleId: "gucci-hair-stylist",
    status: "pending",
    createdAt: "2025-06-20T15:00:00Z",
  },
  {
    id: generateId(),
    jobId: "prada-editorial",
    talentId: "2", // Lucia Bianchi
    roleId: "prada-makeup-artist",
    status: "accepted",
    createdAt: "2025-06-25T12:00:00Z",
  },
  {
    id: generateId(),
    jobId: "versace-runway",
    talentId: "10", // Davide Gallo (Assistant)
    roleId: "versace-assistant-1",
    status: "pending",
    createdAt: "2025-06-29T10:00:00Z",
  },
  {
    id: generateId(),
    jobId: "dolce-gabbana-campaign",
    talentId: "3", // Marco Ricci (Photographer)
    roleId: "d&g-photographer",
    status: "pending",
    createdAt: "2025-07-01T14:00:00Z",
  },
  {
    id: generateId(),
    jobId: "valentino-couture",
    talentId: "7", // Alessia Conti (Makeup Artist)
    roleId: "valentino-makeup-artist",
    status: "pending",
    createdAt: "2025-07-11T09:00:00Z",
  },
  {
    id: generateId(),
    jobId: "valentino-couture",
    talentId: "8", // Luca Ferrari (Hair Stylist)
    roleId: "valentino-hair-stylist",
    status: "pending",
    createdAt: "2025-07-11T09:30:00Z",
  },
]

const chats: Chat[] = [
  {
    id: "chat-1",
    participantIds: ["1", "hirer-1"], // Vittoria Rossi and Hirer
    jobId: "gucci-project",
    messages: [
      {
        id: generateId(),
        chatId: "chat-1",
        senderId: "hirer-1",
        text: "Hi Vittoria, we're very impressed with your portfolio and would like to invite you to the Gucci Fall/Winter campaign. Are you available from July 15-29?",
        timestamp: "2025-06-20T15:05:00Z",
      },
      {
        id: generateId(),
        chatId: "chat-1",
        senderId: "1",
        text: "Hello! Thank you for reaching out. Yes, I am available during those dates. I'm very interested in the Gucci campaign.",
        timestamp: "2025-06-20T16:00:00Z",
      },
      {
        id: generateId(),
        chatId: "chat-1",
        senderId: "hirer-1",
        text: "Great! We've sent an official invitation through the platform. Please review the details.",
        timestamp: "2025-06-20T16:10:00Z",
      },
    ],
    lastMessageAt: "2025-06-20T16:10:00Z",
  },
  {
    id: "chat-2",
    participantIds: ["2", "hirer-1"], // Lucia Bianchi and Hirer
    jobId: "prada-editorial",
    messages: [
      {
        id: generateId(),
        chatId: "chat-2",
        senderId: "hirer-1",
        text: "Hi Lucia, we'd like to offer you the makeup artist role for the Prada editorial. The dates are August 1-5. Let us know if you accept!",
        timestamp: "2025-06-26T11:00:00Z",
      },
      {
        id: generateId(),
        chatId: "chat-2",
        senderId: "2",
        text: "Thank you for the offer! I'm excited to accept the Prada editorial role. Looking forward to working with your team.",
        timestamp: "2025-06-26T11:30:00Z",
      },
    ],
    lastMessageAt: "2025-06-26T11:30:00Z",
  },
]

const talentLists: TalentList[] = [
  {
    id: "list-1",
    name: "Top Milan Hair Stylists",
    description: "A curated list of the best hair stylists based in Milan.",
    talentIds: ["1", "4"],
    createdAt: "2025-06-15",
  },
  {
    id: "list-2",
    name: "Editorial Makeup Artists",
    description: "Leading makeup artists with strong editorial portfolios.",
    talentIds: ["2", "7"],
    createdAt: "2025-06-18",
  },
]

const userAvailabilityStore: { [key: string]: Date[] } = {}

export const getUserAvailability = (talentId: string): Date[] | undefined => {
  if (userAvailabilityStore[talentId]) {
    return userAvailabilityStore[talentId]
  }

  const talent = getTalentById(talentId)
  if (talent?.availability) {
    const dates = []
    const start = new Date(talent.availability.startDate)
    const end = new Date(talent.availability.endDate)
    start.setUTCHours(0, 0, 0, 0)
    end.setUTCHours(0, 0, 0, 0)

    const current = start
    while (current <= end) {
      dates.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    userAvailabilityStore[talentId] = dates
    return dates
  }

  return []
}

export const setUserAvailability = (talentId: string, dates: Date[]) => {
  userAvailabilityStore[talentId] = dates
}

// --- Data Store Functions ---

export const getTalentLists = (): TalentList[] => {
  return talentLists
}

export const getLists = (): TalentList[] => {
  return talentLists
}

export const getTalentListById = (listId: string): TalentList | undefined => {
  return talentLists.find((list) => list.id === listId)
}

export const createTalentList = (name: string, description: string): TalentList => {
  const newList: TalentList = {
    id: generateId(),
    name,
    description,
    talentIds: [],
    createdAt: new Date().toISOString(),
  }
  talentLists.push(newList)
  return newList
}

export const saveList = (raw: {
  id: string
  name: string
  talents?: string[]
  talentIds?: string[]
  createdAt: string
}) => {
  const list: TalentList = {
    id: raw.id,
    name: raw.name,
    description: "", // description is optional in Create List flow
    talentIds: raw.talentIds ?? raw.talents ?? [],
    createdAt: raw.createdAt,
  }

  // Prevent duplicates
  if (!talentLists.find((l) => l.id === list.id)) {
    talentLists.push(list)
  }
}

export const addTalentToList = (listId: string, talentId: string) => {
  const list = talentLists.find((l) => l.id === listId)
  if (list && !list.talentIds.includes(talentId)) {
    list.talentIds.push(talentId)
  }
}

export const removeTalentFromList = (talentId: string) => {
  talentLists.forEach((list) => {
    list.talentIds = list.talentIds.filter((id) => id !== talentId)
  })
}

export const deleteList = (listId: string): void => {
  const index = talentLists.findIndex((l) => l.id === listId)
  if (index !== -1) {
    talentLists.splice(index, 1)
  }
}

export const getCurrentMode = (): "hirer" | "talent" => {
  if (typeof window !== "undefined") {
    return (localStorage.getItem("userMode") as "hirer" | "talent") || "hirer"
  }
  return "hirer" // Default for server-side rendering
}

export const setCurrentMode = (mode: "hirer" | "talent"): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("userMode", mode)
  }
}

export const getTalents = (): Talent[] => {
  return talents
}

export const getTalentById = (id: string): Talent | undefined => {
  return talents.find((talent) => talent.id === id)
}

export const getTalentBySlug = (slug: string): Talent | undefined => {
  return talents.find((talent) => talent.slug === slug)
}

export const getHirerById = (id: string): Hirer | undefined => {
  return hirers.find((hirer) => hirer.id === id)
}

export const getJobs = (): Job[] => {
  return jobs
}

export const getJobById = (id: string): Job | undefined => {
  return jobs.find((job) => job.id === id)
}

export const getApplications = (): Application[] => {
  return applications
}

export const getApplicationsForJob = (jobId: string): Application[] => {
  return applications.filter((app) => app.jobId === jobId)
}

export const getApplicationsForTalent = (talentId: string): Application[] => {
  return applications.filter((app) => app.talentId === talentId)
}

export const saveApplication = (newApplication: Application) => {
  applications.push(newApplication)
}

export const hasAppliedForRole = (talentId: string, jobId: string, roleId: string): boolean => {
  return applications.some((app) => app.talentId === talentId && app.jobId === jobId && app.roleId === roleId)
}

export const getInvitations = (): Invitation[] => {
  return invitations
}

export const getInvitationsForJob = (jobId: string): Invitation[] => {
  return invitations.filter((inv) => inv.jobId === jobId)
}

export const getInvitationsForTalent = (talentId: string): Invitation[] => {
  return invitations.filter((inv) => inv.talentId === talentId)
}

export const updateInvitationStatus = (invitationId: string, status: "accepted" | "declined") => {
  const invitationIndex = invitations.findIndex((inv) => inv.id === invitationId)
  if (invitationIndex !== -1) {
    invitations[invitationIndex].status = status
  }
}

export const confirmTalent = (jobId: string, talentId: string, roleId: string) => {
  const existingApplicationIndex = applications.findIndex(
    (app) => app.jobId === jobId && app.talentId === talentId && app.roleId === roleId,
  )

  if (existingApplicationIndex !== -1) {
    applications[existingApplicationIndex].status = "confirmed"
  } else {
    const newApplication: Application = {
      id: generateId(),
      jobId,
      talentId,
      roleId,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    }
    applications.push(newApplication)
  }
}

export const saveJob = (job: Job): void => {
  jobs.push(job)
}

export const getChats = (): Chat[] => {
  return chats
}

export const getChatById = (chatId: string): Chat | undefined => {
  return chats.find((chat) => chat.id === chatId)
}

export const getMessagesForChat = (chatId: string): ChatMessage[] => {
  const chat = chats.find((c) => c.id === chatId)
  return chat ? chat.messages : []
}

export const addMessageToChat = (chatId: string, message: ChatMessage) => {
  const chat = chats.find((c) => c.id === chatId)
  if (chat) {
    chat.messages.push(message)
    chat.lastMessageAt = message.timestamp
  }
}

export const saveInvitation = (invitation: Invitation) => {
  const existing = invitations.find(
    (i) => i.jobId === invitation.jobId && i.talentId === invitation.talentId && i.roleId === invitation.roleId,
  )
  if (!existing) {
    invitations.push(invitation)
    const job = jobs.find((j) => j.id === invitation.jobId)
    if (job) {
      if (!job.invitedTalentIds) {
        job.invitedTalentIds = []
      }
      job.invitedTalentIds.push(invitation.talentId)
    }
  }
}

export const getHirerLists = () => hirerLists
export const addHirerToList = (listId: string, hirerId: string) => {
  const list = hirerLists.find((l) => l.id === listId)
  if (list && !list.hirerIds.includes(hirerId)) {
    list.hirerIds.push(hirerId)
  }
}
export const removeHirerFromList = (hirerId: string) => {
  hirerLists.forEach((list) => {
    list.hirerIds = list.hirerIds.filter((id) => id !== hirerId)
  })
}

export const isTalentInAnyList = (talentId: string): boolean =>
  talentLists.some((list) => list.talentIds.includes(talentId))

export const isHirerInAnyList = (hirerId: string): boolean => hirerLists.some((list) => list.hirerIds.includes(hirerId))

export const isTalentInvitedToJob = (talentId: string, jobId: string): boolean =>
  invitations.some((inv) => inv.talentId === talentId && inv.jobId === jobId)

export const cancelJobInvitation = (talentId: string, jobId: string) => {
  invitations = invitations.filter((inv) => !(inv.talentId === talentId && inv.jobId === jobId))
  const job = jobs.find((j) => j.id === jobId)
  if (job && job.invitedTalentIds) {
    job.invitedTalentIds = job.invitedTalentIds.filter((id) => id !== talentId)
  }
}
