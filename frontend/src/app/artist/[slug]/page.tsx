'use client';

import { use } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart, Play, UserPlus } from 'lucide-react';
import { cn, formatCount } from '@/lib/utils';
import { mockArtists, mockTracks, mockAlbums } from '@/lib/mock-data';
import { AlbumCard } from '@/components/Album/AlbumCard';
import { TrackList } from '@/components/Track/TrackList';
import { usePlayerStore } from '@/context/player-store';

interface ArtistPageProps {
  params: Promise<{ slug: string }>;
}

export default function ArtistPage({ params }: ArtistPageProps) {
  const { slug } = use(params);
  const { play } = usePlayerStore();

  const artist = mockArtists.find((a) => a.slug === slug);

  if (!artist) {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-content-primary mb-2">Artist not found</h1>
          <p className="text-content-secondary">The artist you're looking for doesn't exist.</p>
        </motion.div>
      </div>
    );
  }

  const artistTracks = mockTracks.filter((t) => t.artist.slug === artist.slug);
  const artistAlbums = mockAlbums.filter((a) => a.artist.id === artist.id);

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
      {/* Banner Header */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative h-64 md:h-96 overflow-hidden"
      >
        {/* Banner Image with Gradient Overlay */}
        <Image
          src={artist.bannerUrl}
          alt={artist.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-surface-base" />

        {/* Artist Info Overlay */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="absolute inset-0 flex flex-col items-center justify-end pb-8 md:pb-12"
        >
          <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden shadow-2xl border-4 border-surface-base mb-6">
            <Image
              src={artist.avatarUrl}
              alt={artist.name}
              fill
              className="object-cover"
            />
          </div>
        </motion.div>
      </motion.section>

      {/* Artist Details */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto px-4 md:px-8 py-8 text-center"
      >
        {/* Name with Verified Badge */}
        <motion.h1
          variants={itemVariants}
          className="text-4xl md:text-5xl font-bold text-content-primary mb-2 flex items-center justify-center gap-2"
        >
          {artist.name}
          {artist.verified && <span className="text-brand-400 text-3xl">✓</span>}
        </motion.h1>

        {/* Genres */}
        {artist.genres.length > 0 && (
          <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-2 mb-6">
            {artist.genres.map((genre) => (
              <span
                key={genre}
                className="text-sm px-3 py-1 rounded-full bg-surface-overlay text-text-brand-400"
              >
                {genre}
              </span>
            ))}
          </motion.div>
        )}

        {/* Stats */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap justify-center gap-8 md:gap-16 mb-8 text-sm"
        >
          <div>
            <div className="text-2xl md:text-3xl font-bold text-brand-400">
              {formatCount(artist.monthlyListeners)}
            </div>
            <div className="text-content-muted text-xs uppercase tracking-wide">
              Monthly Listeners
            </div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-bold text-brand-400">
              {formatCount(artist.followerCount)}
            </div>
            <div className="text-content-muted text-xs uppercase tracking-wide">Followers</div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-3">
          {artistTracks.length > 0 && (
            <button
              onClick={() => play(artistTracks, 0)}
              className="btn-primary flex items-center gap-2"
            >
              <Play size={18} className="fill-current" />
              Play
            </button>
          )}
          <button
            className={cn(
              'btn-ghost flex items-center gap-2',
              'hover:text-brand-400 transition-colors'
            )}
          >
            <UserPlus size={20} />
            Follow
          </button>
          <button
            className={cn(
              'btn-ghost flex items-center gap-2',
              'hover:text-brand-400 transition-colors'
            )}
          >
            <Heart size={20} />
          </button>
        </motion.div>
      </motion.section>

      {/* Bio */}
      {artist.bio && (
        <motion.section
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="max-w-6xl mx-auto px-4 md:px-8 py-8"
        >
          <p className="text-content-secondary leading-relaxed text-center md:text-left">
            {artist.bio}
          </p>
        </motion.section>
      )}

      {/* Popular Tracks */}
      {artistTracks.length > 0 && (
        <motion.section
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="max-w-6xl mx-auto px-4 md:px-8 py-12"
        >
          <h2 className="text-2xl font-bold text-content-primary mb-6">Popular Tracks</h2>
          <div className={cn('surface-raised rounded-lg p-6')}>
            <TrackList tracks={artistTracks.slice(0, 10)} showPlayCount={true} />
          </div>
        </motion.section>
      )}

      {/* Discography */}
      {artistAlbums.length > 0 && (
        <motion.section
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="max-w-6xl mx-auto px-4 md:px-8 py-12"
        >
          <h2 className="text-2xl font-bold text-content-primary mb-8">Discography</h2>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {artistAlbums.map((album) => (
              <motion.div key={album.id} variants={itemVariants}>
                <AlbumCard album={album} />
              </motion.div>
            ))}
          </motion.div>
        </motion.section>
      )}

      {/* Empty State */}
      {artistTracks.length === 0 && artistAlbums.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-6xl mx-auto px-4 md:px-8 py-12 text-center"
        >
          <p className="text-content-secondary">No tracks or albums available yet.</p>
        </motion.div>
      )}
    </div>
  );
}
