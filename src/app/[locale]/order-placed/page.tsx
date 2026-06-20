import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getTranslations } from 'next-intl/server';
import Celebration from './celebration';
import { ShoppingBag, ReceiptText, CalendarRange } from 'lucide-react';

export default async function OrderPlacedPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const t = await getTranslations('OrderPlaced');
  const { orderId } = await searchParams;

  const displayOrderId = orderId || `FMG-${Math.floor(1000000 + Math.random() * 9000000)}`;

  return (
    <div className="flex items-center justify-center min-h-[70vh] w-full p-4">
      <Card className="w-full max-w-md text-center shadow-xl border-emerald-500/10 dark:border-emerald-500/5 bg-card/60 backdrop-blur rounded-3xl p-6 relative overflow-hidden">
        {/* Glow corner accent */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

        <CardHeader className="pb-4">
          <Celebration />
          <CardTitle className="font-headline font-bold text-2xl tracking-tight text-foreground mt-4">
            {t('title')}
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm leading-relaxed mt-2">
            {t('subtitle')}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-2">
          {/* Order Details Panel */}
          <div className="bg-muted/40 dark:bg-muted/10 border border-muted-foreground/10 rounded-2xl p-4 text-left space-y-3">
            {/* Order ID */}
            <div className="flex justify-between items-center text-sm border-b border-muted-foreground/10 pb-2">
              <span className="text-muted-foreground flex items-center gap-2">
                <ReceiptText className="w-4 h-4 text-primary" />
                {t('order-id-label')}
              </span>
              <span className="font-mono font-bold text-foreground">{displayOrderId}</span>
            </div>

            {/* Estimated Delivery */}
            <div className="flex justify-between items-start text-sm pt-1">
              <span className="text-muted-foreground flex items-center gap-2 mt-0.5">
                <CalendarRange className="w-4 h-4 text-amber-500" />
                {t('delivery-label')}
              </span>
              <span className="font-medium text-foreground text-right max-w-[200px]">
                {t('delivery-value')}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-2">
            <Button
              asChild
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/10 dark:bg-emerald-500 dark:hover:bg-emerald-600 py-6 text-sm font-semibold rounded-xl w-full"
            >
              <Link href="/marketplace" className="flex items-center justify-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                <span>{t('continue')}</span>
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 py-6 text-sm font-semibold rounded-xl w-full"
            >
              <Link href="/settings/orders" className="flex items-center justify-center gap-2">
                <ReceiptText className="w-4 h-4" />
                <span>{t('view-orders')}</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
