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

  if (loading) return <div className="py-8 text-center text-slate-400">Loading…</div>;

  return (
    <div className="space-y-4 pb-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Removal History</h1>
        <p className="text-slate-500 text-sm mt-0.5">{log.length} total removals</p>
      </div>

      {log.length === 0 ? (
        <div className="text-center py-16">
          <TrendingDown className="h-16 w-16 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500">No removals logged yet.</p>
          <p className="text-slate-400 text-sm mt-1">When you remove items from inventory, they appear here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {log.map((entry) => (
            <div key={entry.id} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-100 rounded-lg flex-shrink-0 mt-0.5">
                  <Package className="h-4 w-4 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-800">{entry.item_name}</span>
                    <Badge variant={reasonColor[entry.reason] ?? "secondary"}>
                      {reasonLabel[entry.reason] ?? entry.reason}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {entry.quantity_removed} unit{entry.quantity_removed !== 1 ? "s" : ""} removed
                    {entry.area_name ? ` from ${entry.area_name}` : ""}
                  </p>
                  {entry.notes && (
                    <p className="text-sm text-slate-600 mt-1 italic">"{entry.notes}"</p>
                  )}
                  <p className="text-xs text-slate-400 mt-1">{formatDateTime(entry.date)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
