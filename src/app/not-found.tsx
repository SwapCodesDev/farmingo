'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { MapPinOff, ArrowLeft, Home } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-emerald-50/50 via-background to-amber-50/30 dark:from-emerald-950/10 dark:to-amber-950/5 p-6 text-center">
      {/* Background Decorative Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 dark:bg-emerald-500/3 blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-amber-500/5 dark:bg-amber-500/3 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="max-w-md w-full bg-card/40 dark:bg-card/20 backdrop-blur-md border border-emerald-500/10 dark:border-emerald-500/5 rounded-3xl p-8 shadow-xl relative z-10"
      >
        {/* Animated Badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold tracking-wide uppercase mb-6"
        >
          <MapPinOff className="w-3.5 h-3.5" />
          <span>Lost in the fields</span>
        </motion.div>

        {/* Custom Animated Graphic */}
        <div className="mb-6 relative h-48 flex items-center justify-center">
          <svg
            viewBox="0 0 200 200"
            className="w-48 h-48 mx-auto"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Ground Shadow */}
            <ellipse cx="100" cy="165" rx="70" ry="10" className="fill-slate-900/10 dark:fill-slate-100/5" />
            
            {/* Soil / Grass Base */}
            <motion.path
              d="M 30 160 Q 100 152 170 160"
              className="stroke-emerald-600/30 dark:stroke-emerald-500/20 stroke-[3]"
              strokeLinecap="round"
            />
            <motion.path
              d="M 45 168 Q 100 163 155 168"
              className="stroke-emerald-600/20 dark:stroke-emerald-500/10 stroke-[2]"
              strokeLinecap="round"
            />

            {/* Floating Lost Map Pin */}
            <motion.g
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {/* Glow Behind Pin */}
              <circle cx="100" cy="85" r="30" className="fill-amber-500/10 dark:fill-amber-500/5" />

              {/* Pin Shape */}
              <path
                d="M 100 135 C 70 100, 65 80, 100 48 C 135 80, 130 100, 100 135 Z"
                className="fill-amber-500 stroke-amber-600 dark:stroke-amber-400 stroke-2"
                strokeLinejoin="round"
              />

              {/* Inner Circle */}
              <circle cx="100" cy="83" r="14" className="fill-card" />

              {/* Broken Pin Cross Line */}
              <motion.line
                x1="94"
                y1="89"
                x2="106"
                y2="77"
                className="stroke-amber-600 dark:stroke-amber-400 stroke-[3]"
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
              <path d="M 60 160 Q 65 142 72 138" className="stroke-emerald-500 stroke-[3]" fill="none" strokeLinecap="round" />
              <path d="M 72 138 Q 80 132 78 140 Q 70 145 72 138" className="fill-emerald-500" />
            </motion.g>

            {/* Sprouting leaf on the right */}
            <motion.g
              initial={{ scale: 0.8 }}
              animate={{ scale: [1.02, 0.98, 1.02] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            >
              <path d="M 140 160 Q 135 144 127 140" className="stroke-emerald-500 stroke-[3]" fill="none" strokeLinecap="round" />
              <path d="M 127 140 Q 120 136 122 143 Q 128 146 127 140" className="fill-emerald-400" />
            </motion.g>

            {/* Clouds drifting */}
            <motion.g
              animate={{
                x: [-6, 6, -6],
              }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="opacity-30 dark:opacity-10"
            >
              <path
                d="M 35 55 A 8 8 0 0 1 47 50 A 12 12 0 0 1 67 54 A 8 8 0 0 1 75 62 L 30 62 Z"
                className="fill-slate-400 dark:fill-slate-600"
              />
            </motion.g>
          </svg>
        </div>

        {/* Text Details */}
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-3">
          404 - Page Not Found
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-sm mx-auto">
          Oops! The page you are looking for has wandered off the field or never existed. Let's get you back on track.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2 border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 py-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </Button>

          <Button
            asChild
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/10 dark:bg-emerald-500 dark:hover:bg-emerald-600 py-6"
          >
            <Link href="/dashboard" className="flex items-center justify-center gap-2">
              <Home className="w-4 h-4" />
              <span>Go to Dashboard</span>
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
