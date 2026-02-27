'use client';
import { useMemo } from 'react';
import { useFirestore, useUser, useCollection } from '@/firebase';
import { collection, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Loader2, Package, PackageCheck, PackageX, ShoppingBag } from 'lucide-react';
import type { Product } from '@/components/features/marketplace-client';
import { formatTimestamp } from '@/lib/utils';

type OrderItem = Product & { quantity: number };

type Order = {
    id: string;
    items: OrderItem[];
    total: number;
    createdAt: Timestamp;
    status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
}

const statusConfig = {
    Pending: { icon: Package, color: 'bg-yellow-500' },
    Shipped: { icon: Package, color: 'bg-blue-500' },
    Delivered: { icon: PackageCheck, color: 'bg-green-500' },
    Cancelled: { icon: PackageX, color: 'bg-red-500' },
}

export default function MyOrdersPage() {
    const { user, loading: userLoading } = useUser();
    const firestore = useFirestore();

    const ordersQuery = useMemo(() => {
        if (!firestore || !user) return null;
        return query(
            collection(firestore, 'orders'),
            where('uid', '==', user.uid),
            orderBy('createdAt', 'desc')
        );
    }, [firestore, user]);

    const { data: orders, loading: ordersLoading } = useCollection<Order>(ordersQuery);
    
    const loading = userLoading || ordersLoading;

    if (loading) {
        return (
            <div className="flex justify-center items-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!user) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Access Denied</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>You must be logged in to view your orders.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">My Orders</h3>
                <p className="text-sm text-muted-foreground">
                    View your order history and track the status of your purchases.
                </p>
            </div>
            <Separator />
            {orders && orders.length > 0 ? (
                <div className="space-y-4">
                    {orders.map(order => {
                        const StatusIcon = statusConfig[order.status].icon;
                        const statusColor = statusConfig[order.status].color;
                        return (
                        <Card key={order.id}>
                            <CardHeader className="flex flex-row justify-between items-start">
                                <div>
                                    <CardTitle className="text-base font-medium">Order #{order.id.slice(0, 8).toUpperCase()}</CardTitle>
                                    <CardDescription>
                                        Placed on {formatTimestamp(order.createdAt, { format: 'full', addSuffix: false })}
                                    </CardDescription>
                                </div>
                                <div className="text-right">
                                    <Badge variant="secondary" className="flex items-center gap-2">
                                        <div className={`h-2 w-2 rounded-full ${statusColor}`} />
                                        {order.status}
                                    </Badge>
                                    <p className="text-lg font-bold">₹{order.total.toFixed(2)}</p>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {order.items.map(item => (
                                     <div key={item.id} className="flex items-center gap-4">
                                        <Image src={item.imageUrl} alt={item.name} width={64} height={64} className="rounded-md object-cover border" />
                                        <div className="flex-grow">
                                            <h4 className="font-semibold">{item.name}</h4>
                                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )})}
                </div>
            ) : (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mt-4">No Orders Yet</h3>
                    <p className="text-muted-foreground mt-2">You haven't placed any orders.</p>
                </div>
            )}
        </div>
    );
}
