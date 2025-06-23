"use client";

import { Home, ListChecks, LineChart, User } from "lucide-react";
import { cn } from "@/lib/utils";

type BottomNavProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

const navItems = [
  { id: "home", icon: Home, label: "Home" },
  { id: "activities", icon: ListChecks, label: "Activities" },
  { id: "insights", icon: LineChart, label: "Insights" },
  { id: "profile", icon: User, label: "Profile" },
];

export function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40">
      <div className="bg-white/90 backdrop-blur-lg border-t m-4 rounded-3xl shadow-2xl">
        <div className="flex justify-around py-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex flex-col items-center space-y-1 w-20 h-16 justify-center rounded-2xl transition-all duration-300",
                activeTab === item.id
                  ? "bg-gradient-to-r from-primary to-pink-500 text-primary-foreground shadow-lg"
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs font-medium capitalize">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
