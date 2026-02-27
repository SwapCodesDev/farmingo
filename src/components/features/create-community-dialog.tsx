'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CreateCommunityForm } from './create-community-form';
import type { CommunityData } from '@/lib/actions/community';
import { cn } from '@/lib/utils';


export function CreateCommunityDialog({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [communityData, setCommunityData] = useState<Partial<CommunityData>>({});

  const handleNext = (data: Partial<CommunityData>) => {
    setCommunityData(prev => ({...prev, ...data}));
    setStep(prev => prev + 1);
  }

  const handleBack = () => {
    setStep(prev => prev - 1);
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset state when dialog is closed
      setTimeout(() => {
        setStep(1);
        setCommunityData({});
      }, 300);
    }
    setIsOpen(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <div className="flex gap-2 mb-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={cn(
                'h-2 w-2 rounded-full transition-colors',
                step >= s ? 'bg-primary' : 'bg-muted'
              )}
            />
          ))}
        </div>
        {step === 1 && (
            <>
            <DialogHeader>
              <DialogTitle>Tell us about your community</DialogTitle>
              <DialogDescription>
                A name and description help people understand what your community is all about.
              </DialogDescription>
            </DialogHeader>
            <CreateCommunityForm onNext={handleNext} initialData={communityData} />
            </>
        )}
        {step === 2 && (
            <>
            <DialogHeader>
                <DialogTitle>Style your community</DialogTitle>
                <DialogDescription>
                    Adding visual flair will catch new members' attention and help establish your community's culture! You can update this at any time.
                </DialogDescription>
            </DialogHeader>
            <CreateCommunityForm
                isStyleStep={true}
                onNext={handleNext}
                onBack={handleBack}
                initialData={communityData}
            />
            </>
        )}
        {step === 3 && (
            <>
            <DialogHeader>
                <DialogTitle>What kind of community is this?</DialogTitle>
                <DialogDescription>
                    Decide who can view and contribute in your community.
                </DialogDescription>
            </DialogHeader>
            <CreateCommunityForm
                isSettingsStep={true}
                onNext={() => handleOpenChange(false)}
                onBack={handleBack}
                initialData={communityData}
            />
            </>
        )}
      </DialogContent>
    </Dialog>
  );
}
