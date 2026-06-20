'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useRouter, Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { MapPinOff, ArrowLeft, Home } from 'lucide-react';

export default function LocaleNotFound() {
  const t = useTranslations('NotFound');
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] w-full p-4 md:p-8 text-center bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="max-w-md w-full bg-card/50 dark:bg-card/25 border border-emerald-500/10 dark:border-emerald-500/5 rounded-3xl p-6 md:p-8 shadow-lg relative z-10"
      >
        {/* Animated Badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 100 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold tracking-wide uppercase mb-6"
        >
          <MapPinOff className="w-3.5 h-3.5" />
          <span>{t('title')}</span>
        </motion.div>

        {/* Custom Animated Graphic */}
        <div className="mb-6 relative h-40 flex items-center justify-center">
          <svg
            viewBox="0 0 200 200"
            className="w-40 h-40 mx-auto"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Ground Shadow */}
            <ellipse cx="100" cy="165" rx="60" ry="8" className="fill-slate-900/10 dark:fill-slate-100/5" />
            
            {/* Soil / Grass Base */}
            <motion.path
              d="M 40 160 Q 100 154 160 160"
              className="stroke-emerald-600/30 dark:stroke-emerald-500/20 stroke-[3]"
              strokeLinecap="round"
            />
            <motion.path
              d="M 55 168 Q 100 164 145 168"
              className="stroke-emerald-600/20 dark:stroke-emerald-500/10 stroke-[2]"
              strokeLinecap="round"
            />

            {/* Floating Lost Map Pin */}
            <motion.g
              animate={{
                y: [0, -8, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {/* Glow Behind Pin */}
              <circle cx="100" cy="85" r="26" className="fill-amber-500/10 dark:fill-amber-500/5" />

              {/* Pin Shape */}
              <path
                d="M 100 135 C 75 102, 70 85, 100 54 C 130 85, 125 102, 100 135 Z"
                className="fill-amber-500 stroke-amber-600 dark:stroke-amber-400 stroke-2"
                strokeLinejoin="round"
              />

              {/* Inner Circle */}
              <circle cx="100" cy="85" r="12" className="fill-card" />

              {/* Broken Pin Cross Line */}
              <motion.line
                x1="95"
                y1="90"
                x2="105"
                y2="80"
                className="stroke-amber-600 dark:stroke-amber-400 stroke-[2.5]"
                strokeLinecap="round"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
            </motion.g>

            {/* Little sprouting leaf on the left */}
            <motion.g
              initial={{ scale: 0.8 }}
              animate={{ scale: [0.95, 1.05, 0.95] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <path d="M 65 160 Q 70 144 76 141" className="stroke-emerald-500 stroke-[2.5]" fill="none" strokeLinecap="round" />
              <path d="M 76 141 Q 83 136 81 143 Q 74 147 76 141" className="fill-emerald-500" />
            </motion.g>

            {/* Sprouting leaf on the right */}
            <motion.g
              initial={{ scale: 0.8 }}
              animate={{ scale: [1.02, 0.98, 1.02] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            >
              <path d="M 135 160 Q 131 146 124 142" className="stroke-emerald-500 stroke-[2.5]" fill="none" strokeLinecap="round" />
              <path d="M 124 142 Q 118 138 120 144 Q 125 147 124 142" className="fill-emerald-400" />
            </motion.g>

            {/* Clouds drifting */}
            <motion.g
              animate={{
                x: [-4, 4, -4],
              }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="opacity-30 dark:opacity-10"
            >
              <path
                d="M 45 55 A 6 6 0 0 1 54 51 A 9 9 0 0 1 69 54 A 6 6 0 0 1 75 60 L 40 60 Z"
                className="fill-slate-400 dark:fill-slate-600"
              />
            </motion.g>
          </svg>
        </div>

        {/* Text Details */}
        <h1 className="text-2xl font-bold text-foreground tracking-tight mb-2">
          {t('title')}
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-xs mx-auto">
          {t('description')}
        </p>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2 border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 py-5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('go-back')}</span>
          </Button>

          <Button
            asChild
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/10 dark:bg-emerald-500 dark:hover:bg-emerald-600 py-5"
          >
            <Link href="/dashboard" className="flex items-center justify-center gap-2">
              <Home className="w-4 h-4" />
              <span>{t('go-to-dashboard')}</span>
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
