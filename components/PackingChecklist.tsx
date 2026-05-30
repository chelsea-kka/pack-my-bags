"use client";

import {
  CreditCard,
  HeartPulse,
  Map,
  Save,
  Shirt,
  Smartphone,
  Sparkles,
  Sun,
  Thermometer,
  Info,
} from "lucide-react";
import type { DestinationInfo, PackingCategory } from "@/lib/types";
import { countProgress, formatDateRange } from "@/lib/utils";

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  证件与支付: CreditCard,
  衣物与装备: Shirt,
  电子设备: Smartphone,
  日常用品: Sparkles,
  健康与安全: HeartPulse,
  行程准备: Map,
};

type PackingChecklistProps = {
  destination: string;
  departureDate: string;
  days: number;
  categories: PackingCategory[];
  destinationInfo?: DestinationInfo;
  onToggleItem: (categoryId: string, itemId: string) => void;
  onSave: () => void;
  saving?: boolean;
};

export function PackingChecklist({
  destination,
  departureDate,
  days,
  categories,
  destinationInfo,
  onToggleItem,
  onSave,
  saving,
}: PackingChecklistProps) {
  const { checked, total, percent } = countProgress(categories);

  return (
    <div className="flex flex-1 flex-col px-4 pb-44">
      <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
        <span className="inline-block rounded-lg bg-[#EEF0FF] px-2.5 py-1 text-xs font-medium text-[#3F29C8]">
          即将出发
        </span>
        <h2 className="mt-2 text-xl font-bold text-gray-900">
          {destination} · {days}天行程
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {formatDateRange(departureDate, days)}
        </p>
      </div>

      {destinationInfo && (
        <div className="mb-4 rounded-2xl bg-gradient-to-br from-[#3F29C8]/10 to-[#7B61FF]/10 p-4 shadow-sm ring-1 ring-[#3F29C8]/10">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#3F29C8]/15">
              <Sun className="h-4 w-4 text-[#3F29C8]" />
            </span>
            <h3 className="text-sm font-semibold text-[#3F29C8]">目的地概况</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Thermometer className="mt-0.5 h-4 w-4 shrink-0 text-[#7B61FF]" />
              <div>
                <span className="text-xs font-medium text-[#3F29C8]">{destinationInfo.season}&nbsp;·&nbsp;</span>
                <span className="text-xs text-gray-600">{destinationInfo.climate}</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#7B61FF]" />
              <p className="text-xs leading-relaxed text-gray-600">{destinationInfo.tips}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {categories.map((category) => {
          const Icon = CATEGORY_ICONS[category.name] ?? Sparkles;
          return (
            <div
              key={category.id}
              className="rounded-2xl bg-white p-4 shadow-sm"
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEF0FF]">
                  <Icon className="h-4 w-4 text-[#3F29C8]" />
                </span>
                <h3 className="font-semibold text-[#3F29C8]">{category.name}</h3>
              </div>
              <ul className="space-y-3">
                {category.items.map((item) => (
                  <li key={item.id}>
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() =>
                          onToggleItem(category.id, item.id)
                        }
                        className="mt-0.5 h-5 w-5 shrink-0 rounded border-gray-300 text-[#3F29C8] focus:ring-[#3F29C8]"
                      />
                      <span
                        className={`text-sm leading-snug ${
                          item.checked
                            ? "text-gray-400 line-through"
                            : "text-gray-700"
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

      <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] left-1/2 z-40 w-full max-w-[375px] -translate-x-1/2 border-t border-purple-100 bg-[#F5F5FF]/95 px-4 pt-3 backdrop-blur-sm">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">
            已完成 {checked} / {total} 项
          </span>
          <span className="font-semibold text-[#3F29C8]">{percent}%</span>
        </div>
        <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-[#EEF0FF]">
          <div
            className="h-full rounded-full bg-[#3F29C8] transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#3F29C8] py-3.5 text-base font-semibold text-white shadow-lg disabled:opacity-60"
        >
          <Save className="h-5 w-5" />
          {saving ? "保存中…" : "完成，保存行程"}
        </button>
      </div>
    </div>
  );
}
