
"use client";

import { useState } from "react";
import type { Activity } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Camera, Trash2 } from "lucide-react";
import { ProFeatureWrapper } from "./pro-feature-wrapper";
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

type ActivitiesTabProps = {
  activities: Activity[];
  openModal: (modalName: string) => void;
  isProMember: boolean;
  onDeleteActivity: (id: number) => void;
  ageGroup: 'under14' | 'over14' | null;
};

export function ActivitiesTab({ activities, openModal, isProMember, onDeleteActivity, ageGroup }: ActivitiesTabProps) {
  const [activityToDelete, setActivityToDelete] = useState<Activity | null>(null);

  const confirmDelete = () => {
    if (activityToDelete) {
      onDeleteActivity(activityToDelete.id);
      setActivityToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Activity History
        </h2>
        <div className="flex items-center gap-2">
            <ProFeatureWrapper isPro={isProMember}>
              <Button onClick={() => openModal('imageCheckin')} size="icon" variant="ghost" className="text-primary">
                  <Camera className="h-7 w-7"/>
                  <span className="sr-only">Visual Check-in</span>
              </Button>
            </ProFeatureWrapper>
            <Button onClick={() => openModal('addActivity')} size="icon" variant="ghost" className="text-primary">
                <PlusCircle className="h-8 w-8"/>
                <span className="sr-only">Log Activity</span>
            </Button>
        </div>
      </div>
      <div className="space-y-4">
        {activities.map((activity) => (
          <Card
            key={activity.id}
            className="bg-card/80 backdrop-blur-sm shadow-lg"
          >
            <CardContent className="p-4">
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
                <div className="flex items-center gap-2">
                  <div
                    className={`text-lg font-bold ${
                      activity.impact < 0 ? "text-red-500" : "text-green-500"
                    }`}
                  >
                    {activity.impact > 0 ? "+" : ""}
                    {activity.impact}%
                  </div>
                   <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:bg-red-100 hover:text-red-500"
                      onClick={() => setActivityToDelete(activity)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete activity</span>
                    </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
       <AlertDialog open={!!activityToDelete} onOpenChange={(isOpen) => !isOpen && setActivityToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the activity "{activityToDelete?.name}". This action cannot be undone.
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
