"use client";

import { useState, useRef } from "react";
import Image  from "next/image";
import Link   from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, TrendingUp, Sparkles, Clock, Flame } from "lucide-react";
import { AlbumCard } from "@/components/Album/AlbumCard";
import { TrackList } from "@/components/Track/TrackList";
import { usePlayerStore } from "@/context/player-store";
import { mockAlbums, mockArtists, mockFeatured, mockTracks, mockGenres } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const [featuredIdx, setFeaturedIdx] = useState(0);
  const play = usePlayerStore(s => s.play);

  const featured = mockFeatured[featuredIdx];

  const nextFeatured = () => setFeaturedIdx(i => (i + 1) % mockFeatured.length);
  const prevFeatured = () => setFeaturedIdx(i => (i - 1 + mockFeatured.length) % mockFeatured.length);

  const newReleases   = mockAlbums.filter(a => a.isPublished).slice(0, 6);
  const trendingNow   = mockAlbums.sort((a, b) => b.playCount - a.playCount).slice(0, 6);
  const popularTracks = mockTracks.sort((a, b) => b.playCount - a.playCount).slice(0, 8);

  return (
    <div className="min-h-full">
      {/* ── Hero Banner ──────────────────────────────────────────────────── */}
      <section className="relative h-72 md:h-96 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={featured.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0"
          >
            <Image
              src={featured.imageUrl}
              alt={featured.title}
              fill
              className="object-cover"
              priority
            />
            {/* Gradient overlay */}
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${featured.gradientFrom}99 0%, ${featured.gradientTo}66 50%, transparent 100%),
                             linear-gradient(to top, #09090f 0%, transparent 50%)`,
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end px-6 pb-8 md:px-10">
          <motion.div
            key={featured.id + "-text"}
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <p className="text-sm font-medium text-white/70 mb-1">{featured.subtitle}</p>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight text-balance mb-4">
              {featured.title}
            </h1>
            <Link href={featured.link} className="btn-primary inline-flex">
              <Play className="w-4 h-4 fill-current" />
              {featured.cta}
            </Link>
          </motion.div>
        </div>

        {/* Navigation arrows */}
        <button
          onClick={prevFeatured}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-all backdrop-blur-sm"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={nextFeatured}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-all backdrop-blur-sm"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {mockFeatured.map((_, i) => (
            <button
              key={i}
              onClick={() => setFeaturedIdx(i)}
              className={cn(
                "rounded-full transition-all duration-300",
                i === featuredIdx ? "w-6 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/40"
              )}
            />
          ))}
        </div>
      </section>

      {/* ── Page content ───────────────────────────────────────────────── */}
      <div className="px-4 md:px-8 py-8 space-y-10">

        {/* Genre pills */}
        <section>
          <SectionHeader title="Browse Genres" icon={<Sparkles className="w-4 h-4" />} />
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mt-4">
            {mockGenres.map(genre => (
              <Link
                key={genre.id}
                href={`/search?genre=${genre.slug}`}
                className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all hover:brightness-125 hover:scale-105"
                style={{ background: `${genre.color}25`, color: genre.color, border: `1px solid ${genre.color}40` }}
              >
                {genre.name}
              </Link>
            ))}
          </div>
        </section>

        {/* Trending */}
        <section>
          <SectionHeader
            title="Trending Now"
            icon={<Flame className="w-4 h-4 text-orange-400" />}
            href="/trending"
          />
          <HorizontalScroll>
            {trendingNow.map(album => (
              <AlbumCard key={album.id} album={album} size="md" />
            ))}
          </HorizontalScroll>
        </section>

        {/* New Releases */}
        <section>
          <SectionHeader
            title="New Releases"
            icon={<TrendingUp className="w-4 h-4 text-emerald-400" />}
            href="/new-releases"
          />
          <HorizontalScroll>
            {newReleases.map(album => (
              <AlbumCard key={album.id} album={album} size="md" />
            ))}
          </HorizontalScroll>
        </section>

        {/* Popular tracks */}
        <section>
          <SectionHeader
            title="Popular Tracks"
            icon={<TrendingUp className="w-4 h-4 text-brand-400" />}
            href="/trending?type=tracks"
          />
          <div className="surface-raised p-2 mt-4">
            <TrackList
              tracks={popularTracks}
              showAlbum
              showPlayCount
            />
          </div>
        </section>

        {/* Featured Artists */}
        <section className="pb-6">
          <SectionHeader
            title="Featured Artists"
            icon={<Sparkles className="w-4 h-4 text-pink-400" />}
            href="/artists"
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
            {mockArtists.map(artist => (
              <Link key={artist.id} href={`/artist/${artist.slug}`}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="group surface-raised p-4 text-center hover:border-brand-700/50 transition-colors"
                >
                  <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-3 ring-2 ring-surface-border group-hover:ring-brand-600 transition-all">
                    <Image
                      src={artist.avatarUrl!}
                      alt={artist.name}
                      width={80} height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-sm font-semibold text-content-primary truncate">
                    {artist.name}
                    {artist.verified && <span className="ml-1 text-brand-400">✓</span>}
                  </p>
                  <p className="text-xs text-content-muted mt-0.5">{artist.genres[0]}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

// ── Helper Components ─────────────────────────────────────────────────────────

function SectionHeader({ title, icon, href }: { title: string; icon?: React.ReactNode; href?: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-bold text-content-primary flex items-center gap-2">
        {icon}
        {title}
      </h2>
      {href && (
        <Link href={href} className="text-sm text-brand-400 hover:text-brand-300 transition-colors font-medium">
          See all →
        </Link>
      )}
    </div>
  );
}

function HorizontalScroll({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: "left" | "right") => {
    if (ref.current) ref.current.scrollBy({ left: dir === "right" ? 240 : -240, behavior: "smooth" });
  };

  return (
    <div className="relative group/scroll mt-4">
      <button
        onClick={() => scroll("left")}
        className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-surface-raised border border-surface-border shadow-card flex items-center justify-center opacity-0 group-hover/scroll:opacity-100 transition-all hover:bg-surface-hover"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <div
        ref={ref}
        className="flex gap-4 overflow-x-auto no-scrollbar pb-2"
      >
        {children}
      </div>
      <button
        onClick={() => scroll("right")}
        className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-surface-raised border border-surface-border shadow-card flex items-center justify-center opacity-0 group-hover/scroll:opacity-100 transition-all hover:bg-surface-hover"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
