'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface SectionErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  messageKey: string;
}

export function SectionError({ error, reset, messageKey }: SectionErrorProps) {
  const t = useTranslations('Error');

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.error(`Captured by boundary [${messageKey}]:`, error);
    }
  }, [error, messageKey]);

  const isDev = process.env.NODE_ENV === 'development';

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full p-4 text-center bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full bg-card border border-destructive/20 rounded-3xl p-6 md:p-8 shadow-lg shadow-destructive/5 relative z-10"
      >
        {/* Animated Warning Icon */}
        <motion.div
          animate={{
            scale: [1, 1.03, 1],
            rotate: [0, 1.5, -1.5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="mx-auto w-14 h-14 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-6"
        >
          <AlertTriangle className="w-7 h-7" />
        </motion.div>

        {/* Text Details */}
        <h1 className="text-xl font-bold text-foreground tracking-tight mb-2">
          {t('title')}
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-6">
          {t(messageKey)}
        </p>

        {/* Development Error Details */}
        {isDev && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/5 border border-destructive/10 text-left overflow-auto max-h-40 font-mono text-xs text-destructive">
            <p className="font-semibold mb-1">Dev Debug Info:</p>
            <p className="whitespace-pre-wrap">{error.message || 'No error message available'}</p>
            {error.stack && <p className="mt-2 text-[10px] opacity-70">{error.stack}</p>}
          </div>
        )}

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 py-5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t('try-again')}</span>
          </Button>

          {messageKey !== 'dashboard-failed' && (
            <Button
              asChild
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/10 dark:bg-emerald-500 dark:hover:bg-emerald-600 py-5"
            >
              <Link href="/dashboard" className="flex items-center justify-center gap-2">
                <Home className="w-4 h-4" />
                <span>{t('go-to-dashboard')}</span>
              </Link>
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
