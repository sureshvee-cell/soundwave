'use client';

import { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { AlbumCard } from '@/components/Album/AlbumCard';
import { TrackList } from '@/components/Track/TrackList';
import { mockAlbums, mockTracks, mockArtists } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

type TabType = 'albums' | 'tracks' | 'artists';

export default function TrendingPage() {
  const [activeTab, setActiveTab] = useState<TabType>('albums');

  const tabs: { id: TabType; label: string }[] = [
    { id: 'albums', label: 'Albums' },
    { id: 'tracks', label: 'Tracks' },
    { id: 'artists', label: 'Artists' },
  ];

  const sortedAlbums = [...mockAlbums].sort((a, b) => b.playCount - a.playCount);
  const sortedTracks = [...mockTracks].sort((a, b) => b.playCount - a.playCount);
  const sortedArtists = [...mockArtists].sort(
    (a, b) => b.monthlyListeners - a.monthlyListeners
  );

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
            <TrendingUp className="w-8 h-8 text-brand-400" />
            <h1 className="text-4xl font-bold text-content-primary">Trending</h1>
          </div>

          {/* Tab Bar */}
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'px-4 py-2 rounded-lg font-medium transition-all',
                  activeTab === tab.id
                    ? 'bg-brand-600 text-white'
                    : 'bg-surface-raised text-content-secondary hover:text-content-primary hover:bg-surface-hover'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto px-6 py-12"
      >
        {/* Albums Tab */}
        {activeTab === 'albums' && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {sortedAlbums.map((album) => (
              <motion.div key={album.id} variants={itemVariants}>
                <AlbumCard album={album} size="md" />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Tracks Tab */}
        {activeTab === 'tracks' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <TrackList
              tracks={sortedTracks}
              showAlbum
              showPlayCount
            />
          </motion.div>
        )}

        {/* Artists Tab */}
        {activeTab === 'artists' && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {sortedArtists.map((artist) => (
              <motion.div
                key={artist.id}
                variants={itemVariants}
                className="surface-raised bg-surface-raised rounded-lg p-6 text-center hover:bg-surface-hover transition-colors"
              >
                <img
                  src={artist.avatarUrl}
                  alt={artist.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-lg font-semibold text-content-primary mb-1">
                  {artist.name}
                </h3>
                {artist.verified && (
                  <div className="inline-block mb-3">
                    <span className="text-xs font-medium text-brand-400">
                      ✓ Verified
                    </span>
                  </div>
                )}
                <p className="text-sm text-content-secondary mb-3">
                  {artist.genres.slice(0, 2).join(', ')}
                </p>
                <p className="text-xs text-content-muted">
                  {artist.monthlyListeners.toLocaleString()} monthly listeners
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
