"use client";

import { BookOpen, MapPin, Plus, UserCircle } from "lucide-react";
import type { Trip } from "@/lib/types";
import { TripCard } from "./TripCard";

type TripsViewProps = {
  trips: Trip[];
  onNewTrip: () => void;
  onSelectTrip: (trip: Trip) => void;
};

export function TripsView({ trips, onNewTrip, onSelectTrip }: TripsViewProps) {
  return (
    <div className="flex flex-1 flex-col px-4 pb-28 pt-5">
      {/* 顶部导航 */}
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-[#2d4a3e]" strokeWidth={1.5} />
          <span className="text-sm font-semibold tracking-wide text-[#2d4a3e]">
            Hygge Pack
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onNewTrip}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2d4a3e] text-white shadow-md"
            aria-label="新建行程"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
          </button>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#5c7268]"
            aria-label="个人中心"
          >
            <UserCircle className="h-7 w-7" strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {/* 标题区 */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-[#1c2b26]">
          我的行程
        </h1>
        <p className="mt-1 text-sm text-[#9ab0a8]">探索更轻盈、更有温度的旅。</p>
      </div>

      {/* 行程列表 */}
      <div className="flex flex-col gap-4">
        {trips.map((trip) => (
          <TripCard
            key={trip.id}
            trip={trip}
            onClick={() => onSelectTrip(trip)}
          />
        ))}

        {/* 添加新行程虚线卡 */}
        <button
          type="button"
          onClick={onNewTrip}
          className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[#c8d8c8] bg-[#f7f5f0] py-10 transition-colors hover:border-[#2d4a3e]/40 hover:bg-[#eaf0ea]"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eaf0ea]">
            <MapPin className="h-5 w-5 text-[#4a7c6f]" strokeWidth={1.5} />
          </span>
          <div className="text-center">
            <p className="text-sm font-semibold text-[#2d4a3e]">添加新行程</p>
            <p className="mt-0.5 text-xs text-[#9ab0a8]">
              开启下一段充满灵感的北欧式慢旅。
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
