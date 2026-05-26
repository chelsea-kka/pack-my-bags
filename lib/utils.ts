import type { PackingCategory, Trip } from "./types";

const CITY_IMAGES = [
  "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1524492412937-28c6667b4d0e?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1505764707775-d6e3c9b0f6f3?w=800&h=500&fit=crop",
];

export function getCityImageUrl(destination: string): string {
  let hash = 0;
  for (let i = 0; i < destination.length; i++) {
    hash = (hash << 5) - hash + destination.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % CITY_IMAGES.length;
  return CITY_IMAGES[index];
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  if (Number.isNaN(d.getTime())) return dateStr;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

export function formatDateRange(departureDate: string, days: number): string {
  const start = new Date(departureDate + "T00:00:00");
  const end = new Date(start);
  end.setDate(end.getDate() + days - 1);
  const fmt = (d: Date) =>
    `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  return `${fmt(start)} - ${end.getMonth() + 1}月${end.getDate()}日`;
}

export function countProgress(categories: PackingCategory[]): {
  checked: number;
  total: number;
  percent: number;
} {
  let checked = 0;
  let total = 0;
  for (const cat of categories) {
    for (const item of cat.items) {
      total++;
      if (item.checked) checked++;
    }
  }
  const percent = total === 0 ? 0 : Math.round((checked / total) * 100);
  return { checked, total, percent };
}

export function tripProgress(trip: Trip) {
  return countProgress(trip.categories);
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
