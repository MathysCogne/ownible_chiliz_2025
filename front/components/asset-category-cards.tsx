'use client';

import {
  IconBallFootball,
  IconDeviceGamepad2,
  IconHome,
  IconMusic,
  IconArrowUpRight,
  IconArrowDownRight,
  IconChevronRight,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';

const initialCategories = [
  {
    name: 'Sport',
    icon: IconBallFootball,
    href: '#',
    videoUrl: '/video/sport.mp4',
    glowColor: 'from-orange-500/30 to-orange-400/30',
    id: 'sport',
    performance: 2.7,
    description: 'Own a share of iconic moments and teams from the world of professional sports.',
    cta: 'Own the Game',
  },
  {
    name: 'E-Sport',
    icon: IconDeviceGamepad2,
    href: '#',
    videoUrl: '/video/esport.mp4',
    glowColor: 'from-purple-600/30 to-purple-500/30',
    id: 'esport',
    performance: -1.5,
    description: 'Invest in your favorite players, teams, and tournament memorabilia from the competitive gaming scene.',
    cta: 'Join the Lobby',
  },
  {
    name: 'Music',
    icon: IconMusic,
    href: '#',
    videoUrl: '/video/kpop.mp4',
    glowColor: 'from-sky-500/30 to-sky-400/30',
    id: 'music',
    performance: 8.2,
    description: 'Get a piece of music history by investing in album rights and exclusive artist content.',
    cta: 'Feel the Beat',
  },
  {
    name: 'Real Estate',
    icon: IconHome,
    href: '#',
    videoUrl: '/video/real.mp4',
    glowColor: 'from-emerald-500/30 to-emerald-400/30',
    id: 'real-estate',
    performance: 0.9,
    description: 'Invest in fractional ownership of unique properties and venues around the world.',
    cta: 'Get the Keys',
  },
];

type Category = (typeof initialCategories)[0];

const CardSlot = ({
  activeCategory,
  layout,
}: {
  activeCategory: Category;
  layout: 'featured' | 'small-rect' | 'small-square';
}) => {
  const [coords, setCoords] = React.useState({ x: 50, y: 50 });

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - left) / width) * 100;
    const y = ((event.clientY - top) / height) * 100;
    setCoords({ x, y });
  };

  const handleMouseLeave = () => {
    setCoords({ x: 50, y: 50 });
  };
  
  const isFeatured = layout === 'featured';

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative h-full w-full overflow-hidden rounded-2xl border border-neutral-800/80 bg-neutral-950 transition-transform duration-300 ease-in-out will-change-transform"
      style={{
        transformStyle: 'preserve-3d',
        transform: `perspective(1000px) rotateY(${
          (coords.x - 50) / 15
        }deg) rotateX(${(50 - coords.y) / 15}deg) scale(1)`,
      }}
    >
      <AnimatePresence>
        {initialCategories.map((cat) => (
          <motion.video
            key={cat.id}
            src={cat.videoUrl}
            initial={{ opacity: 0 }}
            animate={{ opacity: cat.id === activeCategory.id ? 1 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="absolute inset-0 z-0 h-full w-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
            autoPlay
            loop
            muted
            playsInline
          />
        ))}
      </AnimatePresence>
      
      <div className={cn(
        'absolute -inset-px rounded-2xl bg-gradient-to-br opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100',
        activeCategory.glowColor
      )}/>
      
      <div className="pointer-events-none absolute inset-0 z-20" style={{
          background: `radial-gradient(circle at ${coords.x}% ${coords.y}%, transparent, rgba(0,0,0,0.6) 100%)`,
      }}/>

      <div className="relative z-30 flex h-full flex-col justify-between p-8 transition-transform duration-300 group-hover:-translate-y-1">
        
        <div className="flex items-center gap-3 self-start">
          <div className="rounded-lg bg-black/50 p-3 backdrop-blur-sm">
            <activeCategory.icon className="size-8 text-white" stroke={1.5} />
          </div>
          {!isFeatured && (
            <h3 className="text-2xl font-bold text-white">{activeCategory.name}</h3>
          )}
          {isFeatured && (
            <div
              className={cn(
                'flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-semibold',
                activeCategory.performance >= 0
                  ? 'bg-green-500 text-white'
                  : 'bg-red-500 text-white'
              )}
            >
              {activeCategory.performance >= 0 ? (
                <IconArrowUpRight size={16} />
              ) : (
                <IconArrowDownRight size={16} />
              )}
              <span>{activeCategory.performance.toFixed(1)}%</span>
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-4">
          {isFeatured && (
            <>
              <h3 className="text-4xl font-bold text-white">{activeCategory.name}</h3>
              <p className="max-w-md text-lg text-neutral-300">{activeCategory.description}</p>
              <Link href={activeCategory.href} className="mt-2">
                <Button size="lg" className="bg-white text-black hover:bg-neutral-200 font-bold group/button">
                  {activeCategory.cta}
                  <IconChevronRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover/button:translate-x-1" />
                </Button>
              </Link>
            </>
          )}
        </div>

      </div>
      {isFeatured && (
         <div className="absolute bottom-4 right-4 z-30 w-32 h-0.5 bg-white/20 rounded-full overflow-hidden">
           <motion.div
              key={activeCategory.id}
              className="h-full bg-white"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 8, ease: "linear" }}
           />
         </div>
      )}
    </div>
  );
};


export function AssetCategoryCards() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % initialCategories.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const getCategory = (offset: number) => {
    return initialCategories[(activeIndex + offset) % initialCategories.length];
  }

  return (
    <div className="relative grid h-[46rem] grid-cols-1 grid-rows-4 gap-6 md:grid-cols-3 md:grid-rows-2">
      <div className="md:col-span-2 md:row-span-2">
        <CardSlot activeCategory={getCategory(0)} layout="featured" />
      </div>
      <div className="md:col-span-1">
        <CardSlot activeCategory={getCategory(1)} layout="small-rect" />
      </div>
      <div className="grid grid-cols-2 gap-6 md:col-span-1">
        <CardSlot activeCategory={getCategory(2)} layout="small-square" />
        <CardSlot activeCategory={getCategory(3)} layout="small-square" />
      </div>
    </div>
  );
} 