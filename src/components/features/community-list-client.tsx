'use client';
import { useFirestore, useUser } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, orderBy, query, Timestamp } from 'firebase/firestore';
import Link from 'next/link';
import { Card, CardDescription, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Edit, MoreVertical, Plus, Trash2 } from 'lucide-react';
import { CreateCommunityDialog } from './create-community-dialog';
import { useMemo, useState } from 'react';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EditCommunityDialog } from './edit-community-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuthActions } from '@/hooks/use-auth-actions';
import { useToast } from '@/hooks/use-toast';
import { useUserProfileDialog } from '@/context/user-profile-dialog-provider';
import { formatUsername, formatTimestamp } from '@/lib/utils';
import type { UserProfile } from '@/types';

type Community = {
    id: string;
    name: string;
    description: string;
    postCount: number;
    imageUrl?: string;
    creatorId: string;
    creatorUsername: string;
    creatorRole?: UserProfile['role'];
    createdAt: Timestamp;
}

export function CommunityListClient() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { deleteCommunity } = useAuthActions();
    const { toast } = useToast();
    const { showProfile } = useUserProfileDialog();
    
    const [communityToEdit, setCommunityToEdit] = useState<Community | null>(null);
    const [communityToDelete, setCommunityToDelete] = useState<Community | null>(null);


    const communitiesQuery = useMemo(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'communities'), orderBy('createdAt', 'desc'));
    }, [firestore]);

    const { data: communities, loading } = useCollection<Community>(communitiesQuery);

    const handleDelete = async () => {
        if (!communityToDelete) return;
        try {
            await deleteCommunity(communityToDelete.id);
            toast({ title: "Community Deleted", description: `c/${communityToDelete.id} has been removed.` });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error deleting community', description: error.message });
        }
        setCommunityToDelete(null);
    };

    return (
        <div className="relative">
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {loading && Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="h-[320px] animate-pulse bg-muted/50"></Card>
                ))}

                {communities?.map(community => {
                    const isCreator = user?.uid === community.creatorId;
                    return (
                        <Card key={community.id} className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                             <Link href={`/c/${community.id}`} className="relative block aspect-video w-full bg-muted">
                                {community.imageUrl && (
                                    <Image
                                        src={community.imageUrl}
                                        alt={community.name}
                                        fill
                                        className="object-cover"
                                    />
                                )}
                             </Link>
                             <CardHeader className="relative">
                                <Link href={`/c/${community.id}`}>
                                    <CardTitle className="font-headline text-xl hover:underline">c/{community.name}</CardTitle>
                                </Link>
                                <CardDescription className="line-clamp-2 h-10">{community.description}</CardDescription>
                                {isCreator && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => setCommunityToEdit(community)}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            <span>Edit</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => setCommunityToDelete(community)}
                                            className="text-destructive"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            <span>Delete</span>
                                        </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </CardHeader>
                            <CardFooter className="mt-auto flex justify-between text-xs text-muted-foreground">
                                <button onClick={() => showProfile(community.creatorUsername)} className="hover:underline">
                                    Created by {formatUsername(community.creatorUsername, community.creatorRole)}
                                </button>
                                <span>{formatTimestamp(community.createdAt)}</span>
                            </CardFooter>
                        </Card>
                    )
                })}
            </div>

            {user && (
                <CreateCommunityDialog>
                    <Button
                        className="fixed bottom-6 right-6 rounded-full shadow-lg"
                        aria-label="Create New Community"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Community
                    </Button>
                </CreateCommunityDialog>
            )}

            {communityToEdit && (
                <EditCommunityDialog 
                    isOpen={!!communityToEdit}
                    onOpenChange={(open) => !open && setCommunityToEdit(null)}
                    community={communityToEdit}
                />
            )}

            <AlertDialog open={!!communityToDelete} onOpenChange={(open) => !open && setCommunityToDelete(null)}>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the <strong>c/{communityToDelete?.id}</strong> community and all of its posts.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive hover:bg-destructive/90"
                    >
                    Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
