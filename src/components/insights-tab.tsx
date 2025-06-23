"use client";

import type { Achievement, Activity, Goal, Challenge } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Trophy, BrainCircuit, Users, LineChart, Target, Star, Users2, FileText, BarChart2, HeartPulse } from "lucide-react";
import { WeeklyEnergyChart } from "./weekly-energy-chart";

type InsightsTabProps = {
  dynamicInsights: { drainPattern: string; rechargePattern: string };
  selfCareStreak: number;
  achievements: Achievement[];
  currentEnergy: number;
  activities: Activity[];
  openModal: (modalName: string) => void;
  goals: Goal[];
  challenges: Challenge[];
  onGoalComplete: (goalId: number) => void;
};

export function InsightsTab({
  dynamicInsights,
  selfCareStreak,
  achievements,
  currentEnergy,
  activities,
  openModal,
  goals,
  challenges,
  onGoalComplete
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
            <Target className="text-green-500 mr-3" /> Goals & Challenges
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">YOUR GOALS</h3>
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
            </div>
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">COMMUNITY CHALLENGES</h3>
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
            </div>
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
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            How you compare to the EnergySync community (anonymised).
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
                <p className="text-muted-foreground">Your Avg. Energy</p>
                <p className="font-bold text-blue-600 text-lg">{Math.round(currentEnergy)}%</p>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
                <p className="text-muted-foreground">Community Avg.</p>
                <p className="font-bold text-lg">68%</p>
            </div>
          </div>
          <div className="mt-4 bg-purple-50 border border-purple-100 rounded-xl p-4 text-left flex items-center gap-4">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="font-semibold text-purple-800">Trending Recharge</p>
              <p className="text-sm text-purple-700 mt-1">The most effective activity this week is <span className="font-bold">"Short Walk" (+15%)</span>.</p>
            </div>
          </div>
          <div className="mt-3 bg-red-50 border border-red-100 rounded-xl p-4 text-left flex items-center gap-4">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-semibold text-red-800">Common Drainer</p>
              <p className="text-sm text-red-700 mt-1">Many users are drained by <span className="font-bold">"Long Meetings" (-25%)</span>.</p>
            </div>
          </div>
        </CardContent>
      </Card>

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
