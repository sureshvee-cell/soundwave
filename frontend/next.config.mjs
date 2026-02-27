/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.soundwave.app" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "i.scdn.co" },
      // Vercel Blob CDN
      { protocol: "https", hostname: "**.public.blob.vercel-storage.com" },
    ],
  },
  // NOTE: No rewrites() — all /api/* routes are Next.js Route Handlers
  // (the old Express proxy has been removed for Vercel deployment)
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
};

export default nextConfig;
