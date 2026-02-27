"use client";

import Image from "next/image";
import { Play, Pause, Heart, MoreHorizontal, Lock, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { usePlayerStore } from "@/context/player-store";
import { cn, formatDuration, formatCount } from "@/lib/utils";
import type { Track, ChartEntry } from "@/types";

interface TrackListProps {
  tracks:         Track[];
  showAlbum?:     boolean;
  showIndex?:     boolean;
  showPlayCount?: boolean;
  compact?:       boolean;
  onLike?:        (trackId: string) => void;
}

export function TrackList({
  tracks, showAlbum = false, showIndex = true, showPlayCount = false, compact = false, onLike,
}: TrackListProps) {
  const { currentTrack, isPlaying, play, togglePlay, queue } = usePlayerStore();

  return (
    <div className="space-y-0.5">
      {/* Header */}
      {!compact && (
        <div className={cn(
          "grid gap-4 px-4 pb-2 text-[11px] font-semibold text-content-muted uppercase tracking-wider border-b border-surface-border mb-1",
          showAlbum ? "grid-cols-[32px_1fr_1fr_80px_40px]" : "grid-cols-[32px_1fr_80px_40px]"
        )}>
          <span className="text-center">#</span>
          <span>Title</span>
          {showAlbum && <span>Album</span>}
          {showPlayCount && <span className="text-right">Plays</span>}
          <span className="text-right pr-2">Duration</span>
          <span />
        </div>
      )}

      {tracks.map((track, idx) => {
        const isCurrent = currentTrack?.id === track.id;
        const isInQueue = queue.some(t => t.id === track.id);

        return (
          <div
            key={track.id}
            className={cn(
              "track-row",
              isCurrent && "playing",
              compact && "py-2"
            )}
            onDoubleClick={() => play(track, tracks)}
          >
            {/* Index / play indicator */}
            {showIndex && (
              <div className="w-8 flex items-center justify-center flex-shrink-0">
                {isCurrent ? (
                  <button onClick={togglePlay} className="flex items-center justify-center">
                    {isPlaying ? (
                      <div className="flex gap-0.5 items-end h-3.5">
                        {[1,2,3].map(i => (
                          <span key={i} className="equalizer-bar" style={{ animationDelay: `${i * 0.15}s` }} />
                        ))}
                      </div>
                    ) : (
                      <Play className="w-3.5 h-3.5 text-brand-400" />
                    )}
                  </button>
                ) : (
                  <span className="text-sm text-content-muted group-hover:hidden tabular-nums">
                    {idx + 1}
                  </span>
                )}
              </div>
            )}

            {/* Album cover (optional) */}
            {showAlbum && (
              <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-surface-overlay">
                <Image
                  src={track.album.coverUrl}
                  alt={track.album.title}
                  width={36} height={36}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Title + Artist */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-sm font-medium truncate",
                  isCurrent ? "text-brand-300" : "text-content-primary"
                )}>
                  {track.title}
                </span>
                {track.isExplicit && (
                  <span className="flex-shrink-0 px-1.5 py-0.5 bg-surface-border text-content-muted text-[9px] font-bold rounded uppercase">E</span>
                )}
                {track.isPremium && (
                  <Lock className="w-3 h-3 text-amber-400 flex-shrink-0" />
                )}
              </div>
              {!compact && (
                <span className="text-xs text-content-muted truncate block">
                  {track.artist.name}
                </span>
              )}
            </div>

            {/* Album name */}
            {showAlbum && !compact && (
              <span className="text-sm text-content-muted truncate hidden md:block">
                {track.album.title}
              </span>
            )}

            {/* Play count */}
            {showPlayCount && (
              <span className="text-sm text-content-muted text-right hidden md:block tabular-nums">
                {formatCount(track.playCount)}
              </span>
            )}

            {/* Like */}
            <button
              onClick={() => onLike?.(track.id)}
              className={cn(
                "btn-icon w-8 h-8",
                track.isLiked ? "text-pink-500 opacity-100" : "opacity-0 group-hover:opacity-100"
              )}
            >
              <Heart className={cn("w-3.5 h-3.5", track.isLiked && "fill-current")} />
            </button>

            {/* Duration */}
            <span className="text-sm text-content-muted w-10 text-right tabular-nums flex-shrink-0">
              {formatDuration(track.duration)}
            </span>

            {/* More */}
            <button className="btn-icon w-8 h-8 opacity-0 group-hover:opacity-100">
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ── Chart Track List ──────────────────────────────────────────────────────────

interface ChartListProps {
  entries: ChartEntry[];
}

export function ChartList({ entries }: ChartListProps) {
  const { currentTrack, isPlaying, play, togglePlay } = usePlayerStore();

  return (
    <div className="space-y-1">
      {entries.map((entry) => {
        const isCurrent = currentTrack?.id === entry.track.id;
        const ChangeIcon = entry.change === "up" ? TrendingUp : entry.change === "down" ? TrendingDown : Minus;
        const changeColor = entry.change === "up" ? "text-emerald-400" : entry.change === "down" ? "text-red-400" : "text-content-muted";

        return (
          <div
            key={entry.track.id}
            className={cn("track-row group", isCurrent && "playing")}
            onDoubleClick={() => play(entry.track, entries.map(e => e.track))}
          >
            {/* Rank */}
            <div className="w-10 flex-shrink-0 flex items-center justify-center">
              {isCurrent ? (
                <div className="flex gap-0.5 items-end h-3.5">
                  {[1,2,3].map(i => <span key={i} className="equalizer-bar" />)}
                </div>
              ) : (
                <span className="text-base font-bold text-content-muted tabular-nums w-5 text-right">
                  {entry.rank}
                </span>
              )}
            </div>

            {/* Cover */}
            <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-surface-overlay">
              <Image
                src={entry.track.album.coverUrl}
                alt={entry.track.album.title}
                width={40} height={40}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className={cn("text-sm font-semibold truncate", isCurrent && "text-brand-300")}>
                {entry.track.title}
              </p>
              <p className="text-xs text-content-muted truncate">{entry.track.artist.name}</p>
            </div>

            {/* Change indicator */}
            <div className={cn("flex items-center gap-1 text-xs", changeColor)}>
              <ChangeIcon className="w-3 h-3" />
              {entry.changeAmount && <span>{entry.changeAmount}</span>}
              {entry.change === "new" && <span className="badge badge-new text-[10px]">NEW</span>}
            </div>

            {/* Plays */}
            <span className="text-sm text-content-muted hidden md:block tabular-nums">
              {formatCount(entry.track.playCount)}
            </span>

            <span className="text-sm text-content-muted tabular-nums w-10 text-right">
              {formatDuration(entry.track.duration)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
