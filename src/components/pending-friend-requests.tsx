"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Check, X, Loader2 } from "lucide-react";
import type { PendingFriendRequest } from "@/lib/types";
import { collection, query, where, onSnapshot, updateDoc, doc, getDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

type PendingFriendRequestsProps = {
    childUserId: string;
};

export function PendingFriendRequests({ childUserId }: PendingFriendRequestsProps) {
    const [requests, setRequests] = useState<PendingFriendRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (!childUserId) return;

        // Listen to pending friend requests for this child
        const requestsQuery = query(
            collection(firestore, "friendRequests"),
            where("toUserId", "==", childUserId),
            where("status", "==", "pending")
        );

        const unsubscribe = onSnapshot(requestsQuery, (snapshot) => {
            const pendingRequests = snapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id,
            })) as PendingFriendRequest[];

            setRequests(pendingRequests);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [childUserId]);

    const handleApprove = async (request: PendingFriendRequest) => {
        setProcessingId(request.id);
        try {
            // Update request status
            const requestRef = doc(firestore, "friendRequests", request.id);
            await updateDoc(requestRef, { status: "approved" });

            // Add friend to both users' friend lists
            const childRef = doc(firestore, "users", childUserId);
            const friendRef = doc(firestore, "users", request.fromUserId);

            const [childDoc, friendDoc] = await Promise.all([
                getDoc(childRef),
                getDoc(friendRef),
            ]);

            if (childDoc.exists() && friendDoc.exists()) {
                const childData = childDoc.data();
                const friendData = friendDoc.data();

                // Add to child's friend list
                const childFriends = childData.friends || [];
                childFriends.push({
                    id: request.fromUserId,
                    name: request.fromUserName,
                    avatar: request.fromUserAvatar,
                    avatarHint: "friend avatar",
                    energyStatus: "Friend",
                    currentEnergy: 75,
                    hasUpdatedToday: false,
                });

                // Add to friend's friend list
                const friendFriends = friendData.friends || [];
                friendFriends.push({
                    id: childUserId,
                    name: childData.name,
                    avatar: childData.avatar || "",
                    avatarHint: "friend avatar",
                    energyStatus: "Friend",
                    currentEnergy: 75,
                    hasUpdatedToday: false,
                });

                await Promise.all([
                    updateDoc(childRef, { friends: childFriends }),
                    updateDoc(friendRef, { friends: friendFriends }),
                ]);

                toast({
                    title: "Friend Request Approved! 🎉",
                    description: `${request.fromUserName} has been added to your child's friends.`,
                });
            }
        } catch (error) {
            console.error("Error approving friend request:", error);
            toast({
                title: "Approval Failed",
                description: "Could not approve this friend request. Please try again.",
                variant: "destructive",
            });
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (request: PendingFriendRequest) => {
        setProcessingId(request.id);
        try {
            const requestRef = doc(firestore, "friendRequests", request.id);
            await updateDoc(requestRef, { status: "rejected" });

            toast({
                title: "Friend Request Rejected",
                description: `The request from ${request.fromUserName} has been declined.`,
            });
        } catch (error) {
            console.error("Error rejecting friend request:", error);
            toast({
                title: "Rejection Failed",
                description: "Could not reject this friend request. Please try again.",
                variant: "destructive",
            });
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserPlus className="w-5 h-5" />
                        Pending Friend Requests
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (requests.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserPlus className="w-5 h-5" />
                        Pending Friend Requests
                    </CardTitle>
                    <CardDescription>No pending friend requests at this time.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    Pending Friend Requests
                    <Badge variant="secondary">{requests.length}</Badge>
                </CardTitle>
                <CardDescription>
                    Review and approve friend requests for your child
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {requests.map((request) => (
                    <div
                        key={request.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card"
                    >
                        <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={request.fromUserAvatar} alt={request.fromUserName} />
                                <AvatarFallback>{request.fromUserName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{request.fromUserName}</p>
                                <p className="text-sm text-muted-foreground">
                                    {formatDistanceToNow(new Date(request.timestamp), { addSuffix: true })}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleApprove(request)}
                                disabled={processingId === request.id}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                {processingId === request.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <Check className="w-4 h-4 mr-1" />
                                        Approve
                                    </>
                                )}
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReject(request)}
                                disabled={processingId === request.id}
                                className="text-red-600 hover:bg-red-50"
                            >
                                {processingId === request.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <X className="w-4 h-4 mr-1" />
                                        Reject
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
