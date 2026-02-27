// ─── Core Domain Types ───────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  role: "listener" | "artist" | "admin";
  subscription?: Subscription;
  createdAt: string;
}

export interface Artist {
  id: string;
  userId: string;
  name: string;
  slug: string;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  genres: string[];
  verified: boolean;
  monthlyListeners: number;
  followerCount: number;
  isFollowing?: boolean;
  albums: Album[];
  popularTracks: Track[];
  socialLinks?: {
    website?: string;
    twitter?: string;
    instagram?: string;
  };
  createdAt: string;
}

export interface Album {
  id: string;
  artistId: string;
  artist: Pick<Artist, "id" | "name" | "slug" | "verified">;
  title: string;
  slug: string;
  coverUrl: string;
  description?: string;
  releaseDate: string;
  genres: string[];
  type: "album" | "single" | "ep";
  isPremium: boolean;
  isPublished: boolean;
  totalDuration: number; // seconds
  trackCount: number;
  playCount: number;
  likeCount: number;
  isLiked?: boolean;
  tracks?: Track[];
  createdAt: string;
}

export interface Track {
  id: string;
  albumId: string;
  album: Pick<Album, "id" | "title" | "coverUrl">;
  artistId: string;
  artist: Pick<Artist, "id" | "name" | "slug">;
  title: string;
  slug: string;
  audioUrl: string;
  previewUrl?: string; // 30-second preview for free users
  duration: number; // seconds
  trackNumber: number;
  discNumber: number;
  genre?: string;
  bpm?: number;
  key?: string;
  lyrics?: string;
  isPremium: boolean;
  isExplicit: boolean;
  playCount: number;
  likeCount: number;
  isLiked?: boolean;
  createdAt: string;
}

// ─── Subscription & Payments ─────────────────────────────────────────────────

export type SubscriptionTier = "free" | "premium" | "family" | "student";
export type SubscriptionStatus = "active" | "canceled" | "past_due" | "trialing";

export interface SubscriptionPlan {
  id: string;
  tier: SubscriptionTier;
  name: string;
  description: string;
  price: number; // cents
  currency: string;
  interval: "month" | "year";
  features: string[];
  stripePriceId: string;
  popular?: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  plan: SubscriptionPlan;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId: string;
  createdAt: string;
}

// ─── Player ──────────────────────────────────────────────────────────────────

export interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  queueIndex: number;
  isPlaying: boolean;
  isLoading: boolean;
  progress: number; // 0-1
  duration: number; // seconds
  currentTime: number; // seconds
  volume: number; // 0-1
  isMuted: boolean;
  isShuffled: boolean;
  repeatMode: "none" | "one" | "all";
  isQueueOpen: boolean;
}

// ─── Library ─────────────────────────────────────────────────────────────────

export interface Playlist {
  id: string;
  userId: string;
  name: string;
  description?: string;
  coverUrl?: string;
  isPublic: boolean;
  trackCount: number;
  totalDuration: number;
  tracks?: Track[];
  createdAt: string;
}

export interface RecentlyPlayed {
  id: string;
  userId: string;
  track: Track;
  playedAt: string;
}

export interface LibraryItem {
  type: "album" | "playlist" | "artist";
  item: Album | Playlist | Artist;
  addedAt: string;
}

// ─── Discovery / Home ─────────────────────────────────────────────────────────

export interface FeaturedBanner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  gradientFrom: string;
  gradientTo: string;
  link: string;
  cta: string;
}

export interface Genre {
  id: string;
  name: string;
  slug: string;
  color: string;
  imageUrl: string;
}

export interface ChartEntry {
  rank: number;
  track: Track;
  change: "up" | "down" | "new" | "same";
  changeAmount?: number;
}

// ─── API Responses ────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface SearchResults {
  tracks: Track[];
  albums: Album[];
  artists: Artist[];
  playlists: Playlist[];
}

// ─── Artist Dashboard ─────────────────────────────────────────────────────────

export interface ArtistStats {
  totalStreams: number;
  monthlyListeners: number;
  followers: number;
  totalRevenue: number; // cents
  topTracks: (Track & { streams: number; revenue: number })[];
  streamsByDay: { date: string; streams: number }[];
  revenueByMonth: { month: string; revenue: number }[];
  listenersByCountry: { country: string; count: number }[];
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  username: string;
  displayName: string;
  role?: "listener" | "artist";
}
