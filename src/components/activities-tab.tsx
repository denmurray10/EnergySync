
"use client";

import { useState, useMemo } from "react";
import type { Activity, UpcomingEvent } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { PlusCircle, Camera, Pencil, Calendar, History } from "lucide-react";
import { ProFeatureWrapper } from "@/components/pro-feature-wrapper";
import { format, parse, isValid } from "date-fns";
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
import { Badge } from "@/components/ui/badge";

type ActivitiesTabProps = {
  activities: Activity[];
  upcomingEvents: UpcomingEvent[];
  openModal: (modalName: string) => void;
  isProMember: boolean;
  onEditActivity: (activity: Activity) => void;
  onEditEvent?: (event: UpcomingEvent) => void;
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

// Format date to "Tue 25th Nov" format
const formatActivityDate = (dateString: string): string => {
  // Try to parse common date formats
  const formats = [
    'yyyy-MM-dd',           // 2025-11-25
    'PPP',                   // December 25, 2025
    'MMMM d, yyyy',         // December 25, 2025
  ];

  for (const formatString of formats) {
    try {
      const parsed = parse(dateString, formatString, new Date());
      if (isValid(parsed)) {
        return format(parsed, 'EEE do MMM');
      }
    } catch {
      // Continue to next format
    }
  }

  // Try direct Date parsing as fallback
  try {
    const date = new Date(dateString);
    if (isValid(date) && !isNaN(date.getTime())) {
      return format(date, 'EEE do MMM');
    }
  } catch {
    // Fallback to original if all parsing fails
  }

  return dateString;
};

// Check if a date is today
const isToday = (dateString: string): boolean => {
  const formats = ['yyyy-MM-dd', 'PPP', 'MMMM d, yyyy'];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const formatString of formats) {
    try {
      const parsed = parse(dateString, formatString, new Date());
      if (isValid(parsed)) {
        parsed.setHours(0, 0, 0, 0);
        return parsed.getTime() === today.getTime();
      }
    } catch { }
  }

  try {
    const date = new Date(dateString);
    if (isValid(date) && !isNaN(date.getTime())) {
      date.setHours(0, 0, 0, 0);
      return date.getTime() === today.getTime();
    }
  } catch { }

  return false;
};

// Check if a date is tomorrow
const isTomorrow = (dateString: string): boolean => {
  const formats = ['yyyy-MM-dd', 'PPP', 'MMMM d, yyyy'];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  for (const formatString of formats) {
    try {
      const parsed = parse(dateString, formatString, new Date());
      if (isValid(parsed)) {
        parsed.setHours(0, 0, 0, 0);
        return parsed.getTime() === tomorrow.getTime();
      }
    } catch { }
  }

  try {
    const date = new Date(dateString);
    if (isValid(date) && !isNaN(date.getTime())) {
      date.setHours(0, 0, 0, 0);
      return date.getTime() === tomorrow.getTime();
    }
  } catch { }

  return false;
};

export function ActivitiesTab({ activities, upcomingEvents, openModal, isProMember, onEditActivity, onEditEvent, ageGroup }: ActivitiesTabProps) {
  const [viewMode, setViewMode] = useState<'upcoming' | 'history'>('upcoming');

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
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-800">{event.name}</p>
                        {isToday(event.date) && (
                          <Badge className="bg-blue-500 text-white text-xs px-2 py-0.5">Today</Badge>
                        )}
                        {isTomorrow(event.date) && (
                          <Badge className="bg-purple-500 text-white text-xs px-2 py-0.5">Tomorrow</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {formatActivityDate(event.date)} &bull; {event.time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${event.estimatedImpact < 0 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                      }`}>
                      {event.estimatedImpact > 0 ? "+" : ""}{event.estimatedImpact}%
                    </div>
                    {onEditEvent && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:bg-blue-100 hover:text-blue-600"
                        onClick={() => onEditEvent(event)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit event</span>
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
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-800">
                          {activity.name}
                        </p>
                        {isToday(activity.date) && (
                          <Badge className="bg-blue-500 text-white text-xs px-2 py-0.5">Today</Badge>
                        )}
                        {isTomorrow(activity.date) && (
                          <Badge className="bg-purple-500 text-white text-xs px-2 py-0.5">Tomorrow</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {activity.duration}min &bull; {activity.location} &bull; {formatActivityDate(activity.date)}
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
                      className="h-8 w-8 text-muted-foreground hover:bg-blue-100 hover:text-blue-600"
                      onClick={() => onEditActivity(activity)}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit activity</span>
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
    </div>
  );
}
