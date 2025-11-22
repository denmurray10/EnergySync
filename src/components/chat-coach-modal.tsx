
"use client";

import { useState, useRef, useEffect } from "react";
import type { ChatMessage } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, BrainCircuit, User as UserIcon, LoaderCircle, Star } from "lucide-react";
import { cn } from "@/lib/utils";

type ChatCoachModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatHistory: ChatMessage[];
  isThinking: boolean;
  onSendMessage: (message: string) => void;
  isProMember: boolean;
  ageGroup: 'under14' | '14to17' | 'over18' | null;
};

export function ChatCoachModal({ open, onOpenChange, chatHistory, isThinking, onSendMessage, isProMember, ageGroup }: ChatCoachModalProps) {
  const [input, setInput] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [chatHistory]);
  
  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput("");
    }
  };
  
  const titleText = ageGroup === 'under14' ? 'Chat with your Pet' : 'AI Energy Coach';
  const descriptionText = ageGroup === 'under14' 
    ? 'Ask me anything about our energy, activities, or schedule.' 
    : 'Ask me anything about your energy, activities, or schedule.';
  const proUpgradeText = ageGroup === 'under14' 
    ? "Upgrade to Pro to get smart replies from your pet." 
    : "Upgrade to Pro to unlock the AI Energy Coach to get personalized insights.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card/95 backdrop-blur-lg flex flex-col h-[85vh] max-h-[700px] p-0 gap-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <BrainCircuit className="text-primary"/>
            {titleText}
          </DialogTitle>
          <DialogDescription>{descriptionText}</DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {chatHistory.map((message, index) => (
              <div key={index} className={cn("flex items-start gap-3", message.role === 'user' ? "justify-end" : "justify-start")}>
                {message.role === 'model' && (
                  <Avatar className="w-8 h-8 bg-primary/20 text-primary">
                    <AvatarFallback><BrainCircuit size={18}/></AvatarFallback>
                  </Avatar>
                )}
                <div className={cn("max-w-[75%] rounded-2xl p-3 text-sm", message.role === 'user' ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted text-card-foreground rounded-bl-none")}>
                  <p>{message.content}</p>
                </div>
                 {message.role === 'user' && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback><UserIcon size={18}/></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
             {isThinking && (
                <div className="flex items-start gap-3 justify-start">
                    <Avatar className="w-8 h-8 bg-primary/20 text-primary">
                        <AvatarFallback><BrainCircuit size={18}/></AvatarFallback>
                    </Avatar>
                    <div className="bg-muted text-card-foreground rounded-2xl p-3 rounded-bl-none">
                       <LoaderCircle className="animate-spin w-5 h-5" />
                    </div>
                </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-background">
          {!isProMember ? (
            <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Star className="mx-auto h-8 w-8 text-yellow-500 mb-2 fill-yellow-500" />
                <h3 className="font-semibold text-card-foreground">Upgrade to Pro to Chat</h3>
                <p className="text-sm text-muted-foreground mt-1">{proUpgradeText}</p>
            </div>
          ) : (
             <div className="flex items-center gap-2">
                <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="e.g., Why was I so tired yesterday?"
                disabled={isThinking}
                className="flex-1"
                />
                <Button onClick={handleSend} disabled={isThinking || !input.trim()} size="icon">
                <Send />
                </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
