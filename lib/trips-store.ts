import type { Trip } from "./types";
import { getTrips, saveTrips } from "./storage";

type Listener = () => void;

const listeners = new Set<Listener>();

export function subscribeTrips(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function notifyTripsChanged(): void {
  listeners.forEach((l) => l());
}

export function getTripsSnapshot(): Trip[] {
  return getTrips();
}

export function getTripsServerSnapshot(): Trip[] {
  return [];
}

export function persistTrips(trips: Trip[]): void {
  saveTrips(trips);
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
