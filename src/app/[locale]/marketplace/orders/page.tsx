'use client';
import type { Product } from '@/types';

import { useMemo } from 'react';
import { useFirestore, useUser, useCollection } from '@/firebase';
import { collection, query, where, Timestamp } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Loader2, Package, PackageCheck, PackageX, ShoppingBag } from 'lucide-react';
import { Link } from '@/i18n/routing';

import { formatTimestamp } from '@/lib/utils';
import { useTranslations } from 'next-intl';

type OrderItem = Product & { quantity: number };

type Order = {
    id: string;
    items: OrderItem[];
    total: number;
    createdAt: Timestamp;
    status: 'Pending' | 'Confirmed' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
}

const statusConfig = {
    Pending: { icon: Package, color: 'bg-yellow-500' },
    Confirmed: { icon: Package, color: 'bg-green-500' },
    Shipped: { icon: Package, color: 'bg-blue-500' },
    'Out for Delivery': { icon: Package, color: 'bg-purple-500' },
    Delivered: { icon: PackageCheck, color: 'bg-emerald-500' },
    Cancelled: { icon: PackageX, color: 'bg-red-500' },
}

export default function MyOrdersPage() {
    const { user, loading: userLoading } = useUser();
    const firestore = useFirestore();
    const t = useTranslations('Settings');

    const ordersQuery = useMemo(() => {
        if (!firestore || !user) return null;
        return query(
            collection(firestore, 'orders'),
            where('uid', '==', user.uid)
        );
    }, [firestore, user]);

    const { data: orders, loading: ordersLoading, error } = useCollection<Order>(ordersQuery);
    
    const sortedOrders = useMemo(() => {
        if (!orders) return [];
        return [...orders].sort((a, b) => {
            const timeA = a.createdAt?.toDate 
                ? a.createdAt.toDate().getTime() 
                : (a.createdAt?.seconds 
                    ? a.createdAt.seconds * 1000 
                    : (a.createdAt ? new Date(a.createdAt as any).getTime() : 0));
            const timeB = b.createdAt?.toDate 
                ? b.createdAt.toDate().getTime() 
                : (b.createdAt?.seconds 
                    ? b.createdAt.seconds * 1000 
                    : (b.createdAt ? new Date(b.createdAt as any).getTime() : 0));
            return timeB - timeA;
        });
    }, [orders]);

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
        <div className="max-w-4xl mx-auto space-y-6 py-6">
            <div>
                <h3 className="text-2xl font-bold font-headline">{t('orders')}</h3>
                <p className="text-sm text-muted-foreground">
                    {t('orders-desc')}
                </p>
            </div>
            <Separator />

            {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-md">
                    Failed to fetch orders: {error.message}
                </div>
            )}

            {sortedOrders && sortedOrders.length > 0 ? (
                <div className="space-y-4">
                    {sortedOrders.map(order => {
                        const status = order.status in statusConfig ? order.status : 'Pending';
                        const StatusIcon = statusConfig[status].icon;
                        const statusColor = statusConfig[status].color;
                        return (
                        <Card key={order.id} className="shadow-sm border-muted">
                            <CardHeader className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                <div>
                                    <CardTitle className="text-base font-medium">{t('order-id', { id: order.id.slice(0, 8).toUpperCase() })}</CardTitle>
                                    <CardDescription>
                                        {t('order-placed-on', { date: formatTimestamp(order.createdAt, { format: 'full', addSuffix: false }) })}
                                    </CardDescription>
                                </div>
                                <div className="text-left sm:text-right w-full sm:w-auto">
                                    <Badge variant="secondary" className="flex items-center gap-2 w-fit sm:ml-auto">
                                        <div className={`h-2 w-2 rounded-full ${statusColor}`} />
                                        {order.status}
                                    </Badge>
                                    <p className="text-lg font-bold mt-1">₹{order.total.toFixed(2)}</p>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {order.items.map(item => (
                                     <div key={item.id} className="flex items-center gap-4">
                                        <Image src={item.imageUrl} alt={item.name} width={64} height={64} className="rounded-md object-cover border" />
                                        <div className="flex-grow">
                                            <h4 className="font-semibold">{item.name}</h4>
                                            <p className="text-sm text-muted-foreground">Qty: {item.quantity} {item.unit || 'kg'}</p>
                                        </div>
                                        <p className="font-medium text-sm">₹{(item.price * item.quantity).toFixed(2)}</p>
                                     </div>
                                ))}
                            </CardContent>
                            <CardFooter className="flex justify-end border-t pt-4">
                                <Button asChild variant="outline" size="sm">
                                    <Link href={`/marketplace/orders/${order.id}`}>
                                        Track Order
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    )})}
                </div>
            ) : (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground animate-pulse" />
                    <h3 className="text-xl font-semibold mt-4">{t('no-orders')}</h3>
                    <p className="text-muted-foreground mt-2">{t('no-orders-desc')}</p>
                </div>
            )}
        </div>
    );
}
