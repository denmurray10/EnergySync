
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
import { ShieldAlert } from "lucide-react";
import { useRouter } from 'next/navigation';

type GuardianRequiredModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function GuardianRequiredModal({ open, onOpenChange }: GuardianRequiredModalProps) {
    const router = useRouter();

    const handleRedirect = () => {
        onOpenChange(false);
        router.push('/parent-setup');
    }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader className="text-center items-center">
            <div className="p-3 rounded-full bg-destructive/10 mb-2">
                <ShieldAlert className="w-8 h-8 text-destructive"/>
            </div>
            <AlertDialogTitle>Guardian Required</AlertDialogTitle>
            <AlertDialogDescription>
                For your safety, users under 18 must have a parent or guardian complete the account setup process.
            </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
            <AlertDialogAction onClick={handleRedirect} className="w-full">
                Go to Parent Setup
            </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
