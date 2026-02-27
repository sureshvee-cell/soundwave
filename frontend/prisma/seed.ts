/**
 * Prisma Seed Script — populates Soundwave with demo data
 * Run: npx tsx prisma/seed.ts
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Soundwave database…");

  // ── Genres ──────────────────────────────────────────────────────────────────
  const genres = await Promise.all([
    { name: "Electronic",  slug: "electronic",  color: "#7c3aed" },
    { name: "Indie Rock",  slug: "indie-rock",  color: "#ec4899" },
    { name: "Hip Hop",     slug: "hip-hop",     color: "#f59e0b" },
    { name: "Folk",        slug: "folk",        color: "#10b981" },
    { name: "Jazz",        slug: "jazz",        color: "#06b6d4" },
    { name: "Ambient",     slug: "ambient",     color: "#6366f1" },
    { name: "Synth-pop",   slug: "synth-pop",   color: "#ef4444" },
    { name: "R&B",         slug: "rnb",         color: "#d946ef" },
    { name: "Pop",         slug: "pop",         color: "#f97316" },
    { name: "Classical",   slug: "classical",   color: "#84cc16" },
  ].map(g => prisma.genre.upsert({ where: { slug: g.slug }, update: {}, create: g })));

  console.log(`✅ Created ${genres.length} genres`);

  // ── Subscription Plans ───────────────────────────────────────────────────────
  const plans = [
    { tier: "PREMIUM" as const, name: "Premium",        description: "Full access",          price: 999,   currency: "usd", interval: "month", sortOrder: 1, stripePriceId: "price_premium_monthly",  features: JSON.stringify(["Full playback", "320kbps audio", "Offline mode", "No ads"]) },
    { tier: "PREMIUM" as const, name: "Premium Annual", description: "Save 2 months",        price: 9990,  currency: "usd", interval: "year",  sortOrder: 2, stripePriceId: "price_premium_annual",   features: JSON.stringify(["All Premium features", "Save $19.90/yr"]) },
    { tier: "FAMILY"  as const, name: "Family",         description: "6 premium accounts",   price: 1599,  currency: "usd", interval: "month", sortOrder: 3, stripePriceId: "price_family_monthly",   features: JSON.stringify(["6 accounts", "Family Mix", "Parental controls"]) },
    { tier: "STUDENT" as const, name: "Student",        description: "Half-price for students",price: 499, currency: "usd", interval: "month", sortOrder: 4, stripePriceId: "price_student_monthly",  features: JSON.stringify(["All Premium features", "Verified students only"]) },
  ];
  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({ where: { stripePriceId: plan.stripePriceId }, update: {}, create: plan });
  }
  console.log(`✅ Created ${plans.length} subscription plans`);

  // ── Demo Artist User ─────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("password123", 10);
  const artistUser   = await prisma.user.upsert({
    where: { email: "luna@soundwave.demo" },
    update: {},
    create: {
      email: "luna@soundwave.demo", username: "lunawaves", displayName: "Luna Waves",
      passwordHash, role: "ARTIST",
      subscription: { create: { tier: "PREMIUM", status: "ACTIVE" } },
      artist: {
        create: {
          name: "Luna Waves", slug: "luna-waves", verified: true,
          bio: "Ethereal electronic pop artist blending ambient soundscapes with driving beats.",
          avatarUrl: "https://picsum.photos/seed/luna/400/400",
          bannerUrl: "https://picsum.photos/seed/luna-banner/1400/400",
          monthlyListeners: 4_250_000,
          genres: { create: [
            { genreId: genres.find(g => g.slug === "electronic")!.id },
            { genreId: genres.find(g => g.slug === "ambient")!.id },
          ]},
        }
      },
    },
    include: { artist: true },
  });

  // ── Demo Listener User ───────────────────────────────────────────────────────
  await prisma.user.upsert({
    where: { email: "listener@soundwave.demo" },
    update: {},
    create: {
      email: "listener@soundwave.demo", username: "musiclover", displayName: "Music Lover",
      passwordHash, role: "LISTENER",
      subscription: { create: { tier: "FREE", status: "ACTIVE" } },
    },
  });

  // ── Demo Album ───────────────────────────────────────────────────────────────
  const artist = artistUser.artist!;
  const album  = await prisma.album.upsert({
    where: { artistId_slug: { artistId: artist.id, slug: "starfall" } },
    update: {},
    create: {
      artistId:    artist.id,
      title:       "Starfall",
      slug:        "starfall",
      coverUrl:    "https://picsum.photos/seed/starfall/400/400",
      description: "Luna Waves' debut album — a breathtaking journey through cosmic soundscapes.",
      releaseDate: new Date("2023-06-01"),
      type:        "ALBUM",
      isPublished: true,
      playCount:   42_000_000,
    },
  });

  // ── Demo Tracks ──────────────────────────────────────────────────────────────
  const trackData = [
    { title: "Northern Lights", duration: 247, trackNumber: 1 },
    { title: "Aurora Drift",    duration: 312, trackNumber: 2, isPremium: true },
    { title: "Celestial Tide",  duration: 198, trackNumber: 3 },
    { title: "Event Horizon",   duration: 284, trackNumber: 4 },
    { title: "Starfall",        duration: 421, trackNumber: 5 },
  ];

  for (const t of trackData) {
    const slug = t.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    await prisma.track.upsert({
      where: { albumId_slug: { albumId: album.id, slug } },
      update: {},
      create: {
        albumId:     album.id,
        artistId:    artist.id,
        title:       t.title,
        slug,
        audioUrl:    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        duration:    t.duration,
        trackNumber: t.trackNumber,
        isPremium:   t.isPremium ?? false,
        playCount:   Math.floor(Math.random() * 10_000_000),
      },
    });
  }

  console.log("✅ Created demo users, artist, album, and tracks");
  console.log("\n🎵 Demo credentials:");
  console.log("   Artist:   luna@soundwave.demo / password123");
  console.log("   Listener: listener@soundwave.demo / password123");
  console.log("\n✨ Seeding complete!");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
