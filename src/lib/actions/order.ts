'use client';
import type { Product } from '@/types';
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

    const orderId = `FMG-${Math.floor(1000000 + Math.random() * 9000000)}`;
    const estDeliveryDate = new Date();
    estDeliveryDate.setDate(estDeliveryDate.getDate() + 5);

    const initialStatus = paymentMethod === 'cod' ? 'Pending' : 'Confirmed';
    
    const newOrder = {
        uid: user.uid,
        items: cart,
        total,
        shippingAddress,
        paymentMethod,
        status: initialStatus,
        createdAt: serverTimestamp(),
        trackingId: orderId,
        carrier: 'AgriExpress Logistics',
        estimatedDelivery: estDeliveryDate,
        statusHistory: [
            {
                status: initialStatus,
                title: paymentMethod === 'cod' ? 'Order Placed' : 'Order Confirmed',
                description: paymentMethod === 'cod' 
                    ? 'Your Cash on Delivery order has been placed and is awaiting vendor confirmation.'
                    : 'Payment successful. Your order has been confirmed and is being processed.',
                timestamp: new Date(),
            }
        ]
    };

    const ordersCollection = collection(firestore, 'orders');
    
    try {
        await addDoc(ordersCollection, newOrder);
    } catch (serverError: any) {
        const permissionError = new FirestorePermissionError({
            path: ordersCollection.path,
            operation: 'create',
            requestResourceData: newOrder,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
    }
}
