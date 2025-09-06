
"use client";

import { useState, useMemo } from "react";
import type { UpcomingEvent, User, ActionableSuggestion, ReadinessReport, EnergyForecastData } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PetCompanionCard } from "@/components/pet-companion-card";
import { ReadinessCard } from "@/components/readiness-card";
import { ProFeatureWrapper } from "@/components/pro-feature-wrapper";
import { EnergyForecastChart } from "@/components/energy-forecast-chart";
import {
  Users,
  Share2,
  Hourglass,
  Zap,
  Mic,
  Calendar,
  Globe,
  CalendarPlus,
  PlusCircle,
  Trash2,
  TrendingUp,
  BrainCircuit
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type HomeTabProps = {
  user: User | null;
  isProMember: boolean;
  ageGroup: 'under14' | '14to17' | 'over18' | null;
  currentEnergy: number;
  energyDebt: number;
  upcomingEvents: UpcomingEvent[];
  communityMode: boolean;
  setCommunityMode: (value: boolean) => void;
  getEnergyStatus: (energy: number) => string;
  onShareStatus: () => void;
  openModal: (modalName: string) => void;
  aiSuggestion: string | null;
  actionableSuggestion: ActionableSuggestion | null;
  handleScheduleAction: (action: ActionableSuggestion) => void;
  isSuggestionLoading: boolean;
  currentUserLocation: string;
  changeLocation: () => void;
  readinessReport: ReadinessReport | null;
  isReadinessLoading: boolean;
  onSyncHealth: () => void;
  onDeleteEvent: (id: number) => void;
  energyForecast: EnergyForecastData[] | null;
  isForecastLoading: boolean;
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

const parseTimeForSorting = (timeStr: string): number => {
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s(AM|PM)/i);
    if (!match) return 2400; // Invalid format, sort to end

    let [_, hours, minutes, ampm] = match;
    let eventHours = parseInt(hours, 10);
    
    if (ampm.toUpperCase() === 'PM' && eventHours !== 12) {
        eventHours += 12;
    }
    if (ampm.toUpperCase() === 'AM' && eventHours === 12) {
        eventHours = 0; // Midnight case
    }

    return eventHours * 100 + parseInt(minutes, 10);
};

export function HomeTab({
  user,
  isProMember,
  ageGroup,
  currentEnergy,
  energyDebt,
  upcomingEvents,
  communityMode,
  setCommunityMode,
  getEnergyStatus,
  onShareStatus,
  openModal,
  aiSuggestion,
  actionableSuggestion,
  handleScheduleAction,
  isSuggestionLoading,
  currentUserLocation,
  changeLocation,
  readinessReport,
  isReadinessLoading,
  onSyncHealth,
  onDeleteEvent,
  energyForecast,
  isForecastLoading,
}: HomeTabProps) {
  const [eventToDelete, setEventToDelete] = useState<UpcomingEvent | null>(null);

  const confirmDelete = () => {
    if (eventToDelete) {
      onDeleteEvent(eventToDelete.id);
      setEventToDelete(null);
    }
  };
  
  const showPetFeatures = user?.petEnabled;
  
  const sortedEvents = useMemo(() => {
    return [...upcomingEvents].sort((a, b) => {
        const timeA = parseTimeForSorting(a.time);
        const timeB = parseTimeForSorting(b.time);
        return timeA - timeB;
    });
  }, [upcomingEvents]);

  return (
    <div className="space-y-6">
       <div className="mb-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-pink-600 bg-clip-text text-transparent">
          Hello, {user?.name}!
        </h1>
        <p className="text-muted-foreground mt-1">
          {getEnergyStatus(currentEnergy)}
        </p>
      </div>

      {user?.featureVisibility?.communityMode && (
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
      )}

      {communityMode && user?.featureVisibility?.communityMode && (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 text-center">
          <CardContent className="p-4">
            <p className="font-semibold text-purple-800 mb-2">
              Your current status is:
            </p>
            <p className="text-lg font-bold text-purple-600 mb-3">
              "{getEnergyStatus(currentEnergy)}"
            </p>
            <Button onClick={onShareStatus}>
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

       {showPetFeatures && (
        <ProFeatureWrapper isPro={isProMember}>
            <PetCompanionCard onClick={() => openModal('chatCoach')} ageGroup={ageGroup} />
        </ProFeatureWrapper>
       )}
      
      {ageGroup !== 'under14' && (
        <ProFeatureWrapper isPro={isProMember}>
          <ReadinessCard
            report={readinessReport}
            loading={isReadinessLoading}
            onSync={onSyncHealth}
          />
        </ProFeatureWrapper>
      )}

      <Card className="bg-card/80 backdrop-blur-sm text-center">
        <CardContent className="p-4">
          <div className="text-6xl mb-4">{getEnergyEmoji(currentEnergy)}</div>
          <h2 className="text-2xl font-bold text-card-foreground mb-4">
            Current Energy
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
          
           <div className="grid grid-cols-1 gap-3">
            <Button
                onClick={() => openModal("recharge")}
                className="group w-full h-auto bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 py-3"
            >
                <Zap className="w-5 h-5 mr-2" />
                <span className="font-semibold">Start Recharge</span>
            </Button>
             <ProFeatureWrapper isPro={isProMember}>
                <Button
                    onClick={() => openModal("voiceCheckIn")}
                    className="group w-full h-auto bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 py-3"
                >
                    <Mic className="w-5 h-5 mr-2" />
                    <span className="font-semibold">Voice Check-in</span>
                </Button>
             </ProFeatureWrapper>
            </div>

        </CardContent>
      </Card>

      {ageGroup !== 'under14' && (
        <ProFeatureWrapper isPro={isProMember}>
          <Card className="bg-card/80 backdrop-blur-sm">
              <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                      <TrendingUp className="text-cyan-500 mr-3" />
                      Energy Forecast
                  </CardTitle>
              </CardHeader>
              <CardContent>
                  {isForecastLoading ? (
                      <div className="space-y-2">
                          <Skeleton className="h-48 w-full" />
                          <div className="flex justify-between">
                              <Skeleton className="h-4 w-10" />
                              <Skeleton className="h-4 w-10" />
                              <Skeleton className="h-4 w-10" />
                              <Skeleton className="h-4 w-10" />
                          </div>
                      </div>
                  ) : (
                      <EnergyForecastChart data={energyForecast || []} />
                  )}
              </CardContent>
          </Card>
        </ProFeatureWrapper>
      )}
      
       {showPetFeatures && (
        <ProFeatureWrapper isPro={isProMember}>
            <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="flex items-center text-xl">
                {ageGroup === 'under14' ? <Zap className="text-yellow-500 mr-3" /> : <BrainCircuit className="text-yellow-500 mr-3" />}
                {ageGroup === 'under14' ? "Your Pet's Thoughts" : "Proactive Suggestions"}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isSuggestionLoading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-4/5" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground mb-4">
                        {aiSuggestion || "No suggestions at this time. Try syncing your data!"}
                    </p>
                )}
                {actionableSuggestion && (
                    <Button onClick={() => handleScheduleAction(actionableSuggestion)} className="w-full mt-2">
                        <CalendarPlus className="mr-2 h-4 w-4" />
                        Add "{actionableSuggestion.activityName}" to Schedule
                    </Button>
                )}
            </CardContent>
            </Card>
        </ProFeatureWrapper>
       )}

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center text-xl">
              <Calendar className="text-indigo-500 mr-3" />
              Smart Schedule
            </CardTitle>
            <div className="flex items-center gap-2">
                 <Button
                    onClick={changeLocation}
                    variant="ghost"
                    size="sm"
                    className="text-xs bg-indigo-100 text-indigo-600 font-semibold px-3 py-1 rounded-full hover:bg-indigo-200"
                >
                    <Globe className="mr-1.5 h-4 w-4" />
                    {currentUserLocation}
                </Button>
                <Button onClick={() => openModal('addEvent')} size="icon" variant="ghost" className="text-primary -mr-2">
                    <PlusCircle className="h-6 w-6"/>
                    <span className="sr-only">Add Event</span>
                </Button>
            </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {sortedEvents.map((event) => (
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
                <div className="flex items-center gap-1">
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
                   <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:bg-red-100 hover:text-red-500"
                      onClick={() => setEventToDelete(event)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete event</span>
                    </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
       <AlertDialog open={!!eventToDelete} onOpenChange={(isOpen) => !isOpen && setEventToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the event "{eventToDelete?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
