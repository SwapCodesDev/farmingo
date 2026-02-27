'use client';
import {
    addDoc,
    collection,
    doc,
    Firestore,
    serverTimestamp,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import {
    FirestorePermissionError,
    type SecurityRuleContext,
} from '@/firebase/errors';
import type { User } from 'firebase/auth';
import type { Product } from '@/components/features/marketplace-client';

type CartItem = Product & { quantity: number };

type ShippingAddress = {
    name: string;
    address1: string;
    city: string;
    state: string;
    pincode: string;
}

export async function createOrder(
    firestore: Firestore,
    user: User,
    cart: CartItem[],
    total: number,
    shippingAddress: ShippingAddress,
    paymentMethod: 'cod' | 'upi' | 'card'
) {

    const newOrder = {
        uid: user.uid,
        items: cart,
        total,
        shippingAddress,
        paymentMethod,
        status: 'Pending',
        createdAt: serverTimestamp(),
    };

    const ordersCollection = collection(firestore, 'orders');
    
    addDoc(ordersCollection, newOrder).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
        path: ordersCollection.path,
        operation: 'create',
        requestResourceData: newOrder,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
    });
}
