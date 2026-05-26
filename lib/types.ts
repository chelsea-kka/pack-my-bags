export type PackingItem = {
  id: string;
  name: string;
  checked: boolean;
};

export type PackingCategory = {
  id: string;
  name: string;
  items: PackingItem[];
};

export type Trip = {
  id: string;
  destination: string;
  departureDate: string;
  days: number;
  additionalInfo?: string;
  categories: PackingCategory[];
  imageUrl: string;
  createdAt: string;
};

export type NewTripDraft = {
  destination: string;
  departureDate: string;
  days: number;
  additionalInfo?: string;
  categories: PackingCategory[];
};

export type TabId = "trips" | "pack";
