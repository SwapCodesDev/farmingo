'use client';
import {
  addDoc,
  collection,
  doc,
  Firestore,
  getDoc,
  serverTimestamp,
  deleteDoc,
  updateDoc,
  runTransaction,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import {
  FirestorePermissionError,
  type SecurityRuleContext,
} from '@/firebase/errors';
import { placeholderImages } from '@/lib/placeholder-images';
import type { User } from 'firebase/auth';
import type { UserProfile } from '@/types';

export type ProductData = {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
  unit: string;
  moq: number;
  origin: string;
};

const demoProducts: ProductData[] = [
  {
    name: 'Fresh Organic Tomatoes',
    description: 'Plump, juicy, and bursting with flavor. Straight from our farm to your table. Perfect for salads, sauces, or just eating raw!',
    price: 250,
    imageUrl: placeholderImages.find(img => img.id === 'product-1')?.imageUrl || "https://picsum.photos/seed/tomato/400/300",
    category: 'Vegetables',
    stock: 150,
    unit: 'kg',
    moq: 5,
    origin: 'Nashik, Maharashtra',
  },
  {
    name: 'Crisp Lettuce Heads',
    description: 'Crisp and refreshing green lettuce. Grown using sustainable methods to ensure the highest quality and taste.',
    price: 120,
    imageUrl: placeholderImages.find(img => img.id === 'product-2')?.imageUrl || "https://picsum.photos/seed/lettuce/400/300",
    category: 'Vegetables',
    stock: 80,
    unit: 'crate',
    moq: 2,
    origin: 'Pune, Maharashtra',
  },
  {
    name: 'Handmade Wooden Crate',
    description: 'A sturdy and rustic handmade wooden crate. Ideal for harvesting, storage, or as a decorative piece for your farmhouse.',
    price: 800,
    imageUrl: placeholderImages.find(img => img.id === 'product-3')?.imageUrl || "https://picsum.photos/seed/crate/400/300",
    category: 'Tools & Equipment',
    stock: 25,
    unit: 'piece',
    moq: 1,
    origin: 'Sahranpur, Uttar Pradesh',
  },
  {
    name: 'Organic Fertilizer (20kg)',
    description: 'Enrich your soil with our premium organic fertilizer. Packed with nutrients to help your crops thrive.',
    price: 1500,
    imageUrl: placeholderImages.find(img => img.id === 'product-4')?.imageUrl || "https://picsum.photos/seed/fertilizer/400/300",
    category: 'Fertilizers',
    stock: 200,
    unit: 'packet',
    moq: 10,
    origin: 'Anand, Gujarat',
  },
  {
    name: 'Durable Gardening Gloves',
    description: 'Protect your hands with these durable, all-weather gardening gloves. Provides excellent grip and comfort for long hours in the field.',
    price: 450,
    imageUrl: placeholderImages.find(img => img.id === 'product-5')?.imageUrl || "https://picsum.photos/seed/gloves/400/300",
    category: 'Tools & Equipment',
    stock: 50,
    unit: 'piece',
    moq: 2,
    origin: 'Ludhiana, Punjab',
  },
];


export function seedDemoProducts(
  firestore: Firestore
) {
  const productsCollection = collection(firestore, 'products');

  demoProducts.forEach(product => {
      const newProduct = {
        ...product,
        uid: 'firebase', // Generic user for demo data
        sellerName: 'Farmingo Demo',
        sellerPhotoURL: '',
        sellerRole: 'admin',
        createdAt: serverTimestamp(),
        rating: 4.5 + Math.random(),
        reviewCount: Math.floor(Math.random() * 50) + 5,
      };
      
      addDoc(productsCollection, newProduct).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: productsCollection.path,
          operation: 'create',
          requestResourceData: newProduct,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
  })
}


export async function createProduct(
  firestore: Firestore,
  user: User,
  productData: Omit<ProductData, 'uid'|'sellerName'|'sellerPhotoURL'>,
) {
  const userDocRef = doc(firestore, 'users', user.uid);
  const userDoc = await getDoc(userDocRef);
  const userData = userDoc.data() as UserProfile;
  const username = userData?.username || user.displayName || 'Anonymous';

  const newProduct = {
    ...productData,
    uid: user.uid,
    sellerName: username,
    sellerPhotoURL: userData?.photoURL || user.photoURL || '',
    sellerRole: userData?.role || 'user',
    createdAt: serverTimestamp(),
    rating: 0,
    reviewCount: 0,
  };

  const productsCollection = collection(firestore, 'products');
  try {
    await addDoc(productsCollection, newProduct);
  } catch (serverError: any) {
    const permissionError = new FirestorePermissionError({
      path: productsCollection.path,
      operation: 'create',
      requestResourceData: newProduct,
    });
    errorEmitter.emit('permission-error', permissionError);
    throw serverError;
  }
}

export async function updateProduct(firestore: Firestore, productId: string, productData: ProductData) {
    const productRef = doc(firestore, 'products', productId);
    const updateData = {
        ...productData,
        updatedAt: serverTimestamp(),
    };
    try {
        await updateDoc(productRef, updateData);
    } catch (serverError: any) {
        const permissionError = new FirestorePermissionError({
            path: productRef.path,
            operation: 'update',
            requestResourceData: updateData,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
    }
}

export async function deleteProduct(firestore: Firestore, productId: string) {
    const productRef = doc(firestore, 'products', productId);
    try {
        await deleteDoc(productRef);
    } catch (serverError: any) {
        const permissionError = new FirestorePermissionError({
            path: productRef.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
    }
}

export async function submitProductReview(
  firestore: Firestore,
  user: User,
  productId: string,
  rating: number,
  comment: string
) {
  const reviewRef = doc(firestore, 'products', productId, 'reviews', user.uid);
  const productRef = doc(firestore, 'products', productId);

  let exists = false;
  try {
    await runTransaction(firestore, async (transaction) => {
      // 1. Fetch the review document to check if it exists
      const reviewDoc = await transaction.get(reviewRef);
      exists = reviewDoc.exists();

      // 2. Fetch the product document to get current rating and reviewCount
      const productDoc = await transaction.get(productRef);
      if (!productDoc.exists()) {
        throw new Error('Product not found.');
      }

      const productData = productDoc.data();
      const currentRating = productData.rating || 0;
      const currentReviewCount = productData.reviewCount || 0;

      let newRating = currentRating;
      let newReviewCount = currentReviewCount;

      if (exists) {
        // Edit/Update case
        const oldReviewData = reviewDoc.data();
        const oldRating = oldReviewData?.rating || 0;
        
        if (currentReviewCount > 0) {
          newRating = (currentRating * currentReviewCount - oldRating + rating) / currentReviewCount;
        } else {
          newRating = rating;
          newReviewCount = 1;
        }
      } else {
        // Create/New case
        newReviewCount = currentReviewCount + 1;
        newRating = (currentRating * currentReviewCount + rating) / newReviewCount;
      }

      // 3. Create/Update the review document
      const reviewData = {
        id: user.uid,
        uid: user.uid,
        username: user.displayName || 'Anonymous',
        userPhotoURL: user.photoURL || '',
        rating,
        comment,
        createdAt: serverTimestamp(),
      };

      transaction.set(reviewRef, reviewData);

      // 4. Update the product's average rating and reviewCount
      transaction.update(productRef, {
        rating: newRating,
        reviewCount: newReviewCount,
      });
    });
  } catch (serverError: any) {
    if (serverError.code === 'permission-denied') {
      const permissionError = new FirestorePermissionError({
        path: reviewRef.path,
        operation: exists ? 'update' : 'create',
      });
      errorEmitter.emit('permission-error', permissionError);
    }
    throw serverError;
  }
}

