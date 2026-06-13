import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SyncProvider } from "@/contexts/SyncContext";
import { OfflineBanner } from "@/components/OfflineBanner";
import { Sidebar } from "@/components/Sidebar";
import { BottomNav } from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "Home Inventory",
  description: "Personal inventory management for home and storage",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Inventory" },
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
      <body className="h-full bg-white text-[#37352F]">
        <SyncProvider>
          <OfflineBanner />
          {/* Desktop: sidebar + content */}
          <div className="hidden md:flex h-full">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
              <div className="max-w-[900px] mx-auto px-8 py-8">
                {children}
              </div>
            </main>
          </div>
          {/* Mobile: full screen + bottom nav */}
          <div className="flex flex-col md:hidden h-full">
            <main className="flex-1 overflow-y-auto pb-16">
              <div className="px-4 py-5">
                {children}
              </div>
            </main>
            <BottomNav />
          </div>
        </SyncProvider>
      </body>
    </html>
  );
}
