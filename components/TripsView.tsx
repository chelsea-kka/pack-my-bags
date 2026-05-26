"use client";

import { Bell, Luggage, Plus } from "lucide-react";
import type { Trip } from "@/lib/types";
import { TripCard } from "./TripCard";

type TripsViewProps = {
  trips: Trip[];
  onNewTrip: () => void;
  onSelectTrip: (trip: Trip) => void;
};

export function TripsView({ trips, onNewTrip, onSelectTrip }: TripsViewProps) {
  return (
    <div className="flex flex-1 flex-col px-4 pb-28 pt-4">
      <header className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Luggage className="h-5 w-5 text-[#3F29C8]" />
          <span className="text-sm font-semibold text-[#3F29C8]">
            Pack My Bags
          </span>
        </div>
        <button
          type="button"
          className="rounded-full p-2 text-gray-500 hover:bg-purple-50"
          aria-label="通知"
        >
          <Bell className="h-5 w-5" />
        </button>
      </header>

      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">我的行程</h1>
        <button
          type="button"
          onClick={onNewTrip}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3F29C8] text-white shadow-lg shadow-purple-300/50"
          aria-label="新建行程"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {trips.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF0FF]">
            <Luggage className="h-8 w-8 text-[#3F29C8]/60" />
          </div>
          <p className="text-gray-500">还没有行程，点击 + 开始规划</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {trips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              onClick={() => onSelectTrip(trip)}
            />
          ))}
        </div>
      )}

      {trips.length > 0 && (
        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-40 mx-auto max-w-[375px] px-4">
          <button
            type="button"
            onClick={onNewTrip}
            className="pointer-events-auto ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#3F29C8] text-white shadow-xl shadow-purple-400/40"
            aria-label="新建行程"
          >
            <Plus className="h-6 w-6" />
          </button>
        </div>
      )}
    </div>
  );
}
