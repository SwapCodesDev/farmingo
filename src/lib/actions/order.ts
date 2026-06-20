'use client';
import type { Product } from '@/types';
import {
    addDoc,
    collection,
    doc,
    Firestore,
    serverTimestamp,
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
    paymentMethod: 'cod' | 'upi' | 'card',
    idempotencyKey?: string | null
): Promise<string> {
    const ordersCollection = collection(firestore, 'orders');

    // Idempotency check: check if an order with this idempotency key already exists for this user
    if (idempotencyKey) {
        try {
            const q = query(
                ordersCollection,
                where('idempotencyKey', '==', idempotencyKey),
                where('uid', '==', user.uid)
            );
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const existingOrder = querySnapshot.docs[0].data();
                if (process.env.NODE_ENV === 'development') {
                    console.log('Duplicate submission detected. Returning existing orderId:', existingOrder.trackingId);
                }
                return existingOrder.trackingId as string;
            }
        } catch (err) {
            console.error('Error checking idempotency key:', err);
            // Fall back to creating a new order if query fails
        }
    }

    const orderId = `FMG-${Math.floor(1000000 + Math.random() * 9000000)}`;
    const estDeliveryDate = new Date();
    estDeliveryDate.setDate(estDeliveryDate.getDate() + 5);

    const initialStatus = paymentMethod === 'cod' ? 'Pending' : 'Confirmed';
    
    const newOrder = {
        uid: user.uid,
        idempotencyKey: idempotencyKey || null,
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

    try {
        await addDoc(ordersCollection, newOrder);
        return orderId;
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
