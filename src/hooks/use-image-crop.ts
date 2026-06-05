'use client';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useImageCrop(aspect: number = 1, initialPreview: string | null = null) {
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(initialPreview);
  const [cropState, setCropState] = useState<{
    isOpen: boolean;
    imageSrc: string | null;
    aspect: number;
    onComplete: (croppedImage: string) => void;
  }>({
    isOpen: false,
    imageSrc: null,
    aspect,
    onComplete: () => {},
  });

  const handleImageSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
    onCropComplete: (croppedImage: string) => void
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        toast({
          variant: 'destructive',
          title: 'Image too large',
          description: 'Please upload an image smaller than 4MB.',
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setCropState({
          isOpen: true,
          imageSrc: reader.result as string,
          aspect,
          onComplete: (croppedImage) => {
            setImagePreview(croppedImage);
            onCropComplete(croppedImage);
          },
        });
      };
      reader.readAsDataURL(file);
    }
    if (event.target) {
      event.target.value = '';
    }
  };

  const clearImage = (onClear: () => void) => {
    setImagePreview(null);
    onClear();
  };

  return {
    imagePreview,
    setImagePreview,
    cropState,
    setCropState,
    handleImageSelect,
    clearImage,
  };
}
