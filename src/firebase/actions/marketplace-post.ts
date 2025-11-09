'use client';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  Firestore,
  getDoc,
  increment,
  runTransaction,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import {
  FirestorePermissionError,
} from '@/firebase/errors';
import type { User } from 'firebase/auth';

export type MarketplacePostData = {
  itemName: string;
  description: string;
  price: number;
  quantity: string;
  condition: "New" | "Used" | "For Hire";
  imageUrl: string;
};

export async function createMarketplacePost(
  firestore: Firestore,
  user: User,
  postData: MarketplacePostData,
) {
  const userDocRef = doc(firestore, 'users', user.uid);
  const userDoc = await getDoc(userDocRef);
  const username = userDoc.data()?.username || user.displayName || 'Anonymous';
  
  const newPost = {
    ...postData,
    uid: user.uid,
    author: username,
    authorPhotoURL: user.photoURL || '',
    createdAt: serverTimestamp(),
    commentCount: 0,
    upvotes: [],
    downvotes: [],
  };

  const postsCollection = collection(firestore, 'marketplacePosts');
  addDoc(postsCollection, newPost).catch(async (serverError) => {
    const permissionError = new FirestorePermissionError({
      path: postsCollection.path,
      operation: 'create',
      requestResourceData: newPost,
    });
    errorEmitter.emit('permission-error', permissionError);
    throw serverError;
  });
}

export async function addMarketplaceComment(
  firestore: Firestore,
  user: User,
  postId: string,
  text: string,
  parentId: string | null = null
) {
  const userDocRef = doc(firestore, 'users', user.uid);
  const userDoc = await getDoc(userDocRef);
  const username = userDoc.data()?.username || user.displayName || 'Anonymous';

  const batch = writeBatch(firestore);

  // 1. Create the new comment
  const commentsCollection = collection(firestore, 'marketplacePosts', postId, 'comments');
  const newCommentRef = doc(commentsCollection);

  const newComment = {
    uid: user.uid,
    author: username,
    authorPhotoURL: user.photoURL || '',
    text: text,
    createdAt: serverTimestamp(),
    parentId: parentId,
    replyCount: 0,
    upvotes: [],
    downvotes: [],
  };

  batch.set(newCommentRef, newComment);

  const postRef = doc(firestore, 'marketplacePosts', postId);
  
  // 2. Increment the post's total comment count
  if (!parentId) {
    batch.update(postRef, { commentCount: increment(1) });
  }

  // 3. If it's a reply, increment the parent comment's replyCount
  if (parentId) {
    const parentCommentRef = doc(firestore, 'marketplacePosts', postId, 'comments', parentId);
    batch.update(parentCommentRef, { replyCount: increment(1) });
  }


  batch.commit().catch(async (serverError) => {
    const permissionError = new FirestorePermissionError({
      path: newCommentRef.path,
      operation: 'create',
      requestResourceData: newComment,
    });
    errorEmitter.emit('permission-error', permissionError);
  });
}


export function voteOnMarketplaceComment(
    firestore: Firestore,
    userId: string,
    postId: string,
    commentId: string,
    vote: 'up' | 'down'
  ) {
    const commentRef = doc(firestore, 'marketplacePosts', postId, 'comments', commentId);
  
    runTransaction(firestore, async (transaction) => {
      const commentDoc = await transaction.get(commentRef);
      if (!commentDoc.exists()) {
        throw 'Comment does not exist!';
      }
  
      const commentData = commentDoc.data();
      const upvoted = commentData.upvotes?.includes(userId);
      const downvoted = commentData.downvotes?.includes(userId);
  
      let newUpvotes = commentData.upvotes || [];
      let newDownvotes = commentData.downvotes || [];
  
      if (vote === 'up') {
        if (upvoted) {
          newUpvotes = newUpvotes.filter((uid: string) => uid !== userId);
        } else {
          newUpvotes.push(userId);
          newDownvotes = newDownvotes.filter((uid: string) => uid !== userId);
        }
      } else if (vote === 'down') {
        if (downvoted) {
          newDownvotes = newDownvotes.filter((uid: string) => uid !== userId);
        } else {
          newDownvotes.push(userId);
          newUpvotes = newUpvotes.filter((uid: string) => uid !== userId);
        }
      }
  
      transaction.update(commentRef, {
        upvotes: newUpvotes,
        downvotes: newDownvotes,
      });
    }).catch(async (serverError) => {
      const commentDoc = await getDoc(commentRef);
      const permissionError = new FirestorePermissionError({
        path: commentRef.path,
        operation: 'update',
        requestResourceData: commentDoc.data(),
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  }

export function voteOnMarketplacePost(
    firestore: Firestore,
    userId: string,
    postId: string,
    vote: 'up' | 'down'
) {
    const postRef = doc(firestore, 'marketplacePosts', postId);

    runTransaction(firestore, async (transaction) => {
        const postDoc = await transaction.get(postRef);
        if (!postDoc.exists()) {
            throw 'Document does not exist!';
        }

        const postData = postDoc.data();
        const upvoted = postData.upvotes?.includes(userId);
        const downvoted = postData.downvotes?.includes(userId);

        let newUpvotes = postData.upvotes || [];
        let newDownvotes = postData.downvotes || [];

        if (vote === 'up') {
            if (upvoted) {
                newUpvotes = newUpvotes.filter((uid: string) => uid !== userId);
            } else {
                newUpvotes.push(userId);
                newDownvotes = newDownvotes.filter((uid: string) => uid !== userId);
            }
        } else if (vote === 'down') {
            if (downvoted) {
                newDownvotes = newDownvotes.filter((uid: string) => uid !== userId);
            } else {
                newDownvotes.push(userId);
                newUpvotes = newUpvotes.filter((uid: string) => uid !== userId);
            }
        }

        transaction.update(postRef, {
            upvotes: newUpvotes,
            downvotes: newDownvotes,
        });
    }).catch(async (serverError) => {
        const postDoc = await getDoc(postRef);
        const permissionError = new FirestorePermissionError({
            path: postRef.path,
            operation: 'update',
            requestResourceData: postDoc.data(),
        });
        errorEmitter.emit('permission-error', permissionError);
    });
}

export function updateMarketplacePost(firestore: Firestore, postId: string, postData: Partial<MarketplacePostData>) {
    const postRef = doc(firestore, 'marketplacePosts', postId);
    const updateData = {
        ...postData,
        updatedAt: serverTimestamp(),
    };
    updateDoc(postRef, updateData)
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: postRef.path,
                operation: 'update',
                requestResourceData: updateData,
            });
            errorEmitter.emit('permission-error', permissionError);
            throw serverError;
        });
}

export function deleteMarketplacePost(firestore: Firestore, postId: string) {
    const postRef = doc(firestore, 'marketplacePosts', postId);
    deleteDoc(postRef)
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: postRef.path,
                operation: 'delete',
            });
            errorEmitter.emit('permission-error', permissionError);
            throw serverError;
        });
}
