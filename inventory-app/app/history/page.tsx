"use client";

import { useEffect, useState } from "react";
import { TrendingDown } from "lucide-react";
import { getRemovalLog } from "@/lib/db/operations";
import type { RemovalLog } from "@/lib/supabase/types";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";

const reasonBadge: Record<string, "success" | "destructive" | "warning" | "secondary"> = {
  used:         "secondary",
  discarded:    "destructive",
  "given away": "success",
  sold:         "success",
  moved:        "warning",
};
const reasonLabel: Record<string, string> = {
  used: "Used", discarded: "Discarded", "given away": "Given away", sold: "Sold", moved: "Moved",
};

export default function HistoryPage() {
  const [log, setLog] = useState<RemovalLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRemovalLog().then((d) => { setLog(d); setLoading(false); });
  }, []);

  if (loading) return <div className="py-12 text-center text-[13px] text-[#9B9A97]">Loading…</div>;

  return (
    <div className="max-w-[700px] space-y-5 pb-8">
      <div>
        <h1 className="text-[28px] font-bold text-[#37352F] tracking-tight">History</h1>
        <p className="text-[13px] text-[#787774] mt-1">{log.length} removal{log.length !== 1 ? "s" : ""} logged</p>
      </div>

      {log.length === 0 ? (
        <div className="text-center py-20">
          <TrendingDown className="h-12 w-12 text-[#E9E8E4] mx-auto mb-4" />
          <p className="text-[13px] text-[#787774]">No removals logged yet.</p>
          <p className="text-[12px] text-[#9B9A97] mt-1">When you remove items from inventory, they appear here.</p>
        </div>
      ) : (
        <div className="rounded-[4px] border border-[#E9E8E4] bg-white divide-y divide-[#F1F1EF]">
          {log.map((entry) => (
            <div key={entry.id} className="flex items-start gap-3 px-4 py-3 hover:bg-[#F7F6F3] transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[13px] font-medium text-[#37352F]">{entry.item_name}</span>
                  <Badge variant={reasonBadge[entry.reason] ?? "secondary"}>
                    {reasonLabel[entry.reason] ?? entry.reason}
                  </Badge>
                </div>
                <p className="text-[12px] text-[#787774] mt-0.5">
                  {entry.quantity_removed} unit{entry.quantity_removed !== 1 ? "s" : ""} removed
                  {entry.area_name ? ` from ${entry.area_name}` : ""}
                </p>
                {entry.notes && (
                  <p className="text-[12px] text-[#9B9A97] mt-0.5 italic">"{entry.notes}"</p>
                )}
              </div>
              <span className="text-[11px] text-[#9B9A97] flex-shrink-0 mt-0.5">{formatDateTime(entry.date)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
