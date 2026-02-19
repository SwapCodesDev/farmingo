
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
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import {
  FirestorePermissionError,
  type SecurityRuleContext,
} from '@/firebase/errors';
import type { User } from 'firebase/auth';
import type { UserProfile } from '@/types';


export type Post = {
  id: string;
  uid: string;
  author: string;
  authorPhotoURL: string;
  authorRole?: UserProfile['role'];
  title: string;
  text: string;
  communityId: string;
  createdAt: any;
  imageUrl?: string;
  commentCount?: number;
  upvotes?: string[];
  downvotes?: string[];
  pinnedCommentId?: string;
};

export type Comment = {
  id: string;
  uid: string;
  author: string;
  authorPhotoURL: string;
  authorRole?: UserProfile['role'];
  text: string;
  createdAt: any;
  parentId: string | null;
  upvotes?: string[];
  downvotes?: string[];
};


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
  const userData = userDoc.data() as UserProfile;
  const username = userData?.username || user.displayName || user.email;

  const batch = writeBatch(firestore);

  const postsCollection = collection(firestore, 'posts');
  const newPostRef = doc(postsCollection);

  const newPost = {
    id: newPostRef.id,
    uid: user.uid,
    author: username,
    authorPhotoURL: user.photoURL || '',
    authorRole: userData?.role || 'user',
    title: postData.title,
    text: postData.text,
    communityId: postData.communityId,
    imageUrl: postData.imageUrl || '',
    createdAt: serverTimestamp(),
    upvotes: [],
    downvotes: [],
    commentCount: 0,
    pinnedCommentId: null,
  };
  batch.set(newPostRef, newPost);

  // 2. Increment the community's post count
  const communityRef = doc(firestore, 'communities', postData.communityId);
  batch.update(communityRef, { postCount: increment(1) });


  try {
    await batch.commit();
  } catch (serverError) {
    const permissionError = new FirestorePermissionError({
      path: newPostRef.path,
      operation: 'create',
      requestResourceData: newPost,
    });
    errorEmitter.emit('permission-error', permissionError);
    throw serverError;
  }
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
  const userData = userDoc.data() as UserProfile;
  const username = userData?.username || user.displayName || user.email;

  const batch = writeBatch(firestore);

  const commentsCollection = collection(firestore, 'posts', postId, 'comments');
  const newCommentRef = doc(commentsCollection);

  const newComment = {
    id: newCommentRef.id,
    uid: user.uid,
    author: username,
    authorPhotoURL: user.photoURL || '',
    authorRole: userData?.role || 'user',
    text: text,
    createdAt: serverTimestamp(),
    parentId: parentId,
    replyCount: 0,
    upvotes: [],
    downvotes: [],
  };

  batch.set(newCommentRef, newComment);

  const postRef = doc(firestore, 'posts', postId);
  
  if (!parentId) {
    batch.update(postRef, { commentCount: increment(1) });
  }

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

  try {
    await batch.commit();
  } catch (serverError) {
    const permissionError = new FirestorePermissionError({
      path: commentsCollection.path, // Use collection path for create
      operation: 'create',
      requestResourceData: newComment,
    });
    errorEmitter.emit('permission-error', permissionError);
    throw serverError;
  }
}

export function updateComment(
    firestore: Firestore,
    postId: string,
    commentId: string,
    text: string
) {
    const commentRef = doc(firestore, 'posts', postId, 'comments', commentId);
    const updateData = { text, updatedAt: serverTimestamp() };

    updateDoc(commentRef, updateData).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: commentRef.path,
            operation: 'update',
            requestResourceData: updateData,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
    });
}

export function deleteComment(firestore: Firestore, postId: string, commentId: string) {
    const commentRef = doc(firestore, 'posts', postId, 'comments', commentId);
    const postRef = doc(firestore, 'posts', postId);

    runTransaction(firestore, async (transaction) => {
        const commentDoc = await transaction.get(commentRef);
        if (!commentDoc.exists()) {
            throw new Error("Comment does not exist");
        }

        const commentData = commentDoc.data();
        transaction.delete(commentRef);

        if (!commentData.parentId) {
            transaction.update(postRef, { commentCount: increment(-1) });
        } else {
            const parentCommentRef = doc(firestore, 'posts', postId, 'comments', commentData.parentId);
            transaction.update(parentCommentRef, { replyCount: increment(-1) });
        }
    }).catch((serverError) => {
        const permissionError = new FirestorePermissionError({
            path: commentRef.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
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
    } satisfies SecurityRuleContext);
    errorEmitter.emit('permission-error', permissionError);
  });
}

export function pinComment(firestore: Firestore, postId: string, commentId: string | null) {
  const postRef = doc(firestore, 'posts', postId);
  updateDoc(postRef, { pinnedCommentId: commentId }).catch((serverError) => {
    const permissionError = new FirestorePermissionError({
      path: postRef.path,
      operation: 'update',
      requestResourceData: { pinnedCommentId: commentId },
    });
    errorEmitter.emit('permission-error', permissionError);
    throw serverError;
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
    bannerUrl?: string;
    iconUrl?: string;
    type: 'public' | 'restricted' | 'private';
    isMature: boolean;
};

export type Community = {
    id: string;
    name: string;
    description: string;
    bannerUrl?: string;
    iconUrl?: string;
    postCount: number;
    creatorId: string;
    creatorUsername: string;
    creatorRole?: UserProfile['role'];
    createdAt: any;
    type: 'public' | 'restricted' | 'private';
    isMature: boolean;
}


export async function createCommunity(firestore: Firestore, user: User, data: CommunityData) {
    const communityRef = doc(firestore, 'communities', data.id);
    const communityDoc = await getDoc(communityRef);

    if (communityDoc.exists()) {
        throw new Error('A community with this ID already exists.');
    }
    
    const userDocRef = doc(firestore, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.data() as UserProfile;
    const username = userData?.username || 'user';
    const role = userData?.role || 'user';

    const newCommunity = {
        name: data.name,
        description: data.description,
        iconUrl: data.iconUrl || '',
        bannerUrl: data.bannerUrl || '',
        creatorId: user.uid,
        creatorUsername: username,
        creatorRole: role,
        createdAt: serverTimestamp(),
        postCount: 0,
        type: data.type,
        isMature: data.isMature,
    };

    try {
        await setDoc(communityRef, newCommunity);
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({
            path: communityRef.path,
            operation: 'create',
            requestResourceData: newCommunity
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
    }
}

export type CommunityUpdateData = {
    name: string;
    description: string;
    iconUrl?: string;
    bannerUrl?: string;
}

export async function updateCommunity(firestore: Firestore, communityId: string, data: Partial<CommunityUpdateData>) {
    const communityRef = doc(firestore, 'communities', communityId);
    
    const updateData = { ...data };

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

export async function deleteCommunity(firestore: Firestore, communityId: string) {
    const batch = writeBatch(firestore);

    // 1. Delete the community document itself
    const communityRef = doc(firestore, 'communities', communityId);
    batch.delete(communityRef);

    // 2. Query for all posts in that community
    const postsQuery = query(collection(firestore, 'posts'), where('communityId', '==', communityId));
    const postsSnapshot = await getDocs(postsQuery);

    // 3. Delete each post
    postsSnapshot.docs.forEach(postDoc => {
        batch.delete(postDoc.ref);
    });

    // 4. Commit the batch
    batch.commit().catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: communityRef.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
    });
}
