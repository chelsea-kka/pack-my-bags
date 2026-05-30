import type { Trip } from "./types";
import { getTrips, saveTrips, STORAGE_KEY } from "./storage";

type Listener = () => void;

const EMPTY_TRIPS: Trip[] = [];

const listeners = new Set<Listener>();

let cachedRaw: string | null = null;
let cachedSnapshot: Trip[] = EMPTY_TRIPS;

function readSnapshot(): Trip[] {
  if (typeof window === "undefined") {
    return EMPTY_TRIPS;
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) {
    return cachedSnapshot;
  }

  cachedRaw = raw;
  if (!raw) {
    cachedSnapshot = EMPTY_TRIPS;
    return cachedSnapshot;
  }

  try {
    cachedSnapshot = JSON.parse(raw) as Trip[];
  } catch {
    cachedSnapshot = EMPTY_TRIPS;
  }
  return cachedSnapshot;
}

function updateCache(trips: Trip[]): void {
  cachedRaw = localStorage.getItem(STORAGE_KEY);
  cachedSnapshot = trips;
}

export function subscribeTrips(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function notifyTripsChanged(): void {
  listeners.forEach((l) => l());
}

export function getTripsSnapshot(): Trip[] {
  return readSnapshot();
}

export function getTripsServerSnapshot(): Trip[] {
  return EMPTY_TRIPS;
}

export function persistTrips(trips: Trip[]): void {
  saveTrips(trips);
  updateCache(trips);
  notifyTripsChanged();
}

export function persistTrip(trip: Trip): void {
  const trips = getTrips();
  const index = trips.findIndex((t) => t.id === trip.id);
  if (index >= 0) {
    trips[index] = trip;
  } else {
    trips.unshift(trip);
  }
  persistTrips(trips);
}

export function removeTrip(id: string): void {
  persistTrips(getTrips().filter((t) => t.id !== id));
}
