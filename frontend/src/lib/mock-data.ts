import type { Album, Artist, Track, Genre, SubscriptionPlan, FeaturedBanner, ChartEntry } from "@/types";

// ─── Artists ─────────────────────────────────────────────────────────────────

export const mockArtists: Artist[] = [
  {
    id: "a1", userId: "u1", name: "Luna Waves", slug: "luna-waves",
    bio: "Ethereal electronic pop artist blending ambient soundscapes with driving beats. Luna Waves crafts immersive sonic journeys that transport listeners to otherworldly landscapes.",
    avatarUrl: "https://picsum.photos/seed/luna/400/400",
    bannerUrl: "https://picsum.photos/seed/luna-banner/1400/400",
    genres: ["Electronic", "Ambient", "Pop"], verified: true,
    monthlyListeners: 4_250_000, followerCount: 890_000,
    albums: [], popularTracks: [], createdAt: "2021-03-15",
  },
  {
    id: "a2", userId: "u2", name: "The Midnight Shift", slug: "midnight-shift",
    bio: "Indie rock collective from Austin, TX. Raw, authentic, and unapologetically loud.",
    avatarUrl: "https://picsum.photos/seed/midnight/400/400",
    bannerUrl: "https://picsum.photos/seed/midnight-banner/1400/400",
    genres: ["Indie Rock", "Alternative"], verified: true,
    monthlyListeners: 2_100_000, followerCount: 540_000,
    albums: [], popularTracks: [], createdAt: "2019-07-20",
  },
  {
    id: "a3", userId: "u3", name: "Neon Citadel", slug: "neon-citadel",
    bio: "Synth-pop duo creating neon-soaked anthems for late-night drives.",
    avatarUrl: "https://picsum.photos/seed/neon/400/400",
    bannerUrl: "https://picsum.photos/seed/neon-banner/1400/400",
    genres: ["Synth-pop", "Electronic"], verified: false,
    monthlyListeners: 780_000, followerCount: 195_000,
    albums: [], popularTracks: [], createdAt: "2022-01-10",
  },
  {
    id: "a4", userId: "u4", name: "Iris Soleil", slug: "iris-soleil",
    bio: "Singer-songwriter weaving folk and jazz into intimate portraits of human connection.",
    avatarUrl: "https://picsum.photos/seed/iris/400/400",
    bannerUrl: "https://picsum.photos/seed/iris-banner/1400/400",
    genres: ["Folk", "Jazz", "Singer-Songwriter"], verified: true,
    monthlyListeners: 1_400_000, followerCount: 320_000,
    albums: [], popularTracks: [], createdAt: "2020-05-08",
  },
];

// ─── Tracks ───────────────────────────────────────────────────────────────────

export const mockTracks: Track[] = [
  { id: "t1", albumId: "al1", album: { id: "al1", title: "Starfall", coverUrl: "https://picsum.photos/seed/starfall/400/400" }, artistId: "a1", artist: { id: "a1", name: "Luna Waves", slug: "luna-waves" }, title: "Northern Lights", slug: "northern-lights", audioUrl: "/mock/audio.mp3", previewUrl: "/mock/preview.mp3", duration: 247, trackNumber: 1, discNumber: 1, genre: "Electronic", bpm: 128, key: "Am", isPremium: false, isExplicit: false, playCount: 12_400_000, likeCount: 890_000, isLiked: true, createdAt: "2023-06-01" },
  { id: "t2", albumId: "al1", album: { id: "al1", title: "Starfall", coverUrl: "https://picsum.photos/seed/starfall/400/400" }, artistId: "a1", artist: { id: "a1", name: "Luna Waves", slug: "luna-waves" }, title: "Aurora Drift", slug: "aurora-drift", audioUrl: "/mock/audio.mp3", duration: 312, trackNumber: 2, discNumber: 1, genre: "Electronic", bpm: 120, isPremium: true, isExplicit: false, playCount: 8_200_000, likeCount: 560_000, createdAt: "2023-06-01" },
  { id: "t3", albumId: "al1", album: { id: "al1", title: "Starfall", coverUrl: "https://picsum.photos/seed/starfall/400/400" }, artistId: "a1", artist: { id: "a1", name: "Luna Waves", slug: "luna-waves" }, title: "Celestial Tide", slug: "celestial-tide", audioUrl: "/mock/audio.mp3", duration: 198, trackNumber: 3, discNumber: 1, genre: "Ambient", bpm: 90, isPremium: false, isExplicit: false, playCount: 5_600_000, likeCount: 340_000, createdAt: "2023-06-01" },
  { id: "t4", albumId: "al2", album: { id: "al2", title: "Voltage", coverUrl: "https://picsum.photos/seed/voltage/400/400" }, artistId: "a2", artist: { id: "a2", name: "The Midnight Shift", slug: "midnight-shift" }, title: "Broken Signal", slug: "broken-signal", audioUrl: "/mock/audio.mp3", duration: 223, trackNumber: 1, discNumber: 1, genre: "Indie Rock", bpm: 142, isPremium: false, isExplicit: true, playCount: 9_800_000, likeCount: 720_000, isLiked: false, createdAt: "2023-04-12" },
  { id: "t5", albumId: "al2", album: { id: "al2", title: "Voltage", coverUrl: "https://picsum.photos/seed/voltage/400/400" }, artistId: "a2", artist: { id: "a2", name: "The Midnight Shift", slug: "midnight-shift" }, title: "Glass City", slug: "glass-city", audioUrl: "/mock/audio.mp3", duration: 274, trackNumber: 2, discNumber: 1, genre: "Indie Rock", bpm: 135, isPremium: true, isExplicit: false, playCount: 6_300_000, likeCount: 480_000, createdAt: "2023-04-12" },
  { id: "t6", albumId: "al3", album: { id: "al3", title: "Neon Dreams", coverUrl: "https://picsum.photos/seed/neondreams/400/400" }, artistId: "a3", artist: { id: "a3", name: "Neon Citadel", slug: "neon-citadel" }, title: "Chrome Highway", slug: "chrome-highway", audioUrl: "/mock/audio.mp3", duration: 261, trackNumber: 1, discNumber: 1, genre: "Synth-pop", bpm: 118, isPremium: false, isExplicit: false, playCount: 3_400_000, likeCount: 210_000, createdAt: "2023-08-30" },
  { id: "t7", albumId: "al4", album: { id: "al4", title: "Still Waters", coverUrl: "https://picsum.photos/seed/stillwaters/400/400" }, artistId: "a4", artist: { id: "a4", name: "Iris Soleil", slug: "iris-soleil" }, title: "Morning Fog", slug: "morning-fog", audioUrl: "/mock/audio.mp3", duration: 189, trackNumber: 1, discNumber: 1, genre: "Folk", bpm: 74, isPremium: false, isExplicit: false, playCount: 7_100_000, likeCount: 540_000, isLiked: true, createdAt: "2022-11-15" },
  { id: "t8", albumId: "al4", album: { id: "al4", title: "Still Waters", coverUrl: "https://picsum.photos/seed/stillwaters/400/400" }, artistId: "a4", artist: { id: "a4", name: "Iris Soleil", slug: "iris-soleil" }, title: "River Bend", slug: "river-bend", audioUrl: "/mock/audio.mp3", duration: 232, trackNumber: 2, discNumber: 1, genre: "Folk", bpm: 80, isPremium: true, isExplicit: false, playCount: 4_500_000, likeCount: 290_000, createdAt: "2022-11-15" },
];

// ─── Albums ───────────────────────────────────────────────────────────────────

export const mockAlbums: Album[] = [
  { id: "al1", artistId: "a1", artist: { id: "a1", name: "Luna Waves", slug: "luna-waves", verified: true }, title: "Starfall", slug: "starfall", coverUrl: "https://picsum.photos/seed/starfall/400/400", description: "Luna Waves' debut album is a breathtaking journey through cosmic soundscapes.", releaseDate: "2023-06-01", genres: ["Electronic", "Ambient"], type: "album", isPremium: false, isPublished: true, totalDuration: 2847, trackCount: 10, playCount: 42_000_000, likeCount: 3_200_000, isLiked: true, tracks: mockTracks.filter(t => t.albumId === "al1"), createdAt: "2023-06-01" },
  { id: "al2", artistId: "a2", artist: { id: "a2", name: "The Midnight Shift", slug: "midnight-shift", verified: true }, title: "Voltage", slug: "voltage", coverUrl: "https://picsum.photos/seed/voltage/400/400", description: "An electrifying collection of indie rock anthems.", releaseDate: "2023-04-12", genres: ["Indie Rock", "Alternative"], type: "album", isPremium: false, isPublished: true, totalDuration: 3124, trackCount: 12, playCount: 28_000_000, likeCount: 1_900_000, isLiked: false, tracks: mockTracks.filter(t => t.albumId === "al2"), createdAt: "2023-04-12" },
  { id: "al3", artistId: "a3", artist: { id: "a3", name: "Neon Citadel", slug: "neon-citadel", verified: false }, title: "Neon Dreams", slug: "neon-dreams", coverUrl: "https://picsum.photos/seed/neondreams/400/400", description: "Retro-futuristic synth-pop for the modern age.", releaseDate: "2023-08-30", genres: ["Synth-pop"], type: "ep", isPremium: false, isPublished: true, totalDuration: 1560, trackCount: 6, playCount: 8_400_000, likeCount: 590_000, isLiked: false, tracks: mockTracks.filter(t => t.albumId === "al3"), createdAt: "2023-08-30" },
  { id: "al4", artistId: "a4", artist: { id: "a4", name: "Iris Soleil", slug: "iris-soleil", verified: true }, title: "Still Waters", slug: "still-waters", coverUrl: "https://picsum.photos/seed/stillwaters/400/400", description: "Delicate folk songs that find beauty in quiet moments.", releaseDate: "2022-11-15", genres: ["Folk", "Jazz"], type: "album", isPremium: false, isPublished: true, totalDuration: 2980, trackCount: 11, playCount: 19_000_000, likeCount: 1_400_000, isLiked: true, tracks: mockTracks.filter(t => t.albumId === "al4"), createdAt: "2022-11-15" },
  { id: "al5", artistId: "a1", artist: { id: "a1", name: "Luna Waves", slug: "luna-waves", verified: true }, title: "Void Garden", slug: "void-garden", coverUrl: "https://picsum.photos/seed/voidgarden/400/400", description: "Luna Waves ventures deeper into experimental ambient territory.", releaseDate: "2024-01-20", genres: ["Ambient", "Experimental"], type: "album", isPremium: true, isPublished: true, totalDuration: 3600, trackCount: 9, playCount: 15_000_000, likeCount: 980_000, isLiked: false, tracks: [], createdAt: "2024-01-20" },
  { id: "al6", artistId: "a2", artist: { id: "a2", name: "The Midnight Shift", slug: "midnight-shift", verified: true }, title: "Overload (Single)", slug: "overload", coverUrl: "https://picsum.photos/seed/overload/400/400", releaseDate: "2024-02-14", genres: ["Indie Rock"], type: "single", isPremium: false, isPublished: true, totalDuration: 245, trackCount: 1, playCount: 5_200_000, likeCount: 380_000, isLiked: false, tracks: [], createdAt: "2024-02-14" },
];

// ─── Genres ───────────────────────────────────────────────────────────────────

export const mockGenres: Genre[] = [
  { id: "g1",  name: "Electronic",       slug: "electronic",       color: "#7c3aed", imageUrl: "https://picsum.photos/seed/electronic/300/200" },
  { id: "g2",  name: "Indie Rock",        slug: "indie-rock",        color: "#ec4899", imageUrl: "https://picsum.photos/seed/indierock/300/200" },
  { id: "g3",  name: "Hip Hop",           slug: "hip-hop",           color: "#f59e0b", imageUrl: "https://picsum.photos/seed/hiphop/300/200" },
  { id: "g4",  name: "Folk",              slug: "folk",              color: "#10b981", imageUrl: "https://picsum.photos/seed/folk/300/200" },
  { id: "g5",  name: "Jazz",              slug: "jazz",              color: "#06b6d4", imageUrl: "https://picsum.photos/seed/jazz/300/200" },
  { id: "g6",  name: "Ambient",           slug: "ambient",           color: "#6366f1", imageUrl: "https://picsum.photos/seed/ambient/300/200" },
  { id: "g7",  name: "Synth-pop",         slug: "synth-pop",         color: "#ef4444", imageUrl: "https://picsum.photos/seed/synthpop/300/200" },
  { id: "g8",  name: "R&B",               slug: "rnb",               color: "#d946ef", imageUrl: "https://picsum.photos/seed/rnb/300/200" },
  { id: "g9",  name: "Classical",         slug: "classical",         color: "#84cc16", imageUrl: "https://picsum.photos/seed/classical/300/200" },
  { id: "g10", name: "Metal",             slug: "metal",             color: "#64748b", imageUrl: "https://picsum.photos/seed/metal/300/200" },
];

// ─── Subscription Plans ────────────────────────────────────────────────────────

export const mockPlans: SubscriptionPlan[] = [
  {
    id: "plan_free", tier: "free", name: "Free",
    description: "Explore music with limited access",
    price: 0, currency: "USD", interval: "month",
    features: ["30-second track previews", "Browse all albums & artists", "Limited shuffle playback", "Standard audio quality"],
    stripePriceId: "",
  },
  {
    id: "plan_premium_monthly", tier: "premium", name: "Premium",
    description: "Full unlimited access to all music",
    price: 999, currency: "USD", interval: "month", popular: true,
    features: ["Full track playback", "Offline downloads (mobile)", "High-quality audio (320kbps)", "Unlimited skips", "No ads ever", "Lyrics view", "Queue management"],
    stripePriceId: "price_premium_monthly",
  },
  {
    id: "plan_premium_annual", tier: "premium", name: "Premium Annual",
    description: "Save 2 months with annual billing",
    price: 9990, currency: "USD", interval: "year",
    features: ["Everything in Premium", "Save $19.90 vs monthly", "Priority support"],
    stripePriceId: "price_premium_annual",
  },
  {
    id: "plan_family", tier: "family", name: "Family",
    description: "Up to 6 accounts, one price",
    price: 1599, currency: "USD", interval: "month",
    features: ["6 Premium accounts", "Family Mix playlist", "Parental controls", "All Premium features"],
    stripePriceId: "price_family_monthly",
  },
  {
    id: "plan_student", tier: "student", name: "Student",
    description: "Verified students get Premium at half price",
    price: 499, currency: "USD", interval: "month",
    features: ["All Premium features", "Student verification required", "Annual renewal"],
    stripePriceId: "price_student_monthly",
  },
];

// ─── Featured Banners ─────────────────────────────────────────────────────────

export const mockFeatured: FeaturedBanner[] = [
  { id: "f1", title: "Starfall", subtitle: "Luna Waves · New Album", imageUrl: "https://picsum.photos/seed/starfall/800/450", gradientFrom: "#7c3aed", gradientTo: "#06b6d4", link: "/album/starfall", cta: "Listen Now" },
  { id: "f2", title: "Voltage", subtitle: "The Midnight Shift · Latest Release", imageUrl: "https://picsum.photos/seed/voltage/800/450", gradientFrom: "#ec4899", gradientTo: "#f59e0b", link: "/album/voltage", cta: "Play Album" },
  { id: "f3", title: "Still Waters", subtitle: "Iris Soleil · Folk & Jazz", imageUrl: "https://picsum.photos/seed/stillwaters/800/450", gradientFrom: "#10b981", gradientTo: "#06b6d4", link: "/album/still-waters", cta: "Discover" },
];

// ─── Charts ───────────────────────────────────────────────────────────────────

export const mockCharts: ChartEntry[] = mockTracks.map((track, i) => ({
  rank: i + 1,
  track,
  change: (["up", "down", "new", "same"] as const)[i % 4],
  changeAmount: i % 4 === 0 ? 2 : i % 4 === 1 ? 1 : undefined,
}));
