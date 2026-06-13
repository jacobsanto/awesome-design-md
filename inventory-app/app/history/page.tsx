"use client";

import { useEffect, useState } from "react";
import { TrendingDown, Package } from "lucide-react";
import { getRemovalLog } from "@/lib/db/operations";
import type { RemovalLog } from "@/lib/supabase/types";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";

const reasonColor = {
  used: "secondary",
  discarded: "destructive",
  "given away": "success",
  sold: "success",
  moved: "warning",
} as const;

const reasonLabel: Record<string, string> = {
  used: "Used up",
  discarded: "Discarded",
  "given away": "Given away",
  sold: "Sold",
  moved: "Moved",
};

export default function HistoryPage() {
  const [log, setLog] = useState<RemovalLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRemovalLog().then((data) => {
      setLog(data);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="py-8 text-center" style={{ fontSize: "14px", color: "var(--notion-text-tertiary)" }}>
      Loading…
    </div>
  );

  return (
    <div className="space-y-4 pb-4">
      {/* Page header */}
      <div>
        <h1 style={{ fontSize: "28px", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--notion-text)" }}>
          Removal History
        </h1>
        <p style={{ fontSize: "14px", color: "var(--notion-text-secondary)", marginTop: "2px" }}>
          {log.length} total removals
        </p>
      </div>

      {log.length === 0 ? (
        <div className="text-center py-16">
          <TrendingDown
            className="mx-auto mb-4"
            style={{ width: "48px", height: "48px", color: "var(--notion-border)" }}
          />
          <p style={{ fontSize: "14px", color: "var(--notion-text-secondary)" }}>No removals logged yet.</p>
          <p style={{ fontSize: "13px", color: "var(--notion-text-tertiary)", marginTop: "4px" }}>
            When you remove items from inventory, they appear here.
          </p>
        </div>
      ) : (
        <div
          style={{
            border: "1px solid var(--notion-border)",
            borderRadius: "4px",
            background: "var(--notion-bg)",
            overflow: "hidden",
          }}
        >
          {log.map((entry, idx) => (
            <div
              key={entry.id}
              className="flex items-start gap-3 px-3 py-3 transition-colors"
              style={{
                borderBottom: idx < log.length - 1 ? "1px solid var(--notion-border-light)" : "none",
              }}
              onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = "var(--notion-bg-secondary)"}
              onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = "transparent"}
            >
              {/* Icon */}
              <div
                className="flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "4px",
                  background: "var(--notion-bg-gray)",
                }}
              >
                <Package style={{ width: "14px", height: "14px", color: "var(--notion-text-tertiary)" }} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--notion-text)" }}>
                    {entry.item_name}
                  </span>
                  <Badge variant={reasonColor[entry.reason] ?? "secondary"}>
                    {reasonLabel[entry.reason] ?? entry.reason}
                  </Badge>
                </div>
                <p style={{ fontSize: "13px", color: "var(--notion-text-secondary)", marginTop: "2px" }}>
                  {entry.quantity_removed} unit{entry.quantity_removed !== 1 ? "s" : ""} removed
                  {entry.area_name ? ` from ${entry.area_name}` : ""}
                </p>
                {entry.notes && (
                  <p style={{ fontSize: "13px", color: "var(--notion-text-secondary)", marginTop: "2px", fontStyle: "italic" }}>
                    &ldquo;{entry.notes}&rdquo;
                  </p>
                )}
                <p style={{ fontSize: "12px", color: "var(--notion-text-tertiary)", marginTop: "2px" }}>
                  {formatDateTime(entry.date)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
