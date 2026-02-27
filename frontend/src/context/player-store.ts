import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { shuffle } from "@/lib/utils";
import type { Track, PlayerState } from "@/types";

interface PlayerActions {
  play:          (track: Track, queue?: Track[]) => void;
  pause:         () => void;
  resume:        () => void;
  togglePlay:    () => void;
  next:          () => void;
  prev:          () => void;
  seek:          (progress: number) => void;
  setVolume:     (volume: number) => void;
  toggleMute:    () => void;
  toggleShuffle: () => void;
  cycleRepeat:   () => void;
  addToQueue:    (track: Track) => void;
  removeFromQueue:(index: number) => void;
  clearQueue:    () => void;
  jumpToIndex:   (index: number) => void;
  toggleQueue:   () => void;
  setProgress:   (progress: number) => void;
  setDuration:   (duration: number) => void;
  setCurrentTime:(time: number) => void;
  setLoading:    (loading: boolean) => void;
}

type PlayerStore = PlayerState & PlayerActions;

const DEFAULT_STATE: PlayerState = {
  currentTrack: null,
  queue: [],
  queueIndex: 0,
  isPlaying: false,
  isLoading: false,
  progress: 0,
  duration: 0,
  currentTime: 0,
  volume: 0.8,
  isMuted: false,
  isShuffled: false,
  repeatMode: "none",
  isQueueOpen: false,
};

export const usePlayerStore = create<PlayerStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...DEFAULT_STATE,

        play(track, queue) {
          const q = queue ?? [track];
          const idx = q.findIndex(t => t.id === track.id);
          set({
            currentTrack: track,
            queue: q,
            queueIndex: idx >= 0 ? idx : 0,
            isPlaying: true,
            isLoading: true,
            progress: 0,
            currentTime: 0,
          });
        },

        pause() { set({ isPlaying: false }); },
        resume() { set({ isPlaying: true }); },
        togglePlay() { set(s => ({ isPlaying: !s.isPlaying })); },

        next() {
          const { queue, queueIndex, repeatMode, isShuffled } = get();
          if (!queue.length) return;
          if (repeatMode === "one") {
            set({ progress: 0, currentTime: 0, isPlaying: true });
            return;
          }
          let nextIdx: number;
          if (isShuffled) {
            nextIdx = Math.floor(Math.random() * queue.length);
          } else {
            nextIdx = queueIndex + 1;
            if (nextIdx >= queue.length) {
              if (repeatMode === "all") nextIdx = 0;
              else { set({ isPlaying: false, progress: 0, currentTime: 0 }); return; }
            }
          }
          set({ queueIndex: nextIdx, currentTrack: queue[nextIdx], isPlaying: true, progress: 0, currentTime: 0, isLoading: true });
        },

        prev() {
          const { currentTime, queue, queueIndex } = get();
          if (currentTime > 3) { set({ progress: 0, currentTime: 0 }); return; }
          const prevIdx = Math.max(0, queueIndex - 1);
          set({ queueIndex: prevIdx, currentTrack: queue[prevIdx], isPlaying: true, progress: 0, currentTime: 0, isLoading: true });
        },

        seek(progress) { set({ progress, currentTime: get().duration * progress }); },

        setVolume(volume) { set({ volume, isMuted: volume === 0 }); },
        toggleMute() { set(s => ({ isMuted: !s.isMuted })); },

        toggleShuffle() {
          const { isShuffled, queue, queueIndex } = get();
          if (!isShuffled) {
            const current = queue[queueIndex];
            const rest = queue.filter((_, i) => i !== queueIndex);
            const shuffled = shuffle(rest);
            const newQueue = [current, ...shuffled];
            set({ isShuffled: true, queue: newQueue, queueIndex: 0 });
          } else {
            set({ isShuffled: false });
          }
        },

        cycleRepeat() {
          const modes: PlayerState["repeatMode"][] = ["none", "all", "one"];
          const { repeatMode } = get();
          const next = modes[(modes.indexOf(repeatMode) + 1) % modes.length];
          set({ repeatMode: next });
        },

        addToQueue(track) {
          set(s => ({ queue: [...s.queue, track] }));
        },

        removeFromQueue(index) {
          set(s => {
            const queue = s.queue.filter((_, i) => i !== index);
            const queueIndex = index < s.queueIndex ? s.queueIndex - 1 : s.queueIndex;
            return { queue, queueIndex };
          });
        },

        clearQueue() {
          const { currentTrack } = get();
          set({ queue: currentTrack ? [currentTrack] : [], queueIndex: 0 });
        },

        jumpToIndex(index) {
          const { queue } = get();
          if (queue[index]) {
            set({ queueIndex: index, currentTrack: queue[index], isPlaying: true, progress: 0, currentTime: 0, isLoading: true });
          }
        },

        toggleQueue() { set(s => ({ isQueueOpen: !s.isQueueOpen })); },

        setProgress(progress)   { set({ progress }); },
        setDuration(duration)   { set({ duration }); },
        setCurrentTime(time)    { set({ currentTime: time, progress: get().duration ? time / get().duration : 0 }); },
        setLoading(loading)     { set({ isLoading: loading }); },
      }),
      {
        name: "soundwave-player",
        partialize: (state) => ({
          volume:     state.volume,
          isMuted:    state.isMuted,
          repeatMode: state.repeatMode,
          isShuffled: state.isShuffled,
        }),
      }
    ),
    { name: "PlayerStore" }
  )
);
