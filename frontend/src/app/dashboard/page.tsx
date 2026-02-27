"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Music, Upload, BarChart3, DollarSign, Users, TrendingUp,
  Plus, Eye, Edit3, Trash2, Globe, Lock, CheckCircle2,
  ArrowUpRight, ArrowDownRight, Play
} from "lucide-react";
import { motion } from "framer-motion";
import { mockAlbums, mockArtists } from "@/lib/mock-data";
import { formatCount, formatDuration, formatPrice, cn } from "@/lib/utils";

const TABS = [
  { id: "overview",  label: "Overview",    icon: BarChart3 },
  { id: "releases",  label: "My Releases",  icon: Music },
  { id: "analytics", label: "Analytics",   icon: TrendingUp },
  { id: "revenue",   label: "Revenue",     icon: DollarSign },
  { id: "upload",    label: "Upload",      icon: Upload },
] as const;

type Tab = (typeof TABS)[number]["id"];

// Mock stats
const STATS = [
  { label: "Total Streams",     value: "42.8M",  change: +12.4, icon: Play,        color: "#7c3aed" },
  { label: "Monthly Listeners", value: "4.25M",  change: +8.1,  icon: Users,       color: "#06b6d4" },
  { label: "Followers",         value: "890K",   change: +5.3,  icon: TrendingUp,  color: "#10b981" },
  { label: "Est. Revenue",      value: "$18,240", change: +22.7, icon: DollarSign,  color: "#f59e0b" },
];

const CHART_DATA = [
  { day: "Mon", streams: 820 }, { day: "Tue", streams: 1200 },
  { day: "Wed", streams: 950 },  { day: "Thu", streams: 1580 },
  { day: "Fri", streams: 2100 }, { day: "Sat", streams: 2800 },
  { day: "Sun", streams: 1900 },
];
const MAX_STREAMS = Math.max(...CHART_DATA.map(d => d.streams));

export default function DashboardPage() {
  const [tab, setTab]       = useState<Tab>("overview");
  const [dragging, setDrag] = useState(false);
  const artist              = mockArtists[0];
  const albums              = mockAlbums.filter(a => a.artistId === artist.id);

  return (
    <div className="min-h-full">
      {/* Header banner */}
      <div className="relative h-40 overflow-hidden">
        <Image
          src={artist.bannerUrl!}
          alt={artist.name}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-surface-base" />
        <div className="absolute bottom-5 left-6 flex items-end gap-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-brand-600 shadow-glow-brand">
            <Image src={artist.avatarUrl!} alt={artist.name} width={64} height={64} className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">{artist.name}</h1>
              <CheckCircle2 className="w-4 h-4 text-brand-400" />
            </div>
            <p className="text-sm text-white/60">{formatCount(artist.monthlyListeners)} monthly listeners</p>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="px-6 border-b border-surface-border sticky top-16 bg-surface-base/95 backdrop-blur-xl z-30">
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap",
                tab === id
                  ? "border-brand-500 text-brand-300"
                  : "border-transparent text-content-secondary hover:text-content-primary"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 md:px-8 py-8">

        {/* ── OVERVIEW TAB ───────────────────────────────────────────────── */}
        {tab === "overview" && (
          <div className="space-y-8 animate-fade-in">
            {/* Stat cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              {STATS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="surface-raised p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${stat.color}20` }}>
                      <stat.icon className="w-4.5 h-4.5" style={{ color: stat.color }} />
                    </div>
                    <div className={cn("flex items-center gap-1 text-xs font-medium", stat.change >= 0 ? "text-emerald-400" : "text-red-400")}>
                      {stat.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {Math.abs(stat.change)}%
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-content-primary">{stat.value}</p>
                  <p className="text-xs text-content-muted mt-0.5">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Streams chart */}
            <div className="surface-raised p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-bold text-content-primary">Streams This Week</h2>
                <select className="text-xs bg-surface-overlay border border-surface-border rounded-lg px-3 py-1.5 text-content-secondary">
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                </select>
              </div>
              <div className="flex items-end gap-3 h-40">
                {CHART_DATA.map(({ day, streams }, i) => (
                  <div key={day} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-[10px] text-content-muted tabular-nums">{(streams/1000).toFixed(1)}k</span>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(streams / MAX_STREAMS) * 100}%` }}
                      transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 25 }}
                      className="w-full rounded-t-lg"
                      style={{ background: `linear-gradient(to top, #7c3aed, #ec4899)`, minHeight: 4 }}
                    />
                    <span className="text-[10px] text-content-muted">{day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top tracks */}
            <div className="surface-raised p-6">
              <h2 className="text-base font-bold text-content-primary mb-4">Top Tracks</h2>
              <div className="space-y-3">
                {[
                  { title: "Northern Lights", streams: "12.4M", revenue: "$4,220" },
                  { title: "Aurora Drift",    streams: "8.2M",  revenue: "$2,790" },
                  { title: "Celestial Tide",  streams: "5.6M",  revenue: "$1,904" },
                ].map((t, i) => (
                  <div key={t.title} className="flex items-center gap-4">
                    <span className="text-content-muted text-sm w-4 tabular-nums">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-content-primary">{t.title}</p>
                      <div className="mt-1 h-1.5 bg-surface-border rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-brand"
                          style={{ width: `${100 - i * 28}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-content-muted tabular-nums">{t.streams}</span>
                    <span className="text-xs text-emerald-400 tabular-nums">{t.revenue}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── RELEASES TAB ───────────────────────────────────────────────── */}
        {tab === "releases" && (
          <div className="animate-fade-in space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-content-primary">My Releases ({albums.length})</h2>
              <button
                onClick={() => setTab("upload")}
                className="btn-primary text-sm px-4 py-2"
              >
                <Plus className="w-3.5 h-3.5" />
                New Release
              </button>
            </div>

            {albums.map(album => (
              <div key={album.id} className="surface-raised p-4 flex items-center gap-4 group">
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                  <Image src={album.coverUrl} alt={album.title} width={56} height={56} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-content-primary">{album.title}</p>
                    <span className={cn("badge text-[10px]", album.isPublished ? "badge-new" : "badge-free")}>
                      {album.isPublished ? "Published" : "Draft"}
                    </span>
                    {album.isPremium && <span className="badge badge-premium text-[10px]">Premium</span>}
                    <span className="badge badge-free text-[10px] capitalize">{album.type}</span>
                  </div>
                  <p className="text-xs text-content-muted mt-0.5">
                    {album.trackCount} tracks · {new Date(album.releaseDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </p>
                </div>
                <div className="hidden md:flex gap-6 text-center">
                  <div>
                    <p className="text-sm font-semibold text-content-primary">{formatCount(album.playCount)}</p>
                    <p className="text-[10px] text-content-muted">Streams</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-content-primary">{formatCount(album.likeCount)}</p>
                    <p className="text-[10px] text-content-muted">Likes</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="btn-icon"><Eye className="w-4 h-4" /></button>
                  <button className="btn-icon"><Edit3 className="w-4 h-4" /></button>
                  <button className="btn-icon hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── UPLOAD TAB ─────────────────────────────────────────────────── */}
        {tab === "upload" && (
          <div className="animate-fade-in max-w-2xl">
            <h2 className="text-lg font-bold text-content-primary mb-6">Upload New Release</h2>
            <form className="space-y-6" onSubmit={e => e.preventDefault()}>
              {/* Cover art */}
              <div>
                <label className="text-sm font-medium text-content-secondary block mb-2">Cover Art</label>
                <div
                  onDragOver={e => { e.preventDefault(); setDrag(true); }}
                  onDragLeave={() => setDrag(false)}
                  onDrop={e => { e.preventDefault(); setDrag(false); }}
                  className={cn(
                    "border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer",
                    dragging ? "border-brand-500 bg-brand-900/20" : "border-surface-border hover:border-brand-700 hover:bg-surface-overlay"
                  )}
                >
                  <Upload className="w-8 h-8 text-content-muted mx-auto mb-2" />
                  <p className="text-sm font-medium text-content-primary">Drag & drop or click to upload</p>
                  <p className="text-xs text-content-muted mt-1">PNG or JPG · Min 3000×3000px · Max 10MB</p>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-content-secondary block mb-2">Album Title *</label>
                  <input type="text" placeholder="Enter album title" className="input" />
                </div>
                <div>
                  <label className="text-sm font-medium text-content-secondary block mb-2">Release Type</label>
                  <select className="input">
                    <option value="album">Album</option>
                    <option value="single">Single</option>
                    <option value="ep">EP</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-content-secondary block mb-2">Release Date</label>
                  <input type="date" className="input" />
                </div>
                <div>
                  <label className="text-sm font-medium text-content-secondary block mb-2">Genre</label>
                  <select className="input">
                    <option>Electronic</option>
                    <option>Indie Rock</option>
                    <option>Hip Hop</option>
                    <option>Folk</option>
                    <option>Jazz</option>
                    <option>Pop</option>
                    <option>R&B</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-content-secondary block mb-2">Description</label>
                <textarea rows={3} placeholder="Tell listeners about this release…" className="input resize-none" />
              </div>

              {/* Tracks */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-content-secondary">Tracks</label>
                  <button type="button" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add Track
                  </button>
                </div>
                <div
                  className="border-2 border-dashed border-surface-border rounded-xl p-8 text-center hover:border-brand-700 transition-colors cursor-pointer"
                >
                  <Upload className="w-6 h-6 text-content-muted mx-auto mb-2" />
                  <p className="text-sm text-content-secondary">Drop audio files here</p>
                  <p className="text-xs text-content-muted mt-1">MP3, FLAC, WAV · Max 500MB per track</p>
                </div>
              </div>

              {/* Visibility */}
              <div className="surface-raised p-4">
                <p className="text-sm font-medium text-content-secondary mb-3">Visibility & Pricing</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "free", icon: Globe, label: "Free", desc: "Available to all users" },
                    { value: "premium", icon: Lock, label: "Premium Only", desc: "Subscribers only" },
                  ].map(({ value, icon: Icon, label, desc }) => (
                    <label key={value} className="flex items-start gap-3 p-3 rounded-xl border border-surface-border hover:border-brand-700 cursor-pointer transition-colors">
                      <input type="radio" name="visibility" value={value} className="mt-0.5 accent-brand-600" defaultChecked={value === "free"} />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Icon className="w-3.5 h-3.5 text-content-muted" />
                          <span className="text-sm font-medium text-content-primary">{label}</span>
                        </div>
                        <p className="text-xs text-content-muted mt-0.5">{desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3">
                <button type="button" className="btn-secondary flex-1">Save as Draft</button>
                <button type="submit" className="btn-primary flex-1">
                  <Globe className="w-4 h-4" />
                  Publish Now
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── ANALYTICS TAB ─────────────────────────────────────────────── */}
        {tab === "analytics" && (
          <div className="animate-fade-in space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Listeners by country */}
              <div className="surface-raised p-6">
                <h3 className="text-sm font-bold text-content-primary mb-4">Top Countries</h3>
                {[
                  { country: "United States", pct: 34, listeners: "1.44M" },
                  { country: "United Kingdom", pct: 18, listeners: "765K" },
                  { country: "Germany",         pct: 12, listeners: "510K" },
                  { country: "Australia",       pct: 8,  listeners: "340K" },
                  { country: "Canada",          pct: 7,  listeners: "297K" },
                ].map(row => (
                  <div key={row.country} className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-content-secondary">{row.country}</span>
                      <span className="text-content-muted">{row.listeners}</span>
                    </div>
                    <div className="h-1.5 bg-surface-border rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${row.pct}%`, background: "linear-gradient(90deg, #7c3aed, #ec4899)" }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Audience breakdown */}
              <div className="surface-raised p-6">
                <h3 className="text-sm font-bold text-content-primary mb-4">Audience Breakdown</h3>
                {[
                  { label: "18–24",   pct: 38, color: "#7c3aed" },
                  { label: "25–34",   pct: 31, color: "#ec4899" },
                  { label: "35–44",   pct: 17, color: "#06b6d4" },
                  { label: "45+",     pct: 14, color: "#10b981" },
                ].map(row => (
                  <div key={row.label} className="flex items-center gap-3 mb-3">
                    <span className="text-xs text-content-muted w-10">{row.label}</span>
                    <div className="flex-1 h-1.5 bg-surface-border rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${row.pct}%`, background: row.color }} />
                    </div>
                    <span className="text-xs text-content-secondary w-7 text-right">{row.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── REVENUE TAB ───────────────────────────────────────────────── */}
        {tab === "revenue" && (
          <div className="animate-fade-in space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "This Month",   value: "$4,820",  change: "+22.7%" },
                { label: "Last Month",   value: "$3,930",  change: "+14.2%" },
                { label: "Total Earned", value: "$48,240", change: "" },
              ].map(stat => (
                <div key={stat.label} className="surface-raised p-5">
                  <p className="text-content-muted text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-content-primary mt-1">{stat.value}</p>
                  {stat.change && <p className="text-xs text-emerald-400 mt-1">{stat.change} vs prev period</p>}
                </div>
              ))}
            </div>
            <div className="surface-raised p-6">
              <h3 className="text-sm font-bold text-content-primary mb-4">Revenue by Track</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[11px] text-content-muted uppercase tracking-wider border-b border-surface-border">
                    <th className="text-left pb-3">Track</th>
                    <th className="text-right pb-3">Streams</th>
                    <th className="text-right pb-3">Revenue</th>
                    <th className="text-right pb-3">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {[
                    { title: "Northern Lights", streams: "12.4M", revenue: "$4,220", rate: "$0.0034" },
                    { title: "Aurora Drift",    streams: "8.2M",  revenue: "$2,790", rate: "$0.0034" },
                    { title: "Celestial Tide",  streams: "5.6M",  revenue: "$1,904", rate: "$0.0034" },
                  ].map(row => (
                    <tr key={row.title} className="hover:bg-surface-hover">
                      <td className="py-3 text-content-primary font-medium">{row.title}</td>
                      <td className="py-3 text-right text-content-secondary tabular-nums">{row.streams}</td>
                      <td className="py-3 text-right text-emerald-400 font-semibold tabular-nums">{row.revenue}</td>
                      <td className="py-3 text-right text-content-muted tabular-nums">{row.rate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
