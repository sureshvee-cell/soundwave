"use client";

import Image from "next/image";
import { X, GripVertical, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePlayerStore } from "@/context/player-store";
import { formatDuration, cn } from "@/lib/utils";

export function PlayerQueue() {
  const {
    queue, queueIndex, currentTrack,
    jumpToIndex, removeFromQueue, clearQueue, toggleQueue,
  } = usePlayerStore();

  const upcoming  = queue.slice(queueIndex + 1);
  const history   = queue.slice(0, queueIndex);

  return (
    <motion.aside
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 30, stiffness: 350 }}
      className="w-80 xl:w-96 flex-shrink-0 flex flex-col bg-surface-raised border-l border-surface-border z-40 md:relative fixed right-0 top-0 bottom-0"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
        <h2 className="text-base font-bold text-content-primary">Queue</h2>
        <div className="flex items-center gap-1">
          {queue.length > 1 && (
            <button
              onClick={clearQueue}
              className="btn-ghost text-xs px-3 py-1.5 text-content-muted hover:text-red-400"
            >
              Clear
            </button>
          )}
          <button onClick={toggleQueue} className="btn-icon">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Now Playing */}
        {currentTrack && (
          <section className="px-4 py-3">
            <p className="text-[11px] font-semibold text-content-muted uppercase tracking-wider mb-2 px-1">
              Now Playing
            </p>
            <QueueItem
              track={currentTrack}
              index={queueIndex}
              isCurrent
              onPlay={() => {}}
              onRemove={() => {}}
            />
          </section>
        )}

        {/* Next in queue */}
        {upcoming.length > 0 && (
          <section className="px-4 py-2">
            <p className="text-[11px] font-semibold text-content-muted uppercase tracking-wider mb-2 px-1">
              Next Up ({upcoming.length})
            </p>
            <div className="space-y-0.5">
              {upcoming.map((track, i) => (
                <QueueItem
                  key={`${track.id}-${i}`}
                  track={track}
                  index={queueIndex + 1 + i}
                  onPlay={() => jumpToIndex(queueIndex + 1 + i)}
                  onRemove={() => removeFromQueue(queueIndex + 1 + i)}
                />
              ))}
            </div>
          </section>
        )}

        {/* History */}
        {history.length > 0 && (
          <section className="px-4 py-2 pb-6">
            <p className="text-[11px] font-semibold text-content-muted uppercase tracking-wider mb-2 px-1">
              History ({history.length})
            </p>
            <div className="space-y-0.5 opacity-50">
              {[...history].reverse().map((track, i) => (
                <QueueItem
                  key={`hist-${track.id}-${i}`}
                  track={track}
                  index={queueIndex - 1 - i}
                  isHistory
                  onPlay={() => jumpToIndex(queueIndex - 1 - i)}
                  onRemove={() => removeFromQueue(queueIndex - 1 - i)}
                />
              ))}
            </div>
          </section>
        )}

        {queue.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface-overlay flex items-center justify-center mb-4">
              <span className="text-3xl">🎵</span>
            </div>
            <p className="text-content-primary font-semibold">Queue is empty</p>
            <p className="text-content-muted text-sm mt-1">Add songs to start listening</p>
          </div>
        )}
      </div>
    </motion.aside>
  );
}

interface QueueItemProps {
  track:    import("@/types").Track;
  index:    number;
  isCurrent?: boolean;
  isHistory?: boolean;
  onPlay:   () => void;
  onRemove: () => void;
}

function QueueItem({ track, isCurrent, isHistory, onPlay, onRemove }: QueueItemProps) {
  return (
    <div
      className={cn(
        "group flex items-center gap-2.5 px-2 py-2 rounded-xl cursor-pointer transition-colors",
        isCurrent ? "bg-brand-900/40" : "hover:bg-surface-hover"
      )}
      onClick={!isCurrent ? onPlay : undefined}
    >
      <GripVertical className="w-3.5 h-3.5 text-content-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 cursor-grab" />
      <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 relative">
        <Image
          src={track.album.coverUrl}
          alt={track.album.title}
          width={36} height={36}
          className="w-full h-full object-cover"
        />
        {isCurrent && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="flex gap-0.5 items-end h-3">
              {[1,2,3,4].map(i => (
                <span
                  key={i}
                  className="equalizer-bar bg-brand-400"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm font-medium truncate",
          isCurrent ? "text-brand-300" : isHistory ? "text-content-muted" : "text-content-primary"
        )}>
          {track.title}
        </p>
        <p className="text-xs text-content-muted truncate">{track.artist.name}</p>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-xs text-content-muted tabular-nums">{formatDuration(track.duration)}</span>
        {!isCurrent && (
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="btn-icon opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7"
          >
            <Trash2 className="w-3 h-3 text-red-400" />
          </button>
        )}
      </div>
    </div>
  );
}
