
"use client";

import { Home, ListChecks, LineChart, User, PawPrint } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import type { User as AppUser } from "@/lib/types";

type BottomNavProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  petEnabled: boolean;
  featureVisibility?: AppUser['featureVisibility'];
};

const allNavItems = [
  { id: "home", icon: Home, label: "Home" },
  { id: "activities", icon: ListChecks, label: "Activities" },
  { id: "pet", icon: PawPrint, label: "Pet" },
  { id: "insights", icon: LineChart, label: "Insights" },
  { id: "profile", icon: User, label: "Profile" },
];

export function BottomNav({ activeTab, setActiveTab, petEnabled, featureVisibility }: BottomNavProps) {

  const navItems = useMemo(() => {
    let items = [...allNavItems];
    if (!petEnabled) {
      items = items.filter(item => item.id !== 'pet');
    }

    if (!featureVisibility?.insights) {
      items = items.filter(item => item.id !== 'insights');
    }
    return items;
  }, [petEnabled, featureVisibility]);

  const handleNavClick = (item: typeof allNavItems[0]) => {
    setActiveTab(item.id);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40">
      <div className="bg-white/90 backdrop-blur-lg border-t m-4 rounded-3xl shadow-2xl">
        <div className="flex justify-around py-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={cn(
                "flex flex-col items-center space-y-1 w-14 h-14 justify-center rounded-2xl transition-all duration-300",
                activeTab === item.id
                  ? "bg-gradient-to-r from-primary to-pink-500 text-primary-foreground shadow-lg"
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              <item.icon className="w-5 h-5" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
