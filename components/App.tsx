"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import type { TabId, Trip } from "@/lib/types";
import {
  getTripsServerSnapshot,
  getTripsSnapshot,
  persistTrip,
  subscribeTrips,
} from "@/lib/trips-store";
import { BottomNav } from "./BottomNav";
import { PackView } from "./PackView";
import { TripsView } from "./TripsView";

export function App() {
  const [activeTab, setActiveTab] = useState<TabId>("trips");
  const trips = useSyncExternalStore(
    subscribeTrips,
    getTripsSnapshot,
    getTripsServerSnapshot
  );
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [packKey, setPackKey] = useState(0);

  const handleSaveTrip = useCallback((trip: Trip) => {
    persistTrip(trip);
    setEditingTrip(null);
    setActiveTab("trips");
  }, []);

  const handleNewTrip = () => {
    setEditingTrip(null);
    setPackKey((k) => k + 1);
    setActiveTab("pack");
  };

  const handleSelectTrip = (trip: Trip) => {
    setEditingTrip(trip);
    setPackKey((k) => k + 1);
    setActiveTab("pack");
  };

  const handlePackReset = () => {
    setEditingTrip(null);
    setPackKey((k) => k + 1);
  };

  const handleTabChange = (tab: TabId) => {
    if (tab === "pack" && activeTab !== "pack") {
      setEditingTrip(null);
      setPackKey((k) => k + 1);
    }
    setActiveTab(tab);
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[375px] flex-col bg-[#F7F5F0]">
      {activeTab === "trips" ? (
        <TripsView
          trips={trips}
          onNewTrip={handleNewTrip}
          onSelectTrip={handleSelectTrip}
        />
      ) : (
        <PackView
          key={packKey}
          editingTrip={editingTrip}
          onSaveTrip={handleSaveTrip}
          onReset={handlePackReset}
          onBack={() => setActiveTab("trips")}
        />
      )}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}
