"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen } from "lucide-react";

type DailyDebriefModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  story: string | null;
  loading: boolean;
};

export function DailyDebriefModal({ open, onOpenChange, story, loading }: DailyDebriefModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card/95 backdrop-blur-lg">
        <DialogHeader className="text-center items-center">
          <div className="p-3 rounded-full bg-primary/10 mb-2">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle>Your Daily Debrief</DialogTitle>
          <DialogDescription>Here's the AI-generated story of your energy from yesterday.</DialogDescription>
        </DialogHeader>
        <div className="my-4 p-4 bg-muted/50 rounded-lg min-h-[120px]">
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : (
            <p className="text-card-foreground leading-relaxed">{story}</p>
          )}
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} className="w-full">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
