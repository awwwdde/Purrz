import type {
  Company,
  Lead,
  Review,
  Service,
  ServiceCategory,
  User,
} from "@/shared/types";

export const categories: ServiceCategory[] = [
  {
    id: "cat-hvac",
    name: "Кондиционеры и климат",
    slug: "hvac",
    icon: "snowflake",
    description: "Установка, обслуживание и ремонт сплит-систем, мульти-сплит, чиллеров.",
  },
  {
    id: "cat-renovation",
    name: "Ремонт квартир",
    slug: "renovation",
    icon: "hammer",
    description: "Капитальный, косметический и дизайнерский ремонт под ключ.",
  },
  {
    id: "cat-cleaning",
    name: "Клининг",
    slug: "cleaning",
    icon: "sparkles",
    description: "Уборка квартир, офисов и помещений после ремонта.",
  },
  {
    id: "cat-electric",
    name: "Электрика",
    slug: "electric",
    icon: "zap",
    description: "Монтаж проводки, щитков, освещения и систем умного дома.",
  },
  {
    id: "cat-plumbing",
    name: "Сантехника",
    slug: "plumbing",
    icon: "droplet",
    description: "Замена труб, установка сантехники, аварийные работы.",
  },
  {
    id: "cat-construction",
    name: "Строительство",
    slug: "construction",
    icon: "building",
    description: "Строительство домов, бань, гаражей и хозблоков.",
  },
];

export const services: Service[] = [
  // HVAC
  {
    id: "svc-split-install",
    name: "Установка сплит-системы",
    categoryId: "cat-hvac",
    description: "Полный монтаж сплит-системы любой мощности с гарантией.",
    minPrice: 6000,
    maxPrice: 18000,
  },
  {
    id: "svc-split-service",
    name: "Сервисное обслуживание сплит-системы",
    categoryId: "cat-hvac",
    description: "Чистка, заправка фреоном, диагностика.",
    minPrice: 2500,
    maxPrice: 7000,
  },
  {
    id: "svc-multi-split",
    name: "Монтаж мульти-сплит системы",
    categoryId: "cat-hvac",
    description: "Несколько внутренних блоков на один внешний.",
    minPrice: 25000,
    maxPrice: 90000,
  },
  // Renovation
  {
    id: "svc-renov-cosmetic",
    name: "Косметический ремонт",
    categoryId: "cat-renovation",
    description: "Покраска стен, замена обоев, мелкий ремонт.",
    minPrice: 4500,
    maxPrice: 9000,
  },
  {
    id: "svc-renov-capital",
    name: "Капитальный ремонт под ключ",
    categoryId: "cat-renovation",
    description: "Полная переделка квартиры с дизайн-проектом.",
    minPrice: 12000,
    maxPrice: 45000,
  },
  // Cleaning
  {
    id: "svc-clean-flat",
    name: "Уборка квартиры",
    categoryId: "cat-cleaning",
    description: "Поддерживающая или генеральная уборка.",
    minPrice: 2000,
    maxPrice: 8000,
  },
  {
    id: "svc-clean-after",
    name: "Уборка после ремонта",
    categoryId: "cat-cleaning",
    description: "Уборка строительной пыли и мойка окон.",
    minPrice: 4000,
    maxPrice: 15000,
  },
  // Electric
  {
    id: "svc-electric-wiring",
    name: "Монтаж проводки",
    categoryId: "cat-electric",
    description: "Замена и прокладка электропроводки.",
    minPrice: 800,
    maxPrice: 2500,
  },
  {
    id: "svc-electric-panel",
    name: "Сборка электрощита",
    categoryId: "cat-electric",
    description: "Подбор автоматов и УЗО, сборка щита.",
    minPrice: 6000,
    maxPrice: 25000,
  },
  // Plumbing
  {
    id: "svc-plumb-pipes",
    name: "Замена труб водоснабжения",
    categoryId: "cat-plumbing",
    description: "Демонтаж старых и монтаж новых труб.",
    minPrice: 5000,
    maxPrice: 20000,
  },
  {
    id: "svc-plumb-mixer",
    name: "Установка смесителя",
    categoryId: "cat-plumbing",
    description: "Замена смесителя на кухне или в ванной.",
    minPrice: 1500,
    maxPrice: 3500,
  },
  // Construction
  {
    id: "svc-house",
    name: "Строительство дома",
    categoryId: "cat-construction",
    description: "Строительство загородного дома под ключ.",
    minPrice: 35000,
    maxPrice: 90000,
  },
];

const review = (id: string, author: string, rating: number, text: string, daysAgo: number): Review => ({
  id,
  author,
  rating,
  text,
  date: new Date(Date.now() - daysAgo * 86400_000).toISOString(),
});

export const companies: Company[] = [
  {
    id: "co-arctica",
    name: "Арктика-Сервис",
    inn: "7701234567",
    description:
      "Монтаж и обслуживание сплит-систем с 2009 года. Официальный дилер Daikin, Mitsubishi Electric и Haier. Работаем по Москве и области.",
    logo: "https://api.dicebear.com/9.x/initials/svg?seed=Arctica&backgroundColor=0A0A0B&textColor=D6FF3D&fontWeight=700",
    banner:
      "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=1600&q=80",
    rating: 4.9,
    reviewsCount: 234,
    discount: 15,
    contacts: {
      phone: "+7 (495) 123-45-67",
      email: "info@arctica-service.demo",
      site: "arctica-service.demo",
    },
    address: "Москва, ул. Электрозаводская, 27",
    services: [
      { serviceId: "svc-split-install", price: 8500, discount: 15 },
      { serviceId: "svc-split-service", price: 3500 },
      { serviceId: "svc-multi-split", price: 45000, discount: 10 },
    ],
    gallery: [
      "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=900&q=80",
      "https://images.unsplash.com/photo-1635424239131-c4934f7a7d33?w=900&q=80",
      "https://images.unsplash.com/photo-1611365892117-bce8eaf9d72d?w=900&q=80",
    ],
    reviews: [
      review("r1", "Анна К.", 5, "Установили за 3 часа, аккуратно, без пыли. Очень довольна!", 3),
      review("r2", "Дмитрий П.", 5, "Профессионалы. Цена не выросла после монтажа.", 12),
      review("r3", "Олег С.", 4, "Всё хорошо, но ждал бригаду 30 минут.", 24),
    ],
    views: 4812,
    yearsOnMarket: 16,
    verified: true,
  },
  {
    id: "co-renovo",
    name: "Renovo Studio",
    inn: "7707654321",
    description:
      "Студия премиум-ремонта с собственным дизайн-бюро. Реализовали 240+ проектов. Фиксированная смета и сроки в договоре.",
    logo: "https://api.dicebear.com/9.x/initials/svg?seed=Renovo&backgroundColor=D6FF3D&textColor=0A0A0B&fontWeight=700",
    banner:
      "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=1600&q=80",
    rating: 4.8,
    reviewsCount: 187,
    discount: 10,
    contacts: {
      phone: "+7 (495) 555-11-22",
      email: "hello@renovo.demo",
      site: "renovo.demo",
    },
    address: "Москва, Пресненская наб., 12",
    services: [
      { serviceId: "svc-renov-cosmetic", price: 6500 },
      { serviceId: "svc-renov-capital", price: 24000, discount: 10 },
    ],
    gallery: [
      "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=800&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
    ],
    reviews: [
      review("r4", "Мария Л.", 5, "Сделали ремонт за 2.5 месяца, в смету уложились.", 7),
      review("r5", "Игорь В.", 5, "Качественно, дизайнер очень внимательный.", 20),
    ],
    views: 6391,
    yearsOnMarket: 9,
    verified: true,
  },
  {
    id: "co-clean-pro",
    name: "CleanPro",
    inn: "7712345678",
    description:
      "Профессиональный клининг для квартир и офисов. Экологичные средства, обученный персонал, страховка ответственности.",
    logo: "https://api.dicebear.com/9.x/initials/svg?seed=CleanPro&backgroundColor=1FCB6B&textColor=0A0A0B&fontWeight=700",
    banner:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1600&q=80",
    rating: 4.7,
    reviewsCount: 412,
    discount: 20,
    contacts: {
      phone: "+7 (495) 777-88-99",
      email: "order@cleanpro.demo",
    },
    address: "Москва, ул. Бутырская, 76",
    services: [
      { serviceId: "svc-clean-flat", price: 3200, discount: 20 },
      { serviceId: "svc-clean-after", price: 6800, discount: 15 },
    ],
    gallery: [
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80",
      "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800&q=80",
    ],
    reviews: [
      review("r6", "Светлана Н.", 5, "Девочки вылизали квартиру до блеска.", 2),
      review("r7", "Артём Д.", 4, "Хорошо, но опоздали на 20 минут.", 14),
    ],
    views: 8120,
    yearsOnMarket: 6,
    verified: true,
  },
  {
    id: "co-voltage",
    name: "Voltage Lab",
    inn: "7798765432",
    description:
      "Электромонтажные работы любой сложности. Лицензированные специалисты, акт скрытых работ, гарантия 5 лет.",
    logo: "https://api.dicebear.com/9.x/initials/svg?seed=Voltage&backgroundColor=FFD43D&textColor=0A0A0B&fontWeight=700",
    banner:
      "https://images.unsplash.com/photo-1565608438257-fac3c27beb36?w=1600&q=80",
    rating: 4.9,
    reviewsCount: 156,
    discount: 12,
    contacts: {
      phone: "+7 (495) 444-33-22",
      email: "ops@voltage-lab.demo",
    },
    address: "Москва, ул. Складочная, 1",
    services: [
      { serviceId: "svc-electric-wiring", price: 1400 },
      { serviceId: "svc-electric-panel", price: 14000, discount: 12 },
    ],
    gallery: [
      "https://images.unsplash.com/photo-1565608438257-fac3c27beb36?w=800&q=80",
      "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80",
    ],
    reviews: [
      review("r8", "Николай К.", 5, "Сделали щит как из учебника. Подписан на ютуб.", 8),
    ],
    views: 3401,
    yearsOnMarket: 12,
    verified: true,
  },
  {
    id: "co-aquaplus",
    name: "АкваПлюс",
    inn: "7723456789",
    description:
      "Сантехнические работы любой сложности. Аварийный выезд 24/7. Опыт работы более 14 лет.",
    logo: "https://api.dicebear.com/9.x/initials/svg?seed=AquaPlus&backgroundColor=4D7BFF&textColor=ffffff&fontWeight=700",
    banner:
      "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=1600&q=80",
    rating: 4.6,
    reviewsCount: 298,
    discount: 8,
    contacts: {
      phone: "+7 (495) 222-11-00",
      email: "help@aquaplus.demo",
    },
    address: "Москва, ул. Авиамоторная, 50",
    services: [
      { serviceId: "svc-plumb-pipes", price: 12000 },
      { serviceId: "svc-plumb-mixer", price: 2200, discount: 8 },
    ],
    gallery: [
      "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80",
    ],
    reviews: [
      review("r9", "Алексей М.", 5, "Приехали за час, починили, вежливые.", 1),
      review("r10", "Татьяна Е.", 4, "Норм, но дороговато.", 30),
    ],
    views: 5601,
    yearsOnMarket: 14,
    verified: true,
  },
  {
    id: "co-buildmax",
    name: "BuildMax",
    inn: "7734567890",
    description:
      "Строительство домов, бань и хозблоков из бруса, газобетона и кирпича. Свой проектный отдел.",
    logo: "https://api.dicebear.com/9.x/initials/svg?seed=BuildMax&backgroundColor=FF4D3D&textColor=ffffff&fontWeight=700",
    banner:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1600&q=80",
    rating: 4.7,
    reviewsCount: 89,
    discount: 5,
    contacts: {
      phone: "+7 (495) 333-22-11",
      email: "build@buildmax.demo",
      site: "buildmax.demo",
    },
    address: "Московская обл., Красногорск, ш. Энтузиастов, 1",
    services: [{ serviceId: "svc-house", price: 55000, discount: 5 }],
    gallery: [
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80",
      "https://images.unsplash.com/photo-1565182999561-18d7dc61c393?w=800&q=80",
    ],
    reviews: [
      review("r11", "Виктор Ш.", 5, "Построили дом за 5 месяцев. Сроки и смета соблюдены.", 60),
    ],
    views: 2310,
    yearsOnMarket: 11,
    verified: false,
  },
];

export const demoUser: User = {
  id: "u-demo",
  name: "Иван Петров",
  email: "demo@purrz.dev",
  phone: "+7 (905) 123-45-67",
  avatar: "https://api.dicebear.com/9.x/initials/svg?seed=Ivan&backgroundColor=D6FF3D&textColor=0A0A0B",
  role: "user",
  createdAt: new Date(Date.now() - 90 * 86400_000).toISOString(),
};

export const demoManager: User = {
  id: "u-manager",
  name: "Сергей Менеджеров",
  email: "manager@arctica-service.demo",
  phone: "+7 (495) 123-45-67",
  avatar: "https://api.dicebear.com/9.x/initials/svg?seed=Sergey&backgroundColor=0A0A0B&textColor=D6FF3D",
  role: "company_manager",
  companyId: "co-arctica",
  createdAt: new Date(Date.now() - 200 * 86400_000).toISOString(),
};

const mkLead = (
  id: string,
  userName: string,
  contact: string,
  companyId: string,
  serviceId: string,
  comment: string,
  daysAgo: number,
  status: Lead["status"],
): Lead => {
  const co = companies.find((c) => c.id === companyId)!;
  const sv = services.find((s) => s.id === serviceId)!;
  return {
    id,
    userId: "u-demo",
    userName,
    userContact: contact,
    companyId,
    companyName: co.name,
    serviceId,
    serviceName: sv.name,
    comment,
    date: new Date(Date.now() - daysAgo * 86400_000).toISOString(),
    status,
  };
};

export const leads: Lead[] = [
  mkLead("l1", "Иван Петров", "+7 (905) 123-45-67", "co-arctica", "svc-split-install", "Двушка, 2 комнаты. Нужно установить.", 1, "new"),
  mkLead("l2", "Иван Петров", "+7 (905) 123-45-67", "co-renovo", "svc-renov-capital", "Квартира 64 м², хочу скандинавский стиль.", 3, "in_progress"),
  mkLead("l3", "Мария Сидорова", "maria@demo.dev", "co-arctica", "svc-split-service", "Шумит компрессор, посмотрите.", 5, "done"),
  mkLead("l4", "Алексей К.", "+7 (916) 000-11-22", "co-arctica", "svc-split-install", "Офис 30 м², 2 блока.", 7, "in_progress"),
  mkLead("l5", "Ольга М.", "olga@demo.dev", "co-arctica", "svc-multi-split", "Трёшка, 3 блока нужны.", 10, "rejected"),
  mkLead("l6", "Дмитрий В.", "+7 (903) 222-33-44", "co-arctica", "svc-split-service", "Профилактика после зимы.", 12, "done"),
  mkLead("l7", "Светлана П.", "sveta@demo.dev", "co-arctica", "svc-split-install", "Нужно 2 кондиционера в спальни.", 14, "new"),
];
