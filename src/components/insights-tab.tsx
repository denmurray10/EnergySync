"use client";

import type { Achievement, Activity } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, BrainCircuit, Users, Link as LinkIcon, LineChart } from "lucide-react";
import { WeeklyEnergyChart } from "./weekly-energy-chart";

type InsightsTabProps = {
  dynamicInsights: { drainPattern: string; rechargePattern: string };
  selfCareStreak: number;
  achievements: Achievement[];
  currentEnergy: number;
  activities: Activity[];
  openModal: (modalName: string) => void;
  simulateHealthSync: () => void;
};

export function InsightsTab({
  dynamicInsights,
  selfCareStreak,
  achievements,
  currentEnergy,
  activities,
  openModal,
  simulateHealthSync,
}: InsightsTabProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
        Insights
      </h2>

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <LineChart className="text-cyan-500 mr-3" /> Weekly Energy Flow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <WeeklyEnergyChart activities={activities} />
        </CardContent>
      </Card>

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Trophy className="text-amber-500 mr-3" /> Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-around text-center mb-4">
            <div>
              <p className="text-2xl font-bold text-amber-600">
                {selfCareStreak}
              </p>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">
                {achievements.filter((a) => a.unlocked).length}/
                {achievements.length}
              </p>
              <p className="text-sm text-muted-foreground">Achievements</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {achievements.map((ach) => (
              <Badge
                key={ach.id}
                variant={ach.unlocked ? "default" : "secondary"}
                className={`transition-all ${
                  ach.unlocked
                    ? "bg-amber-100 text-amber-800 border-amber-200"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                <span className="text-md mr-2">{ach.icon}</span>
                <span className="text-xs font-medium">{ach.name}</span>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <BrainCircuit className="text-purple-500 mr-3" /> AI Pattern
            Recognition
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center space-x-3">
            <span className="text-2xl">⚡️</span>
            <p className="text-sm text-gray-700">
              {dynamicInsights.drainPattern}
            </p>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex items-center space-x-3">
            <span className="text-2xl">🎯</span>
            <p className="text-sm text-gray-700">
              {dynamicInsights.rechargePattern}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Users className="text-blue-500 mr-3" /> Community Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            How you compare to the community (anonymised).
          </p>
          <div className="space-y-2">
            <p className="text-sm text-card-foreground">
              Your Avg. Energy:{" "}
              <span className="font-bold text-blue-600">
                {Math.round(currentEnergy)}%
              </span>{" "}
              vs. Community Avg: <span className="font-bold">68%</span>
            </p>
            <p className="text-sm text-card-foreground">
              Most common recharge:{" "}
              <span className="font-bold text-blue-600">🎵 Music</span>
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <LinkIcon className="text-gray-500 mr-3" /> Integrations
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-around">
          <Button
            onClick={simulateHealthSync}
            className="text-sm bg-red-100 text-red-700 font-semibold px-4 py-2 rounded-full hover:bg-red-200"
            variant="ghost"
          >
            Sync Health Data
          </Button>
          <Button
            onClick={() => openModal("weeklyReport")}
            className="text-sm bg-blue-100 text-blue-700 font-semibold px-4 py-2 rounded-full hover:bg-blue-200"
            variant="ghost"
          >
            Weekly Report
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
