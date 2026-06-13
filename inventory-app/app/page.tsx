"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Plus, Search } from "lucide-react";
import { getItems, getAreas, getRemovalLog } from "@/lib/db/operations";
import type { Item, Area, RemovalLog } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [recentRemovals, setRecentRemovals] = useState<RemovalLog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    Promise.all([getItems(), getAreas(), getRemovalLog()]).then(([i, a, r]) => {
      setItems(i); setAreas(a); setRecentRemovals(r.slice(0, 5));
    });
  }, []);

  const byArea = areas
    .map((a) => ({ area: a, count: items.filter((i) => i.area_id === a.id).length }))
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) router.push(`/inventory?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <div className="space-y-8">
      {/* Page title */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-[#37352F] tracking-tight leading-tight">Dashboard</h1>
          <p className="text-[13px] text-[#787774] mt-1">{items.length} items · {areas.length} areas</p>
        </div>
        <Link href="/item/new">
          <Button size="sm">
            <Plus className="h-3.5 w-3.5" /> Add Item
          </Button>
        </Link>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#C4C1BB]" />
          <Input
            placeholder="Search items…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-7"
          />
        </div>
        <Button type="submit" variant="secondary">Search</Button>
      </form>

      {/* Metrics — Notion-style inline stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Items",  value: items.length },
          { label: "Areas",        value: areas.length },
          { label: "Removals",     value: recentRemovals.length },
          { label: "Total Units",  value: items.reduce((s, i) => s + i.quantity, 0) },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-[4px] border border-[#E9E8E4] bg-white px-3 py-3">
            <p className="text-[22px] font-bold text-[#37352F] leading-none">{value}</p>
            <p className="text-[11px] text-[#9B9A97] mt-1 uppercase tracking-wide">{label}</p>
          </div>
        ))}
      </div>

      {/* By area */}
      {byArea.length > 0 && (
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-[#9B9A97] mb-2">By Area</p>
          <div className="rounded-[4px] border border-[#E9E8E4] bg-white divide-y divide-[#F1F1EF]">
            {byArea.map(({ area, count }) => (
              <Link
                key={area.id}
                href={`/inventory?area=${area.id}`}
                className="flex items-center justify-between px-3 h-8 hover:bg-[#F7F6F3] transition-colors duration-100 first:rounded-t-[4px] last:rounded-b-[4px]"
              >
                <span className="text-[13px] text-[#37352F]">{area.name}</span>
                <span className="text-[12px] text-[#9B9A97]">{count}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recently added */}
      {items.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-[#9B9A97]">Recently Added</p>
            <Link href="/inventory" className="text-[12px] text-[#2383E2] hover:underline">View all</Link>
          </div>
          <div className="rounded-[4px] border border-[#E9E8E4] bg-white divide-y divide-[#F1F1EF]">
            {items.slice(0, 6).map((item) => (
              <Link
                key={item.id}
                href={`/item/${item.id}`}
                className="flex items-center gap-3 px-3 h-10 hover:bg-[#F7F6F3] transition-colors duration-100 first:rounded-t-[4px] last:rounded-b-[4px]"
              >
                {item.photo_url ? (
                  <img src={item.photo_url} alt={item.name} className="h-6 w-6 rounded-[3px] object-cover flex-shrink-0" />
                ) : (
                  <div className="h-6 w-6 rounded-[3px] bg-[#F1F1EF] flex items-center justify-center flex-shrink-0">
                    <Package className="h-3.5 w-3.5 text-[#C4C1BB]" />
                  </div>
                )}
                <span className="text-[13px] text-[#37352F] flex-1 truncate">{item.name}</span>
                <span className="text-[12px] text-[#9B9A97] flex-shrink-0">
                  {item.area?.name ?? ""}{item.area ? " · " : ""}{formatDate(item.date_added)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {items.length === 0 && (
        <div className="text-center py-20">
          <Package className="h-12 w-12 text-[#E9E8E4] mx-auto mb-4" />
          <h2 className="text-[16px] font-semibold text-[#37352F] mb-1">No items yet</h2>
          <p className="text-[13px] text-[#787774] mb-5">Start by adding your first inventory item.</p>
          <Link href="/item/new">
            <Button><Plus className="h-3.5 w-3.5" /> Add your first item</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
