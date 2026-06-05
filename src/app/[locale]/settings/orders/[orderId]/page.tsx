'use client';

import React, { use, useState } from 'react';
import { useDoc, useFirestore, useUser } from '@/firebase';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { 
  Loader2, 
  ArrowLeft, 
  FileText, 
  CheckCircle2, 
  Truck, 
  Navigation, 
  PackageCheck,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Terminal,
  Calendar,
  MapPin,
  Clock
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import { formatTimestamp } from '@/lib/utils';

type OrderHistoryItem = {
  status: string;
  title: string;
  description: string;
  timestamp: any;
}

type OrderDetail = {
  id: string;
  uid: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string;
    unit?: string;
  }>;
  total: number;
  paymentMethod: 'cod' | 'upi' | 'card';
  status: 'Pending' | 'Confirmed' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  createdAt: any;
  trackingId: string;
  carrier: string;
  estimatedDelivery: any;
  statusHistory: OrderHistoryItem[];
  shippingAddress: {
    name: string;
    address1: string;
    city: string;
    state: string;
    pincode: string;
  };
}

interface PageProps {
  params: Promise<{ orderId: string }>;
}

export default function OrderTrackingPage({ params }: PageProps) {
  const { orderId } = use(params);
  const { user } = useUser();
  const firestore = useFirestore();
  const [showConsole, setShowConsole] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const orderDocRef = firestore ? doc(firestore, 'orders', orderId) : null;
  const { data: order, loading, error } = useDoc<OrderDetail>(orderDocRef);

  const getStepIndex = (status: string) => {
    if (status === 'Pending') return 0;
    if (status === 'Confirmed') return 1;
    if (status === 'Shipped') return 2;
    if (status === 'Out for Delivery') return 3;
    if (status === 'Delivered') return 4;
    return -1; // Cancelled
  };

  const formatTime = (ts: any) => {
    if (!ts) return '';
    if (ts.toDate) {
      return ts.toDate().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    }
    if (ts instanceof Date) {
      return ts.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    }
    return new Date(ts).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  };

  const formatDateOnly = (ts: any) => {
    if (!ts) return '';
    let d: Date;
    if (ts.toDate) {
      d = ts.toDate();
    } else if (ts instanceof Date) {
      d = ts;
    } else {
      d = new Date(ts);
    }
    return d.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const advanceStatus = async () => {
    if (!firestore || !order) return;
    setIsUpdating(true);
    try {
      const currentIndex = getStepIndex(order.status);
      if (currentIndex >= 4 || currentIndex === -1) return;

      const nextStatuses = ['Confirmed', 'Shipped', 'Out for Delivery', 'Delivered'];
      const nextStatus = nextStatuses[currentIndex] as OrderDetail['status'];

      const descriptions: Record<string, { title: string; desc: string }> = {
        Confirmed: {
          title: 'Order Confirmed',
          desc: 'The seller has confirmed your order and is preparing the package.',
        },
        Shipped: {
          title: 'Shipped & In Transit',
          desc: `Handed over to carrier ${order.carrier || 'AgriExpress Logistics'}. Tracking ID: ${order.trackingId}.`,
        },
        'Out for Delivery': {
          title: 'Out for Delivery',
          desc: 'Our delivery partner is out with your package and will arrive today.',
        },
        Delivered: {
          title: 'Delivered',
          desc: 'Package delivered successfully. Thank you for shopping with Farmingo!',
        }
      };

      const serializedHistory = order.statusHistory.map(item => ({
        ...item,
        timestamp: item.timestamp.toDate ? item.timestamp.toDate().toISOString() : new Date(item.timestamp).toISOString()
      }));

      const newHistory = [
        ...serializedHistory,
        {
          status: nextStatus,
          title: descriptions[nextStatus].title,
          description: descriptions[nextStatus].desc,
          timestamp: new Date().toISOString()
        }
      ];

      const docRef = doc(firestore, 'orders', order.id);
      await updateDoc(docRef, {
        status: nextStatus,
        statusHistory: newHistory
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  };

  const cancelOrder = async () => {
    if (!firestore || !order) return;
    setIsUpdating(true);
    try {
      const serializedHistory = order.statusHistory.map(item => ({
        ...item,
        timestamp: item.timestamp.toDate ? item.timestamp.toDate().toISOString() : new Date(item.timestamp).toISOString()
      }));

      const newHistory = [
        ...serializedHistory,
        {
          status: 'Cancelled',
          title: 'Order Cancelled',
          description: 'This order has been cancelled by the customer.',
          timestamp: new Date().toISOString()
        }
      ];

      const docRef = doc(firestore, 'orders', order.id);
      await updateDoc(docRef, {
        status: 'Cancelled',
        statusHistory: newHistory
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  };

  const resetOrder = async () => {
    if (!firestore || !order) return;
    setIsUpdating(true);
    try {
      const initialStatus = order.paymentMethod === 'cod' ? 'Pending' : 'Confirmed';
      const initialHistory = [
        {
          status: initialStatus,
          title: order.paymentMethod === 'cod' ? 'Order Placed' : 'Order Confirmed',
          description: order.paymentMethod === 'cod' 
              ? 'Your Cash on Delivery order has been placed and is awaiting vendor confirmation.'
              : 'Payment successful. Your order has been confirmed and is being processed.',
          timestamp: new Date().toISOString()
        }
      ];

      const docRef = doc(firestore, 'orders', order.id);
      await updateDoc(docRef, {
        status: initialStatus,
        statusHistory: initialHistory
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[400px] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Retrieving shipment logs...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <Card className="text-center p-8 border-destructive/20 shadow-md">
          <CardHeader>
            <XCircle className="h-16 w-16 text-destructive mx-auto" />
            <CardTitle className="mt-4">Order Not Found</CardTitle>
            <CardDescription>
              We couldn't retrieve the details for order ID: {orderId}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Please double check the ID or go back to your orders history.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button asChild>
              <Link href="/settings/orders">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Orders
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (user && order.uid !== user.uid) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <Card className="text-center p-8 border-destructive/20 shadow-md">
          <CardHeader>
            <AlertTriangle className="h-16 w-16 text-destructive mx-auto" />
            <CardTitle className="mt-4">Access Denied</CardTitle>
            <CardDescription>
              You do not have permission to track this order.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button asChild>
              <Link href="/settings/orders">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Orders
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const currentStep = getStepIndex(order.status);
  const isCancelled = order.status === 'Cancelled';

  const steps = [
    { label: 'Placed', icon: FileText, desc: 'Placed' },
    { label: 'Confirmed', icon: CheckCircle2, desc: 'Accepted' },
    { label: 'Shipped', icon: Truck, desc: 'In Transit' },
    { label: 'Out for Delivery', icon: Navigation, desc: 'Out' },
    { label: 'Delivered', icon: PackageCheck, desc: 'Arrived' }
  ];

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      <Link href="/settings/orders" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Orders
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-headline text-2xl md:text-3xl font-bold tracking-tight">Order Details</h1>
            <Badge variant={isCancelled ? 'destructive' : order.status === 'Delivered' ? 'default' : 'secondary'} className="font-medium">
              {order.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">ID: <span className="font-mono text-foreground font-semibold">{order.id}</span></p>
        </div>
        {!isCancelled && order.status !== 'Delivered' && (
          <div className="flex items-center gap-2 text-sm bg-accent/40 border border-accent rounded-lg p-3">
            <Calendar className="h-4 w-4 text-primary" />
            <div>
              <span className="text-muted-foreground block text-xs">Estimated Delivery</span>
              <span className="font-semibold text-foreground">{formatDateOnly(order.estimatedDelivery)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stepper Card */}
        <Card className="md:col-span-3 overflow-hidden shadow-sm">
          <CardHeader className="bg-muted/40 pb-4">
            <CardTitle className="text-base font-medium">Delivery Timeline</CardTitle>
          </CardHeader>
          <CardContent className="pt-8 pb-10">
            {isCancelled ? (
              <div className="flex flex-col items-center justify-center py-6 text-center text-destructive">
                <XCircle className="h-12 w-12 animate-in zoom-in" />
                <h3 className="font-semibold text-lg mt-3">This order has been cancelled</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-md">
                  We have registered your cancellation request. If a payment was made, your refund is being processed to your original payment method.
                </p>
              </div>
            ) : (
              <div className="relative flex justify-between items-center w-full max-w-3xl mx-auto px-4">
                {/* Stepper Line Background */}
                <div className="absolute left-8 right-8 top-1/2 h-1 bg-muted -translate-y-1/2 z-0" />
                
                {/* Stepper Line Fill */}
                <div 
                  className="absolute left-8 top-1/2 h-1 bg-primary -translate-y-1/2 z-0 transition-all duration-500 ease-in-out"
                  style={{ 
                    right: `calc(100% - 16px - ${(currentStep / 4) * 100}% - 8px)`
                  }}
                />

                {/* Steps */}
                {steps.map((step, idx) => {
                  const StepIcon = step.icon;
                  const isCompleted = idx < currentStep;
                  const isActive = idx === currentStep;
                  const isFuture = idx > currentStep;

                  return (
                    <div key={idx} className="relative flex flex-col items-center z-10">
                      <div 
                        className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                          isCompleted 
                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-emerald-200/50 shadow-md' 
                            : isActive 
                            ? 'bg-background border-primary text-primary shadow-primary-200 shadow-lg ring-4 ring-primary/20 scale-110' 
                            : 'bg-background border-muted text-muted-foreground'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <StepIcon className="h-5 w-5" />
                        )}
                      </div>
                      <span className={`text-xs font-semibold mt-3 ${isActive ? 'text-primary font-bold' : isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Left Columns - Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Order Summary & Address */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-medium">Items & Shipping</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="divide-y">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                    <div className="relative h-14 w-14 flex-shrink-0">
                      <Image src={item.imageUrl} alt={item.name} fill className="rounded-md object-cover border" />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-semibold text-sm">{item.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        Qty: {item.quantity} {item.unit || 'kg'} @ ₹{item.price.toFixed(2)} / {item.unit || 'kg'}
                      </p>
                    </div>
                    <p className="font-medium text-sm">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <h5 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider mb-2">Shipping Address</h5>
                  <div className="space-y-1 text-foreground">
                    <p className="font-medium">{order.shippingAddress.name}</p>
                    <p>{order.shippingAddress.address1}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                  </div>
                </div>

                <div>
                  <h5 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider mb-2">Payment Details</h5>
                  <div className="space-y-1">
                    <p className="capitalize">Method: <span className="font-medium">{order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : order.paymentMethod.toUpperCase()}</span></p>
                    <p className="font-bold text-lg text-primary mt-1">Total Paid: ₹{order.total.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Shipment Milestones Log */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-medium">Activity Logs</CardTitle>
              <CardDescription>Real-time status updates and transit notes</CardDescription>
            </CardHeader>
            <CardContent className="pb-8">
              <div className="relative border-l-2 border-muted pl-6 ml-4 space-y-6 pt-2">
                {order.statusHistory.slice().reverse().map((log, idx) => (
                  <div key={idx} className="relative">
                    {/* Bullet marker */}
                    <div className={`absolute -left-[31px] top-1.5 w-4.5 h-4.5 rounded-full border-4 border-background flex items-center justify-center ${
                      idx === 0 
                        ? log.status === 'Cancelled' ? 'bg-destructive' : 'bg-primary' 
                        : 'bg-muted-foreground/50'
                    }`} />
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className={`font-semibold text-sm ${idx === 0 ? 'text-foreground font-bold text-base' : 'text-muted-foreground'}`}>
                          {log.title}
                        </h4>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(log.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 max-w-md">{log.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Columns - Logistics & Simulator */}
        <div className="space-y-6">
          {/* Carrier Details Card */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-medium">Logistics Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-3">
                <div>
                  <span className="text-muted-foreground text-xs block">Carrier Partner</span>
                  <span className="font-semibold">{order.carrier || 'AgriExpress Logistics'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs block">Tracking Reference</span>
                  <span className="font-mono font-semibold">{order.trackingId}</span>
                </div>
                {!isCancelled && (
                  <div>
                    <span className="text-muted-foreground text-xs block">Estimated Delivery</span>
                    <span className="font-semibold text-primary">{formatDateOnly(order.estimatedDelivery)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Interactive Simulation Console */}
          <Card className="border-primary/20 shadow-md">
            <CardHeader className="bg-primary/5 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Terminal className="h-4.5 w-4.5 text-primary" />
                  <span>Simulator Controls</span>
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 text-primary hover:bg-primary/10"
                  onClick={() => setShowConsole(!showConsole)}
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              <CardDescription className="text-xs">
                Simulate warehouse, carrier, and transit status transitions.
              </CardDescription>
            </CardHeader>

            {showConsole && (
              <CardContent className="pt-4 space-y-3">
                <div className="bg-accent/40 border border-accent rounded-md p-3 text-[11px] text-muted-foreground space-y-1">
                  <p className="font-semibold text-foreground">Active Status: {order.status}</p>
                  {isCancelled ? (
                    <p>Order is cancelled. Use the "Reset" action to start tracking from confirmation state.</p>
                  ) : order.status === 'Delivered' ? (
                    <p>Order is delivered. Use the "Reset" action to start simulation from scratch.</p>
                  ) : (
                    <p>Click "Advance Transit State" to step-wise update order logistics status.</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Button 
                    size="sm" 
                    className="w-full text-xs font-semibold"
                    disabled={isUpdating || isCancelled || order.status === 'Delivered'}
                    onClick={advanceStatus}
                  >
                    {isUpdating && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                    Advance Transit State
                  </Button>

                  {!isCancelled && order.status !== 'Delivered' && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full text-xs text-destructive border-destructive/20 hover:bg-destructive/5 hover:text-destructive"
                      disabled={isUpdating}
                      onClick={cancelOrder}
                    >
                      Cancel Order Shipment
                    </Button>
                  )}

                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="w-full text-xs"
                    disabled={isUpdating}
                    onClick={resetOrder}
                  >
                    Reset Status to Initial
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
