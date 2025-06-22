"use client";

import type { Activity } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

type ActivitiesTabProps = {
  activities: Activity[];
  openModal: (modalName: string) => void;
};

export function ActivitiesTab({ activities, openModal }: ActivitiesTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Activity History
        </h2>
        <Button onClick={() => openModal('addActivity')} size="icon" variant="ghost" className="text-primary">
            <PlusCircle className="h-8 w-8"/>
            <span className="sr-only">Log Activity</span>
        </Button>
      </div>
      <div className="space-y-4">
        {activities.map((activity) => (
          <Card
            key={activity.id}
            className="bg-card/80 backdrop-blur-sm shadow-lg"
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">{activity.emoji}</div>
                  <div>
                    <h3 className="font-bold text-card-foreground text-lg">
                      {activity.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {activity.duration}min &bull; {activity.location}
                    </p>
                  </div>
                </div>
                <div
                  className={`text-lg font-bold ${
                    activity.impact < 0 ? "text-red-500" : "text-green-500"
                  }`}
                >
                  {activity.impact > 0 ? "+" : ""}
                  {activity.impact}%
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
