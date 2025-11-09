'use client';
import { useFirestore, useUser } from '@/firebase';
import {
  createPost as createPostAction,
  updatePost as updatePostAction,
  addComment as addCommentAction,
  voteOnPost as voteOnPostAction,
  deletePost as deletePostAction,
  voteOnComment as voteOnCommentAction,
  updateComment as updateCommentAction,
  deleteComment as deleteCommentAction,
  pinComment as pinCommentAction,
  createCommunity as createCommunityAction,
  updateCommunity as updateCommunityAction,
  deleteCommunity as deleteCommunityAction,
  type PostData,
  type CommunityData,
  type CommunityUpdateData,
} from '@/lib/actions/community';
import { useToast } from './use-toast';
import { useCallback } from 'react';

export function useAuthActions() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const createPost = useCallback(
    async (postData: PostData) => {
      if (!user || !firestore) {
        toast({
          variant: 'destructive',
          title: 'Not authenticated',
          description: 'You must be logged in to create a post.',
        });
        return;
      }
      createPostAction(firestore, user, postData);
    },
    [user, firestore, toast]
  );

  const updatePost = useCallback(
    async (postId: string, postData: Partial<PostData>) => {
      if (!user || !firestore) {
        toast({
          variant: 'destructive',
          title: 'Not authenticated',
          description: 'You must be logged in to update a post.',
        });
        return;
      }
      updatePostAction(firestore, postId, postData);
    },
    [user, firestore, toast]
  );

  const addComment = useCallback(
    async (postId: string, text: string, parentId: string | null = null) => {
      if (!user || !firestore) {
        toast({
          variant: 'destructive',
          title: 'Not authenticated',
          description: 'You must be logged in to comment.',
        });
        return;
      }
      addCommentAction(firestore, user, postId, text, parentId);
    },
    [user, firestore, toast]
  );

  const updateComment = useCallback(
    async (postId: string, commentId: string, text: string) => {
      if (!user || !firestore) {
        toast({
          variant: 'destructive',
          title: 'Not authenticated',
          description: 'You must be logged in to update a comment.',
        });
        throw new Error('User not authenticated');
      }
      return updateCommentAction(firestore, postId, commentId, text);
    },
    [user, firestore, toast]
  );

  const deleteComment = useCallback(
    async (postId: string, commentId: string) => {
      if (!user || !firestore) {
        toast({
          variant: 'destructive',
          title: 'Not authenticated',
          description: 'You must be logged in to delete a comment.',
        });
        throw new Error('User not authenticated');
      }
      return deleteCommentAction(firestore, postId, commentId);
    },
    [user, firestore, toast]
  );


  const voteOnPost = useCallback(
    async (postId: string, vote: 'up' | 'down') => {
      if (!user || !firestore) {
        toast({
          variant: 'destructive',
          title: 'Not authenticated',
          description: 'You must be logged in to vote.',
        });
        return;
      }
      voteOnPostAction(firestore, user.uid, postId, vote);
    },
    [user, firestore, toast]
  );

  const voteOnComment = useCallback(
    async (postId: string, commentId: string, vote: 'up' | 'down') => {
        if (!user || !firestore) {
            toast({
                variant: 'destructive',
                title: 'Not authenticated',
                description: 'You must be logged in to vote on a comment.',
            });
            return;
        }
        voteOnCommentAction(firestore, user.uid, postId, commentId, vote);
    },
    [user, firestore, toast]
  );

  const pinComment = useCallback(
    async (postId: string, commentId: string | null) => {
      if (!user || !firestore) {
        toast({
          variant: 'destructive',
          title: 'Not authenticated',
          description: 'You must be logged in to pin a comment.',
        });
        throw new Error('User not authenticated');
      }
      return pinCommentAction(firestore, postId, commentId);
    }, [user, firestore, toast]
  );

  const deletePost = useCallback(
    async (postId: string) => {
        if (!user || !firestore) {
            toast({
                variant: 'destructive',
                title: 'Not authenticated',
                description: 'You must be logged in to delete a post.',
            });
            return;
        }
        deletePostAction(firestore, postId);
    },
    [user, firestore, toast]
);

  const createCommunity = useCallback(
    async (communityData: CommunityData) => {
      if (!user || !firestore) {
        toast({
          variant: 'destructive',
          title: 'Not authenticated',
          description: 'You must be logged in to create a community.',
        });
        throw new Error('User not authenticated');
      }
      return createCommunityAction(firestore, user, communityData);
    },
    [user, firestore, toast]
  );
  
  const updateCommunity = useCallback(
    async (communityId: string, communityData: CommunityUpdateData) => {
        if (!user || !firestore) {
            toast({
                variant: 'destructive',
                title: 'Not authenticated',
                description: 'You must be logged in to update a community.',
            });
            throw new Error('User not authenticated');
        }
        return updateCommunityAction(firestore, communityId, communityData);
    },
    [user, firestore, toast]
  );

  const deleteCommunity = useCallback(
    async (communityId: string) => {
        if (!user || !firestore) {
            toast({
                variant: 'destructive',
                title: 'Not authenticated',
                description: 'You must be logged in to delete a community.',
            });
            throw new Error('User not authenticated');
        }
        return deleteCommunityAction(firestore, communityId);
    },
    [user, firestore, toast]
  );


  return { createPost, updatePost, addComment, voteOnPost, deletePost, voteOnComment, updateComment, deleteComment, pinComment, createCommunity, updateCommunity, deleteCommunity };
}
