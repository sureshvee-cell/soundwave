"use client";

import Image  from "next/image";
import Link   from "next/link";
import { Play, Heart, MoreHorizontal, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { usePlayerStore } from "@/context/player-store";
import { cn, formatCount } from "@/lib/utils";
import type { Album } from "@/types";

interface AlbumCardProps {
  album:      Album;
  size?:      "sm" | "md" | "lg";
  showArtist?: boolean;
}

export function AlbumCard({ album, size = "md", showArtist = true }: AlbumCardProps) {
  const play = usePlayerStore(s => s.play);

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    if (album.tracks && album.tracks.length > 0) {
      play(album.tracks[0], album.tracks);
    }
  };

  const sizeClasses = {
    sm: "w-36",
    md: "w-44",
    lg: "w-56",
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn("flex-shrink-0", sizeClasses[size])}
    >
      <Link href={`/album/${album.slug}`} className="group block">
        {/* Cover art */}
        <div className="relative aspect-album rounded-2xl overflow-hidden bg-surface-overlay shadow-card mb-3">
          <Image
            src={album.coverUrl}
            alt={album.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 144px, (max-width: 1024px) 176px, 224px"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300" />

          {/* Play button */}
          <button
            onClick={handlePlay}
            className={cn(
              "absolute bottom-3 right-3",
              "w-11 h-11 rounded-full bg-brand-600 text-white shadow-glow-brand",
              "flex items-center justify-center",
              "translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100",
              "transition-all duration-250 hover:scale-110 active:scale-95"
            )}
          >
            <Play className="w-4.5 h-4.5 ml-0.5" />
          </button>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex gap-1.5">
            {album.isPremium && (
              <span className="badge badge-premium">
                <Lock className="w-2.5 h-2.5" />
                Premium
              </span>
            )}
            {album.type === "single" && (
              <span className="badge badge-free">Single</span>
            )}
            {album.type === "ep" && (
              <span className="badge badge-brand">EP</span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="px-0.5">
          <h3 className="text-sm font-semibold text-content-primary truncate group-hover:text-brand-300 transition-colors">
            {album.title}
          </h3>
          {showArtist && (
            <p className="text-xs text-content-muted mt-0.5 truncate">
              {album.artist.name}
              {album.artist.verified && (
                <span className="ml-1 text-brand-400">✓</span>
              )}
            </p>
          )}
          <p className="text-xs text-content-muted mt-0.5">
            {new Date(album.releaseDate).getFullYear()} · {formatCount(album.playCount)} plays
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
