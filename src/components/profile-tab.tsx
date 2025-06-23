"use client";

import type { User } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Film, Star, BookOpen } from "lucide-react";

type ProfileTabProps = {
  user: User | null;
  onLogout: () => void;
  onShowTutorial: () => void;
  onShowDebrief: () => void;
};

export function ProfileTab({ user, onLogout, onShowTutorial, onShowDebrief }: ProfileTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center space-y-4 pt-4">
        <Avatar className="h-24 w-24 border-4 border-primary">
          <AvatarImage src={`https://placehold.co/100x100.png`} data-ai-hint="profile picture" />
          <AvatarFallback className="text-4xl bg-muted">
            {user?.name?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <h2 className="text-3xl font-bold">{user?.name}</h2>
      </div>

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Star className="text-yellow-500 mr-3" />
            Membership Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-semibold text-primary">Pro Member</p>
          <p className="text-sm text-muted-foreground">You have access to all features!</p>
        </CardContent>
      </Card>
      
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
            <CardTitle>Settings & Reports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
             <Button onClick={onShowTutorial} variant="outline" className="w-full justify-start">
                <Film className="mr-2 h-4 w-4" />
                Re-watch Tutorial
            </Button>
            <Button onClick={onShowDebrief} variant="outline" className="w-full justify-start">
                <BookOpen className="mr-2 h-4 w-4" />
                Yesterday's Debrief
            </Button>
            <Button onClick={onLogout} variant="destructive" className="w-full justify-start">
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
