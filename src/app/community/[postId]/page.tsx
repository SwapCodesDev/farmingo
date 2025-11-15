import { PostDetailClient } from '@/components/features/post-detail-client';
import { Suspense } from 'react';
import type { Metadata, ResolvingMetadata } from 'next';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';
import type { Post } from '@/lib/actions/community';

// Initialize Firebase Admin SDK-like access on the server
// This is safe because it only runs on the server.
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig, 'server');
} else {
  app = getApp('server');
}
const db = getFirestore(app);


type Props = {
  params: { postId: string }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const postId = params.postId;

  try {
    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDoc(postRef);

    if (!postSnap.exists()) {
      return {
        title: 'Post Not Found',
        description: 'This post may have been removed.',
      };
    }

    const post = postSnap.data() as Post;
    const previousImages = (await parent).openGraph?.images || [];
    
    // Construct a clean description for the preview
    const description = post.text.substring(0, 150).replace(/\s+/g, ' ').trim() + '...';
    const url = `https://farmingo.com/community/${postId}`;

    return {
      title: `${post.title} | Farmingo`,
      description: description,
      openGraph: {
        title: post.title,
        description: description,
        url: url,
        type: 'article',
        images: post.imageUrl ? [post.imageUrl, ...previousImages] : previousImages,
      },
      twitter: {
        card: post.imageUrl ? 'summary_large_image' : 'summary',
        title: post.title,
        description: description,
        images: post.imageUrl ? [post.imageUrl] : [],
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: 'Error',
      description: 'Could not load post details.',
    }
  }
}


export default function PostPage({ params }: { params: { postId: string } }) {
  return (
    <Suspense fallback={<p>Loading post...</p>}>
      <PostDetailClient postId={params.postId} />
    </Suspense>
  );
}
