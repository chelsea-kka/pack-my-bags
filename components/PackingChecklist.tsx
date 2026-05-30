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
  Loader2,
  Map,
  Pencil,
  Plus,
  Save,
  Send,
  Sparkles,
  Trash2,
  Wind,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { DestinationInfo, PackingCategory } from "@/lib/types";
import { countProgress, formatDateRangeShort } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<
  string,
  React.ComponentType<{ className?: string; strokeWidth?: number }>
> = {
  证件与支付: CreditCard,
  衣物与装备: Wind,
  电子设备: Camera,
  日常用品: Backpack,
  健康与安全: HeartPulse,
  行程准备: Map,
};

const SWIPE_MAX = 120;
const SWIPE_THRESHOLD = 52;

// ─── SwipeableItem ────────────────────────────────────────────────────────────

function SwipeableItem({
  children,
  onAskAI,
  onEdit,
  onDelete,
}: {
  children: React.ReactNode;
  onAskAI: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [offset, setOffset] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef<number | null>(null);
  const startYRef = useRef<number | null>(null);
  const isHorizontalRef = useRef<boolean | null>(null);
  const offsetRef = useRef(0);

  const snapOpen = useCallback(() => {
    setIsOpen(true);
    setOffset(SWIPE_MAX);
    offsetRef.current = SWIPE_MAX;
  }, []);

  const snapClose = useCallback(() => {
    setIsOpen(false);
    setOffset(0);
    offsetRef.current = 0;
  }, []);

  const onTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    startYRef.current = e.touches[0].clientY;
    isHorizontalRef.current = null;
    setIsDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (startXRef.current === null) return;
    const dx = e.touches[0].clientX - startXRef.current;
    const dy = Math.abs(e.touches[0].clientY - (startYRef.current ?? 0));
    if (isHorizontalRef.current === null && (Math.abs(dx) > 6 || dy > 6)) {
      isHorizontalRef.current = Math.abs(dx) > dy;
    }
    if (!isHorizontalRef.current) return;
    const base = isOpen ? SWIPE_MAX : 0;
    const next = Math.max(0, Math.min(SWIPE_MAX, base + dx));
    setOffset(next);
    offsetRef.current = next;
  };

  const onTouchEnd = () => {
    setIsDragging(false);
    startXRef.current = null;
    if (!isHorizontalRef.current) { isHorizontalRef.current = null; return; }
    isHorizontalRef.current = null;
    offsetRef.current > SWIPE_THRESHOLD ? snapOpen() : snapClose();
  };

  return (
    <div className="relative overflow-hidden">
      {/* 操作按钮区（右滑后从左侧露出） */}
      <div className="absolute inset-y-0 left-0 flex" style={{ width: SWIPE_MAX }}>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onAskAI(); snapClose(); }}
          className="flex flex-1 flex-col items-center justify-center gap-0.5 bg-[#4a7c6f] text-white"
        >
          <Sparkles className="h-4 w-4" strokeWidth={1.5} />
          <span className="text-[10px] font-medium">问AI</span>
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onEdit(); snapClose(); }}
          className="flex flex-1 flex-col items-center justify-center gap-0.5 bg-[#8a9e8a] text-white"
        >
          <Pencil className="h-4 w-4" strokeWidth={1.5} />
          <span className="text-[10px] font-medium">编辑</span>
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="flex flex-1 flex-col items-center justify-center gap-0.5 bg-[#b07070] text-white"
        >
          <Trash2 className="h-4 w-4" strokeWidth={1.5} />
          <span className="text-[10px] font-medium">删除</span>
        </button>
      </div>

      {/* 滑动内容区 */}
      <div
        style={{
          transform: `translateX(${offset}px)`,
          transition: isDragging ? "none" : "transform 0.28s cubic-bezier(0.25,0.46,0.45,0.94)",
          willChange: "transform",
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={isOpen ? snapClose : undefined}
        className="relative bg-white"
      >
        {children}
      </div>
    </div>
  );
}

// ─── EditItemRow ──────────────────────────────────────────────────────────────

function EditItemRow({
  value,
  onChange,
  onConfirm,
  onCancel,
}: {
  value: string;
  onChange: (v: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex items-center gap-2 bg-white py-1.5">
      <input
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onConfirm();
          if (e.key === "Escape") onCancel();
        }}
        className="flex-1 rounded-lg bg-[#f0f4f0] px-3 py-2 text-sm text-[#1c2b26] outline-none focus:ring-2 focus:ring-[#2d4a3e]/20"
      />
      <button type="button" onClick={onConfirm} className="shrink-0 text-[#2d4a3e]">
        <CheckCircle2 className="h-5 w-5" strokeWidth={1.5} />
      </button>
      <button type="button" onClick={onCancel} className="shrink-0 text-[#9ab0a8]">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── AddItemRow ───────────────────────────────────────────────────────────────

function AddItemRow({ onAdd }: { onAdd: (name: string) => void }) {
  const [active, setActive] = useState(false);
  const [value, setValue] = useState("");

  const confirm = () => {
    const t = value.trim();
    if (t) { onAdd(t); setValue(""); setActive(false); }
  };

  if (!active) {
    return (
      <button
        type="button"
        onClick={() => setActive(true)}
        className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-[#9ab0a8] transition-colors hover:text-[#4a7c6f]"
      >
        <Plus className="h-3.5 w-3.5" />
        添加物品
      </button>
    );
  }

  return (
    <div className="mt-3 flex items-center gap-2">
      <input
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") confirm();
          if (e.key === "Escape") { setValue(""); setActive(false); }
        }}
        placeholder="输入物品名称…"
        className="flex-1 rounded-lg bg-[#f0f4f0] px-3 py-2 text-sm text-[#1c2b26] placeholder:text-[#9ab0a8] outline-none focus:ring-2 focus:ring-[#2d4a3e]/20"
      />
      <button type="button" onClick={confirm} className="shrink-0 text-[#2d4a3e]">
        <CheckCircle2 className="h-5 w-5" strokeWidth={1.5} />
      </button>
      <button
        type="button"
        onClick={() => { setValue(""); setActive(false); }}
        className="shrink-0 text-[#9ab0a8]"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── AskAIDrawer ──────────────────────────────────────────────────────────────

type AskAIState = {
  open: boolean;
  itemName: string;
  question: string;
  answer: string;
  loading: boolean;
  error: string | null;
};

const CLOSED_AI: AskAIState = {
  open: false, itemName: "", question: "", answer: "", loading: false, error: null,
};

function AskAIDrawer({
  state,
  onQuestionChange,
  onClose,
  onSend,
  onReset,
}: {
  state: AskAIState;
  onQuestionChange: (q: string) => void;
  onClose: () => void;
  onSend: () => void;
  onReset: () => void;
}) {
  const [bottomOffset, setBottomOffset] = useState(0);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const handler = () => {
      setBottomOffset(window.innerHeight - vv.height - vv.offsetTop);
    };
    vv.addEventListener("resize", handler);
    return () => vv.removeEventListener("resize", handler);
  }, []);

  if (!state.open) return null;

  return (
    <>
      {/* 半透明遮罩 */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* 抽屉本体：flex 列布局，固定高度，保证按钮始终可见 */}
      <div
        className="fixed left-1/2 z-50 flex w-full max-w-[375px] -translate-x-1/2 flex-col rounded-t-3xl bg-white shadow-2xl"
        style={{ maxHeight: "calc(75vh - 4rem)", bottom: `calc(4rem + ${bottomOffset}px)` }}
      >
        {/* 拖动条 */}
        <div className="flex shrink-0 justify-center pb-2 pt-3">
          <div className="h-1 w-10 rounded-full bg-[#dde8dd]" />
        </div>

        {/* 标题栏 */}
        <div className="flex shrink-0 items-center justify-between px-5 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eaf0ea]">
              <Sparkles className="h-3.5 w-3.5 text-[#4a7c6f]" strokeWidth={1.5} />
            </span>
            <div>
              <p className="text-sm font-semibold text-[#1c2b26]">问问 AI 顾问</p>
              {state.itemName && (
                <p className="text-[11px] text-[#9ab0a8]">关于 · {state.itemName}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f0f4f0] text-[#5c7268]"
            aria-label="关闭"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 可滚动内容区 */}
        <div className="flex-1 overflow-y-auto px-5">
          {/* 问题阶段 */}
          {!state.answer && (
            <>
              <textarea
                value={state.question}
                onChange={(e) => onQuestionChange(e.target.value)}
                rows={3}
                className="w-full resize-none rounded-xl bg-[#f0f4f0] px-4 py-3 text-sm text-[#1c2b26] placeholder:text-[#9ab0a8] outline-none focus:ring-2 focus:ring-[#2d4a3e]/20"
                placeholder="输入你的问题…"
              />
              {state.error && (
                <div className="mt-3 rounded-xl bg-red-50 px-4 py-3">
                  <p className="text-xs font-semibold text-red-600">发送失败</p>
                  <p className="mt-1 text-xs leading-relaxed text-red-500">
                    {state.error.length > 80
                      ? "请求失败，请确认 DASHSCOPE_API_KEY 已在 .env.local 中正确配置。"
                      : state.error}
                  </p>
                </div>
              )}
            </>
          )}

          {/* 回答阶段 */}
          {state.answer && (
            <div className="rounded-xl bg-[#eaf0ea] px-4 py-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#4a7c6f]">
                AI 建议
              </p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#1c2b26]">
                {state.answer}
              </p>
            </div>
          )}
        </div>

        {/* 底部按钮区 — 始终固定在抽屉底部 */}
        <div className="shrink-0 border-t border-[#f0f4f0] px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3">
          {!state.answer ? (
            /* 发送按钮 */
            <button
              type="button"
              onClick={onSend}
              disabled={state.loading || !state.question.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2d4a3e] py-3.5 text-base font-semibold text-white shadow-md shadow-[#2d4a3e]/20 disabled:opacity-60"
            >
              {state.loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  AI 思考中，请稍候…
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" strokeWidth={1.5} />
                  发送问题
                </>
              )}
            </button>
          ) : (
            /* 再问按钮 */
            <button
              type="button"
              onClick={onReset}
              className="w-full rounded-2xl border-2 border-[#2d4a3e] py-3.5 text-base font-semibold text-[#2d4a3e] hover:bg-[#eaf0ea]"
            >
              再问一个问题
            </button>
          )}
        </div>
      </div>
    </>
  );
}

// ─── PackingChecklist (main) ──────────────────────────────────────────────────

type EditState = { categoryId: string; itemId: string; value: string } | null;

type PackingChecklistProps = {
  destination: string;
  departureDate: string;
  days: number;
  categories: PackingCategory[];
  destinationInfo?: DestinationInfo;
  onToggleItem: (categoryId: string, itemId: string) => void;
  onAddItem: (categoryId: string, itemName: string) => void;
  onEditItem: (categoryId: string, itemId: string, newName: string) => void;
  onDeleteItem: (categoryId: string, itemId: string) => void;
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
  onToggleItem,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onSave,
  onBack,
  saving,
}: PackingChecklistProps) {
  const { checked, total, percent } = countProgress(categories);

  // ── 编辑状态 ──────────────────────────────────────────────────────────────
  const [editState, setEditState] = useState<EditState>(null);

  const startEdit = useCallback((categoryId: string, itemId: string, name: string) => {
    setEditState({ categoryId, itemId, value: name });
  }, []);

  const confirmEdit = useCallback(() => {
    if (!editState) return;
    const trimmed = editState.value.trim();
    if (trimmed) onEditItem(editState.categoryId, editState.itemId, trimmed);
    setEditState(null);
  }, [editState, onEditItem]);

  // ── 问AI状态 ──────────────────────────────────────────────────────────────
  const [askAI, setAskAI] = useState<AskAIState>(CLOSED_AI);

  const openAskAI = useCallback((itemName: string) => {
    setAskAI({
      open: true,
      itemName,
      question: `我要去${destination}，${itemName}怎么准备？`,
      answer: "",
      loading: false,
      error: null,
    });
  }, [destination]);

  // 使用 ref 读取最新 question，避免闭包陈旧问题
  const askAIRef = useRef(askAI);
  askAIRef.current = askAI;

  const sendAskAI = useCallback(async () => {
    const question = askAIRef.current.question.trim();
    if (!question) return;
    setAskAI((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await fetch("/api/ask-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = (await res.json()) as { answer?: string; error?: string };
      if (!res.ok) throw new Error(data.error || "请求失败");
      setAskAI((s) => ({ ...s, loading: false, answer: data.answer ?? "" }));
    } catch (err) {
      setAskAI((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : "出错了",
      }));
    }
  }, []); // 通过 ref 读取 question，deps 为空

  const readyLabel =
    percent === 100 ? "All Ready! 🎉" : percent >= 60 ? "Almost There!" : `${percent}% Ready`;

  return (
    <div className="flex flex-1 flex-col bg-[#f7f5f0] pb-28">

      {/* ── 顶部 Header ── */}
      <div className="bg-white px-4 pb-4 pt-5 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f0f4f0] text-[#2d4a3e]"
            aria-label="返回"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold text-[#1c2b26]">
              {destination} · {days} 天
            </h1>
            <p className="text-xs text-[#9ab0a8]">
              {formatDateRangeShort(departureDate, days)}
            </p>
          </div>
        </div>

        {/* 进度卡片 */}
        <div className="rounded-2xl bg-[#f7f5f0] px-4 py-3">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#9ab0a8]">
            Packing Status
          </p>
          <div className="flex items-end justify-between">
            <p className="text-lg font-bold text-[#1c2b26]">
              已完成 <span className="text-[#2d4a3e]">{checked}</span> / {total}
            </p>
            <span className="rounded-full bg-[#2d4a3e]/10 px-2.5 py-0.5 text-xs font-semibold text-[#2d4a3e]">
              {readyLabel}
            </span>
          </div>
          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-[#dde8dd]">
            <div
              className="h-full rounded-full bg-[#2d4a3e] transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── 目的地概况 ── */}
      {destinationInfo && (
        <div className="mx-4 mt-3 rounded-2xl bg-[#eaf0ea] px-4 py-3">
          <div className="flex items-center gap-2">
            <Heart className="h-3.5 w-3.5 text-[#4a7c6f]" strokeWidth={1.5} />
            <span className="text-xs font-semibold text-[#2d4a3e]">
              {destinationInfo.season} · {destinationInfo.climate}
            </span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-[#5c7268]">
            {destinationInfo.tips}
          </p>
        </div>
      )}

      {/* ── 分类清单 ── */}
      <div className="mx-4 mt-3 flex flex-col gap-3">
        {categories.map((category) => {
          const Icon = CATEGORY_ICONS[category.name] ?? Sparkles;
          const catChecked = category.items.filter((i) => i.checked).length;
          const catTotal = category.items.length;

          return (
            <div key={category.id} className="rounded-2xl bg-white shadow-sm">
              {/* 分类标题 */}
              <div className="flex items-center justify-between px-4 pb-2 pt-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#eaf0ea]">
                    <Icon className="h-4 w-4 text-[#2d4a3e]" strokeWidth={1.5} />
                  </span>
                  <h3 className="text-sm font-semibold text-[#1c2b26]">{category.name}</h3>
                </div>
                <span className="text-xs text-[#9ab0a8]">{catChecked}/{catTotal}</span>
              </div>

              {/* 物品列表 */}
              <ul>
                {category.items.map((item) => {
                  const isEditing =
                    editState?.categoryId === category.id &&
                    editState?.itemId === item.id;

                  return (
                    <li key={item.id} className="border-t border-[#f0f4f0] first:border-t-0">
                      {isEditing ? (
                        <div className="px-4 py-1">
                          <EditItemRow
                            value={editState.value}
                            onChange={(v) => setEditState((s) => s ? { ...s, value: v } : s)}
                            onConfirm={confirmEdit}
                            onCancel={() => setEditState(null)}
                          />
                        </div>
                      ) : (
                        <SwipeableItem
                          onAskAI={() => openAskAI(item.name)}
                          onEdit={() => startEdit(category.id, item.id, item.name)}
                          onDelete={() => onDeleteItem(category.id, item.id)}
                        >
                          <label className="flex cursor-pointer items-start gap-3 px-4 py-2.5">
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
                                item.checked ? "text-[#9ab0a8] line-through" : "text-[#1c2b26]"
                              }`}
                            >
                              {item.name}
                            </span>
                          </label>
                        </SwipeableItem>
                      )}
                    </li>
                  );
                })}
              </ul>

              {/* 添加物品 */}
              <div className="px-4 pb-4">
                <AddItemRow onAdd={(name) => onAddItem(category.id, name)} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 固定底部保存按钮 ── */}
      <div className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] left-1/2 z-40 w-full max-w-[375px] -translate-x-1/2 border-t border-[#dde8dd] bg-[#f7f5f0]/95 px-4 pt-3 backdrop-blur-sm">
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

      {/* ── 问AI抽屉 ── */}
      <AskAIDrawer
        state={askAI}
        onQuestionChange={(q) => setAskAI((s) => ({ ...s, question: q }))}
        onClose={() => setAskAI(CLOSED_AI)}
        onSend={sendAskAI}
        onReset={() =>
          setAskAI((s) => ({
            ...s,
            answer: "",
            error: null,
            question: `我要去${destination}，${s.itemName}怎么准备？`,
          }))
        }
      />
    </div>
  );
}
