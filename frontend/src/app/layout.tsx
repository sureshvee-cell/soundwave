import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { QueryProvider } from "@/components/UI/QueryProvider";
import { Toaster } from "react-hot-toast";
import { AppShell } from "@/components/Layout/AppShell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Soundwave", template: "%s · Soundwave" },
  description: "The world's most immersive music experience. Discover, stream, and publish music.",
  keywords: ["music", "streaming", "albums", "artists", "discover", "subscribe"],
  authors: [{ name: "Soundwave" }],
  openGraph: {
    title: "Soundwave",
    description: "The world's most immersive music experience.",
    type: "website",
    siteName: "Soundwave",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#09090f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} dark`} suppressHydrationWarning>
      <body className="bg-surface-base text-content-primary antialiased font-sans">
        <QueryProvider>
          <AuthProvider>
            <AppShell>{children}</AppShell>
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: "#18181f",
                  color: "#f4f4f6",
                  border: "1px solid #27272e",
                  borderRadius: "12px",
                  fontSize: "14px",
                },
                success: { iconTheme: { primary: "#10b981", secondary: "#18181f" } },
                error:   { iconTheme: { primary: "#ef4444", secondary: "#18181f" } },
              }}
            />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
