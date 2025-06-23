
"use client";

import { useState } from 'react';
import type { PetCustomization } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Lock, Gem } from "lucide-react";
import { cn } from '@/lib/utils';

type PetCustomizationModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customization: PetCustomization;
  interactions: number;
  onPurchase: (category: 'color' | 'accessory' | 'background', item: string, cost: number) => void;
  onEquip: (category: 'color' | 'accessory' | 'background', item: string) => void;
};

const customizationOptions = {
    colors: [
        { name: 'Stone', value: '#a8a29e', cost: 0 },
        { name: 'Orange', value: '#f97316', cost: 20 },
        { name: 'Sky', value: '#38bdf8', cost: 20 },
        { name: 'Emerald', value: '#34d399', cost: 25 },
        { name: 'Rose', value: '#f43f5e', cost: 25 },
    ],
    accessories: [
        { name: 'None', value: 'none', cost: 0 },
        { name: 'Bowtie', value: 'bowtie', cost: 50 },
    ],
    backgrounds: [
        { name: 'Default', value: 'default', cost: 0, className: 'bg-card' },
        { name: 'Cozy Room', value: 'cozy', cost: 30, className: 'bg-amber-100' },
        { name: 'Park', value: 'park', cost: 30, className: 'bg-green-100' },
    ],
};

export function PetCustomizationModal({ open, onOpenChange, customization, interactions, onPurchase, onEquip }: PetCustomizationModalProps) {

  const renderItem = (category: 'color' | 'accessory' | 'background', item: any) => {
    const isUnlocked = (customization?.[`unlocked${category.charAt(0).toUpperCase() + category.slice(1)}s` as keyof PetCustomization] ?? []).includes(item.value);
    const isEquipped = customization?.[category] === item.value;
    const canAfford = interactions >= item.cost;
    
    let display: React.ReactNode;
    if (category === 'color') {
        display = <div className="w-10 h-10 rounded-full border" style={{ backgroundColor: item.value }} />;
    } else {
        display = <div className="text-center p-2"><span className="text-sm font-medium">{item.name}</span></div>;
    }

    return (
      <Card key={item.value} className={cn("text-center transition-all", isEquipped && "border-primary ring-2 ring-primary")}>
        <CardContent className="p-2 flex flex-col items-center justify-center h-full">
          {display}
          <div className="mt-2 w-full">
            {isUnlocked ? (
                <Button onClick={() => onEquip(category, item.value)} disabled={isEquipped} size="sm" className="w-full">
                    {isEquipped ? <Check className="mr-2 h-4 w-4" /> : null}
                    Equip
                </Button>
            ) : (
                <Button onClick={() => onPurchase(category, item.value, item.cost)} disabled={!canAfford} size="sm" className="w-full">
                    {!canAfford && <Lock className="mr-2 h-4 w-4"/>}
                    <Gem className="mr-2 h-4 w-4"/>
                    {item.cost}
                </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full bg-card/95 backdrop-blur-lg">
        <DialogHeader>
          <DialogTitle>Customize Your Pet</DialogTitle>
          <DialogDescription>Use your interactions to unlock new styles for your pet. You have <span className="font-bold text-primary">{interactions}</span> interactions.</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="colors" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="accessories">Accessories</TabsTrigger>
            <TabsTrigger value="backgrounds">Backgrounds</TabsTrigger>
          </TabsList>
          <ScrollArea className="h-64 mt-4">
            <TabsContent value="colors">
              <div className="grid grid-cols-3 gap-2 p-1">
                {customizationOptions.colors.map(item => renderItem('color', item))}
              </div>
            </TabsContent>
            <TabsContent value="accessories">
              <div className="grid grid-cols-3 gap-2 p-1">
                {customizationOptions.accessories.map(item => renderItem('accessory', item))}
              </div>
            </TabsContent>
            <TabsContent value="backgrounds">
               <div className="grid grid-cols-2 gap-2 p-1">
                {customizationOptions.backgrounds.map(item => renderItem('background', item))}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
