
"use client";

import { useState, useMemo } from "react";
import type { Activity, UpcomingEvent } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { PlusCircle, Camera, Trash2, Calendar, History } from "lucide-react";
import { ProFeatureWrapper } from "@/components/pro-feature-wrapper";
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
  upcomingEvents: UpcomingEvent[];
  openModal: (modalName: string) => void;
  isProMember: boolean;
  onDeleteActivity: (id: number) => void;
  onDeleteEvent?: (id: number) => void;
  ageGroup: 'under14' | '14to17' | 'over18' | null;
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

// Get border and background color based on type (matching Smart Schedule style)
const getLocationColor = (item: UpcomingEvent | Activity): string => {
  // Use type for categorization
  if ('type' in item && item.type) {
    if (item.type === 'social') return 'border-blue-300 bg-blue-50'; // Home
    if (item.type === 'work') return 'border-green-300 bg-green-50'; // School
    if (item.type === 'personal') return 'border-pink-300 bg-pink-50'; // Personal
  }

  // Default to gray if no match
  return 'border-gray-300 bg-gray-50';
};

export function ActivitiesTab({ activities, upcomingEvents, openModal, isProMember, onDeleteActivity, onDeleteEvent, ageGroup }: ActivitiesTabProps) {
  const [activityToDelete, setActivityToDelete] = useState<Activity | null>(null);
  const [eventToDelete, setEventToDelete] = useState<UpcomingEvent | null>(null);
  const [viewMode, setViewMode] = useState<'upcoming' | 'history'>('upcoming');

  const confirmDeleteActivity = () => {
    if (activityToDelete) {
      onDeleteActivity(activityToDelete.id);
      setActivityToDelete(null);
    }
  };

  const confirmDeleteEvent = () => {
    if (eventToDelete && onDeleteEvent) {
      onDeleteEvent(eventToDelete.id);
      setEventToDelete(null);
    }
  };

  const filteredHistory = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return activities.filter(activity => {
      const activityDate = new Date(activity.date);
      return activityDate >= sevenDaysAgo;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [activities]);

  const sortedUpcoming = useMemo(() => {
    return [...upcomingEvents].sort((a, b) => {
      // First sort by date (Today vs others) - simplified for now assuming mostly Today/Tonight
      if (a.date === 'Today' && b.date !== 'Today') return -1;
      if (a.date !== 'Today' && b.date === 'Today') return 1;

      // Then sort by time
      const timeA = parseTimeForSorting(a.time);
      const timeB = parseTimeForSorting(b.time);
      return timeA - timeB;
    });
  }, [upcomingEvents]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Activities
          </h2>
          <div className="flex items-center gap-2">
            <ProFeatureWrapper isPro={isProMember}>
              <Button onClick={() => openModal('imageCheckin')} size="icon" variant="ghost" className="text-primary">
                <Camera className="h-7 w-7" />
                <span className="sr-only">Visual Check-in</span>
              </Button>
            </ProFeatureWrapper>
            <Button onClick={() => openModal('addActivity')} size="icon" variant="ghost" className="text-primary">
              <PlusCircle className="h-8 w-8" />
              <span className="sr-only">Log Activity</span>
            </Button>
          </div>
        </div>

        <div className="flex p-1 bg-muted rounded-lg">
          <Button
            variant={viewMode === 'upcoming' ? 'default' : 'ghost'}
            className="flex-1 rounded-md transition-all"
            onClick={() => setViewMode('upcoming')}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Upcoming
          </Button>
          <Button
            variant={viewMode === 'history' ? 'default' : 'ghost'}
            className="flex-1 rounded-md transition-all"
            onClick={() => setViewMode('history')}
          >
            <History className="w-4 h-4 mr-2" />
            History (7 Days)
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {viewMode === 'upcoming' ? (
          sortedUpcoming.length > 0 ? (
            sortedUpcoming.map((event) => (
              <div key={event.id} className={`p-4 rounded-2xl border-2 ${getLocationColor(event)}`}>
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
                  <div className="flex items-center gap-2">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${event.estimatedImpact < 0 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                      }`}>
                      {event.estimatedImpact > 0 ? "+" : ""}{event.estimatedImpact}%
                    </div>
                    {onDeleteEvent && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:bg-red-100 hover:text-red-500"
                        onClick={() => setEventToDelete(event)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete event</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No upcoming activities scheduled.</p>
              <Button variant="link" onClick={() => openModal('addEvent')} className="mt-2">
                Add an event
              </Button>
            </div>
          )
        ) : (
          filteredHistory.length > 0 ? (
            filteredHistory.map((activity) => (
              <div
                key={activity.id}
                className={`p-4 rounded-2xl border-2 ${getLocationColor(activity)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">{activity.emoji}</div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {activity.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {activity.duration}min &bull; {activity.location} &bull; {activity.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${activity.impact < 0 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                      }`}>
                      {activity.impact > 0 ? "+" : ""}{activity.impact}%
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
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No activities logged in the past 7 days.</p>
            </div>
          )
        )}
      </div>

      <AlertDialog open={!!activityToDelete} onOpenChange={(isOpen) => !isOpen && setActivityToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Activity?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{activityToDelete?.name}" from your history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteActivity} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!eventToDelete} onOpenChange={(isOpen) => !isOpen && setEventToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove "{eventToDelete?.name}" from your schedule.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteEvent} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
