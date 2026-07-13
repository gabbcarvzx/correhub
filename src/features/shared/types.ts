export interface EventCardModel {
  id: string;
  slug: string;
  title: string;
  groupName: string;
  groupSlug: string;
  date: string;
  location: string;
  distance: string;
  level: string;
  suggestedPace: string;
  confirmedCount: number;
  attendanceStatus?: "CONFIRMED" | "CANCELLED" | null;
}

export interface GroupCardModel {
  id: string;
  slug: string;
  name: string;
  description: string;
  leader: string;
  meetingPoint: string;
  members: number;
  status: string;
  logoUrl?: string | null;
}

export interface RankingCardModel {
  position: number;
  name: string;
  group: string;
  attendances: number;
  km: number;
}

export interface PartnerCardModel {
  slug: string;
  name: string;
  category: string;
  description: string;
  coupon: string;
  whatsapp: string;
  instagram: string;
  address: string;
  featured?: boolean;
  gallery?: string[];
  logoUrl?: string | null;
}
