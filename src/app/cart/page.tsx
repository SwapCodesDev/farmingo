
'use client';

import { useCart } from '@/context/cart-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, ShoppingCart, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = subtotal * 0.05; // 5% tax
  const total = subtotal + tax;

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-20rem)] text-center">
        <ShoppingCart className="h-24 w-24 text-muted-foreground/50" />
        <h1 className="mt-8 text-3xl font-bold font-headline">Your Cart is Empty</h1>
        <p className="mt-2 text-muted-foreground">Looks like you haven't added anything to your cart yet.</p>
        <Button asChild className="mt-6">
          <Link href="/marketplace">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Start Shopping
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
        <div className="space-y-2 mb-8">
            <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">Shopping Cart</h1>
            <p className="text-muted-foreground">Review your items before checking out.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Cart Items ({cart.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="divide-y">
                        {cart.map(item => (
                            <div key={item.id} className="flex items-center gap-4 py-4">
                                <Image src={item.imageUrl} alt={item.name} width={80} height={80} className="rounded-md object-cover border" />
                                <div className="flex-grow">
                                    <h3 className="font-semibold">{item.name}</h3>
                                    <p className="text-sm text-muted-foreground">₹{item.price.toFixed(2)}</p>
                                </div>
                                <input 
                                    type="number" 
                                    min="1" 
                                    value={item.quantity}
                                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                                    className="w-16 rounded-md border-input border p-2 text-center"
                                />
                                <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
            <div className="md:col-span-1">
                 <Card className="sticky top-20">
                    <CardHeader>
                        <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between">
                            <p className="text-muted-foreground">Subtotal</p>
                            <p>₹{subtotal.toFixed(2)}</p>
                        </div>
                         <div className="flex justify-between">
                            <p className="text-muted-foreground">Taxes (5%)</p>
                            <p>₹{tax.toFixed(2)}</p>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                            <p>Total</p>
                            <p>₹{total.toFixed(2)}</p>
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col gap-2">
                        <Button asChild className="w-full">
                            <Link href="/checkout">
                                Proceed to Checkout
                            </Link>
                        </Button>
                        <Button variant="outline" className="w-full" asChild>
                            <Link href="/marketplace">
                                Continue Shopping
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    </div>
  );
}
