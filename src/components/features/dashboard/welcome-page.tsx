'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Leaf, 
  ArrowRight, 
  TrendingUp, 
  Bug, 
  Sprout, 
  CloudSun, 
  BarChart3, 
  ShoppingBag, 
  Users, 
  Sparkles,
  Zap,
  ScanLine,
  Handshake,
  Rocket,
  ChevronRight,
  Star,
  Shield,
  Globe
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { motion, useMotionValue, useTransform, useInView, Variants } from 'framer-motion';
import { useFirestore } from '@/firebase';
import { collection, getCountFromServer } from 'firebase/firestore';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// ── Animated Counter Hook ──
function useAnimatedCounter(target: number, duration: number = 2000, startCounting: boolean = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!startCounting || target === 0) return;

    let startTime: number | null = null;
    let animationFrame: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      }
    };

    animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration, startCounting]);

  return count;
}

// ── Stat Counter Component ──
function AnimatedStat({ value, label, loading, index }: { value: number; label: string; loading: boolean; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const animatedValue = useAnimatedCounter(value, 2000, isInView && !loading);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative text-center space-y-3 group"
    >
      {/* Glow behind the number */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-20 h-20 bg-primary/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <span className="relative block font-headline text-5xl md:text-6xl lg:text-7xl font-black tracking-tight min-h-[4.5rem] flex items-center justify-center">
        {loading ? (
          <Skeleton className="h-12 w-28 rounded-xl bg-primary/10" />
        ) : (
          <span className="gradient-text">{animatedValue}+</span>
        )}
      </span>
      <span className="block text-xs md:text-sm text-muted-foreground font-semibold uppercase tracking-[0.15em]">
        {label}
      </span>
    </motion.div>
  );
}

// ── Floating Orb Component ──
function FloatingOrb({ size, color, delay, className }: { size: string; color: string; delay: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 1.5 }}
      className={`absolute rounded-full pointer-events-none ${size} ${color} ${className ?? ''}`}
      style={{ filter: 'blur(60px)' }}
    >
      <motion.div
        className="w-full h-full"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ 
          duration: 6 + delay,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
    </motion.div>
  );
}


export function WelcomePage() {
  const t = useTranslations('Dashboard');
  const welcomeT = useTranslations('Welcome');
  const navT = useTranslations('Navigation');
  const firestore = useFirestore();

  const [counts, setCounts] = useState({
    farmers: 0,
    products: 0,
    posts: 0,
    communities: 0,
    loading: true,
  });

  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    async function fetchCounts() {
      const db = firestore;
      if (!db) return;
      try {
        const [usersSnap, productsSnap, postsSnap, communitiesSnap] = await Promise.all([
          getCountFromServer(collection(db, 'users')),
          getCountFromServer(collection(db, 'products')),
          getCountFromServer(collection(db, 'posts')),
          getCountFromServer(collection(db, 'communities')),
        ]);
        setCounts({
          farmers: usersSnap.data().count,
          products: productsSnap.data().count,
          posts: postsSnap.data().count,
          communities: communitiesSnap.data().count,
          loading: false,
        });
      } catch (err) {
        console.error('Error fetching real metrics:', err);
        setCounts((prev) => ({ ...prev, loading: false }));
      }
    }
    fetchCounts();
  }, [firestore]);

  // ── Animation Variants ──
  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.15
      }
    }
  };

  const fadeUpItem: Variants = {
    hidden: { opacity: 0, y: 40, filter: 'blur(10px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        type: 'spring',
        stiffness: 60,
        damping: 20
      }
    }
  };

  const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15
      }
    }
  };

  const features = [
    {
      title: navT('price-prediction'),
      description: t('descriptions.price-prediction'),
      href: '/price-prediction',
      icon: <TrendingUp className="w-6 h-6" />,
      badge: 'AI Prediction',
      gradient: 'from-emerald-500 to-teal-600',
      glow: 'group-hover:shadow-emerald-500/20'
    },
    {
      title: navT('disease-diagnosis'),
      description: t('descriptions.disease-diagnosis'),
      href: '/disease-diagnosis',
      icon: <Bug className="w-6 h-6" />,
      badge: 'Computer Vision',
      gradient: 'from-rose-500 to-pink-600',
      glow: 'group-hover:shadow-rose-500/20'
    },
    {
      title: navT('crop-recommendation'),
      description: t('descriptions.crop-recommendation'),
      href: '/crop-recommendation',
      icon: <Sprout className="w-6 h-6" />,
      badge: 'Agronomy AI',
      gradient: 'from-green-500 to-emerald-600',
      glow: 'group-hover:shadow-green-500/20'
    },
    {
      title: navT('weather-prediction'),
      description: t('descriptions.weather-prediction'),
      href: '/weather-prediction',
      icon: <CloudSun className="w-6 h-6" />,
      badge: 'Live Forecast',
      gradient: 'from-sky-500 to-blue-600',
      glow: 'group-hover:shadow-sky-500/20'
    },
    {
      title: navT('demand-supply'),
      description: t('descriptions.demand-supply'),
      href: '/demand-supply',
      icon: <BarChart3 className="w-6 h-6" />,
      badge: 'Market Analysis',
      gradient: 'from-amber-500 to-orange-600',
      glow: 'group-hover:shadow-amber-500/20'
    },
    {
      title: navT('marketplace'),
      description: t('descriptions.marketplace'),
      href: '/marketplace',
      icon: <ShoppingBag className="w-6 h-6" />,
      badge: 'Direct Trade',
      gradient: 'from-teal-500 to-cyan-600',
      glow: 'group-hover:shadow-teal-500/20'
    },
    {
      title: navT('community'),
      description: t('descriptions.community'),
      href: '/community',
      icon: <Users className="w-6 h-6" />,
      badge: 'Social Hub',
      gradient: 'from-violet-500 to-purple-600',
      glow: 'group-hover:shadow-violet-500/20'
    }
  ];

  const howItWorks = [
    {
      icon: <ScanLine className="w-7 h-7" />,
      title: welcomeT('step-1-title'),
      description: welcomeT('step-1-desc'),
      gradient: 'from-emerald-500 to-green-600'
    },
    {
      icon: <Sparkles className="w-7 h-7" />,
      title: welcomeT('step-2-title'),
      description: welcomeT('step-2-desc'),
      gradient: 'from-blue-500 to-indigo-600'
    },
    {
      icon: <Rocket className="w-7 h-7" />,
      title: welcomeT('step-3-title'),
      description: welcomeT('step-3-desc'),
      gradient: 'from-amber-500 to-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      
      {/* ═══ HEADER ═══ */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-0 z-50 w-full"
      >
        <div className="glass-light">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="font-headline text-xl font-bold tracking-tight text-foreground">Farmingo</span>
            </div>
            <div className="flex items-center gap-3">
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex text-muted-foreground hover:text-foreground font-medium">
                <Link href="/login">{navT('login')}</Link>
              </Button>
              <Button asChild size="sm" className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white border-none shadow-lg shadow-emerald-600/20 rounded-xl px-5 font-semibold btn-shimmer">
                <Link href="/signup">{navT('signup')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="flex-grow">

        {/* ═══ HERO SECTION ═══ */}
        <section className="relative min-h-[90vh] flex items-center overflow-hidden">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-green-900 to-teal-950" />
          
          {/* Animated mesh/orb system */}
          <FloatingOrb size="w-[500px] h-[500px]" color="bg-emerald-500/30" delay={0} className="-top-40 -right-40" />
          <FloatingOrb size="w-[400px] h-[400px]" color="bg-teal-500/25" delay={0.5} className="-bottom-32 -left-32" />
          <FloatingOrb size="w-[300px] h-[300px]" color="bg-green-400/20" delay={1} className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          <FloatingOrb size="w-[200px] h-[200px]" color="bg-cyan-500/15" delay={1.5} className="top-20 left-1/4" />
          
          {/* Grid pattern overlay */}
          <div 
            className="absolute inset-0 opacity-[0.03]" 
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize: '40px 40px'
            }}
          />

          {/* Orbiting decorative elements */}
          <div className="absolute right-1/4 top-1/2 -translate-y-1/2 hidden lg:block">
            <div className="relative w-[300px] h-[300px]">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0"
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-emerald-400/60 rounded-full" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-teal-400/40 rounded-full" />
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-2.5 h-2.5 bg-green-400/50 rounded-full" />
              </motion.div>
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-8"
              >
                <div className="absolute top-0 right-0 w-2 h-2 bg-cyan-400/50 rounded-full" />
                <div className="absolute bottom-0 left-0 w-3 h-3 bg-emerald-300/40 rounded-full" />
              </motion.div>
              {/* Center leaf */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="p-4 rounded-2xl glass">
                  <Leaf className="w-10 h-10 text-emerald-400" />
                </div>
              </motion.div>
              {/* Orbital rings */}
              <div className="absolute inset-0 border border-emerald-400/10 rounded-full" />
              <div className="absolute inset-8 border border-emerald-400/5 rounded-full" />
              <div className="absolute -inset-4 border border-dashed border-emerald-400/5 rounded-full" />
            </div>
          </div>

          {/* Hero content */}
          <div className="relative z-10 max-w-7xl w-full mx-auto px-6 py-20 md:py-28">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="max-w-3xl space-y-8"
            >
              {/* AI badge */}
              <motion.div variants={fadeUpItem}>
                <div className="inline-flex items-center gap-2.5 glass px-5 py-2 rounded-full">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                  </span>
                  <span className="text-sm font-medium tracking-wide text-emerald-200">
                    {t('ai-insights')}
                  </span>
                </div>
              </motion.div>

              {/* Headline */}
              <motion.div variants={fadeUpItem} className="space-y-4">
                <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9] text-white">
                  <span className="block">Farm</span>
                  <span className="block bg-gradient-to-r from-emerald-300 via-green-200 to-teal-300 bg-clip-text text-transparent">
                    Smarter.
                  </span>
                </h1>
              </motion.div>

              {/* Subtitle */}
              <motion.p
                variants={fadeUpItem}
                className="text-lg md:text-xl text-emerald-100/80 leading-relaxed max-w-xl font-light"
              >
                {t('subtitle')}
              </motion.p>

              {/* Tagline */}
              <motion.p
                variants={fadeUpItem}
                className="text-sm md:text-base text-emerald-200/60 max-w-lg"
              >
                {welcomeT('tagline')}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div variants={fadeUpItem} className="flex flex-wrap gap-4 pt-2">
                <Button 
                  asChild 
                  size="lg" 
                  className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white border-none shadow-2xl shadow-emerald-900/50 px-8 py-7 rounded-2xl text-base font-bold group btn-shimmer"
                >
                  <Link href="/signup">
                    {navT('signup')}
                    <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1.5" />
                  </Link>
                </Button>
                <Button 
                  asChild 
                  variant="outline" 
                  size="lg" 
                  className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:border-white/25 px-8 py-7 rounded-2xl text-base font-semibold backdrop-blur-sm"
                >
                  <Link href="/login">{navT('login')}</Link>
                </Button>
              </motion.div>

              {/* Trust badges */}
              <motion.div 
                variants={fadeUpItem}
                className="flex items-center gap-6 pt-4 text-emerald-300/50 text-xs font-medium"
              >
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  <span>{welcomeT('trust-free')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  <span>{welcomeT('trust-multilingual')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  <span>{welcomeT('trust-ai')}</span>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Bottom gradient fade */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
        </section>

        {/* ═══ FEATURES SECTION ═══ */}
        <section className="relative py-24 md:py-32 max-w-7xl mx-auto px-6">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-center max-w-2xl mx-auto space-y-5 mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-primary/5 dark:bg-primary/10 px-4 py-2 rounded-full border border-primary/10">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">{welcomeT('explore-features')}</span>
            </div>
            <h2 className="font-headline text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
              {welcomeT('explore-features')}
            </h2>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
              {welcomeT('explore-features-desc')}
            </p>
          </motion.div>

          {/* Feature cards grid */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                variants={fadeUpItem}
                whileHover={{ y: -6, transition: { duration: 0.3 } }}
                className="flex group"
              >
                <Link href={feature.href} className="w-full">
                  <Card className={`w-full h-full flex flex-col justify-between overflow-hidden border-border/50 bg-card hover:bg-accent/5 transition-all duration-500 rounded-2xl shadow-sm hover:shadow-xl ${feature.glow} cursor-pointer`}>
                    <CardHeader className="space-y-4 pb-3">
                      <div className="flex items-center justify-between">
                        <div className={`p-3 bg-gradient-to-br ${feature.gradient} rounded-xl shadow-lg text-white transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                          {feature.icon}
                        </div>
                        <Badge variant="secondary" className="bg-muted/60 backdrop-blur-sm text-[11px] font-semibold px-2.5 py-0.5 border border-border/30">
                          {feature.badge}
                        </Badge>
                      </div>
                      <CardTitle className="font-headline text-lg text-foreground font-bold tracking-tight group-hover:text-primary transition-colors duration-300">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-0">
                      <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </CardDescription>
                      <div className="flex items-center gap-1 text-primary text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-0 group-hover:translate-x-1">
                        {t('get-started')}
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ═══ HOW IT WORKS SECTION ═══ */}
        <section className="relative py-24 md:py-32 overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-muted/30 dark:bg-muted/10" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 max-w-6xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="text-center max-w-2xl mx-auto space-y-5 mb-20"
            >
              <div className="inline-flex items-center gap-2 bg-primary/5 dark:bg-primary/10 px-4 py-2 rounded-full border border-primary/10">
                <Handshake className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">{welcomeT('how-it-works')}</span>
              </div>
              <h2 className="font-headline text-3xl md:text-5xl font-bold tracking-tight text-foreground">
                {welcomeT('how-it-works')}
              </h2>
              <p className="text-muted-foreground text-base md:text-lg">
                {welcomeT('how-it-works-desc')}
              </p>
            </motion.div>

            {/* Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
              {howItWorks.map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="relative"
                >
                  {/* Connecting line (hidden on last item & mobile) */}
                  {idx < howItWorks.length - 1 && (
                    <div className="hidden md:block absolute top-12 left-[60%] w-full h-px">
                      <div className="w-full h-px bg-gradient-to-r from-primary/20 to-transparent" />
                      <ChevronRight className="absolute -right-1 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/20" />
                    </div>
                  )}

                  <div className="relative bg-card border border-border/50 rounded-3xl p-8 hover:shadow-lg hover:border-primary/20 transition-all duration-500 group">
                    {/* Step number */}
                    <div className="absolute -top-4 -left-2 md:-left-3">
                      <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-emerald-600 text-white text-sm font-black shadow-lg shadow-primary/20">
                        {idx + 1}
                      </span>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div className={`p-3.5 bg-gradient-to-br ${step.gradient} rounded-2xl w-fit text-white shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                        {step.icon}
                      </div>
                      <h3 className="font-headline text-xl font-bold text-foreground">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ STATS SECTION ═══ */}
        <section className="relative py-24 md:py-32 max-w-7xl mx-auto px-6">
          <div className="relative overflow-hidden rounded-[2rem] md:rounded-[3rem] bg-gradient-to-br from-emerald-950 via-green-900 to-teal-950 p-10 md:p-20">
            {/* Decorative */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/15 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/15 rounded-full blur-[80px] pointer-events-none" />
            <div 
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                backgroundSize: '32px 32px'
              }}
            />

            <div className="relative z-10 space-y-14">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center space-y-4"
              >
                <h3 className="font-headline text-3xl md:text-5xl font-bold tracking-tight text-white">
                  {welcomeT('stats-heading')}
                </h3>
                <p className="text-emerald-200/60 text-sm md:text-base max-w-lg mx-auto">
                  {welcomeT('stats-desc')}
                </p>
              </motion.div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12">
                {[
                  { val: counts.farmers, lbl: welcomeT('stat-farmers-lbl') },
                  { val: counts.products, lbl: welcomeT('stat-products-lbl') },
                  { val: counts.posts, lbl: welcomeT('stat-posts-lbl') },
                  { val: counts.communities, lbl: welcomeT('stat-communities-lbl') },
                ].map((stat, idx) => (
                  <AnimatedStat
                    key={idx}
                    value={stat.val}
                    label={stat.lbl}
                    loading={counts.loading}
                    index={idx}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ CTA BANNER ═══ */}
        <section className="relative py-16 md:py-24 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative overflow-hidden rounded-[2rem] md:rounded-[3rem] bg-gradient-to-br from-primary/5 via-background to-accent/5 border border-primary/10 p-10 md:p-16"
          >
            {/* Floating sparkles */}
            <motion.div
              animate={{ y: [-5, 5, -5], rotate: [0, 180, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-8 right-12 text-primary/20"
            >
              <Star className="w-6 h-6" />
            </motion.div>
            <motion.div
              animate={{ y: [5, -5, 5], rotate: [360, 180, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-8 left-16 text-accent/20"
            >
              <Sparkles className="w-8 h-8" />
            </motion.div>

            <div className="relative z-10 text-center max-w-2xl mx-auto space-y-8">
              <h2 className="font-headline text-3xl md:text-5xl font-bold tracking-tight text-foreground">
                {welcomeT('cta-heading')}
              </h2>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
                {welcomeT('cta-desc')}
              </p>
              <div className="flex flex-wrap justify-center gap-4 pt-2">
                <Button 
                  asChild 
                  size="lg" 
                  className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white border-none shadow-xl shadow-primary/20 px-10 py-7 rounded-2xl text-base font-bold group btn-shimmer"
                >
                  <Link href="/signup">
                    {welcomeT('cta-button')}
                    <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1.5" />
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </section>

      </main>

      {/* ═══ FOOTER ═══ */}
      <footer className="w-full border-t border-border/50 mt-8">
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <span className="font-headline text-lg font-bold text-foreground">Farmingo</span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground text-center md:text-left max-w-md">
              {welcomeT('footer-text')}
            </p>
            <div className="flex items-center gap-8 text-sm text-muted-foreground">
              <Link href="/login" className="hover:text-primary transition-colors duration-300 font-medium">{navT('login')}</Link>
              <Link href="/signup" className="hover:text-primary transition-colors duration-300 font-medium">{navT('signup')}</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
