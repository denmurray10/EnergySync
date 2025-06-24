
'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { ArrowLeft, GripVertical } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { Friend } from '@/lib/types';
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableFriendItem({ friend }: { friend: Friend }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: friend.id, disabled: friend.isPlaceholder });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <Card ref={setNodeRef} style={style} className={cn("bg-card/80 backdrop-blur-sm transition-shadow", isDragging && "shadow-lg")}>
        <CardContent className="p-4">
            <div className="relative flex items-center gap-4">
                <Avatar className="h-12 w-12 border-2 border-primary/20">
                    <AvatarImage src={friend.avatar} data-ai-hint={friend.avatarHint} />
                    <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                    <p className="font-semibold text-card-foreground flex items-center gap-2">
                    {friend.name}
                    {friend.isMe && <Badge className="bg-primary">Me</Badge>}
                    </p>
                    <p className={cn("text-xs", friend.isPlaceholder ? "text-blue-500 font-medium" : "text-muted-foreground")}>{friend.energyStatus}</p>
                    {!friend.isPlaceholder && <Progress value={friend.currentEnergy} className="h-1.5 mt-2" />}
                </div>
                 {!friend.isPlaceholder && (
                    <button {...attributes} {...listeners} className="p-2 -m-2 text-muted-foreground/50 hover:text-muted-foreground cursor-grab active:cursor-grabbing touch-none">
                        <GripVertical className="h-5 w-5" />
                    </button>
                )}
            </div>
        </CardContent>
    </Card>
  );
}


export default function AllFriendsPage() {
    const { friends, setFriends } = useAuth();
    const router = useRouter();

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = friends.findIndex((f) => f.id === active.id);
            const newIndex = friends.findIndex((f) => f.id === over.id);
            if (oldIndex !== -1 && newIndex !== -1) {
                setFriends(arrayMove(friends, oldIndex, newIndex));
            }
        }
    }

    return (
        <main className="min-h-dvh bg-background">
             <div className="max-w-md mx-auto bg-card/60 backdrop-blur-lg min-h-dvh shadow-2xl relative">
                <div className="p-6 h-dvh overflow-y-auto pb-24 custom-scrollbar">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">
                        All Friends
                    </h1>
                     <DndContext
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={friends.map(f => f.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-4">
                                {friends.map((friend: Friend) => (
                                    <SortableFriendItem key={friend.id} friend={friend} />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t">
                    <Button onClick={() => router.back()} className="w-full" variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4"/>
                        Back
                    </Button>
                </div>
            </div>
        </main>
    );
}
