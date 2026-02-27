
import { MarketplacePostDetailClient } from '@/components/features/marketplace-post-detail-client';
import { Suspense } from 'react';
import type { Metadata, ResolvingMetadata } from 'next';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';
import type { MarketplacePost } from '@/components/features/marketplace-client';

// Initialize Firebase Admin SDK-like access on the server
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig, 'server');
} else {
  app = getApp('server');
}
const db = getFirestore(app);

type Props = {
  params: Promise<{ locale: string; postId: string }>
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { postId } = await params;

  try {
    const postRef = doc(db, 'marketplacePosts', postId);
    const postSnap = await getDoc(postRef);

    if (!postSnap.exists()) {
      return {
        title: 'Post Not Found',
        description: 'This marketplace post may have been removed.',
      };
    }

    const post = postSnap.data() as MarketplacePost;
    const previousImages = (await parent).openGraph?.images || [];
    
    const description = post.description.substring(0, 150).replace(/\s+/g, ' ').trim() + '...';
    const title = `${post.itemName} - ₹${post.price}`;

    return {
      title: `${title} | Farmingo Marketplace`,
      description: description,
      openGraph: {
        title: title,
        description: description,
        type: 'article',
        url: `https://farmingo.com/marketplace/posts/${postId}`, 
        images: post.imageUrl ? [post.imageUrl, ...previousImages] : previousImages,
      },
      twitter: {
        card: 'summary_large_image',
        title: title,
        description: description,
        images: post.imageUrl ? [post.imageUrl] : [],
      },
    };
  } catch (error) {
    console.error("Error generating metadata for marketplace post:", error);
    return {
      title: 'Error',
      description: 'Could not load post details.',
    }
  }
}

export default async function MarketplacePostPage({ params }: Props) {
  const { postId } = await params;
  return (
    <Suspense fallback={<p>Loading post...</p>}>
      <MarketplacePostDetailClient postId={postId} />
    </Suspense>
  );
}
