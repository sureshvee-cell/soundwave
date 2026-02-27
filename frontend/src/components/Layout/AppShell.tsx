"use client";

import { type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar }     from "./Sidebar";
import { TopNav }      from "./TopNav";
import { MobileNav }   from "./MobileNav";
import { MusicPlayer } from "../Player/MusicPlayer";
import { PlayerQueue } from "../Player/PlayerQueue";
import { usePlayerStore } from "@/context/player-store";
import { cn } from "@/lib/utils";

const FULL_SCREEN_ROUTES = ["/login", "/register"];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname      = usePathname();
  const isQueueOpen   = usePlayerStore(s => s.isQueueOpen);
  const currentTrack  = usePlayerStore(s => s.currentTrack);

  const isFullScreen = FULL_SCREEN_ROUTES.some(r => pathname.startsWith(r));

  if (isFullScreen) {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center">
        {children}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-surface-base overflow-hidden">
      {/* Sidebar — hidden on mobile */}
      <Sidebar className="hidden md:flex" />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top navigation */}
        <TopNav />

        {/* Scrollable page content */}
        <main
          className={cn(
            "flex-1 overflow-y-auto overflow-x-hidden",
            "scroll-smooth",
            currentTrack && "pb-[88px] md:pb-0"
          )}
          id="main-content"
        >
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>

      {/* Queue panel (slides in from right) */}
      {isQueueOpen && <PlayerQueue />}

      {/* Persistent music player at bottom */}
      {currentTrack && <MusicPlayer />}

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  );
}
