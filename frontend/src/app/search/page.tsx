"use client";

import { Suspense, useState, useEffect } from "react";
import Image  from "next/image";
import Link   from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, X, Music2, Disc, Mic2, ListMusic } from "lucide-react";
import { motion } from "framer-motion";
import { AlbumCard } from "@/components/Album/AlbumCard";
import { TrackList } from "@/components/Track/TrackList";
import { mockAlbums, mockArtists, mockTracks, mockGenres } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const FILTER_TABS = [
  { id: "all",     label: "All",     icon: Search },
  { id: "tracks",  label: "Tracks",  icon: Music2 },
  { id: "albums",  label: "Albums",  icon: Disc },
  { id: "artists", label: "Artists", icon: Mic2 },
] as const;

type Filter = (typeof FILTER_TABS)[number]["id"];

function SearchContent() {
  const params = useSearchParams();
  const [query,  setQuery]  = useState(params.get("q") || "");
  const [filter, setFilter] = useState<Filter>("all");

  // Debounced search results from mock data
  const q = query.toLowerCase().trim();
  const matchedTracks  = q ? mockTracks.filter(t  => t.title.toLowerCase().includes(q) || t.artist.name.toLowerCase().includes(q)) : [];
  const matchedAlbums  = q ? mockAlbums.filter(a  => a.title.toLowerCase().includes(q) || a.artist.name.toLowerCase().includes(q)) : [];
  const matchedArtists = q ? mockArtists.filter(a => a.name.toLowerCase().includes(q) || a.genres.some(g => g.toLowerCase().includes(q))) : [];

  const hasResults = matchedTracks.length > 0 || matchedAlbums.length > 0 || matchedArtists.length > 0;

  return (
    <div className="min-h-full px-4 md:px-8 py-6">
      {/* Search input */}
      <div className="max-w-xl mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-content-muted" />
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="What do you want to listen to?"
            autoFocus
            className={cn(
              "w-full pl-12 pr-10 py-3.5 bg-surface-overlay border border-surface-border rounded-2xl",
              "text-content-primary placeholder:text-content-muted text-base",
              "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
            )}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 btn-icon w-7 h-7"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {q && hasResults ? (
        <div>
          {/* Filter tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
            {FILTER_TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setFilter(id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all flex-shrink-0",
                  filter === id
                    ? "bg-brand-600 text-white shadow-glow-brand"
                    : "bg-surface-overlay border border-surface-border text-content-secondary hover:text-content-primary hover:border-brand-700"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          <div className="space-y-10">
            {/* Tracks */}
            {(filter === "all" || filter === "tracks") && matchedTracks.length > 0 && (
              <section className="animate-fade-in">
                <h2 className="text-lg font-bold text-content-primary mb-4">Tracks</h2>
                <div className="surface-raised p-2">
                  <TrackList tracks={matchedTracks.slice(0, 8)} showAlbum />
                </div>
              </section>
            )}

            {/* Albums */}
            {(filter === "all" || filter === "albums") && matchedAlbums.length > 0 && (
              <section className="animate-fade-in">
                <h2 className="text-lg font-bold text-content-primary mb-4">Albums</h2>
                <div className="flex flex-wrap gap-4">
                  {matchedAlbums.slice(0, 6).map(album => (
                    <AlbumCard key={album.id} album={album} size="md" />
                  ))}
                </div>
              </section>
            )}

            {/* Artists */}
            {(filter === "all" || filter === "artists") && matchedArtists.length > 0 && (
              <section className="animate-fade-in">
                <h2 className="text-lg font-bold text-content-primary mb-4">Artists</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
                  {matchedArtists.map(artist => (
                    <Link key={artist.id} href={`/artist/${artist.slug}`}>
                      <motion.div whileHover={{ y: -4 }} className="group text-center">
                        <div className="w-full aspect-square rounded-full overflow-hidden mb-3 ring-2 ring-surface-border group-hover:ring-brand-600 transition-all">
                          <Image src={artist.avatarUrl!} alt={artist.name} width={160} height={160} className="w-full h-full object-cover" />
                        </div>
                        <p className="text-sm font-semibold text-content-primary truncate">{artist.name}</p>
                        <p className="text-xs text-content-muted">{artist.genres[0]}</p>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      ) : q ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-3xl bg-surface-overlay flex items-center justify-center mx-auto mb-4">
            <Search className="w-9 h-9 text-content-muted" />
          </div>
          <h2 className="text-xl font-bold text-content-primary">No results for &ldquo;{query}&rdquo;</h2>
          <p className="text-content-muted mt-2 text-sm">Try different keywords or check the spelling</p>
        </div>
      ) : (
        // Browse genres when no query
        <div>
          <h2 className="text-xl font-bold text-content-primary mb-6">Browse Genres</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
            {mockGenres.map(genre => (
              <Link
                key={genre.id}
                href={`/search?q=${genre.slug}`}
                className="relative rounded-2xl overflow-hidden aspect-[4/2.5] group"
              >
                <Image
                  src={genre.imageUrl}
                  alt={genre.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div
                  className="absolute inset-0 opacity-80"
                  style={{ background: `linear-gradient(135deg, ${genre.color}cc 0%, ${genre.color}44 100%)` }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-base">
                  {genre.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}
