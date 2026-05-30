"use client";

import type { Trip } from "@/lib/types";
import { formatDateRangeShort, tripProgress } from "@/lib/utils";

type TripCardProps = {
  trip: Trip;
  onClick: () => void;
};

function StatusBadge({ percent }: { percent: number }) {
  if (percent === 100) {
    return (
      <span className="rounded-full bg-[#2d4a3e] px-3 py-1 text-xs font-medium text-white shadow-sm">
        已完成
      </span>
    );
  }
  if (percent >= 60) {
    return (
      <span className="rounded-full bg-[#2d4a3e]/90 px-3 py-1 text-xs font-medium text-white shadow-sm">
        即将启程
      </span>
    );
  }
  if (percent > 0) {
    return (
      <span className="rounded-full bg-white/85 px-3 py-1 text-xs font-medium text-[#2d4a3e] shadow-sm backdrop-blur-sm">
        行程规划中
      </span>
    );
  }
  return null;
}

export function TripCard({ trip, onClick }: TripCardProps) {
  const { checked, total, percent } = tripProgress(trip);

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full overflow-hidden rounded-2xl bg-white text-left shadow-sm transition-shadow hover:shadow-md"
    >
      {/* 配图区 */}
      <div className="relative h-44 w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={trip.imageUrl}
          alt={trip.destination}
          className="h-full w-full object-cover"
        />
        {/* 渐变遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-white/60" />
        {/* 状态角标 */}
        <div className="absolute right-3 top-3">
          <StatusBadge percent={percent} />
        </div>
      </div>

      {/* 信息区 */}
      <div className="px-4 pb-4 pt-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-bold text-[#1c2b26]">
            {trip.destination}
          </h3>
          <div className="flex flex-col items-end">
            <span className="text-xs text-[#9ab0a8]">打包进度</span>
            <span className="text-xl font-bold leading-tight text-[#2d4a3e]">
              {percent}%
            </span>
          </div>
        </div>
        <p className="mt-0.5 text-xs text-[#9ab0a8]">
          {formatDateRangeShort(trip.departureDate, trip.days)}
        </p>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#dde8dd]">
          <div
            className="h-full rounded-full bg-[#2d4a3e] transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
        {total > 0 && (
          <p className="mt-1.5 text-[11px] text-[#9ab0a8]">
            已打包 {checked} / {total} 项
          </p>
        )}
      </div>
    </button>
  );
}
