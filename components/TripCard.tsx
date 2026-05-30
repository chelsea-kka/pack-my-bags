"use client";

import { useCallback, useRef, useState } from "react";
import type { Trip } from "@/lib/types";
import { formatDateRangeShort, tripProgress } from "@/lib/utils";

type TripCardProps = {
  trip: Trip;
  onClick: () => void;
  onDelete: (id: string) => void;
};

function StatusBadge({ percent }: { percent: number }) {
  if (percent === 100)
    return (
      <span className="rounded-full bg-[#2d4a3e] px-3 py-1 text-xs font-medium text-white shadow-sm">
        已完成
      </span>
    );
  if (percent >= 60)
    return (
      <span className="rounded-full bg-[#2d4a3e]/90 px-3 py-1 text-xs font-medium text-white shadow-sm">
        即将启程
      </span>
    );
  if (percent > 0)
    return (
      <span className="rounded-full bg-white/85 px-3 py-1 text-xs font-medium text-[#2d4a3e] shadow-sm backdrop-blur-sm">
        行程规划中
      </span>
    );
  return null;
}

export function TripCard({ trip, onClick, onDelete }: TripCardProps) {
  const { checked, total, percent } = tripProgress(trip);
  const [showConfirm, setShowConfirm] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPressRef = useRef(false);

  const startPress = useCallback(() => {
    didLongPressRef.current = false;
    timerRef.current = setTimeout(() => {
      didLongPressRef.current = true;
      setShowConfirm(true);
    }, 500);
  }, []);

  const cancelPress = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleClick = useCallback(() => {
    if (!didLongPressRef.current) onClick();
  }, [onClick]);

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        onMouseDown={startPress}
        onMouseUp={cancelPress}
        onMouseLeave={cancelPress}
        onTouchStart={startPress}
        onTouchEnd={cancelPress}
        onTouchCancel={cancelPress}
        className="w-full overflow-hidden rounded-2xl bg-white text-left shadow-sm transition-shadow hover:shadow-md active:scale-[0.99]"
      >
        {/* 配图区 */}
        <div className="relative h-44 w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={trip.imageUrl}
            alt={trip.destination}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-white/60" />
          <div className="absolute right-3 top-3">
            <StatusBadge percent={percent} />
          </div>
          {/* Long-press hint */}
          <div className="absolute bottom-2 left-3">
            <span className="rounded-full bg-black/20 px-2 py-0.5 text-[10px] text-white/70 backdrop-blur-sm">
              长按删除
            </span>
          </div>
        </div>

        {/* 信息区 */}
        <div className="px-4 pb-4 pt-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-bold text-[#1c2b26]">{trip.destination}</h3>
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

      {/* Delete confirmation modal */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-8"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="w-full max-w-[280px] rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm font-bold text-[#1c2b26]">删除行程</p>
            <p className="mt-2 text-sm leading-relaxed text-[#5c7268]">
              确认删除「{trip.destination}」行程吗？此操作不可恢复。
            </p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-xl border border-[#dde8dd] py-2.5 text-sm font-medium text-[#5c7268]"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  onDelete(trip.id);
                  setShowConfirm(false);
                }}
                className="flex-1 rounded-xl bg-[#b07070] py-2.5 text-sm font-semibold text-white"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
