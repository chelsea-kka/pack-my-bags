"use client";

import {
  ArrowLeft,
  Calendar,
  Clock,
  Loader2,
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
  onBack: () => void;
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
  onBack,
}: NewTripFormProps) {
  return (
    <div className="flex flex-1 flex-col pb-28">
      {/* 顶部导航 */}
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-full p-2 text-[#2d4a3e] hover:bg-[#eaf0ea]"
          aria-label="返回"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-base font-bold text-[#1c2b26]">新建行程</h1>
      </div>

      <div className="px-4">
      {/* 顶部 banner */}
      <div className="mb-5 overflow-hidden rounded-2xl bg-[#2d4a3e] p-5 text-white shadow-md">
        <p className="text-lg font-bold tracking-tight">开启你的下一段旅程</p>
        <p className="mt-1 text-sm text-white/70">
          告诉我目的地，我们来帮你智能打包
        </p>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <Field label="目的地" icon={MapPin}>
          <input
            type="text"
            value={destination}
            onChange={(e) => onDestinationChange(e.target.value)}
            placeholder="要去哪里？"
            className="w-full rounded-xl bg-[#f0f4f0] px-4 py-3 text-[#1c2b26] placeholder:text-[#9ab0a8] outline-none focus:ring-2 focus:ring-[#2d4a3e]/25"
          />
        </Field>

        <Field label="出发时间" icon={Calendar}>
          <input
            type="date"
            value={departureDate}
            onChange={(e) => onDepartureDateChange(e.target.value)}
            className="w-full rounded-xl bg-[#f0f4f0] px-4 py-3 text-[#1c2b26] outline-none focus:ring-2 focus:ring-[#2d4a3e]/25"
          />
        </Field>

        <Field label="旅行天数" icon={Clock}>
          <div className="flex items-center justify-between rounded-xl bg-[#f0f4f0] px-4 py-2">
            <button
              type="button"
              onClick={() => onDaysChange(Math.max(1, days - 1))}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2d4a3e] text-white"
              aria-label="减少天数"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="text-lg font-semibold text-[#1c2b26]">
              {days}{" "}
              <span className="text-sm font-normal text-[#9ab0a8]">天</span>
            </span>
            <button
              type="button"
              onClick={() => onDaysChange(days + 1)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2d4a3e] text-white"
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
            placeholder="告诉我你的特殊需求，例如：带小孩、商务出行、需要拍摄、住青旅需自备洗漱、蜜月旅行..."
            rows={3}
            className="w-full resize-none rounded-xl bg-[#f0f4f0] px-4 py-3 text-[#1c2b26] placeholder:text-[#9ab0a8] outline-none focus:ring-2 focus:ring-[#2d4a3e]/25"
          />
        </Field>
      </div>
      </div>

      {error && (
        <div
          className="mx-4 mt-3 max-h-48 overflow-y-auto rounded-xl border border-red-200 bg-red-50 p-3 text-left"
          role="alert"
        >
          <p className="mb-1 text-xs font-semibold text-red-700">错误详情</p>
          <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-red-600">
            {error}
          </pre>
        </div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#f7f5f0]/90 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-3xl bg-white px-10 py-8 shadow-xl">
            <Loader2 className="h-10 w-10 animate-spin text-[#2d4a3e]" strokeWidth={1.5} />
            <p className="text-sm font-medium text-[#2d4a3e]">正在为你生成专属清单...</p>
            <p className="text-xs text-[#9ab0a8]">AI 正在分析你的行程，请稍候</p>
          </div>
        </div>
      )}

      <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] left-1/2 z-40 w-full max-w-[375px] -translate-x-1/2 px-4">
        <button
          type="button"
          onClick={onSubmit}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2d4a3e] py-4 text-base font-semibold text-white shadow-lg shadow-[#2d4a3e]/20 transition-opacity disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              正在为你生成专属清单...
            </>
          ) : (
            "生成打包清单"
          )}
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
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="mb-2 flex items-center gap-1.5">
        <Icon className="h-4 w-4 text-[#4a7c6f]" strokeWidth={1.5} />
        <span className="text-sm font-medium text-[#1c2b26]">{label}</span>
        {optional && (
          <span className="text-xs text-[#9ab0a8]">（选填）</span>
        )}
      </div>
      {children}
    </div>
  );
}
