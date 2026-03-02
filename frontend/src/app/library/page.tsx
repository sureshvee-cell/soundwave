'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Library, PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { AlbumCard } from '@/components/Album/AlbumCard';
import { TrackList } from '@/components/Track/TrackList';
import { mockAlbums, mockTracks } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

type TabType = 'liked' | 'albums' | 'playlists';

function LibraryContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as TabType | null;
  const [activeTab, setActiveTab] = useState<TabType>(tabParam || 'liked');

  const tabs: { id: TabType; label: string }[] = [
    { id: 'liked', label: 'Liked Songs' },
    { id: 'albums', label: 'Albums' },
    { id: 'playlists', label: 'Playlists' },
  ];

  // Mock data with isLiked flag
  const likedTracks = mockTracks.slice(0, 8).map((track, idx) => ({
    ...track,
    isLiked: idx % 2 === 0,
  }));

  const likedAlbums = mockAlbums.slice(0, 8).map((album, idx) => ({
    ...album,
    isLiked: idx % 2 === 0,
  }));

  const filteredTracks = likedTracks.filter((t) => t.isLiked);
  const filteredAlbums = likedAlbums.filter((a) => a.isLiked);

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
            <Library className="w-8 h-8 text-brand-400" />
            <h1 className="text-4xl font-bold text-content-primary">
              Your Library
            </h1>
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
        {/* Liked Songs Tab */}
        {activeTab === 'liked' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {filteredTracks.length > 0 ? (
              <TrackList tracks={filteredTracks} />
            ) : (
              <div className="text-center py-12">
                <p className="text-content-secondary">No liked songs yet</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Albums Tab */}
        {activeTab === 'albums' && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {filteredAlbums.length > 0 ? (
              filteredAlbums.map((album) => (
                <motion.div key={album.id} variants={itemVariants}>
                  <AlbumCard album={album} size="md" />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-content-secondary">No liked albums yet</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Playlists Tab */}
        {activeTab === 'playlists' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16"
          >
            <PlusCircle className="w-16 h-16 text-content-muted mb-4" />
            <h2 className="text-xl font-semibold text-content-primary mb-2">
              Create your first playlist
            </h2>
            <p className="text-content-secondary mb-6">
              Organize your favorite tracks into custom playlists
            </p>
            <button className="px-6 py-3 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors">
              New Playlist
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default function LibraryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface-base" />}>
      <LibraryContent />
    </Suspense>
  );
}
