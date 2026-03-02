'use client';

import { useState, useMemo } from 'react';
import { Mic2, Search, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { mockArtists } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

export default function ArtistsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredArtists = useMemo(() => {
    if (!searchQuery.trim()) {
      return mockArtists;
    }
    return mockArtists.filter(
      (artist) =>
        artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artist.genres.some((g) =>
          g.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );
  }, [searchQuery]);

  const containerVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 },
    hover: { y: -4 },
  };

  return (
    <div className="min-h-screen bg-surface-base">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 bg-surface-base/80 backdrop-blur-md border-b border-surface-border"
      >
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-8">
            <Mic2 className="w-8 h-8 text-brand-400" />
            <h1 className="text-4xl font-bold text-content-primary">Artists</h1>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-content-secondary pointer-events-none" />
            <input
              type="text"
              placeholder="Search artists or genres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                'w-full pl-12 pr-4 py-3 rounded-lg',
                'bg-surface-raised border border-surface-border',
                'text-content-primary placeholder-content-secondary',
                'focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400/20',
                'transition-all'
              )}
            />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto px-6 py-12"
      >
        {filteredArtists.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredArtists.map((artist) => (
              <motion.div
                key={artist.id}
                variants={itemVariants}
                whileHover="hover"
                className="cursor-pointer"
              >
                <Link href={`/artist/${artist.slug}`}>
                  <div className="surface-raised bg-surface-raised rounded-lg p-6 hover:bg-surface-hover transition-colors h-full">
                    <div className="flex flex-col items-center text-center">
                      {/* Avatar */}
                      <motion.img
                        src={artist.avatarUrl}
                        alt={artist.name}
                        className="w-32 h-32 rounded-full object-cover mb-4 border-2 border-surface-border"
                        whileHover={{ scale: 1.05 }}
                      />

                      {/* Name with Verified Badge */}
                      <div className="mb-3 flex items-center justify-center gap-2">
                        <h3 className="text-lg font-semibold text-content-primary">
                          {artist.name}
                        </h3>
                        {artist.verified && (
                          <CheckCircle2 className="w-5 h-5 text-brand-400 flex-shrink-0" />
                        )}
                      </div>

                      {/* Genres */}
                      <p className="text-sm text-content-secondary mb-4 line-clamp-2">
                        {artist.genres.slice(0, 2).join(', ')}
                      </p>

                      {/* Monthly Listeners */}
                      <div className="w-full pt-4 border-t border-surface-border">
                        <p className="text-xs text-content-muted mb-2">
                          Monthly Listeners
                        </p>
                        <p className="text-base font-semibold text-brand-400">
                          {(artist.monthlyListeners / 1000000).toFixed(1)}M
                        </p>
                      </div>

                      {/* Followers */}
                      <div className="w-full pt-3">
                        <p className="text-xs text-content-muted mb-1">
                          Followers
                        </p>
                        <p className="text-sm font-medium text-content-primary">
                          {(artist.followerCount / 1000000).toFixed(1)}M
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16"
          >
            <Mic2 className="w-16 h-16 text-content-muted mb-4 opacity-50" />
            <h2 className="text-xl font-semibold text-content-primary mb-2">
              No artists found
            </h2>
            <p className="text-content-secondary">
              Try searching with different keywords
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
