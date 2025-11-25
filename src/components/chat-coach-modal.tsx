
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  userImage?: string;
  onUpgrade: () => void;
};

export function ChatCoachModal({ open, onOpenChange, chatHistory, isThinking, onSendMessage, isProMember, ageGroup, userImage, onUpgrade }: ChatCoachModalProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (open) {
      // Small delay to ensure modal content is rendered
      setTimeout(scrollToBottom, 100);
    }
  }, [open]);

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isThinking]);

  const handleSend = (text: string = input) => {
    if (text.trim()) {
      onSendMessage(text.trim());
      setInput("");
    }
  };

  const titleText = ageGroup === 'under14' ? 'Chat with your Pet' : 'AI Energy Coach';
  const descriptionText = ageGroup === 'under14'
    ? 'I can help you understand your energy!'
    : 'Ask me anything about your energy, activities, or schedule.';

  const isPetMode = ageGroup === 'under14';

  const suggestedQuestions = isPetMode ? [
    "How is my energy?",
    "What should I do next?",
    "Why am I tired?",
    "Tell me a fun fact!"
  ] : [
    "Analyze my energy trends",
    "Suggest a recharge activity",
    "Review my schedule",
    "How can I improve my sleep?"
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card/95 backdrop-blur-lg flex flex-col h-[85vh] max-h-[700px] p-0 gap-0 overflow-hidden border-2 border-primary/10 shadow-2xl">
        {/* Header */}
        <DialogHeader className="p-4 border-b bg-primary/5">
          <DialogTitle className="flex items-center gap-3">
            <div className={cn("p-2 rounded-full", isPetMode ? "bg-yellow-100 text-yellow-600" : "bg-blue-100 text-blue-600")}>
              {isPetMode ? <Star className="w-6 h-6 fill-current" /> : <BrainCircuit className="w-6 h-6" />}
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold">{titleText}</span>
              <span className="text-xs font-normal text-muted-foreground">{descriptionText}</span>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Chat Area */}
        <ScrollArea className="flex-1 p-4 bg-gradient-to-b from-transparent to-muted/20">
          <div className="space-y-6 min-h-full flex flex-col justify-end">
            {chatHistory.length === 0 && (
              <div className="flex flex-col items-center justify-center space-y-4 py-10 opacity-70">
                <div className={cn("p-4 rounded-full bg-muted mb-2", isPetMode ? "animate-bounce" : "")}>
                  {isPetMode ? <Star className="w-12 h-12 text-yellow-500 fill-yellow-500" /> : <BrainCircuit className="w-12 h-12 text-primary" />}
                </div>
                <p className="text-center text-muted-foreground max-w-xs">
                  {isPetMode ? "Hi! I'm your energy pet! Ask me anything!" : "Hello! I'm your AI Energy Coach. How can I assist you today?"}
                </p>
              </div>
            )}

            {chatHistory.map((message, index) => (
              <div key={index} className={cn("flex items-end gap-2", message.role === 'user' ? "justify-end" : "justify-start")}>
                {message.role === 'model' && (
                  <Avatar className={cn("w-8 h-8 border-2", isPetMode ? "border-yellow-200 bg-yellow-50" : "border-blue-200 bg-blue-50")}>
                    <AvatarFallback className={isPetMode ? "text-yellow-600" : "text-blue-600"}>
                      {isPetMode ? <Star size={14} className="fill-current" /> : <BrainCircuit size={14} />}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className={cn(
                  "max-w-[80%] px-4 py-3 text-sm shadow-sm",
                  message.role === 'user'
                    ? "bg-primary text-primary-foreground rounded-2xl rounded-br-none"
                    : "bg-card border border-border text-card-foreground rounded-2xl rounded-bl-none"
                )}>
                  <p className="leading-relaxed">{message.content}</p>
                </div>

                {message.role === 'user' && (
                  <Avatar className="w-8 h-8 border-2 border-primary/20">
                    <AvatarImage src={userImage} alt="User" />
                    <AvatarFallback><UserIcon size={14} /></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {isThinking && (
              <div className="flex items-end gap-2 justify-start">
                <Avatar className={cn("w-8 h-8 border-2", isPetMode ? "border-yellow-200 bg-yellow-50" : "border-blue-200 bg-blue-50")}>
                  <AvatarFallback className={isPetMode ? "text-yellow-600" : "text-blue-600"}>
                    {isPetMode ? <Star size={14} className="fill-current" /> : <BrainCircuit size={14} />}
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted text-muted-foreground rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-2">
                  <span className="text-xs">Thinking</span>
                  <LoaderCircle className="animate-spin w-3 h-3" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 bg-background border-t space-y-3">
          {/* Suggested Questions Chips */}
          {!isThinking && chatHistory.length < 2 && isProMember && (
            <div className="flex flex-wrap gap-2 mb-2">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q)}
                  className="text-xs bg-muted hover:bg-muted/80 text-muted-foreground px-3 py-1.5 rounded-full transition-colors border border-border"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {!isProMember ? (
            <div className="text-center p-4 bg-muted/30 rounded-xl border border-dashed border-muted-foreground/30">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <h3 className="font-semibold text-sm">Pro Feature</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Upgrade to chat with your {isPetMode ? "pet" : "coach"}!</p>
              <Button size="sm" variant="outline" className="w-full" onClick={onUpgrade}>Upgrade Now</Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-muted/30 p-1.5 rounded-full border focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={isPetMode ? "Ask your pet something..." : "Type a message..."}
                disabled={isThinking}
                className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 h-10 px-4"
              />
              <Button
                onClick={() => handleSend()}
                disabled={isThinking || !input.trim()}
                size="icon"
                className="rounded-full h-9 w-9 shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
