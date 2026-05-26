import type { Trip } from "./types";

const STORAGE_KEY = "pack-my-bags-trips";

export function getTrips(): Trip[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Trip[];
  } catch {
    return [];
  }
}

export function saveTrips(trips: Trip[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
}

export function saveTrip(trip: Trip): void {
  const trips = getTrips();
  const index = trips.findIndex((t) => t.id === trip.id);
  if (index >= 0) {
    trips[index] = trip;
  } else {
    trips.unshift(trip);
  }
  saveTrips(trips);
}

export function deleteTrip(id: string): void {
  saveTrips(getTrips().filter((t) => t.id !== id));
}
