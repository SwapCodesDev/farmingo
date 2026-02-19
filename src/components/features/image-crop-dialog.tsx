'use client';

import { useState, useRef } from 'react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import 'react-image-crop/dist/ReactCrop.css';
import { getCroppedImg } from '@/lib/image-processing';
import { useToast } from '@/hooks/use-toast';

interface ImageCropDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  imageSrc: string | null;
  aspect: number;
  onCropComplete: (croppedImageBase64: string) => void;
}

export function ImageCropDialog({
  isOpen,
  onOpenChange,
  imageSrc,
  aspect,
  onCropComplete,
}: ImageCropDialogProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const { toast } = useToast();

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspect,
        width,
        height
      ),
      width,
      height
    );
    setCrop(crop);
  }

  async function handleCrop() {
    if (!completedCrop || !imgRef.current) {
        toast({
            variant: 'destructive',
            title: 'Crop Error',
            description: 'Please select a crop area first.',
        });
        return;
    }

    const croppedImageBase64 = await getCroppedImg(
        imgRef.current,
        completedCrop,
        'new-file.jpeg' // The name does not matter much here as we get a base64 string
    );
    
    if (croppedImageBase64) {
        onCropComplete(croppedImageBase64);
        onOpenChange(false);
    } else {
        toast({
            variant: 'destructive',
            title: 'Crop Error',
            description: 'Could not crop the image. Please try again.',
        });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Crop your image</DialogTitle>
        </DialogHeader>
        <div className="my-4 flex justify-center">
          {imageSrc && (
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspect}
              className="max-h-[70vh]"
            >
              <img
                ref={imgRef}
                alt="Crop me"
                src={imageSrc}
                onLoad={onImageLoad}
                style={{ maxHeight: '70vh' }}
              />
            </ReactCrop>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCrop}>Crop & Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
