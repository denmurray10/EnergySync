"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Search, Users, X, CheckCheck } from "lucide-react";
import type { User, Friend, MessengerChat, Message } from "@/lib/types";

type MessengerTabProps = {
    user: User | null;
    friends: Friend[];
    messengerHistory: MessengerChat[];
    onUpdateHistory: (history: MessengerChat[]) => void;
};

export function MessengerTab({ user, friends, messengerHistory, onUpdateHistory }: MessengerTabProps) {
    const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
    const [messageInput, setMessageInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    // Derive messages from history
    const currentChat = messengerHistory.find(chat => chat.friendId === selectedFriend?.id);
    const messages = currentChat?.messages || [];

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (scrollAreaRef.current) {
            const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [messages, isTyping, selectedFriend]);

    const handleSendMessage = () => {
        if (messageInput.trim() && selectedFriend && user) {
            const newMessage: Message = {
                id: Date.now().toString(),
                senderId: user.userId,
                receiverId: selectedFriend.id,
                content: messageInput,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: 'sent',
            };

            // Update history
            let updatedHistory = [...messengerHistory];
            const chatIndex = updatedHistory.findIndex(chat => chat.friendId === selectedFriend.id);

            if (chatIndex > -1) {
                updatedHistory[chatIndex] = {
                    ...updatedHistory[chatIndex],
                    messages: [...updatedHistory[chatIndex].messages, newMessage],
                    lastMessage: newMessage,
                };
            } else {
                updatedHistory.push({
                    friendId: selectedFriend.id,
                    messages: [newMessage],
                    lastMessage: newMessage,
                    unreadCount: 0,
                });
            }

            onUpdateHistory(updatedHistory);
            setMessageInput("");

            // Simulate "Seen" status update after 1.5s
            setTimeout(() => {
                const historyWithSeen = [...updatedHistory];
                const idx = historyWithSeen.findIndex(chat => chat.friendId === selectedFriend.id);
                if (idx > -1) {
                    const msgs = [...historyWithSeen[idx].messages];
                    const msgIdx = msgs.findIndex(m => m.id === newMessage.id);
                    if (msgIdx > -1) {
                        msgs[msgIdx] = { ...msgs[msgIdx], status: 'seen' };
                        historyWithSeen[idx] = { ...historyWithSeen[idx], messages: msgs };
                        onUpdateHistory(historyWithSeen);
                        updatedHistory = historyWithSeen; // Update local ref for next timeout
                    }
                }
            }, 1500);

            // Simulate typing response after 2s
            setTimeout(() => {
                setIsTyping(true);

                // Simulate receiving message after typing for 3s
                setTimeout(() => {
                    setIsTyping(false);
                    const responseMessage: Message = {
                        id: (Date.now() + 1).toString(),
                        senderId: selectedFriend.id,
                        receiverId: user.userId,
                        content: "That sounds great! Let's catch up soon.",
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        status: 'delivered',
                    };

                    const historyWithResponse = [...updatedHistory]; // Use latest history
                    const idx = historyWithResponse.findIndex(chat => chat.friendId === selectedFriend.id);
                    if (idx > -1) {
                        historyWithResponse[idx] = {
                            ...historyWithResponse[idx],
                            messages: [...historyWithResponse[idx].messages, responseMessage],
                            lastMessage: responseMessage,
                        };
                        onUpdateHistory(historyWithResponse);
                    }
                }, 3000);
            }, 2000);
        }
    };

    // Filter friends based on search query
    const filteredFriends = friends.filter((friend) =>
        friend.name.toLowerCase().includes(searchQuery.toLowerCase()) && !friend.isPlaceholder
    );

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setShowSuggestions(e.target.value.length > 0);
    };

    const selectFriend = (friend: Friend) => {
        setSelectedFriend(friend);
        setSearchQuery("");
        setShowSuggestions(false);
        setIsTyping(false);
    };

    return (
        <div className="space-y-4 h-[calc(100vh-180px)] flex flex-col">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Messenger
                </h2>
            </div>

            {/* Search Area */}
            <div className="relative z-20">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search your friends..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="pl-10 h-12 rounded-2xl bg-white/50 backdrop-blur-sm border-2 border-indigo-100 focus:border-indigo-300 transition-all"
                    />
                    {searchQuery && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                            onClick={() => {
                                setSearchQuery("");
                                setShowSuggestions(false);
                            }}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                {/* Auto-suggestions Dropdown */}
                {showSuggestions && (
                    <Card className="absolute top-full left-0 right-0 mt-2 shadow-xl border-indigo-100 animate-in fade-in zoom-in-95 duration-200">
                        <CardContent className="p-2">
                            {filteredFriends.length > 0 ? (
                                filteredFriends.map((friend) => (
                                    <div
                                        key={friend.id}
                                        onClick={() => selectFriend(friend)}
                                        className="flex items-center gap-3 p-3 hover:bg-indigo-50 rounded-xl cursor-pointer transition-colors"
                                    >
                                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                            <AvatarImage src={friend.avatar} />
                                            <AvatarFallback className="bg-indigo-100 text-indigo-600 font-bold">
                                                {friend.name.slice(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-800">{friend.name}</p>
                                            <p className="text-xs text-muted-foreground">{friend.energyStatus}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-4 text-center text-muted-foreground">
                                    No friends found matching "{searchQuery}"
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Chat Area */}
            <Card className="flex-1 flex flex-col bg-white/60 backdrop-blur-md border-indigo-50 shadow-lg overflow-hidden rounded-3xl">
                {selectedFriend ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-indigo-50 bg-white/40 flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                <AvatarImage src={selectedFriend.avatar} />
                                <AvatarFallback className="bg-indigo-100 text-indigo-600 font-bold">
                                    {selectedFriend.name.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="font-bold text-gray-800">{selectedFriend.name}</h3>
                                <div className="flex items-center gap-1.5">
                                    <span className={`h-2 w-2 rounded-full ${selectedFriend.currentEnergy > 70 ? 'bg-green-500' :
                                            selectedFriend.currentEnergy > 30 ? 'bg-yellow-500' : 'bg-red-500'
                                        }`} />
                                    <span className="text-xs text-muted-foreground">{selectedFriend.energyStatus}</span>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
                            <div className="space-y-4 pb-2">
                                {messages.length === 0 ? (
                                    <div className="text-center text-muted-foreground py-8">
                                        <p>Start a conversation with {selectedFriend.name}!</p>
                                    </div>
                                ) : (
                                    messages.map((message) => {
                                        const isCurrentUser = message.senderId === user?.userId;
                                        return (
                                            <div
                                                key={message.id}
                                                className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"}`}
                                            >
                                                <div
                                                    className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${isCurrentUser
                                                            ? "bg-indigo-600 text-white rounded-tr-none"
                                                            : "bg-white text-gray-800 rounded-tl-none border border-indigo-50"
                                                        }`}
                                                >
                                                    <p className="text-sm leading-relaxed">{message.content}</p>
                                                    <span className={`text-[10px] mt-1 block text-right ${isCurrentUser ? "text-indigo-200" : "text-gray-400"
                                                        }`}>
                                                        {message.timestamp}
                                                    </span>
                                                </div>

                                                {/* Seen Indicator */}
                                                {isCurrentUser && message.status === 'seen' && (
                                                    <div className="flex items-center gap-1 mt-1 mr-1">
                                                        <span className="text-[10px] text-muted-foreground">Seen</span>
                                                        <CheckCheck className="h-3 w-3 text-indigo-500" />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}

                                {/* Typing Indicator */}
                                {isTyping && (
                                    <div className="flex items-start">
                                        <div className="bg-white border border-indigo-50 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-1">
                                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>

                        {/* Input Area */}
                        <div className="p-4 bg-white/40 border-t border-indigo-50">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Type a message..."
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                                    className="rounded-full bg-white border-indigo-100 focus:border-indigo-300 h-12 px-6"
                                />
                                <Button
                                    onClick={handleSendMessage}
                                    size="icon"
                                    className="h-12 w-12 rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                                >
                                    <Send className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
                        <div className="h-20 w-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                            <Users className="h-10 w-10 text-indigo-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-700 mb-2">Your Friends</h3>
                        <p className="max-w-xs mx-auto">
                            Search for a friend above to start chatting. You can only message people in your friends list.
                        </p>
                    </div>
                )}
            </Card>
        </div>
    );
}
