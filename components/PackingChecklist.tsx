"use client";

import {
  ArrowLeft,
  Backpack,
  Camera,
  CheckCircle2,
  Circle,
  CreditCard,
  Heart,
  HeartPulse,
  Map,
  Save,
  Sparkles,
  Wind,
} from "lucide-react";
import type { DestinationInfo, PackingCategory } from "@/lib/types";
import { countProgress, formatDateRangeShort } from "@/lib/utils";

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  证件与支付: CreditCard,
  衣物与装备: Wind,
  电子设备: Camera,
  日常用品: Backpack,
  健康与安全: HeartPulse,
  行程准备: Map,
};

type PackingChecklistProps = {
  destination: string;
  departureDate: string;
  days: number;
  categories: PackingCategory[];
  destinationInfo?: DestinationInfo;
  imageUrl: string;
  onToggleItem: (categoryId: string, itemId: string) => void;
  onSave: () => void;
  onBack: () => void;
  saving?: boolean;
};

export function PackingChecklist({
  destination,
  departureDate,
  days,
  categories,
  destinationInfo,
  imageUrl,
  onToggleItem,
  onSave,
  onBack,
  saving,
}: PackingChecklistProps) {
  const { checked, total, percent } = countProgress(categories);

  const readyLabel =
    percent === 100 ? "All Ready!" : percent >= 60 ? "Almost There!" : `${percent}% Ready`;

  return (
    <div className="flex flex-1 flex-col pb-32">
      {/* Hero 图 */}
      <div className="relative h-52 w-full shrink-0">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={destination}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-[#2d4a3e]" />
        )}
        {/* 深色渐变遮层 */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/50" />

        {/* 返回按钮 */}
        <button
          type="button"
          onClick={onBack}
          className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm"
          aria-label="返回"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        {/* 目的地标题 */}
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-xs font-medium uppercase tracking-widest text-white/70">
            {formatDateRangeShort(departureDate, days)}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-white drop-shadow-sm">
            {destination}
          </h1>
        </div>
      </div>

      {/* 打包进度块 */}
      <div className="mx-4 mt-4 rounded-2xl bg-white p-4 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9ab0a8]">
          Packing Status
        </p>
        <div className="mt-2 flex items-end justify-between">
          <p className="text-xl font-bold text-[#1c2b26]">
            已完成{" "}
            <span className="text-[#2d4a3e]">
              {checked}
            </span>{" "}
            / {total}
          </p>
          <span className="rounded-full bg-[#eaf0ea] px-3 py-1 text-xs font-semibold text-[#2d4a3e]">
            {readyLabel}
          </span>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#dde8dd]">
          <div
            className="h-full rounded-full bg-[#2d4a3e] transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* 目的地概况卡（如有） */}
      {destinationInfo && (
        <div className="mx-4 mt-3 rounded-2xl bg-[#eaf0ea] p-4">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-[#4a7c6f]" strokeWidth={1.5} />
            <span className="text-xs font-semibold text-[#2d4a3e]">
              {destinationInfo.season} · {destinationInfo.climate}
            </span>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-[#5c7268]">
            {destinationInfo.tips}
          </p>
        </div>
      )}

      {/* 分类清单 */}
      <div className="mx-4 mt-3 flex flex-col gap-3">
        {categories.map((category) => {
          const Icon = CATEGORY_ICONS[category.name] ?? Sparkles;
          const catChecked = category.items.filter((i) => i.checked).length;
          const catTotal = category.items.length;

          return (
            <div
              key={category.id}
              className="rounded-2xl bg-white p-4 shadow-sm"
            >
              {/* 分类头 */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#eaf0ea]">
                    <Icon className="h-4 w-4 text-[#2d4a3e]" strokeWidth={1.5} />
                  </span>
                  <h3 className="text-sm font-semibold text-[#1c2b26]">
                    {category.name}
                  </h3>
                </div>
                <span className="text-xs text-[#9ab0a8]">
                  {catChecked}/{catTotal}
                </span>
              </div>

              {/* 物品列表 */}
              <ul className="space-y-2.5">
                {category.items.map((item) => (
                  <li key={item.id}>
                    <label className="flex cursor-pointer items-start gap-3">
                      <button
                        type="button"
                        onClick={() => onToggleItem(category.id, item.id)}
                        className="mt-0.5 shrink-0"
                        aria-label={item.checked ? "取消勾选" : "勾选"}
                      >
                        {item.checked ? (
                          <CheckCircle2 className="h-5 w-5 text-[#2d4a3e]" strokeWidth={1.5} />
                        ) : (
                          <Circle className="h-5 w-5 text-[#c8d8c8]" strokeWidth={1.5} />
                        )}
                      </button>
                      <span
                        className={`text-sm leading-snug ${
                          item.checked
                            ? "text-[#9ab0a8] line-through"
                            : "text-[#1c2b26]"
                        }`}
                      >
                        {item.name}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* 底部固定区域 */}
      <div className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] left-1/2 z-40 w-full max-w-[375px] -translate-x-1/2 border-t border-[#dde8dd] bg-[#F7F5F0]/95 px-4 pt-3 backdrop-blur-sm">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2d4a3e] py-3.5 text-base font-semibold text-white shadow-md shadow-[#2d4a3e]/20 disabled:opacity-60"
        >
          <Save className="h-5 w-5" strokeWidth={1.5} />
          {saving ? "保存中…" : "完成并保存"}
        </button>
      </div>
    </div>
  );
}
