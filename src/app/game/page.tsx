'use client';

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft, Gamepad2 } from "lucide-react";

export default function GamePage() {
    const router = useRouter();

    return (
        <main className="min-h-dvh bg-background flex flex-col items-center justify-center p-4">
            <div className="text-center space-y-4">
                <Gamepad2 className="h-16 w-16 text-primary mx-auto" />
                <h1 className="text-4xl font-bold">Pet Game</h1>
                <p className="text-muted-foreground">
                    This is where the immersive pet game will be built.
                </p>
            </div>
            <Button onClick={() => router.back()} className="absolute top-4 left-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
            </Button>
        </main>
    );
}
