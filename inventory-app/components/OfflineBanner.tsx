"use client";

import { useSync } from "@/contexts/SyncContext";
import { WifiOff, RefreshCw } from "lucide-react";

export function OfflineBanner() {
  const { isOnline, isSyncing } = useSync();

  if (isOnline && !isSyncing) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 px-4 py-1.5"
      style={{
        background: isOnline ? "var(--notion-blue-bg)" : "var(--notion-yellow-bg)",
        color: isOnline ? "var(--notion-blue)" : "var(--notion-yellow)",
        borderBottom: "1px solid var(--notion-border)",
        fontSize: "12px",
      }}
    >
      {isOnline ? (
        <>
          <RefreshCw style={{ width: "12px", height: "12px" }} className="animate-spin" />
          Syncing changes…
        </>
      ) : (
        <>
          <WifiOff style={{ width: "12px", height: "12px" }} />
          You are offline — changes will sync when reconnected
        </>
      )}
    </div>
  );
}
