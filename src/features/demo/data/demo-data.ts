export const tenant = {
  id: "tenant-sao-lourenco",
  name: "Sao Lourenco da Mata",
  slug: "sao-lourenco-da-mata"
};

export const groups = [
  {
    id: "group-1",
    slug: "corre-capibaribe",
    name: "Corre Capibaribe",
    description: "Treinos de rua e longoes dominicais com foco em constancia.",
    leader: "Ana Paixao",
    meetingPoint: "Praca do Centro",
    days: ["Ter", "Qui", "Dom"],
    time: "05:20",
    distances: ["KM_5", "KM_10", "OPEN"],
    members: 124,
    status: "APPROVED"
  },
  {
    id: "group-2",
    slug: "pace-lourenco",
    name: "Pace Lourenco",
    description: "Grupo para evolucao de ritmo com acompanhamento leve e acolhedor.",
    leader: "Carlos Teles",
    meetingPoint: "Parque da Vitoria",
    days: ["Seg", "Qua", "Sab"],
    time: "19:00",
    distances: ["KM_5", "KM_15"],
    members: 86,
    status: "APPROVED"
  },
  {
    id: "group-3",
    slug: "longao-da-mata",
    name: "Longao da Mata",
    description: "Base de endurance para meia maratona e corridas oficiais.",
    leader: "Joao Henrique",
    meetingPoint: "Arena das Aguas",
    days: ["Qua", "Dom"],
    time: "05:00",
    distances: ["KM_10", "KM_21"],
    members: 63,
    status: "PENDING"
  }
];

export const events = [
  {
    id: "event-1",
    slug: "intervalado-capibaribe-0807",
    title: "Intervalado de base",
    groupSlug: "corre-capibaribe",
    groupName: "Corre Capibaribe",
    eventType: "TRAINING",
    date: "2026-07-08T05:20:00.000Z",
    location: "Praca do Centro",
    distance: "KM_5",
    level: "BEGINNER",
    suggestedPace: "6:10-6:50/km",
    confirmedCount: 42,
    attendanceStatus: null
  },
  {
    id: "event-2",
    slug: "longao-vitoria-1207",
    title: "Longao progressivo",
    groupSlug: "pace-lourenco",
    groupName: "Pace Lourenco",
    eventType: "LONG_RUN",
    date: "2026-07-12T05:00:00.000Z",
    location: "Parque da Vitoria",
    distance: "KM_15",
    level: "INTERMEDIATE",
    suggestedPace: "5:40-6:10/km",
    confirmedCount: 55,
    attendanceStatus: null
  },
  {
    id: "event-3",
    slug: "desafio-municipal-1907",
    title: "Desafio 10K da Cidade",
    groupSlug: "corre-capibaribe",
    groupName: "Corre Capibaribe",
    eventType: "CHALLENGE",
    date: "2026-07-19T06:00:00.000Z",
    location: "Arena das Aguas",
    distance: "KM_10",
    level: "ADVANCED",
    suggestedPace: "Livre",
    confirmedCount: 98,
    attendanceStatus: null
  }
];

export const ranking = [
  { name: "Mariana Alves", group: "Corre Capibaribe", attendances: 18, km: 126, position: 1 },
  { name: "Diego Souza", group: "Pace Lourenco", attendances: 16, km: 118, position: 2 },
  { name: "Rafaela Gomes", group: "Corre Capibaribe", attendances: 15, km: 102, position: 3 }
];

export const partners = [
  {
    id: "partner-1",
    slug: "studio-endorfina",
    name: "Studio Endorfina",
    category: "Academia",
    description: "Treinamento funcional para corredores com foco em prevencao de lesoes.",
    whatsapp: "81999990001",
    instagram: "@studioendorfina",
    address: "Av. Central, 180",
    coupon: "CORRE10"
  },
  {
    id: "partner-2",
    slug: "passada-forte",
    name: "Passada Forte",
    category: "Loja de tenis",
    description: "Curadoria de tenis, relogios e acessorios de performance.",
    whatsapp: "81999990002",
    instagram: "@passadaforte",
    address: "Rua do Comercio, 44",
    coupon: "RUN5"
  }
];

export const posts = [
  {
    id: "post-1",
    groupName: "Corre Capibaribe",
    title: "Mudanca de percurso",
    content: "O treino de quinta saira da praca e seguira pela avenida principal por causa de obra no trecho antigo."
  },
  {
    id: "post-2",
    groupName: "Pace Lourenco",
    title: "Convite para longao",
    content: "Domingo teremos cafe de recuperacao no fim do treino. Leve um amigo."
  }
];

export const runnerDashboard = {
  nextEvent: events[0],
  lastCheckIns: ["Treino regenerativo", "Longao 15K", "Desafio de subida"],
  monthKm: 86,
  rankingPosition: 7,
  mainGroup: groups[0],
  nearbyPartners: partners,
  upcomingEvents: events,
  achievements: ["Primeiro treino", "50 km", "10 check-ins"]
};

export const leaderDashboard = {
  group: groups[0],
  approvalStatus: "APPROVED",
  metrics: [
    { label: "Membros ativos", value: "124" },
    { label: "Confirmados na semana", value: "67" },
    { label: "Check-ins no mes", value: "182" }
  ],
  events
};

export const adminDashboard = {
  kpis: [
    { label: "Usuarios", value: "482" },
    { label: "Grupos", value: "9" },
    { label: "Eventos", value: "41" },
    { label: "Check-ins", value: "1.284" },
    { label: "Parceiros", value: "12" }
  ],
  pendingGroups: [groups[2]],
  pendingPartners: [
    {
      id: "partner-pending-1",
      slug: "fisio-ponto-certo",
      name: "Fisio Ponto Certo",
      category: "Fisioterapia"
    }
  ]
};
