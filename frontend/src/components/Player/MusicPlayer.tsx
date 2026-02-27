"use client";

import { useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link  from "next/link";
import {
  Play, Pause, SkipBack, SkipForward,
  Shuffle, Repeat, Repeat1, Volume2, VolumeX, Volume1,
  Heart, ListMusic, Maximize2, Ellipsis,
} from "lucide-react";
import { motion } from "framer-motion";
import { usePlayerStore } from "@/context/player-store";
import { formatDuration, cn } from "@/lib/utils";

export function MusicPlayer() {
  const {
    currentTrack, isPlaying, isLoading,
    progress, duration, currentTime, volume, isMuted,
    isShuffled, repeatMode, isQueueOpen,
    togglePlay, next, prev, seek,
    setVolume, toggleMute, toggleShuffle, cycleRepeat,
    toggleQueue, setCurrentTime, setDuration, setLoading,
  } = usePlayerStore();

  const audioRef    = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // ── Audio element management ─────────────────────────────────────────────
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = "metadata";
    }
    const audio = audioRef.current;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    const onDurationChange = () => {
      setDuration(audio.duration || 0);
    };
    const onEnded = () => {
      next();
    };
    const onCanPlay = () => {
      setLoading(false);
    };
    const onWaiting = () => {
      setLoading(true);
    };

    audio.addEventListener("timeupdate",    onTimeUpdate);
    audio.addEventListener("durationchange",onDurationChange);
    audio.addEventListener("ended",         onEnded);
    audio.addEventListener("canplay",       onCanPlay);
    audio.addEventListener("waiting",       onWaiting);

    return () => {
      audio.removeEventListener("timeupdate",    onTimeUpdate);
      audio.removeEventListener("durationchange",onDurationChange);
      audio.removeEventListener("ended",         onEnded);
      audio.removeEventListener("canplay",       onCanPlay);
      audio.removeEventListener("waiting",       onWaiting);
    };
  }, [next, setCurrentTime, setDuration, setLoading]);

  // ── Track change ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;
    const audio = audioRef.current;
    // In a real app this would be the stream URL; for demo we use a silent placeholder
    const src = currentTrack.audioUrl || "";
    if (audio.src !== src) {
      audio.src = src;
      audio.load();
    }
    if (isPlaying) {
      audio.play().catch(() => { /* autoplay blocked */ });
    }
  }, [currentTrack]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Play / pause ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // ── Volume ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // ── Seek via progress bar click ───────────────────────────────────────────
  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !audioRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const p    = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audioRef.current.currentTime = p * duration;
    seek(p);
  }, [duration, seek]);

  // ── Volume icon ───────────────────────────────────────────────────────────
  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  // ── Repeat icon ──────────────────────────────────────────────────────────
  const RepeatIcon  = repeatMode === "one" ? Repeat1 : Repeat;
  const repeatColor = repeatMode !== "none" ? "text-brand-400" : "text-content-secondary";

  if (!currentTrack) return null;

  return (
    <motion.div
      initial={{ y: 88 }}
      animate={{ y: 0 }}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "h-[88px] md:bottom-0",
        "bg-surface-raised/95 backdrop-blur-xl border-t border-surface-border shadow-player",
        "md:bottom-0 bottom-14" // above mobile nav
      )}
    >
      <div className="h-full flex items-center px-4 md:px-6 gap-4">

        {/* ── Track info ──────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 w-[30%] min-w-0">
          <div className={cn(
            "w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 shadow-card",
            isPlaying && "ring-2 ring-brand-500/50 animate-glow"
          )}>
            <Image
              src={currentTrack.album.coverUrl}
              alt={currentTrack.album.title}
              width={48} height={48}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <Link
              href={`/album/${currentTrack.albumId}`}
              className="text-sm font-semibold text-content-primary truncate hover:text-brand-300 transition-colors block"
            >
              {currentTrack.title}
            </Link>
            <Link
              href={`/artist/${currentTrack.artist.slug}`}
              className="text-xs text-content-secondary hover:text-content-primary transition-colors truncate block"
            >
              {currentTrack.artist.name}
            </Link>
          </div>
          <button className={cn("btn-icon hidden md:flex ml-1", currentTrack.isLiked && "text-pink-500")}>
            <Heart className={cn("w-4 h-4", currentTrack.isLiked && "fill-current")} />
          </button>
        </div>

        {/* ── Player controls ──────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col items-center gap-1.5 max-w-[480px] mx-auto">
          {/* Control buttons */}
          <div className="flex items-center gap-1 md:gap-3">
            <button
              onClick={toggleShuffle}
              className={cn("btn-icon hidden md:flex", isShuffled ? "text-brand-400" : "text-content-secondary")}
            >
              <Shuffle className="w-3.5 h-3.5" />
            </button>

            <button onClick={prev} className="btn-icon">
              <SkipBack className="w-4.5 h-4.5" />
            </button>

            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-content-primary hover:scale-105 active:scale-95 flex items-center justify-center transition-all shadow-glow-brand"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-surface-base border-t-brand-600 rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-4.5 h-4.5 text-surface-base" />
              ) : (
                <Play className="w-4.5 h-4.5 text-surface-base ml-0.5" />
              )}
            </button>

            <button onClick={next} className="btn-icon">
              <SkipForward className="w-4.5 h-4.5" />
            </button>

            <button
              onClick={cycleRepeat}
              className={cn("btn-icon hidden md:flex", repeatColor)}
            >
              <RepeatIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="hidden md:flex items-center gap-2 w-full">
            <span className="text-[11px] text-content-muted w-9 text-right tabular-nums">
              {formatDuration(currentTime)}
            </span>
            <div
              ref={progressRef}
              className="flex-1 group cursor-pointer"
              onClick={handleProgressClick}
            >
              <div className="progress-bar h-1 group-hover:h-1.5 transition-all duration-150">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${progress * 100}%` }}
                />
                {/* Thumb */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ left: `${progress * 100}%`, transform: `translateX(-50%) translateY(-50%)` }}
                />
              </div>
            </div>
            <span className="text-[11px] text-content-muted w-9 tabular-nums">
              {formatDuration(duration || currentTrack.duration)}
            </span>
          </div>
        </div>

        {/* ── Right controls ───────────────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-1 w-[30%] justify-end">
          {/* Volume */}
          <button onClick={toggleMute} className="btn-icon">
            <VolumeIcon className="w-4 h-4" />
          </button>
          <div className="w-24 group">
            <div className="progress-bar h-1 cursor-pointer group-hover:h-1.5 transition-all duration-150"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setVolume(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
              }}
            >
              <div
                className="h-full bg-content-primary rounded-full"
                style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
              />
            </div>
          </div>

          {/* Queue toggle */}
          <button
            onClick={toggleQueue}
            className={cn("btn-icon ml-1", isQueueOpen && "text-brand-400")}
          >
            <ListMusic className="w-4 h-4" />
          </button>

          <button className="btn-icon">
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          <button className="btn-icon">
            <Ellipsis className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile: only queue button */}
        <button
          onClick={toggleQueue}
          className={cn("md:hidden btn-icon ml-auto", isQueueOpen && "text-brand-400")}
        >
          <ListMusic className="w-4.5 h-4.5" />
        </button>
      </div>
    </motion.div>
  );
}
