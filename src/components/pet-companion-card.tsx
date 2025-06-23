"use client";

import { PawPrint, ChevronsRight } from "lucide-react";

type PetCompanionCardProps = {
  onClick: () => void;
};

export function PetCompanionCard({ onClick }: PetCompanionCardProps) {
  return (
    <button onClick={onClick} className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-4 flex items-center justify-between space-x-4 text-left hover:border-blue-300 transition-colors">
      <div className="flex items-start space-x-4">
        <div className="p-2 bg-blue-100 rounded-full mt-1">
          <PawPrint className="text-blue-600 w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-blue-800">
            Chat with your Pet
          </p>
          <p className="text-xs text-blue-700">
            Ask your companion for insights about your day.
          </p>
        </div>
      </div>
      <ChevronsRight className="text-blue-500 w-5 h-5" />
    </button>
  );
}
