
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
};

export function GuardianRequiredModal({ open, onOpenChange }: GuardianRequiredModalProps) {

    const handleAcknowledge = () => {
        onOpenChange(false);
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
                For your safety, users under 18 must have a parent or guardian complete the account setup process. Please ask them to help you sign up.
            </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
            <AlertDialogAction onClick={handleAcknowledge} className="w-full">
                I Understand
            </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
