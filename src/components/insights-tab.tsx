
"use client";

import type { Achievement, Activity, Goal, Challenge, EnergyHotspotAnalysis, Friend } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Trophy, BrainCircuit, Users, LineChart, Target, Star, Users2, FileText, BarChart2, Sparkles, LoaderCircle, MapPin, TrendingUp, TrendingDown } from "lucide-react";
import { WeeklyEnergyChart } from "@/components/weekly-energy-chart";
import { ProFeatureWrapper } from "@/components/pro-feature-wrapper";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

type InsightsTabProps = {
  isProMember: boolean;
  ageGroup: 'under14' | 'over14' | null;
  dynamicInsights: { drainPattern: string; rechargePattern: string };
  selfCareStreak: number;
  achievements: Achievement[];
  currentEnergy: number;
  activities: Activity[];
  openModal: (modalName: string) => void;
  goals: Goal[];
  challenges: Challenge[];
  onGoalComplete: (goalId: number) => void;
  onSuggestGoals: () => void;
  isGoalsLoading: boolean;
  energyHotspots: EnergyHotspotAnalysis | null;
  isHotspotsLoading: boolean;
  friends: Friend[];
};

export function InsightsTab({
  isProMember,
  ageGroup,
  dynamicInsights,
  selfCareStreak,
  achievements,
  currentEnergy,
  activities,
  openModal,
  goals,
  challenges,
  onGoalComplete,
  onSuggestGoals,
  isGoalsLoading,
  energyHotspots,
  isHotspotsLoading,
  friends,
}: InsightsTabProps) {
  
  const suggestButtonText = ageGroup === 'under14' ? 'Ask Pet' : 'Suggest New';
  
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
            <Users className="text-blue-500 mr-3" />
            Friend Network
          </CardTitle>
          <CardDescription>
            See your friends' energy levels to know when it's a good time to connect.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {friends.map((friend) => (
            <div key={friend.id} className="flex items-center gap-4 p-3 rounded-2xl bg-muted/50">
              <Avatar className="h-12 w-12 border-2 border-primary/20">
                <AvatarImage src={friend.avatar} data-ai-hint={friend.avatarHint} />
                <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-grow">
                <p className="font-semibold text-card-foreground">{friend.name}</p>
                <p className="text-xs text-muted-foreground">{friend.energyStatus}</p>
                <Progress value={friend.currentEnergy} className="h-1.5 mt-2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <ProFeatureWrapper isPro={isProMember}>
        <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="flex items-center text-xl">
                    <MapPin className="text-orange-500 mr-3" />
                    Energy Hotspots
                </CardTitle>
                 <CardDescription>
                  {ageGroup === 'under14' ? "Your pet's analysis of where your energy changes most." : "AI-powered analysis of where your energy changes most."}
                 </CardDescription>
            </CardHeader>
            <CardContent>
                {isHotspotsLoading ? (
                     <div className="space-y-4">
                        <div className="flex gap-4"><TrendingDown className="h-5 w-5 text-red-500 mt-1" /><Skeleton className="h-8 w-4/5" /></div>
                        <div className="flex gap-4"><TrendingUp className="h-5 w-5 text-green-500 mt-1" /><Skeleton className="h-8 w-3/5" /></div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {energyHotspots?.drainingHotspots && energyHotspots.drainingHotspots.length > 0 ? (
                            energyHotspots.drainingHotspots.map(hotspot => (
                                <div key={hotspot.location} className="flex items-start gap-3">
                                    <TrendingDown className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold">{hotspot.location}</p>
                                        <p className="text-sm text-muted-foreground">Average impact: <span className="font-bold text-red-500">{hotspot.averageImpact.toFixed(0)}%</span></p>
                                    </div>
                                </div>
                            ))
                        ) : (
                             <div className="flex items-start gap-3"><TrendingDown className="h-5 w-5 text-muted-foreground mt-1" /><p className="text-sm text-muted-foreground">No significant draining locations found yet.</p></div>
                        )}
                        {energyHotspots?.rechargingHotspots && energyHotspots.rechargingHotspots.length > 0 ? (
                            energyHotspots.rechargingHotspots.map(hotspot => (
                                <div key={hotspot.location} className="flex items-start gap-3">
                                    <TrendingUp className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold">{hotspot.location}</p>
                                        <p className="text-sm text-muted-foreground">Average impact: <span className="font-bold text-green-500">+{hotspot.averageImpact.toFixed(0)}%</span></p>
                                    </div>
                                </div>
                            ))
                        ) : (
                           <div className="flex items-start gap-3"><TrendingUp className="h-5 w-5 text-muted-foreground mt-1" /><p className="text-sm text-muted-foreground">No significant recharging locations found yet.</p></div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
      </ProFeatureWrapper>

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center text-xl">
                <Target className="text-green-500 mr-3" /> Goals & Challenges
            </CardTitle>
             <ProFeatureWrapper isPro={isProMember}>
                <Button onClick={onSuggestGoals} variant="ghost" size="sm" disabled={isGoalsLoading}>
                    {isGoalsLoading ? (
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Sparkles className="mr-2 h-4 w-4 text-yellow-500" />
                    )}
                    {suggestButtonText}
                </Button>
            </ProFeatureWrapper>
        </CardHeader>
        <CardContent className="space-y-4">
            {isGoalsLoading ? (
                 <div className="space-y-4">
                    <Skeleton className="h-16 w-full rounded-lg" />
                    <Skeleton className="h-16 w-full rounded-lg" />
                    <Skeleton className="h-20 w-full rounded-lg" />
                </div>
            ) : (
            <>
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">YOUR GOALS</h3>
                  {goals.length > 0 ? (
                    <div className="space-y-3">
                        {goals.map((goal) => (
                        <div key={goal.id} className="flex items-center space-x-3 bg-muted/50 p-3 rounded-lg">
                            <Checkbox id={`goal-${goal.id}`} checked={goal.completed} onCheckedChange={() => onGoalComplete(goal.id)} />
                            <Label htmlFor={`goal-${goal.id}`} className={`flex-grow ${goal.completed ? 'line-through text-muted-foreground' : ''}`}>
                            <span className="font-semibold text-card-foreground">{goal.icon} {goal.name}</span>
                            <p className="text-xs">{goal.description}</p>
                            </Label>
                        </div>
                        ))}
                    </div>
                  ) : (
                     <p className="text-sm text-muted-foreground text-center py-4">No goals yet. Ask your helper for suggestions!</p>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">COMMUNITY CHALLENGES</h3>
                  {challenges.length > 0 ? (
                    <div className="space-y-3">
                        {challenges.map((challenge) => (
                        <div key={challenge.id} className="bg-primary/5 border border-primary/20 p-3 rounded-lg flex items-center justify-between">
                            <div>
                                <p className="font-semibold text-primary">{challenge.icon} {challenge.name}</p>
                                <p className="text-xs text-muted-foreground mt-1">{challenge.description}</p>
                                <div className="flex items-center gap-4 text-xs mt-2">
                                <span className="flex items-center gap-1"><Users2 className="h-3 w-3" /> {challenge.participants} participants</span>
                                <span className="flex items-center gap-1"><Star className="h-3 w-3" /> {challenge.daysLeft} days left</span>
                                </div>
                            </div>
                            <Button size="sm">Join</Button>
                        </div>
                        ))}
                    </div>
                  ) : (
                     <p className="text-sm text-muted-foreground text-center py-4">No challenges available right now.</p>
                  )}
                </div>
            </>
            )}
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

      <ProFeatureWrapper isPro={isProMember}>
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <BrainCircuit className="text-purple-500 mr-3" /> 
              {ageGroup === 'under14' ? "Your Pet's Insights" : "AI Pattern Recognition"}
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
      </ProFeatureWrapper>

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <BarChart2 className="text-gray-500 mr-3" /> Reports
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-around">
          <Button
            onClick={() => openModal("weeklyReport")}
            className="text-sm bg-blue-100 text-blue-700 font-semibold px-4 py-2 rounded-full hover:bg-blue-200"
            variant="ghost"
          >
            <FileText className="mr-2 h-4 w-4" />
            Weekly Report
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
