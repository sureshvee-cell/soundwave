"use client";

import Link            from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Library, TrendingUp, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlayerStore } from "@/context/player-store";

const NAV = [
  { href: "/",         icon: Home,       label: "Home" },
  { href: "/search",   icon: Search,     label: "Search" },
  { href: "/trending", icon: TrendingUp, label: "Trending" },
  { href: "/library",  icon: Library,    label: "Library" },
  { href: "/profile",  icon: User,       label: "Profile" },
];

export function MobileNav() {
  const pathname     = usePathname();
  const currentTrack = usePlayerStore(s => s.currentTrack);

  return (
    <nav className={cn(
      "md:hidden fixed bottom-0 left-0 right-0 z-50",
      "bg-surface-raised/95 backdrop-blur-xl border-t border-surface-border",
      "safe-area-inset-bottom",
      currentTrack && "bottom-[88px]"
    )}>
      <div className="flex items-center justify-around h-14 px-2">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-1 rounded-xl",
                "transition-all duration-150 min-w-0",
                active ? "text-brand-400" : "text-content-muted"
              )}
            >
              <Icon className={cn("w-5 h-5 flex-shrink-0", active && "scale-110")} />
              <span className="text-[10px] font-medium truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
