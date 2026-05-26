"use client";

import type { Trip } from "@/lib/types";
import { formatDate, tripProgress } from "@/lib/utils";

type TripCardProps = {
  trip: Trip;
  onClick: () => void;
};

export function TripCard({ trip, onClick }: TripCardProps) {
  const { checked, total, percent } = tripProgress(trip);

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full overflow-hidden rounded-2xl bg-white text-left shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative h-36 w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={trip.imageUrl}
          alt={trip.destination}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white" />
      </div>
      <div className="px-4 pb-4 -mt-6 relative">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-bold text-gray-900">{trip.destination}</h3>
          <span className="shrink-0 text-sm font-semibold text-[#3F29C8]">
            {trip.days}天
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          {formatDate(trip.departureDate)}
        </p>
        <div className="mt-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">
              已打包 {checked} / {total} 项
            </span>
            <span className="font-semibold text-[#3F29C8]">{percent}%</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#EEF0FF]">
            <div
              className="h-full rounded-full bg-[#3F29C8] transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>
    </button>
  );
}
