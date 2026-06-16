'use client';

import { PostList } from '@/components/features/community/post-list';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { CreatePostDialog } from '@/components/features/community/create-post-dialog';
import { Plus, Pencil, Calendar, Globe, Loader2 } from 'lucide-react';
import { Suspense, useMemo, useState, useRef } from 'react';
import { doc } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatTimestamp } from '@/lib/utils';
import type { Community } from '@/lib/actions/community';
import { useFirestore, useUser, useDoc } from '@/firebase';
import React from 'react';
import { useTranslations } from 'next-intl';
import { useToast } from '@/hooks/use-toast';
import { useAuthActions } from '@/hooks/use-auth-actions';
import { useImageCrop } from '@/hooks/use-image-crop';
import { ImageCropDialog } from '@/components/features/shared/image-crop-dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export default function CommunitySubPage({ params }: { params: Promise<{ communityId: string }> }) {
  const resolvedParams = React.use(params);
  const communityId = resolvedParams.communityId;
  const firestore = useFirestore();
  const { user: currentUser } = useUser();
  const { toast } = useToast();
  const { updateCommunity } = useAuthActions();
  const t = useTranslations('Community');
  const commonT = useTranslations('Common');

  const bannerInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);

  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [editDescription, setEditDescription] = useState('');
  const [isSavingAbout, setIsSavingAbout] = useState(false);

  const communityRef = useMemo(() => {
    if (!firestore) return null;
    return doc(firestore, 'communities', communityId);
  }, [firestore, communityId]);

  const { data: community, loading } = useDoc<Community>(communityRef);

  const {
    cropState: bannerCropState,
    setCropState: setBannerCropState,
    handleImageSelect: handleBannerSelect,
  } = useImageCrop(4, null);

  const {
    cropState: iconCropState,
    setCropState: setIconCropState,
    handleImageSelect: handleIconSelect,
  } = useImageCrop(1, null);

  const isOwner = community && currentUser && community.creatorId === currentUser.uid;

  const onBannerCropComplete = async (croppedImage: string) => {
    try {
      await updateCommunity(communityId, { bannerUrl: croppedImage });
      toast({
        title: 'Banner Updated',
        description: 'The community banner has been updated successfully.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message || 'Could not update banner.',
      });
    }
  };

  const onIconCropComplete = async (croppedImage: string) => {
    try {
      await updateCommunity(communityId, { iconUrl: croppedImage });
      toast({
        title: 'Icon Updated',
        description: 'The community icon has been updated successfully.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message || 'Could not update icon.',
      });
    }
  };

  const handleOpenEditAbout = () => {
    if (community) {
      setEditDescription(community.description || '');
      setIsEditingAbout(true);
    }
  };

  const handleSaveAbout = async () => {
    setIsSavingAbout(true);
    try {
      await updateCommunity(communityId, { description: editDescription });
      toast({
        title: 'About Updated',
        description: 'The community description has been updated successfully.',
      });
      setIsEditingAbout(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message || 'Could not update description.',
      });
    } finally {
      setIsSavingAbout(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!community) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold">Community not found</h1>
        <p className="text-muted-foreground">The community c/{communityId} does not exist.</p>
        <Button asChild variant="link" className="mt-4">
          <Link href="/community">Explore other communities</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Hidden file inputs for editing banner and icon */}
      {isOwner && (
        <>
          <input
            type="file"
            accept="image/*"
            ref={bannerInputRef}
            className="hidden"
            onChange={(e) => handleBannerSelect(e, onBannerCropComplete)}
          />
          <input
            type="file"
            accept="image/*"
            ref={iconInputRef}
            className="hidden"
            onChange={(e) => handleIconSelect(e, onIconCropComplete)}
          />
        </>
      )}

      {/* Banner and Header */}
      <div className="bg-card border rounded-lg overflow-hidden shadow-sm">
        <div className="relative w-full aspect-[4/1] bg-muted">
          {community.bannerUrl && (
            <Image src={community.bannerUrl} alt={`${community.name} banner`} fill className="object-cover" />
          )}
          {isOwner && (
            <Button
              variant="outline"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 bg-black/50 hover:bg-black/75 border-none text-white z-10"
              onClick={() => bannerInputRef.current?.click()}
            >
              <Pencil className="h-4 w-4"/>
            </Button>
          )}
        </div>
        <div className="p-4">
          <div className="relative flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
            <div className="relative group cursor-pointer" onClick={() => isOwner && iconInputRef.current?.click()}>
              <Avatar className="-mt-12 sm:-mt-16 h-20 w-20 sm:h-24 sm:w-24 border-4 border-card bg-card shadow-md group-hover:opacity-95 transition-opacity">
                {community.iconUrl && <AvatarImage src={community.iconUrl} />}
                <AvatarFallback className="text-4xl">
                  {community.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {isOwner && (
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-black/40 rounded-b-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Pencil className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
            <div className="mb-1">
              <h1 className="font-headline text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                c/{community.name}
              </h1>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <CreatePostDialog communityId={communityId}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t('create-post')}
              </Button>
            </CreatePostDialog>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Suspense fallback={<p className="text-muted-foreground">{t('loading-posts')}</p>}>
            <PostList communityId={communityId} />
          </Suspense>
        </div>

        {/* Sidebar */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex justify-between items-center">
                <span>{t('about-title', { name: community.name })}</span>
                {isOwner && (
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleOpenEditAbout}>
                    <Pencil className="h-4 w-4"/>
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-4">
              <p className="text-muted-foreground whitespace-pre-wrap">{community.description}</p>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4"/>
                <span>{t('created-on', { date: formatTimestamp(community.createdAt, { format: 'date', addSuffix: false }) })}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Globe className="h-4 w-4"/>
                <span className="capitalize">{community.type}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Image Crop Dialogs */}
      {isOwner && (
        <>
          <ImageCropDialog
            isOpen={bannerCropState.isOpen}
            onOpenChange={(open) => setBannerCropState((prev) => ({ ...prev, isOpen: open }))}
            imageSrc={bannerCropState.imageSrc}
            aspect={bannerCropState.aspect}
            onCropComplete={bannerCropState.onComplete}
          />
          <ImageCropDialog
            isOpen={iconCropState.isOpen}
            onOpenChange={(open) => setIconCropState((prev) => ({ ...prev, isOpen: open }))}
            imageSrc={iconCropState.imageSrc}
            aspect={iconCropState.aspect}
            onCropComplete={iconCropState.onComplete}
          />
        </>
      )}

      {/* Edit About Description Dialog */}
      {isOwner && (
        <Dialog open={isEditingAbout} onOpenChange={setIsEditingAbout}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Community Details</DialogTitle>
              <DialogDescription>
                Update the description of c/{community.name}.
              </DialogDescription>
            </DialogHeader>
            <div className="my-4">
              <label className="text-sm font-semibold text-muted-foreground block mb-2">Description</label>
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Tell people about your community..."
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-1 text-right">{editDescription.length}/500</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditingAbout(false)} disabled={isSavingAbout}>
                Cancel
              </Button>
              <Button onClick={handleSaveAbout} disabled={isSavingAbout}>
                {isSavingAbout ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
