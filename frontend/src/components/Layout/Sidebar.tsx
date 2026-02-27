"use client";

import Link         from "next/link";
import Image        from "next/image";
import { usePathname } from "next/navigation";
import {
  Home, Search, Library, Heart, PlusCircle,
  TrendingUp, Radio, Mic2, Settings, Crown,
  Music2, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { mockAlbums } from "@/lib/mock-data";

const NAV_ITEMS = [
  { href: "/",          icon: Home,       label: "Home" },
  { href: "/search",    icon: Search,     label: "Search" },
  { href: "/library",   icon: Library,    label: "Your Library" },
];

const DISCOVER_ITEMS = [
  { href: "/trending",  icon: TrendingUp, label: "Trending" },
  { href: "/radio",     icon: Radio,      label: "Radio" },
  { href: "/artists",   icon: Mic2,       label: "Artists" },
];

interface SidebarProps { className?: string; }

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { user }  = useAuth();
  const recentAlbums = mockAlbums.slice(0, 5);

  return (
    <aside className={cn(
      "w-60 flex-shrink-0 flex flex-col h-full bg-surface-raised border-r border-surface-border",
      className
    )}>
      {/* Logo */}
      <div className="px-6 py-5 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow-brand">
          <Music2 className="w-4 h-4 text-white" />
        </div>
        <span className="text-lg font-bold tracking-tight text-content-primary">Soundwave</span>
      </div>

      {/* Navigation */}
      <nav className="px-3 space-y-0.5">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
              pathname === href
                ? "bg-brand-900/50 text-brand-300"
                : "text-content-secondary hover:text-content-primary hover:bg-surface-hover"
            )}
          >
            <Icon className="w-4.5 h-4.5 flex-shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Divider */}
      <div className="mx-4 my-3 border-t border-surface-border" />

      {/* Discover */}
      <div className="px-4 mb-2">
        <p className="text-[11px] font-semibold text-content-muted uppercase tracking-wider mb-2 px-2">
          Discover
        </p>
        <nav className="space-y-0.5">
          {DISCOVER_ITEMS.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                pathname.startsWith(href)
                  ? "bg-brand-900/50 text-brand-300"
                  : "text-content-secondary hover:text-content-primary hover:bg-surface-hover"
              )}
            >
              <Icon className="w-4.5 h-4.5 flex-shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Divider */}
      <div className="mx-4 my-2 border-t border-surface-border" />

      {/* Library / Recents */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-4">
        <div className="flex items-center justify-between mb-2 px-2">
          <p className="text-[11px] font-semibold text-content-muted uppercase tracking-wider">
            Recent
          </p>
          <button className="p-0.5 rounded hover:bg-surface-hover text-content-muted hover:text-content-secondary transition-colors">
            <PlusCircle className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-0.5">
          {recentAlbums.map((album) => (
            <Link
              key={album.id}
              href={`/album/${album.slug}`}
              className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-surface-hover transition-colors group"
            >
              <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-surface-overlay">
                <Image
                  src={album.coverUrl}
                  alt={album.title}
                  width={36}
                  height={36}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-content-primary truncate leading-tight">
                  {album.title}
                </p>
                <p className="text-xs text-content-muted truncate">
                  {album.artist.name}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Liked Songs shortcut */}
        <Link
          href="/library?tab=liked"
          className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-surface-hover transition-colors mt-1"
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-700 to-pink-700 flex items-center justify-center flex-shrink-0">
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-content-primary">Liked Songs</p>
            <p className="text-xs text-content-muted">Playlist</p>
          </div>
        </Link>
      </div>

      {/* Bottom actions */}
      <div className="border-t border-surface-border p-3 space-y-1">
        {/* Premium upsell if free user */}
        {(!user || user.subscription?.tier === "free" || !user.subscription) && (
          <Link
            href="/subscribe"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-brand-900/60 to-pink-900/30
                       border border-brand-700/30 hover:from-brand-900/80 hover:to-pink-900/50 transition-all group"
          >
            <Crown className="w-4 h-4 text-amber-400" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-content-primary">Upgrade to Premium</p>
              <p className="text-[10px] text-content-muted">Unlimited music, no ads</p>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-content-muted group-hover:text-content-secondary transition-colors" />
          </Link>
        )}

        {/* Settings */}
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-content-secondary hover:text-content-primary hover:bg-surface-hover transition-colors text-sm"
        >
          <Settings className="w-4 h-4" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
