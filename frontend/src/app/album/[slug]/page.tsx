'use client';

import { use } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart, Share2, Play } from 'lucide-react';
import { cn, formatCount, formatDuration } from '@/lib/utils';
import { mockAlbums } from '@/lib/mock-data';
import { AlbumCard } from '@/components/Album/AlbumCard';
import { TrackList } from '@/components/Track/TrackList';
import { usePlayerStore } from '@/context/player-store';

interface AlbumPageProps {
  params: Promise<{ slug: string }>;
}

export default function AlbumPage({ params }: AlbumPageProps) {
  const { slug } = use(params);
  const { play } = usePlayerStore();

  const album = mockAlbums.find((a) => a.slug === slug);

  if (!album) {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-content-primary mb-2">Album not found</h1>
          <p className="text-content-secondary">The album you're looking for doesn't exist.</p>
        </motion.div>
      </div>
    );
  }

  const relatedAlbums = mockAlbums.filter(
    (a) => a.artist.id === album.artist.id && a.id !== album.id
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
  };

  return (
    <div className="min-h-screen bg-surface-base">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative bg-gradient-to-b from-surface-raised to-surface-base px-4 py-8 md:px-8 md:py-12"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
            {/* Album Cover */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex justify-center md:justify-start"
            >
              <div className="relative w-40 h-40 md:w-56 md:h-56 rounded-lg overflow-hidden shadow-2xl">
                <Image
                  src={album.coverUrl}
                  alt={album.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </motion.div>

            {/* Album Info */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="md:col-span-2 space-y-4"
            >
              <motion.div variants={itemVariants}>
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <span className="text-sm font-semibold text-brand-400 bg-surface-overlay px-3 py-1 rounded-full">
                    {album.type}
                  </span>
                  <span className="text-sm text-content-muted">
                    {new Date(album.releaseDate).getFullYear()}
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-content-primary mb-2">
                  {album.title}
                </h1>
              </motion.div>

              {/* Artist Info */}
              <motion.div variants={itemVariants} className="flex items-center gap-2">
                <span className="text-lg text-content-secondary">by</span>
                <a
                  href={`/artist/${album.artist.slug}`}
                  className="text-lg font-semibold text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1"
                >
                  {album.artist.name}
                  {album.artist.verified && (
                    <span className="text-brand-400 text-sm">✓</span>
                  )}
                </a>
              </motion.div>

              {/* Stats */}
              <motion.div
                variants={itemVariants}
                className="flex flex-wrap gap-6 text-sm text-content-secondary pt-2"
              >
                <div>
                  <span className="text-content-muted">{album.trackCount}</span> tracks
                </div>
                <div>
                  <span className="text-content-muted">
                    {formatDuration(album.totalDuration)}
                  </span>{' '}
                  total
                </div>
                <div>
                  <span className="text-content-muted">{formatCount(album.playCount)}</span>{' '}
                  plays
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                variants={itemVariants}
                className="flex flex-wrap gap-3 pt-4"
              >
                <button
                  onClick={() => album.tracks?.[0] && play(album.tracks[0], album.tracks)}
                  className="btn-primary flex items-center gap-2"
                >
                  <Play size={18} className="fill-current" />
                  Play All
                </button>
                <button
                  className={cn(
                    'btn-ghost flex items-center gap-2',
                    'hover:text-brand-400 transition-colors'
                  )}
                >
                  <Heart size={20} />
                  <span>{formatCount(album.likeCount)}</span>
                </button>
                <button
                  className={cn(
                    'btn-ghost flex items-center gap-2',
                    'hover:text-brand-400 transition-colors'
                  )}
                >
                  <Share2 size={20} />
                </button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Description */}
      {album.description && (
        <motion.section
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="max-w-6xl mx-auto px-4 md:px-8 py-8"
        >
          <p className="text-content-secondary leading-relaxed">{album.description}</p>
        </motion.section>
      )}

      {/* Tracks Section */}
      <motion.section
        variants={itemVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        className="max-w-6xl mx-auto px-4 md:px-8 py-12"
      >
        <h2 className="text-2xl font-bold text-content-primary mb-6">Tracks</h2>
        <div className={cn('surface-raised rounded-lg p-6')}>
          <TrackList tracks={album.tracks ?? []} showPlayCount={true} />
        </div>
      </motion.section>

      {/* More from Artist */}
      {relatedAlbums.length > 0 && (
        <motion.section
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="max-w-6xl mx-auto px-4 md:px-8 py-12"
        >
          <h2 className="text-2xl font-bold text-content-primary mb-8">
            More from {album.artist.name}
          </h2>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {relatedAlbums.slice(0, 6).map((relatedAlbum) => (
              <motion.div key={relatedAlbum.id} variants={itemVariants}>
                <AlbumCard album={relatedAlbum} />
              </motion.div>
            ))}
          </motion.div>
        </motion.section>
      )}
    </div>
  );
}
