
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

type GuardianRequiredModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProceed: () => void;
  ageGroup: 'under14' | '14to17' | null;
};

export function GuardianRequiredModal({ open, onOpenChange, onProceed, ageGroup }: GuardianRequiredModalProps) {
    const isTeen = ageGroup === '14to17';

    const title = isTeen ? "Guardian Approval Needed" : "Guardian Required";
    const description = isTeen 
      ? "For your safety, we require parental approval for users under 18. You can fill out your details now, and we'll ask for a parent's email at the end to send an approval request."
      : "For your safety, users under 14 must have a parent or guardian complete the account setup process. Please ask them to help you sign up.";

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
            <AlertDialogHeader className="text-center items-center">
                <div className="p-3 rounded-full bg-destructive/10 mb-2">
                    <ShieldAlert className="w-8 h-8 text-destructive"/>
                </div>
                <AlertDialogTitle>{title}</AlertDialogTitle>
                <AlertDialogDescription>{description}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                {isTeen ? (
                    <AlertDialogAction onClick={onProceed} className="w-full">
                        Proceed
                    </AlertDialogAction>
                ) : (
                    <AlertDialogAction onClick={() => onOpenChange(false)} className="w-full">
                        I Understand
                    </AlertDialogAction>
                )}
            </AlertDialogFooter>
        </AlertDialogContent>
        </AlertDialog>
    );
}
