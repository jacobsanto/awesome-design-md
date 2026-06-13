"use client";

import { useSync } from "@/contexts/SyncContext";
import { WifiOff, RefreshCw } from "lucide-react";

export function OfflineBanner() {
  const { isOnline, isSyncing } = useSync();
  if (isOnline && !isSyncing) return null;

  return (
    <div
      className={`flex items-center justify-center gap-2 px-4 py-1.5 text-[12px] font-medium border-b border-[#E9E8E4] ${
        isOnline ? "bg-[#E7F3FF] text-[#1A6FBF]" : "bg-[#FBF3DB] text-[#DFAB01]"
      }`}
    >
      {isOnline ? (
        <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Syncing…</>
      ) : (
        <><WifiOff className="h-3.5 w-3.5" /> Offline — changes will sync when reconnected</>
      )}
    </div>
  );
}
