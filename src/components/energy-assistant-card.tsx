"use client";

import { BrainCircuit } from "lucide-react";
import { Skeleton } from "./ui/skeleton";

type EnergyAssistantCardProps = {
  suggestion: string | null;
  loading: boolean;
};

export function EnergyAssistantCard({ suggestion, loading }: EnergyAssistantCardProps) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-4 flex items-start space-x-4">
      <div className="p-2 bg-blue-100 rounded-full mt-1">
        <BrainCircuit className="text-blue-600 w-5 h-5" />
      </div>
      <div className="flex-1">
        {loading ? (
            <div className="space-y-2">
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-2/3" />
            </div>
        ) : (
          <p className="text-sm font-medium text-blue-800">
            {suggestion || "No suggestions at the moment. Try logging an activity!"}
          </p>
        )}
      </div>
    </div>
  );
}
