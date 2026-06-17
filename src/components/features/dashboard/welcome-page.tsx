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
  Zap
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { motion, Variants } from 'framer-motion';
import { useFirestore } from '@/firebase';
import { collection, getCountFromServer } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

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

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 80,
        damping: 15
      }
    }
  };

  const leafVariants: Variants = {
    animate: {
      y: [0, -8, 0],
      rotate: [0, 3, -3, 0],
      transition: {
        duration: 5,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  const features = [
    {
      title: navT('price-prediction'),
      description: t('descriptions.price-prediction'),
      href: '/price-prediction',
      icon: <TrendingUp className="w-6 h-6 text-emerald-500" />,
      badge: 'AI Prediction',
      color: 'from-emerald-500/10 to-emerald-600/5 hover:border-emerald-500/30'
    },
    {
      title: navT('disease-diagnosis'),
      description: t('descriptions.disease-diagnosis'),
      href: '/disease-diagnosis',
      icon: <Bug className="w-6 h-6 text-red-500" />,
      badge: 'Computer Vision',
      color: 'from-red-500/10 to-red-600/5 hover:border-red-500/30'
    },
    {
      title: navT('crop-recommendation'),
      description: t('descriptions.crop-recommendation'),
      href: '/crop-recommendation',
      icon: <Sprout className="w-6 h-6 text-green-500" />,
      badge: 'Agronomy AI',
      color: 'from-green-500/10 to-green-600/5 hover:border-green-500/30'
    },
    {
      title: navT('weather-prediction'),
      description: t('descriptions.weather-prediction'),
      href: '/weather-prediction',
      icon: <CloudSun className="w-6 h-6 text-blue-500" />,
      badge: 'Live Forecast',
      color: 'from-blue-500/10 to-blue-600/5 hover:border-blue-500/30'
    },
    {
      title: navT('demand-supply'),
      description: t('descriptions.demand-supply'),
      href: '/demand-supply',
      icon: <BarChart3 className="w-6 h-6 text-amber-500" />,
      badge: 'Market Analysis',
      color: 'from-amber-500/10 to-amber-600/5 hover:border-amber-500/30'
    },
    {
      title: navT('marketplace'),
      description: t('descriptions.marketplace'),
      href: '/marketplace',
      icon: <ShoppingBag className="w-6 h-6 text-teal-500" />,
      badge: 'Direct Trade',
      color: 'from-teal-500/10 to-teal-600/5 hover:border-teal-500/30'
    },
    {
      title: navT('community'),
      description: t('descriptions.community'),
      href: '/community',
      icon: <Users className="w-6 h-6 text-indigo-500" />,
      badge: 'Social Hub',
      color: 'from-indigo-500/10 to-indigo-600/5 hover:border-indigo-500/30'
    }
  ];

  return (
    <div className="min-h-screen bg-linear-to-b from-background via-muted/30 to-background flex flex-col justify-between overflow-x-hidden">
      
      {/* Top Header / Nav Banner */}
      <header className="w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between border-b border-muted/40">
        <div className="flex items-center gap-2">
          <Leaf className="w-8 h-8 text-primary" />
          <span className="font-headline text-2xl font-bold tracking-tight text-foreground">Farmingo</span>
        </div>
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/login">{navT('login')}</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/signup">{navT('signup')}</Link>
          </Button>
        </div>
      </header>

      {/* Hero Banner Section */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-6 py-12 md:py-20 space-y-20">
        <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-emerald-950 via-green-900 to-teal-950 text-white p-8 md:p-16 shadow-2xl">
          {/* Animated decorative elements */}
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl space-y-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10"
            >
              <Sparkles className="w-4 h-4 text-emerald-300 animate-pulse" />
              <span className="text-xs md:text-sm font-medium tracking-wide text-emerald-200">
                {t('ai-insights')}
              </span>
            </motion.div>

            <div className="space-y-4">
              <motion.div 
                className="flex items-center gap-4"
                variants={leafVariants}
                animate="animate"
              >
                <Leaf className="w-12 h-12 md:w-16 md:h-16 text-emerald-400 shrink-0" />
                <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-none">
                  Farmingo
                </h1>
              </motion.div>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-lg md:text-2xl text-emerald-100/90 leading-relaxed font-light"
              >
                {t('subtitle')}
              </motion.p>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-sm md:text-lg text-emerald-200/80 max-w-2xl font-light"
            >
              {welcomeT('tagline')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-wrap gap-4 pt-4"
            >
              <Button asChild size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-lg shadow-emerald-900/40 px-8 py-6 rounded-xl text-base font-semibold group">
                <Link href="/signup">
                  {navT('signup')}
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white/20 bg-white/5 text-white hover:bg-white/10 px-8 py-6 rounded-xl text-base font-semibold">
                <Link href="/login">{navT('login')}</Link>
              </Button>
            </motion.div>
          </div>

          {/* Abstract farm art illustration overlay */}
          <div className="absolute right-10 bottom-0 top-0 hidden lg:flex items-center justify-center w-1/3 opacity-20 pointer-events-none">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
              className="w-72 h-72 border border-dashed border-emerald-400/30 rounded-full flex items-center justify-center"
            >
              <div className="w-56 h-56 border border-dashed border-emerald-400/20 rounded-full flex items-center justify-center">
                <Leaf className="w-16 h-16 text-emerald-400" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section with Animations */}
        <section className="space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <Badge variant="outline" className="border-primary/20 text-primary px-3 py-1">
              <Zap className="w-3.5 h-3.5 mr-1 text-primary" />
              {welcomeT('explore-features')}
            </Badge>
            <h2 className="font-headline text-3xl md:text-5xl font-bold tracking-tight text-foreground">
              {welcomeT('explore-features')}
            </h2>
            <p className="text-muted-foreground text-sm md:text-base">
              {welcomeT('explore-features-desc')}
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                className="flex"
              >
                <Card className={`w-full flex flex-col justify-between overflow-hidden border-muted/60 bg-linear-to-b ${feature.color} transition-all duration-300 rounded-3xl shadow-xs hover:shadow-md cursor-pointer group`}>
                  <CardHeader className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="p-3 bg-background rounded-2xl shadow-xs border border-muted/50 text-foreground group-hover:scale-115 transition-transform duration-300 flex items-center justify-center">
                        {feature.icon}
                      </div>
                      <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm text-xs font-semibold px-2.5 py-0.5 border border-muted/20">
                        {feature.badge}
                      </Badge>
                    </div>
                    <CardTitle className="font-headline text-xl md:text-2xl text-foreground font-bold tracking-tight">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <CardDescription className="text-sm md:text-base text-muted-foreground leading-relaxed">
                      {feature.description}
                    </CardDescription>
                    <div className="pt-2">
                      <Button asChild variant="ghost" size="sm" className="p-0 text-primary hover:bg-transparent hover:text-primary/80 flex items-center gap-1 group/btn font-medium">
                        <Link href={feature.href}>
                          {t('get-started')}
                          <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Stats Counter Block */}
        <section className="relative overflow-hidden rounded-[2.5rem] bg-muted/40 border border-muted-foreground/10 px-8 py-16 md:p-16">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-5xl mx-auto space-y-12">
            <div className="text-center space-y-3">
              <h3 className="font-headline text-2xl md:text-4xl font-bold tracking-tight text-foreground">
                {welcomeT('stats-heading')}
              </h3>
              <p className="text-muted-foreground text-sm md:text-base">
                {welcomeT('stats-desc')}
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
              {[
                { val: counts.loading ? null : counts.farmers, lbl: welcomeT('stat-farmers-lbl') },
                { val: counts.loading ? null : counts.products, lbl: welcomeT('stat-products-lbl') },
                { val: counts.loading ? null : counts.posts, lbl: welcomeT('stat-posts-lbl') },
                { val: counts.loading ? null : counts.communities, lbl: welcomeT('stat-communities-lbl') },
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  className="text-center space-y-2 border-r last:border-none border-muted/80 max-md:even:border-none animate-in fade-in duration-500"
                >
                  <span className="block font-headline text-4xl md:text-5xl lg:text-6xl font-black text-primary tracking-tight flex items-center justify-center min-h-[4rem]">
                    {stat.val === null ? (
                      <Skeleton className="h-10 w-24 rounded-lg bg-primary/10" />
                    ) : (
                      stat.val
                    )}
                  </span>
                  <span className="block text-xs md:text-sm text-muted-foreground font-medium uppercase tracking-wider">
                    {stat.lbl}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Styled Premium Footer */}
      <footer className="w-full bg-muted/30 border-t border-muted/50 mt-12 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-primary" />
            <span className="font-headline text-xl font-bold text-foreground">Farmingo</span>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground text-center md:text-left max-w-md">
            {welcomeT('footer-text')}
          </p>
          <div className="flex items-center gap-6 text-xs md:text-sm text-muted-foreground">
            <Link href="/login" className="hover:text-primary transition-colors">{navT('login')}</Link>
            <Link href="/signup" className="hover:text-primary transition-colors">{navT('signup')}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
