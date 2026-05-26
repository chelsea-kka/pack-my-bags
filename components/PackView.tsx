"use client";

import { ArrowLeft, MoreVertical } from "lucide-react";
import { useCallback, useState } from "react";
import type { PackingCategory, Trip } from "@/lib/types";
import { generateId, getCityImageUrl } from "@/lib/utils";
import { NewTripForm } from "./NewTripForm";
import { PackingChecklist } from "./PackingChecklist";

type PackMode = "input" | "checklist";

type PackViewProps = {
  editingTrip: Trip | null;
  onSaveTrip: (trip: Trip) => void;
  onReset: () => void;
  onBack?: () => void;
};

function todayISO(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function categoriesFromApi(
  apiCategories: { name: string; items: string[] }[]
): PackingCategory[] {
  return apiCategories.map((cat) => ({
    id: generateId(),
    name: cat.name,
    items: cat.items.map((name) => ({
      id: generateId(),
      name,
      checked: false,
    })),
  }));
}

export function PackView({
  editingTrip,
  onSaveTrip,
  onReset,
  onBack,
}: PackViewProps) {
  const [mode, setMode] = useState<PackMode>(
    editingTrip ? "checklist" : "input"
  );
  const [destination, setDestination] = useState(
    editingTrip?.destination ?? ""
  );
  const [departureDate, setDepartureDate] = useState(
    editingTrip?.departureDate ?? todayISO()
  );
  const [days, setDays] = useState(editingTrip?.days ?? 5);
  const [additionalInfo, setAdditionalInfo] = useState(
    editingTrip?.additionalInfo ?? ""
  );
  const [categories, setCategories] = useState<PackingCategory[]>(
    editingTrip?.categories ?? []
  );
  const [tripId, setTripId] = useState(editingTrip?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!destination.trim()) {
      setError("请填写目的地");
      return;
    }
    if (!departureDate) {
      setError("请选择出发时间");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/generate-packing-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: destination.trim(),
          days,
          departureDate,
          additionalInfo: additionalInfo.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "生成失败");
      }

      setCategories(categoriesFromApi(data.categories));
      setTripId(generateId());
      setMode("checklist");
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  }, [destination, departureDate, days, additionalInfo]);

  const handleToggleItem = (categoryId: string, itemId: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              items: cat.items.map((item) =>
                item.id === itemId
                  ? { ...item, checked: !item.checked }
                  : item
              ),
            }
          : cat
      )
    );
  };

  const handleSave = () => {
    setSaving(true);
    const trip: Trip = {
      id: tripId || editingTrip?.id || generateId(),
      destination: destination.trim(),
      departureDate,
      days,
      additionalInfo: additionalInfo.trim() || undefined,
      categories,
      imageUrl:
        editingTrip?.imageUrl ?? getCityImageUrl(destination.trim()),
      createdAt: editingTrip?.createdAt ?? new Date().toISOString(),
    };
    onSaveTrip(trip);
    setSaving(false);
    resetForm();
    onReset();
  };

  const resetForm = () => {
    setMode("input");
    setDestination("");
    setDepartureDate(todayISO());
    setDays(5);
    setAdditionalInfo("");
    setCategories([]);
    setTripId("");
    setError(null);
  };

  const handleBack = () => {
    if (mode === "checklist" && !editingTrip) {
      setMode("input");
      return;
    }
    onBack?.();
  };

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-4 py-3">
        <button
          type="button"
          onClick={handleBack}
          className="rounded-full p-2 text-[#3F29C8] hover:bg-purple-50"
          aria-label="返回"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-base font-bold text-[#3F29C8]">
          {mode === "input" ? "新建行程" : "Pack My Bags"}
        </h1>
        <button
          type="button"
          className="rounded-full p-2 text-[#3F29C8] hover:bg-purple-50"
          aria-label="更多"
        >
          <MoreVertical className="h-5 w-5" />
        </button>
      </header>

      {mode === "input" ? (
        <NewTripForm
          destination={destination}
          departureDate={departureDate}
          days={days}
          additionalInfo={additionalInfo}
          loading={loading}
          error={error}
          onDestinationChange={setDestination}
          onDepartureDateChange={setDepartureDate}
          onDaysChange={setDays}
          onAdditionalInfoChange={setAdditionalInfo}
          onSubmit={handleGenerate}
        />
      ) : (
        <PackingChecklist
          destination={destination}
          departureDate={departureDate}
          days={days}
          categories={categories}
          onToggleItem={handleToggleItem}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </div>
  );
}
