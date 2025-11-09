'use client';
import {
  addDoc,
  collection,
  doc,
  Firestore,
  serverTimestamp,
  runTransaction,
  deleteDoc,
  updateDoc,
  writeBatch,
  increment,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import {
  FirestorePermissionError,
  type SecurityRuleContext,
} from '@/firebase/errors';
import type { User } from 'firebase/auth';

export type PostData = {
  title: string;
  text: string;
  communityId: string;
  imageUrl?: string;
};

export async function createPost(
  firestore: Firestore,
  user: User,
  postData: PostData
) {
  const userDocRef = doc(firestore, 'users', user.uid);
  const userDoc = await getDoc(userDocRef);
  const username = userDoc.data()?.username || user.displayName || user.email;

  const batch = writeBatch(firestore);

  // 1. Create the new post
  const postsCollection = collection(firestore, 'posts');
  const newPostRef = doc(postsCollection);
  const newPost = {
    uid: user.uid,
    author: username,
    authorPhotoURL: user.photoURL || '',
    title: postData.title,
    text: postData.text,
    communityId: postData.communityId, // This was the missing field
    imageUrl: postData.imageUrl || '',
    createdAt: serverTimestamp(),
    upvotes: [],
    downvotes: [],
    commentCount: 0,
  };
  batch.set(newPostRef, newPost);

  // 2. Increment the community's post count
  const communityRef = doc(firestore, 'communities', postData.communityId);
  batch.update(communityRef, { postCount: increment(1) });


  batch.commit().catch(async (serverError) => {
    const permissionError = new FirestorePermissionError({
      path: newPostRef.path,
      operation: 'create',
      requestResourceData: newPost,
    } satisfies SecurityRuleContext);
    errorEmitter.emit('permission-error', permissionError);
  });
}

export function updatePost(
  firestore: Firestore,
  postId: string,
  postData: Partial<PostData>
) {
  const postRef = doc(firestore, 'posts', postId);

  const updatedData = {
    ...postData,
    updatedAt: serverTimestamp(),
  };

  updateDoc(postRef, updatedData).catch(async (serverError) => {
    const permissionError = new FirestorePermissionError({
      path: postRef.path,
      operation: 'update',
      requestResourceData: updatedData,
    } satisfies SecurityRuleContext);
    errorEmitter.emit('permission-error', permissionError);
  });
}

export async function addComment(
  firestore: Firestore,
  user: User,
  postId: string,
  text: string,
  parentId: string | null = null
) {
  const userDocRef = doc(firestore, 'users', user.uid);
  const userDoc = await getDoc(userDocRef);
  const username = userDoc.data()?.username || user.displayName || user.email;

  const batch = writeBatch(firestore);

  // 1. Create the new comment
  const commentsCollection = collection(firestore, 'posts', postId, 'comments');
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

  const postRef = doc(firestore, 'posts', postId);
  // 2. If it is a top-level comment, increment the post's total comment count
  if (!parentId) {
    batch.update(postRef, { commentCount: increment(1) });
  }

  // 3. If it's a reply, increment the parent comment's replyCount
  if (parentId) {
    const parentCommentRef = doc(
      firestore,
      'posts',
      postId,
      'comments',
      parentId
    );
    batch.update(parentCommentRef, { replyCount: increment(1) });
  }

  batch.commit().catch(async (serverError) => {
    const permissionError = new FirestorePermissionError({
      path: newCommentRef.path,
      operation: 'create',
      requestResourceData: newComment,
    } satisfies SecurityRuleContext);
    errorEmitter.emit('permission-error', permissionError);
  });
}

export function voteOnPost(
  firestore: Firestore,
  userId: string,
  postId: string,
  vote: 'up' | 'down'
) {
  const postRef = doc(firestore, 'posts', postId);

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
      // If already upvoted, remove the upvote.
      if (upvoted) {
        newUpvotes = newUpvotes.filter((uid: string) => uid !== userId);
      } else {
        // If not upvoted, add the upvote and remove any existing downvote.
        newUpvotes.push(userId);
        newDownvotes = newDownvotes.filter((uid: string) => uid !== userId);
      }
    } else if (vote === 'down') {
      // If already downvoted, remove the downvote.
      if (downvoted) {
        newDownvotes = newDownvotes.filter((uid: string) => uid !== userId);
      } else {
        // If not downvoted, add the downvote and remove any existing upvote.
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
    } satisfies SecurityRuleContext);
    errorEmitter.emit('permission-error', permissionError);
  });
}

export function voteOnComment(
  firestore: Firestore,
  userId: string,
  postId: string,
  commentId: string,
  vote: 'up' | 'down'
) {
  const commentRef = doc(firestore, 'posts', postId, 'comments', commentId);

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
      // If already upvoted, remove the upvote.
      if (upvoted) {
        newUpvotes = newUpvotes.filter((uid: string) => uid !== userId);
      } else {
        // If not upvoted, add the upvote and remove any existing downvote.
        newUpvotes.push(userId);
        newDownvotes = newDownvotes.filter((uid: string) => uid !== userId);
      }
    } else if (vote === 'down') {
      // If already downvoted, remove the downvote.
      if (downvoted) {
        newDownvotes = newDownvotes.filter((uid: string) => uid !== userId);
      } else {
        // If not downvoted, add the downvote and remove any existing upvote.
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
    } satisfies SecurityRuleContext);
    errorEmitter.emit('permission-error', permissionError);
  });
}

export function deletePost(firestore: Firestore, postId: string) {
  const postRef = doc(firestore, 'posts', postId);
  deleteDoc(postRef).catch(async (serverError) => {
    const permissionError = new FirestorePermissionError({
      path: postRef.path,
      operation: 'delete',
    } satisfies SecurityRuleContext);
    errorEmitter.emit('permission-error', permissionError);
  });
}


export type CommunityData = {
    id: string; // The url-safe tag, e.g., "wheat"
    name: string;
    description: string;
    imageUrl?: string;
}

export async function createCommunity(firestore: Firestore, user: User, data: CommunityData) {
    const communityRef = doc(firestore, 'communities', data.id);
    const communityDoc = await getDoc(communityRef);

    if (communityDoc.exists()) {
        throw new Error('A community with this ID already exists.');
    }
    
    const userDoc = await getDoc(doc(firestore, 'users', user.uid));
    const username = userDoc.data()?.username || 'user';

    const newCommunity = {
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl || '',
        creatorId: user.uid,
        creatorUsername: username,
        createdAt: serverTimestamp(),
        postCount: 0,
    };

    setDoc(communityRef, newCommunity)
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: communityRef.path,
                operation: 'create',
                requestResourceData: newCommunity
            });
            errorEmitter.emit('permission-error', permissionError);
            throw serverError; // Re-throw to be caught by the calling form
        });
}

export type CommunityUpdateData = {
    name: string;
    description: string;
    imageUrl?: string;
}

export async function updateCommunity(firestore: Firestore, communityId: string, data: CommunityUpdateData) {
    const communityRef = doc(firestore, 'communities', communityId);
    
    const updateData: any = {
        name: data.name,
        description: data.description,
    };

    if (data.imageUrl) {
        updateData.imageUrl = data.imageUrl;
    }

    updateDoc(communityRef, updateData)
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: communityRef.path,
                operation: 'update',
                requestResourceData: updateData
            });
            errorEmitter.emit('permission-error', permissionError);
            throw serverError;
        });
}

export function deleteCommunity(firestore: Firestore, communityId: string) {
    const communityRef = doc(firestore, 'communities', communityId);
    // In a real app, you'd want to delete all posts in this community as well.
    // This often requires a Cloud Function for atomicity.
    deleteDoc(communityRef).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: communityRef.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
    });
}
