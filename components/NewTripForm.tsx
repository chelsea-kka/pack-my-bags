"use client";

import {
  Calendar,
  Clock,
  Lightbulb,
  MapPin,
  Minus,
  Plus,
  Text,
} from "lucide-react";

type NewTripFormProps = {
  destination: string;
  departureDate: string;
  days: number;
  additionalInfo: string;
  loading: boolean;
  error: string | null;
  onDestinationChange: (v: string) => void;
  onDepartureDateChange: (v: string) => void;
  onDaysChange: (v: number) => void;
  onAdditionalInfoChange: (v: string) => void;
  onSubmit: () => void;
};

export function NewTripForm({
  destination,
  departureDate,
  days,
  additionalInfo,
  loading,
  error,
  onDestinationChange,
  onDepartureDateChange,
  onDaysChange,
  onAdditionalInfoChange,
  onSubmit,
}: NewTripFormProps) {
  return (
    <div className="flex flex-1 flex-col px-4 pb-28">
      <div className="mb-4 overflow-hidden rounded-2xl bg-gradient-to-br from-[#3F29C8] to-[#5B4AE8] p-5 text-white shadow-lg">
        <p className="text-lg font-bold">开启你的下一段旅程</p>
        <p className="mt-1 text-sm text-white/80">
          我们将为你智能生成行李清单
        </p>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <Field label="目的地" icon={MapPin}>
          <input
            type="text"
            value={destination}
            onChange={(e) => onDestinationChange(e.target.value)}
            placeholder="要去哪里？"
            className="w-full rounded-xl bg-[#EEF0FF] px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#3F29C8]/30"
          />
        </Field>

        <Field label="出发时间" icon={Calendar}>
          <div className="relative">
            <input
              type="date"
              value={departureDate}
              onChange={(e) => onDepartureDateChange(e.target.value)}
              className="w-full rounded-xl bg-[#EEF0FF] px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-[#3F29C8]/30"
            />
          </div>
        </Field>

        <Field label="旅行天数" icon={Clock}>
          <div className="flex items-center justify-between rounded-xl bg-[#EEF0FF] px-4 py-2">
            <button
              type="button"
              onClick={() => onDaysChange(Math.max(1, days - 1))}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3F29C8] text-white"
              aria-label="减少天数"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="text-lg font-semibold text-gray-900">
              {days}{" "}
              <span className="text-sm font-normal text-gray-500">天</span>
            </span>
            <button
              type="button"
              onClick={() => onDaysChange(days + 1)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3F29C8] text-white"
              aria-label="增加天数"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </Field>

        <Field label="补充信息" icon={Text} optional>
          <textarea
            value={additionalInfo}
            onChange={(e) => onAdditionalInfoChange(e.target.value)}
            placeholder="例如：带小孩、商务出行、冬季旅行"
            rows={3}
            className="w-full resize-none rounded-xl bg-[#EEF0FF] px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#3F29C8]/30"
          />
        </Field>
      </div>

      <div className="mt-4 flex gap-2 rounded-xl bg-[#EEF0FF] p-3 text-sm text-gray-600">
        <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-[#3F29C8]" />
        <p>
          温馨提示：准确的信息能帮助我们更好地规划您的行李，比如冬夏温差或亲子出行的特殊需求。
        </p>
      </div>

      {error && (
        <p className="mt-3 text-center text-sm text-red-500">{error}</p>
      )}

      <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] left-1/2 z-40 w-full max-w-[375px] -translate-x-1/2 px-4">
        <button
          type="button"
          onClick={onSubmit}
          disabled={loading}
          className="w-full rounded-2xl bg-[#3F29C8] py-4 text-base font-semibold text-white shadow-lg shadow-purple-300/50 transition-opacity disabled:opacity-60"
        >
          {loading ? "正在生成清单…" : "生成打包清单"}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  icon: Icon,
  optional,
  children,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="mb-2 flex items-center gap-1.5">
        <Icon className="h-4 w-4 text-[#3F29C8]" />
        <span className="text-sm font-medium text-gray-700">{label}</span>
        {optional && (
          <span className="text-xs text-gray-400">（选填）</span>
        )}
      </div>
      {children}
    </div>
  );
}
