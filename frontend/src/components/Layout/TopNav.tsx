"use client";

import { useState, useRef } from "react";
import Link            from "next/link";
import Image           from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { Search, Bell, ChevronLeft, ChevronRight, User, LogOut, CreditCard, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

export function TopNav() {
  const router    = useRouter();
  const pathname  = usePathname();
  const { user, logout, isAuthenticated } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen]       = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Derive page title from pathname
  const pageTitle = pathname === "/"
    ? "Home"
    : pathname.startsWith("/search")   ? "Search"
    : pathname.startsWith("/library")  ? "Library"
    : pathname.startsWith("/trending") ? "Trending"
    : pathname.startsWith("/artists")  ? "Artists"
    : pathname.startsWith("/subscribe")? "Premium"
    : pathname.startsWith("/dashboard")? "Artist Dashboard"
    : null;

  return (
    <header className="h-16 flex-shrink-0 flex items-center gap-4 px-6 bg-surface-base/80 backdrop-blur-xl border-b border-surface-border sticky top-0 z-40">
      {/* Back / Forward navigation */}
      <div className="hidden md:flex items-center gap-1">
        <button
          onClick={() => router.back()}
          className="btn-icon"
          aria-label="Go back"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => router.forward()}
          className="btn-icon"
          aria-label="Go forward"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Artists, songs, albums…"
            className={cn(
              "w-full pl-10 pr-4 py-2 bg-surface-overlay rounded-full text-sm",
              "border border-surface-border focus:border-brand-500",
              "text-content-primary placeholder:text-content-muted",
              "focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition-all"
            )}
          />
        </div>
      </form>

      {/* Page title — only on mobile */}
      {pageTitle && (
        <h1 className="md:hidden flex-1 text-lg font-bold text-center text-content-primary">
          {pageTitle}
        </h1>
      )}

      <div className="flex items-center gap-2 ml-auto">
        {/* Notifications */}
        {isAuthenticated && (
          <button className="btn-icon relative">
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full" />
          </button>
        )}

        {/* User menu / Login */}
        {isAuthenticated && user ? (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-full hover:bg-surface-hover transition-colors"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-overlay flex-shrink-0 ring-2 ring-brand-600/50">
                {user.avatarUrl ? (
                  <Image src={user.avatarUrl} alt={user.displayName} width={32} height={32} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-brand flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{user.displayName[0].toUpperCase()}</span>
                  </div>
                )}
              </div>
              <span className="text-sm font-medium text-content-primary hidden md:block max-w-24 truncate">
                {user.displayName}
              </span>
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-56 surface-raised py-1 z-50"
                >
                  <div className="px-4 py-3 border-b border-surface-border">
                    <p className="text-sm font-semibold text-content-primary">{user.displayName}</p>
                    <p className="text-xs text-content-muted mt-0.5">{user.email}</p>
                  </div>

                  {user.role === "artist" && (
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-content-secondary hover:text-content-primary hover:bg-surface-hover transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Artist Dashboard
                    </Link>
                  )}

                  <Link
                    href="/library"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-content-secondary hover:text-content-primary hover:bg-surface-hover transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    Profile & Library
                  </Link>

                  <Link
                    href="/subscribe"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-content-secondary hover:text-content-primary hover:bg-surface-hover transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    <CreditCard className="w-4 h-4" />
                    Subscription
                  </Link>

                  <div className="border-t border-surface-border mt-1 pt-1">
                    <button
                      onClick={async () => { await logout(); setMenuOpen(false); }}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Log out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn-ghost text-sm px-4 py-2">
              Log in
            </Link>
            <Link href="/register" className="btn-primary text-sm px-5 py-2">
              Sign up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
