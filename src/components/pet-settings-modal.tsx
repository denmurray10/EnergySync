"use client";

import { useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const petSettingsSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(20),
  type: z.enum(["cat", "dog", "horse", "chicken"]),
});

type PetSettingsFormValues = z.infer<typeof petSettingsSchema>;

type PetType = 'cat' | 'dog' | 'horse' | 'chicken';

type PetSettingsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string;
  currentType: PetType;
  onSave: (name: string, type: PetType) => void;
};

const petOptions: { value: PetType, label: string, emoji: string }[] = [
    { value: 'cat', label: 'Cat', emoji: '🐱' },
    { value: 'dog', label: 'Dog', emoji: '🐶' },
    { value: 'horse', label: 'Horse', emoji: '🐴' },
    { value: 'chicken', label: 'Chicken', emoji: '🐔' },
];

export function PetSettingsModal({ open, onOpenChange, currentName, currentType, onSave }: PetSettingsModalProps) {
    const form = useForm<PetSettingsFormValues>({
        resolver: zodResolver(petSettingsSchema),
        defaultValues: {
            name: currentName,
            type: currentType,
        },
    });

    useEffect(() => {
        if (open) {
            form.reset({ name: currentName, type: currentType });
        }
    }, [open, currentName, currentType, form]);

    function onSubmit(data: PetSettingsFormValues) {
        onSave(data.name, data.type);
    }
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-card/95 backdrop-blur-lg">
                <DialogHeader>
                    <DialogTitle>Pet Settings</DialogTitle>
                    <DialogDescription>Change your pet's name or type here.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-2">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Pet's Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Buddy" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Pet Type</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            className="grid grid-cols-2 gap-4 pt-2"
                                        >
                                            {petOptions.map(option => (
                                                <FormItem key={option.value} className="flex items-center space-x-3 space-y-0 p-3 bg-muted/50 rounded-lg">
                                                    <FormControl>
                                                        <RadioGroupItem value={option.value} id={option.value} />
                                                    </FormControl>
                                                    <Label htmlFor={option.value} className="font-normal flex items-center gap-2 text-base cursor-pointer">
                                                        {option.emoji} {option.label}
                                                    </Label>
                                                </FormItem>
                                            ))}
                                        </RadioGroup>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
