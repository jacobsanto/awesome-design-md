"use client";

import { useSync } from "@/contexts/SyncContext";
import { WifiOff, RefreshCw } from "lucide-react";

export function OfflineBanner() {
  const { isOnline, isSyncing } = useSync();

  if (isOnline && !isSyncing) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium ${
      isOnline ? "bg-blue-600 text-white" : "bg-amber-500 text-white"
    }`}>
      {isOnline ? (
        <>
          <RefreshCw className="h-4 w-4 animate-spin" />
          Syncing…
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          You are offline — changes will sync when reconnected
        </>
      )}
    </div>
  );
}
