"use client";

import type { BiometricData, UpcomingEvent } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Users,
  Share2,
  Hourglass,
  Heart,
  Moon,
  Wind,
  Zap,
  Mic,
  Calendar,
  Shield,
} from "lucide-react";

type HomeTabProps = {
  currentEnergy: number;
  energyDebt: number;
  biometricData: BiometricData;
  upcomingEvents: UpcomingEvent[];
  communityMode: boolean;
  setCommunityMode: (value: boolean) => void;
  getEnergyStatus: (energy: number) => string;
  copyToClipboard: (text: string) => void;
  openModal: (modalName: string) => void;
  simulateCalendarSync: () => void;
};

const getEnergyColour = (energy: number) => {
  if (energy >= 80) return "from-emerald-400 to-green-500";
  if (energy >= 60) return "from-yellow-400 to-amber-500";
  if (energy >= 40) return "from-orange-400 to-red-500";
  if (energy >= 20) return "from-red-400 to-pink-500";
  return "from-purple-400 to-indigo-500";
};

const getEnergyEmoji = (energy: number) => {
  if (energy >= 80) return "🌟";
  if (energy >= 60) return "😊";
  if (energy >= 40) return "😐";
  if (energy >= 20) return "😴";
  return "🔋";
};

export function HomeTab({
  currentEnergy,
  energyDebt,
  biometricData,
  upcomingEvents,
  communityMode,
  setCommunityMode,
  getEnergyStatus,
  copyToClipboard,
  openModal,
  simulateCalendarSync,
}: HomeTabProps) {
  return (
    <div className="space-y-6">
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardContent className="p-3 flex items-center justify-center space-x-3">
          <Users
            className={`text-primary transition-opacity ${
              communityMode ? "opacity-100" : "opacity-50"
            }`}
          />
          <Switch
            id="communityToggle"
            checked={communityMode}
            onCheckedChange={setCommunityMode}
            aria-label="Community Mode Toggle"
          />
          <Label
            htmlFor="communityToggle"
            className={`font-medium text-sm transition-colors ${
              communityMode ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Community Mode
          </Label>
        </CardContent>
      </Card>

      {communityMode && (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 text-center">
          <CardContent className="p-4">
            <p className="font-semibold text-purple-800 mb-2">
              Your current status is:
            </p>
            <p className="text-lg font-bold text-purple-600 mb-3">
              "{getEnergyStatus(currentEnergy)}"
            </p>
            <Button onClick={() => copyToClipboard(getEnergyStatus(currentEnergy))}>
              <Share2 className="mr-2 h-4 w-4" />
              Share Status
            </Button>
          </CardContent>
        </Card>
      )}

      {energyDebt > 0 && (
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200">
          <CardContent className="p-4 flex items-center space-x-3">
            <Hourglass className="text-amber-600 w-6 h-6" />
            <div>
              <p className="font-semibold text-amber-800">
                Energy Debt: {energyDebt}%
              </p>
              <p className="text-sm text-amber-700">
                Complete recharge activities to pay it back.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-card/80 backdrop-blur-sm text-center">
        <CardContent className="p-6">
          <div className="text-6xl mb-4">{getEnergyEmoji(currentEnergy)}</div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-pink-600 bg-clip-text text-transparent mb-4">
            Social Energy
          </h2>
          <div className="relative w-40 h-8 mx-auto mb-6 bg-muted rounded-full overflow-hidden shadow-inner">
            <div
              className={`absolute left-0 top-0 h-full bg-gradient-to-r ${getEnergyColour(
                currentEnergy
              )} transition-all duration-1000 ease-out rounded-full shadow-lg`}
              style={{ width: `${currentEnergy}%` }}
            >
              <div className="absolute inset-0 bg-white/30 animate-pulse rounded-full"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-gray-700 drop-shadow-sm">
                {currentEnergy}%
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-2">
            <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-3 border border-red-100 text-center">
              <Heart className="text-red-500 mb-1 mx-auto" />
              <p className="text-xs text-red-700 font-medium">
                {biometricData.heartRate} BPM
              </p>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-100 text-center">
              <Moon className="text-blue-500 mb-1 mx-auto" />
              <p className="text-xs text-blue-700 font-medium">
                {biometricData.sleepQuality}% Sleep
              </p>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 border border-green-100 text-center">
              <Wind className="text-green-500 mb-1 mx-auto" />
              <p className="text-xs text-green-700 font-medium">
                {biometricData.stressLevel}% Stress
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Zap className="text-yellow-500 mr-3" />
            Smart Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => openModal("recharge")}
            className="group flex flex-col items-center h-auto bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 py-6"
          >
            <Shield className="w-6 h-6 mb-3" />
            <span className="font-semibold">Start Recharge</span>
          </Button>
          <Button
            onClick={() => openModal("voiceCheckIn")}
            className="group flex flex-col items-center h-auto bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 py-6"
          >
            <Mic className="w-6 h-6 mb-3" />
            <span className="font-semibold">Voice Check-in</span>
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center text-xl">
            <Calendar className="text-indigo-500 mr-3" />
            Smart Schedule
          </CardTitle>
          <Button
            onClick={simulateCalendarSync}
            variant="ghost"
            size="sm"
            className="text-xs bg-indigo-100 text-indigo-600 font-semibold px-3 py-1 rounded-full hover:bg-indigo-200"
          >
            Sync
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {upcomingEvents.map((event) => (
            <div
              key={event.id}
              className={`p-4 rounded-2xl border-2 ${
                event.conflictRisk === "high"
                  ? "border-red-200 bg-red-50"
                  : event.conflictRisk === "medium"
                  ? "border-yellow-200 bg-yellow-50"
                  : "border-green-200 bg-green-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{event.emoji}</div>
                  <div>
                    <p className="font-semibold text-gray-800">{event.name}</p>
                    <p className="text-sm text-gray-600">
                      {event.date} &bull; {event.time}
                    </p>
                  </div>
                </div>
                <div
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    event.estimatedImpact < 0
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {event.estimatedImpact > 0 ? "+" : ""}
                  {event.estimatedImpact}%
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
