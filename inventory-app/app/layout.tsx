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
  themeColor: "#1e293b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-slate-50 text-slate-900">
        <SyncProvider>
          <OfflineBanner />
          <div className="flex flex-col min-h-screen">
            <TopNav />
            <main className="flex-1 pb-20 md:pb-8 max-w-5xl mx-auto w-full px-4 pt-4">
              {children}
            </main>
            <BottomNav />
          </div>
        </SyncProvider>
      </body>
    </html>
  );
}
