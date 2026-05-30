"use client";

import { CalendarDays, Package } from "lucide-react";
import type { TabId } from "@/lib/types";

type BottomNavProps = {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
};

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs: { id: TabId; label: string; icon: typeof CalendarDays }[] = [
    { id: "trips", label: "行程", icon: CalendarDays },
    { id: "pack", label: "行李", icon: Package },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-[375px] -translate-x-1/2 border-t border-[#dde8dd] bg-white px-6 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <div className="flex items-center justify-around">
        {tabs.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onTabChange(id)}
              className="flex flex-col items-center gap-1 px-8 py-1"
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                  active
                    ? "bg-[#2d4a3e] text-white"
                    : "text-[#9ab0a8]"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2 : 1.5} />
              </span>
              <span
                className={`text-xs font-medium ${
                  active ? "text-[#2d4a3e]" : "text-[#9ab0a8]"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
