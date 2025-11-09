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
};

const demoProducts: Omit<ProductData, 'uid' | 'sellerName' | 'sellerPhotoURL'>[] = [
  {
    name: 'Fresh Organic Tomatoes',
    description: 'Plump, juicy, and bursting with flavor. Straight from our farm to your table. Perfect for salads, sauces, or just eating raw!',
    price: 250,
    imageUrl: placeholderImages.find(img => img.id === 'product-1')?.imageUrl || "https://picsum.photos/seed/tomato/400/300",
  },
  {
    name: 'Crisp Lettuce Heads',
    description: 'Crisp and refreshing green lettuce. Grown using sustainable methods to ensure the highest quality and taste.',
    price: 120,
    imageUrl: placeholderImages.find(img => img.id === 'product-2')?.imageUrl || "https://picsum.photos/seed/lettuce/400/300",
  },
  {
    name: 'Handmade Wooden Crate',
    description: 'A sturdy and rustic handmade wooden crate. Ideal for harvesting, storage, or as a decorative piece for your farmhouse.',
    price: 800,
    imageUrl: placeholderImages.find(img => img.id === 'product-3')?.imageUrl || "https://picsum.photos/seed/crate/400/300",
  },
  {
    name: 'Organic Fertilizer (20kg)',
    description: 'Enrich your soil with our premium organic fertilizer. Packed with nutrients to help your crops thrive.',
    price: 1500,
    imageUrl: placeholderImages.find(img => img.id === 'product-4')?.imageUrl || "https://picsum.photos/seed/fertilizer/400/300",
  },
  {
    name: 'Durable Gardening Gloves',
    description: 'Protect your hands with these durable, all-weather gardening gloves. Provides excellent grip and comfort for long hours in the field.',
    price: 450,
    imageUrl: placeholderImages.find(img => img.id === 'product-5')?.imageUrl || "https://picsum.photos/seed/gloves/400/300",
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
    sellerPhotoURL: user.photoURL || '',
    sellerRole: userData?.role || 'user',
    createdAt: serverTimestamp(),
    rating: 0,
    reviewCount: 0,
  };

  const productsCollection = collection(firestore, 'products');
  addDoc(productsCollection, newProduct).catch(async (serverError) => {
    const permissionError = new FirestorePermissionError({
      path: productsCollection.path,
      operation: 'create',
      requestResourceData: newProduct,
    });
    errorEmitter.emit('permission-error', permissionError);
    throw serverError;
  });
}

export async function updateProduct(firestore: Firestore, productId: string, productData: ProductData) {
    const productRef = doc(firestore, 'products', productId);
    const updateData = {
        ...productData,
        updatedAt: serverTimestamp(),
    };
    updateDoc(productRef, updateData)
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: productRef.path,
                operation: 'update',
                requestResourceData: updateData,
            });
            errorEmitter.emit('permission-error', permissionError);
            throw serverError;
        });
}

export async function deleteProduct(firestore: Firestore, productId: string) {
    const productRef = doc(firestore, 'products', productId);
    deleteDoc(productRef)
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: productRef.path,
                operation: 'delete',
            });
            errorEmitter.emit('permission-error', permissionError);
            throw serverError;
        });
}
