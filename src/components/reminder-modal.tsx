
'use client';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { AlarmClock } from "lucide-react";
import type { UpcomingEvent } from "@/lib/types";

type ReminderModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: UpcomingEvent | null;
};

export function ReminderModal({ open, onOpenChange, event }: ReminderModalProps) {
    if (!event) return null;

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
            <AlertDialogHeader className="text-center items-center">
                <div className="p-3 rounded-full bg-primary/10 mb-2">
                    <AlarmClock className="w-10 h-10 text-primary"/>
                </div>
                <AlertDialogTitle className="text-2xl">Event Reminder</AlertDialogTitle>
                <AlertDialogDescription className="text-base">Your scheduled event is starting soon!</AlertDialogDescription>
            </AlertDialogHeader>
            <div className="my-4 p-4 bg-muted/50 rounded-lg text-center">
                <p className="text-4xl">{event.emoji}</p>
                <p className="text-xl font-bold mt-2">{event.name}</p>
                <p className="text-muted-foreground">{event.date} at {event.time}</p>
            </div>
            <AlertDialogFooter>
                <AlertDialogAction onClick={() => onOpenChange(false)} className="w-full">
                    Dismiss
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
        </AlertDialog>
    );
}
