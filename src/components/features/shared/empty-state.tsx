'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export interface EmptyStateProps {
  type: 'search' | 'products' | 'posts' | 'messages';
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  type,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  // SVG Graphic components
  const renderGraphic = () => {
    switch (type) {
      case 'search':
        return (
          <svg viewBox="0 0 200 200" className="w-40 h-40 mx-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Background decorative ring */}
            <motion.circle
              cx="100"
              cy="100"
              r="75"
              className="stroke-muted/30 dark:stroke-muted/10 stroke-2 fill-muted/5 dark:fill-muted/2"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
            
            {/* List document lines representing no results */}
            <motion.g
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <line x1="60" y1="75" x2="140" y2="75" className="stroke-slate-300 dark:stroke-slate-700 stroke-[4]" strokeLinecap="round" />
              <line x1="60" y1="100" x2="110" y2="100" className="stroke-slate-300 dark:stroke-slate-700 stroke-[4]" strokeLinecap="round" />
              <line x1="60" y1="125" x2="125" y2="125" className="stroke-slate-300 dark:stroke-slate-700 stroke-[4]" strokeLinecap="round" />
            </motion.g>

            {/* Sweep animated magnifying glass */}
            <motion.g
              animate={{
                x: [0, 15, -15, 0],
                y: [0, -10, 10, 0]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <circle cx="120" cy="110" r="22" className="fill-primary/10 stroke-primary stroke-[5]" />
              <line x1="135.5" y1="125.5" x2="155" y2="145" className="stroke-primary stroke-[5]" strokeLinecap="round" />
              
              {/* Cute sparkles */}
              <motion.path
                d="M 140 85 L 143 78 L 150 75 L 143 72 L 140 65 L 137 72 L 130 75 L 137 78 Z"
                className="fill-amber-400 dark:fill-amber-300"
                animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.g>
          </svg>
        );

      case 'products':
        return (
          <svg viewBox="0 0 200 200" className="w-40 h-40 mx-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Ground shadow */}
            <ellipse cx="100" cy="160" rx="65" ry="10" className="fill-muted/20 dark:fill-muted/5" />

            <motion.g
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
            >
              {/* Basket Back */}
              <path d="M 45 100 Q 100 80 155 100 L 140 150 Q 100 165 60 150 Z" className="fill-amber-100/40 dark:fill-amber-950/10 stroke-amber-600/20 dark:stroke-amber-500/10 stroke-2" />

              {/* Basket handle */}
              <path d="M 45 100 Q 100 20 155 100" className="stroke-amber-600/70 dark:stroke-amber-700/70 stroke-[5]" fill="none" strokeLinecap="round" />
              
              {/* Falling leaf */}
              <motion.g
                animate={{
                  y: [0, 45, 65],
                  x: [0, 15, -5],
                  rotate: [0, 30, -20, 10],
                  opacity: [0, 1, 0.8]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <path d="M 90 40 Q 110 30 115 50 Q 95 60 90 40 Z" className="fill-emerald-500/80 dark:fill-emerald-600/80" />
                <path d="M 90 40 L 115 50" className="stroke-emerald-600/40 dark:stroke-emerald-800/40 stroke-[1]" />
              </motion.g>

              {/* Basket Front (with weave pattern) */}
              <path d="M 40 105 Q 100 85 160 105 L 145 155 Q 100 170 55 155 Z" className="fill-amber-500/10 dark:fill-amber-800/10 stroke-amber-600 dark:stroke-amber-700 stroke-2" />
              {/* Weave details */}
              <path d="M 60 110 Q 100 95 140 110" className="stroke-amber-600/50 dark:stroke-amber-700/50 stroke-2" fill="none" />
              <path d="M 65 130 Q 100 115 135 130" className="stroke-amber-600/50 dark:stroke-amber-700/50 stroke-2" fill="none" />
              <path d="M 70 148 Q 100 135 130 148" className="stroke-amber-600/50 dark:stroke-amber-700/50 stroke-2" fill="none" />
              
              <path d="M 70 110 L 75 150" className="stroke-amber-600/50 dark:stroke-amber-700/50 stroke-2" />
              <path d="M 90 105 L 92 154" className="stroke-amber-600/50 dark:stroke-amber-700/50 stroke-2" />
              <path d="M 110 105 L 108 154" className="stroke-amber-600/50 dark:stroke-amber-700/50 stroke-2" />
              <path d="M 130 110 L 125 150" className="stroke-amber-600/50 dark:stroke-amber-700/50 stroke-2" />
            </motion.g>
          </svg>
        );

      case 'posts':
        return (
          <svg viewBox="0 0 200 200" className="w-40 h-40 mx-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Ground shadow */}
            <ellipse cx="100" cy="165" rx="55" ry="8" className="fill-muted/20 dark:fill-muted/5" />

            <motion.g
              initial={{ y: 15, opacity: 0, rotate: -3 }}
              animate={{ y: 0, opacity: 1, rotate: 2 }}
              transition={{ duration: 0.5, type: 'spring' }}
            >
              {/* Paper Sheet */}
              <rect x="55" y="45" width="90" height="110" rx="6" className="fill-card stroke-border stroke-2" />
              
              {/* Lines on paper */}
              <line x1="70" y1="70" x2="130" y2="70" className="stroke-slate-200 dark:stroke-slate-800 stroke-[3]" strokeLinecap="round" />
              <line x1="70" y1="90" x2="120" y2="90" className="stroke-slate-200 dark:stroke-slate-800 stroke-[3]" strokeLinecap="round" />
              <line x1="70" y1="110" x2="130" y2="110" className="stroke-slate-200 dark:stroke-slate-800 stroke-[3]" strokeLinecap="round" />
              <line x1="70" y1="130" x2="105" y2="130" className="stroke-slate-200 dark:stroke-slate-800 stroke-[3]" strokeLinecap="round" />

              {/* Cute Pin */}
              <motion.g
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <circle cx="100" cy="40" r="7" className="fill-rose-500 dark:fill-rose-600" />
                <line x1="100" y1="47" x2="100" y2="55" className="stroke-rose-600 dark:stroke-rose-500 stroke-[3.5]" strokeLinecap="round" />
              </motion.g>

              {/* Breeze blowing */}
              <motion.path
                d="M 25 80 Q 40 70 35 90 T 50 85"
                className="stroke-primary/30 dark:stroke-primary/10 stroke-2"
                fill="none"
                strokeLinecap="round"
                animate={{ pathLength: [0, 1, 0], x: [-5, 5] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <motion.path
                d="M 150 110 Q 165 100 160 120 T 175 115"
                className="stroke-primary/30 dark:stroke-primary/10 stroke-2"
                fill="none"
                strokeLinecap="round"
                animate={{ pathLength: [0, 1, 0], x: [5, -5] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
              />
            </motion.g>
          </svg>
        );

      case 'messages':
        return (
          <svg viewBox="0 0 200 200" className="w-40 h-40 mx-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Ground shadow */}
            <ellipse cx="100" cy="165" rx="60" ry="10" className="fill-muted/20 dark:fill-muted/5" />

            {/* Left Chat Bubble */}
            <motion.g
              initial={{ scale: 0.8, x: -10, opacity: 0 }}
              animate={{ scale: 1, x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1, type: "spring" }}
            >
              <path d="M 40 70 C 40 50, 90 50, 90 70 C 90 90, 80 90, 75 95 L 75 105 L 65 95 C 40 95, 40 90, 40 70 Z" 
                    className="fill-primary/10 dark:fill-primary/20 stroke-primary stroke-2" />
              {/* Static dots */}
              <circle cx="55" cy="72" r="3" className="fill-primary" />
              <circle cx="65" cy="72" r="3" className="fill-primary" />
              <circle cx="75" cy="72" r="3" className="fill-primary" />
            </motion.g>

            {/* Right Chat Bubble */}
            <motion.g
              initial={{ scale: 0.8, x: 10, opacity: 0 }}
              animate={{ scale: 1, x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3, type: "spring" }}
            >
              <path d="M 160 100 C 160 82, 115 82, 115 100 C 115 118, 125 118, 129 122 L 129 131 L 138 122 C 160 122, 160 118, 160 100 Z"
                    className="fill-muted/20 dark:fill-muted/50 stroke-muted-foreground/30 dark:stroke-muted-foreground/20 stroke-2" />
              
              {/* Typing animated dots */}
              <motion.circle cx="128" cy="102" r="2.5" className="fill-muted-foreground"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
              />
              <motion.circle cx="138" cy="102" r="2.5" className="fill-muted-foreground"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
              />
              <motion.circle cx="148" cy="102" r="2.5" className="fill-muted-foreground"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
              />
            </motion.g>
          </svg>
        );
    }
  };

  const defaultTitles = {
    search: 'No Results Found',
    products: 'No Products Available',
    posts: 'No Posts Yet',
    messages: 'No Messages',
  };

  const defaultDescriptions = {
    search: "We couldn't find anything matching your search query. Try typing something else or check your spelling.",
    products: 'There are no active products in this category at the moment. Check back again later.',
    posts: "Looks like there isn't any activity here yet. Be the first to start a conversation!",
    messages: 'Start a conversation with a seller or community member to see your chat history here.',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center text-center p-8 border border-dashed rounded-xl bg-card/30 backdrop-blur-[2px] w-full"
    >
      <div className="mb-4">
        {renderGraphic()}
      </div>
      
      <h3 className="text-xl font-bold tracking-tight text-foreground mb-2">
        {title || defaultTitles[type]}
      </h3>
      
      <p className="text-muted-foreground text-sm max-w-sm mb-6 leading-relaxed">
        {description || defaultDescriptions[type]}
      </p>
      
      {actionLabel && onAction && (
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Button onClick={onAction} className="shadow-sm">
            {actionLabel}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
