'use client';

import { motion } from 'framer-motion';

export default function Celebration() {
  return (
    <div className="relative flex justify-center mb-6 h-24">
      {/* Background radial glow */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="absolute w-24 h-24 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-xl"
      />
      
      {/* Checkmark Circle Container */}
      <motion.div
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: [0.3, 1.15, 1], opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center relative z-10 border border-emerald-200 dark:border-emerald-800 shadow-inner"
      >
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.4, duration: 0.6, ease: 'easeInOut' }}
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </motion.div>

      {/* Radial Confetti Sparkles */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        {[...Array(12)].map((_, i) => {
          const angle = (i * 360) / 12;
          const radius = 55 + Math.random() * 25;
          const x = Math.cos((angle * Math.PI) / 180) * radius;
          const y = Math.sin((angle * Math.PI) / 180) * radius;
          const isAmber = i % 2 === 0;

          return (
            <motion.div
              key={i}
              className={`absolute w-2.5 h-2.5 rounded-full ${
                isAmber ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
              initial={{ x: 0, y: 0, scale: 0.5, opacity: 1 }}
              animate={{
                x,
                y,
                scale: [0.5, 1.2, 0],
                opacity: [1, 1, 0],
              }}
              transition={{
                delay: 0.6,
                duration: 1.4,
                ease: 'easeOut',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
