
'use client';

import { useCart } from '@/context/cart-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, ShoppingCart, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { Separator } from '@/components/ui/separator';
import { useTranslations } from 'next-intl';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity } = useCart();
  const t = useTranslations('Cart');
  const commonT = useTranslations('Common');

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = subtotal * 0.05; // 5% tax
  const total = subtotal + tax;

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-20rem)] text-center">
        <ShoppingCart className="h-24 w-24 text-muted-foreground/50" />
        <h1 className="mt-8 text-3xl font-bold font-headline">{t('empty')}</h1>
        <p className="mt-2 text-muted-foreground">{t('empty-desc')}</p>
        <Button asChild className="mt-6 shadow-sm">
          <Link href="/marketplace">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('start-shopping')}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
        <div className="space-y-2 mb-8">
            <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">{t('title')}</h1>
            <p className="text-muted-foreground">{t('review-items')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('cart-items-count', { count: cart.length })}</CardTitle>
                    </CardHeader>
                    <CardContent className="divide-y">
                        {cart.map(item => (
                            <div key={item.id} className="flex items-center gap-4 py-4">
                                <div className="relative h-20 w-20 flex-shrink-0">
                                    <Image src={item.imageUrl} alt={item.name} fill className="rounded-md object-cover border" />
                                </div>
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
                 <Card className="sticky top-20 shadow-md">
                    <CardHeader>
                        <CardTitle>{t('summary')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between">
                            <p className="text-muted-foreground">{t('subtotal')}</p>
                            <p>₹{subtotal.toFixed(2)}</p>
                        </div>
                         <div className="flex justify-between">
                            <p className="text-muted-foreground">{t('taxes')}</p>
                            <p>₹{tax.toFixed(2)}</p>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                            <p>{t('total')}</p>
                            <p>₹{total.toFixed(2)}</p>
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col gap-2">
                        <Button asChild className="w-full shadow-sm">
                            <Link href="/checkout">
                                {t('checkout')}
                            </Link>
                        </Button>
                        <Button variant="outline" className="w-full bg-background" asChild>
                            <Link href="/marketplace">
                                {t('continue-shopping')}
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    </div>
  );
}
