"use client";

import { useCallback, useState } from "react";
import type { DestinationInfo, PackingCategory, Trip } from "@/lib/types";
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
  return new Date().toISOString().slice(0, 10);
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
  const [destination, setDestination] = useState(editingTrip?.destination ?? "");
  const [departureDate, setDepartureDate] = useState(editingTrip?.departureDate ?? todayISO());
  const [days, setDays] = useState(editingTrip?.days ?? 5);
  const [additionalInfo, setAdditionalInfo] = useState(editingTrip?.additionalInfo ?? "");
  const [categories, setCategories] = useState<PackingCategory[]>(editingTrip?.categories ?? []);
  const [destinationInfo, setDestinationInfo] = useState<DestinationInfo | undefined>(editingTrip?.destinationInfo);
  const [imageUrl, setImageUrl] = useState<string>(editingTrip?.imageUrl ?? "");
  const [tripId, setTripId] = useState(editingTrip?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Generate ──────────────────────────────────────────────────────────────
  const handleGenerate = useCallback(async () => {
    if (!destination.trim()) { setError("请填写目的地"); return; }
    if (!departureDate)      { setError("请选择出发时间"); return; }

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
      const data = (await res.json()) as {
        error?: string;
        details?: string;
        categories?: { name: string; items: string[] }[];
        destinationInfo?: DestinationInfo;
      };
      if (!res.ok) throw new Error([data.error, data.details].filter(Boolean).join("\n\n") || "生成失败");
      if (!data.categories?.length) throw new Error("API 未返回清单数据");

      setCategories(categoriesFromApi(data.categories));
      setDestinationInfo(data.destinationInfo);
      setImageUrl(getCityImageUrl(destination.trim()));
      setTripId(generateId());
      setMode("checklist");
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  }, [destination, departureDate, days, additionalInfo]);

  // ── Item operations ───────────────────────────────────────────────────────
  const handleToggleItem = useCallback((categoryId: string, itemId: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id !== categoryId ? cat : {
          ...cat,
          items: cat.items.map((item) =>
            item.id === itemId ? { ...item, checked: !item.checked } : item
          ),
        }
      )
    );
  }, []);

  const handleAddItem = useCallback((categoryId: string, itemName: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id !== categoryId ? cat : {
          ...cat,
          items: [...cat.items, { id: generateId(), name: itemName, checked: false }],
        }
      )
    );
  }, []);

  const handleEditItem = useCallback((categoryId: string, itemId: string, newName: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id !== categoryId ? cat : {
          ...cat,
          items: cat.items.map((item) =>
            item.id === itemId ? { ...item, name: newName } : item
          ),
        }
      )
    );
  }, []);

  const handleDeleteItem = useCallback((categoryId: string, itemId: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id !== categoryId ? cat : {
          ...cat,
          items: cat.items.filter((item) => item.id !== itemId),
        }
      )
    );
  }, []);

  // ── Save / reset ──────────────────────────────────────────────────────────
  const handleSave = () => {
    setSaving(true);
    const trip: Trip = {
      id: tripId || editingTrip?.id || generateId(),
      destination: destination.trim(),
      departureDate,
      days,
      additionalInfo: additionalInfo.trim() || undefined,
      categories,
      destinationInfo,
      imageUrl: imageUrl || editingTrip?.imageUrl || getCityImageUrl(destination.trim()),
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
    setDestinationInfo(undefined);
    setImageUrl("");
    setTripId("");
    setError(null);
  };

  const handleBack = () => {
    if (mode === "checklist" && !editingTrip) { setMode("input"); return; }
    onBack?.();
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (mode === "input") {
    return (
      <div className="flex flex-1 flex-col">
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
          onBack={handleBack}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <PackingChecklist
        destination={destination}
        departureDate={departureDate}
        days={days}
        categories={categories}
        destinationInfo={destinationInfo}
        onToggleItem={handleToggleItem}
        onAddItem={handleAddItem}
        onEditItem={handleEditItem}
        onDeleteItem={handleDeleteItem}
        onSave={handleSave}
        onBack={handleBack}
        saving={saving}
      />
    </div>
  );
}
