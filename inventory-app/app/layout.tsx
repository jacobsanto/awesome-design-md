import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SyncProvider } from "@/contexts/SyncContext";
import { OfflineBanner } from "@/components/OfflineBanner";
import { TopNav } from "@/components/TopNav";
import { BottomNav } from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "Home Inventory",
  description: "Personal inventory management for home and storage",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Inventory",
  },
};

export const viewport: Viewport = {
  themeColor: "#F7F6F3",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full" style={{ background: "var(--notion-bg)", color: "var(--notion-text)" }}>
        <SyncProvider>
          <OfflineBanner />
          {/* Desktop: sidebar layout */}
          <div className="hidden md:flex h-full">
            <TopNav />
            <main className="flex-1 overflow-y-auto">
              <div className="max-w-[900px] mx-auto px-8 py-8">
                {children}
              </div>
            </main>
          </div>
          {/* Mobile: stacked layout */}
          <div className="md:hidden flex flex-col min-h-full">
            <main className="flex-1 pb-16 px-4 pt-4 overflow-y-auto">
              {children}
            </main>
            <BottomNav />
          </div>
        </SyncProvider>
      </body>
    </html>
  );
}
