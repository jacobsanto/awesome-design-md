"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Plus, LayoutGrid, TrendingDown, Search } from "lucide-react";
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
      setItems(i);
      setAreas(a);
      setRecentRemovals(r.slice(0, 5));
    });
  }, []);

  const byArea = areas.map((a) => ({
    area: a,
    count: items.filter((i) => i.area_id === a.id).length,
  })).filter((x) => x.count > 0).sort((a, b) => b.count - a.count);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/inventory?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--notion-text)" }}>
            Dashboard
          </h1>
          <p style={{ fontSize: "14px", color: "var(--notion-text-secondary)", marginTop: "2px" }}>
            {items.length} items tracked
          </p>
        </div>
        <Link href="/item/new">
          <Button variant="default" className="gap-1.5">
            <Plus style={{ width: "14px", height: "14px" }} /> Add Item
          </Button>
        </Link>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search
            className="absolute left-2 top-1/2 -translate-y-1/2"
            style={{ width: "14px", height: "14px", color: "var(--notion-text-tertiary)" }}
          />
          <Input
            placeholder="Search items…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-7"
          />
        </div>
        <Button type="submit" variant="secondary">Search</Button>
      </form>

      {/* Stats — flat Notion-style metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Package, value: items.length, label: "Total Items", bg: "var(--notion-blue-bg)", color: "var(--notion-blue)" },
          { icon: LayoutGrid, value: areas.length, label: "Areas", bg: "var(--notion-green-bg)", color: "var(--notion-green)" },
          { icon: TrendingDown, value: recentRemovals.length, label: "Recent Removals", bg: "var(--notion-yellow-bg)", color: "var(--notion-yellow)" },
          { icon: Package, value: items.reduce((sum, i) => sum + i.quantity, 0), label: "Total Units", bg: "var(--notion-gray-bg)", color: "var(--notion-text-secondary)" },
        ].map(({ icon: Icon, value, label, bg, color }) => (
          <div
            key={label}
            className="p-3"
            style={{
              border: "1px solid var(--notion-border)",
              borderRadius: "4px",
              background: "var(--notion-bg)",
            }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="flex items-center justify-center flex-shrink-0"
                style={{ width: "28px", height: "28px", borderRadius: "4px", background: bg }}
              >
                <Icon style={{ width: "14px", height: "14px", color }} />
              </div>
              <div>
                <p style={{ fontSize: "20px", fontWeight: 600, color: "var(--notion-text)", lineHeight: 1 }}>
                  {value}
                </p>
                <p style={{ fontSize: "12px", color: "var(--notion-text-tertiary)", marginTop: "2px" }}>
                  {label}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Items by area */}
      {byArea.length > 0 && (
        <div
          style={{
            border: "1px solid var(--notion-border)",
            borderRadius: "4px",
            background: "var(--notion-bg)",
          }}
        >
          <div className="px-3 py-2.5" style={{ borderBottom: "1px solid var(--notion-border-light)" }}>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--notion-text)" }}>Items by Area</p>
          </div>
          <div>
            {byArea.map(({ area, count }, idx) => (
              <Link
                key={area.id}
                href={`/inventory?area=${area.id}`}
                className="flex items-center justify-between px-3 transition-colors"
                style={{
                  height: "32px",
                  borderBottom: idx < byArea.length - 1 ? "1px solid var(--notion-border-light)" : "none",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "var(--notion-bg-secondary)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                <span style={{ fontSize: "13px", color: "var(--notion-text)" }}>{area.name}</span>
                <span
                  className="px-1.5"
                  style={{
                    fontSize: "11px",
                    color: "var(--notion-text-secondary)",
                    background: "var(--notion-bg-gray)",
                    borderRadius: "3px",
                    fontWeight: 500,
                  }}
                >
                  {count} {count === 1 ? "item" : "items"}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recently added */}
      {items.length > 0 && (
        <div
          style={{
            border: "1px solid var(--notion-border)",
            borderRadius: "4px",
            background: "var(--notion-bg)",
          }}
        >
          <div
            className="px-3 py-2.5 flex items-center justify-between"
            style={{ borderBottom: "1px solid var(--notion-border-light)" }}
          >
            <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--notion-text)" }}>Recently Added</p>
            <Link
              href="/inventory"
              style={{ fontSize: "12px", color: "var(--notion-text-secondary)", textDecoration: "none" }}
            >
              View all →
            </Link>
          </div>
          <div>
            {items.slice(0, 5).map((item, idx) => (
              <Link
                key={item.id}
                href={`/item/${item.id}`}
                className="flex items-center gap-3 px-3 transition-colors"
                style={{
                  height: "44px",
                  borderBottom: idx < Math.min(items.length, 5) - 1 ? "1px solid var(--notion-border-light)" : "none",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "var(--notion-bg-secondary)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                {item.photo_url ? (
                  <img
                    src={item.photo_url}
                    alt={item.name}
                    className="flex-shrink-0 object-cover"
                    style={{ width: "28px", height: "28px", borderRadius: "3px" }}
                  />
                ) : (
                  <div
                    className="flex items-center justify-center flex-shrink-0"
                    style={{ width: "28px", height: "28px", borderRadius: "3px", background: "var(--notion-bg-gray)" }}
                  >
                    <Package style={{ width: "14px", height: "14px", color: "var(--notion-text-tertiary)" }} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="truncate" style={{ fontSize: "13px", color: "var(--notion-text)" }}>{item.name}</p>
                  <p className="truncate" style={{ fontSize: "12px", color: "var(--notion-text-tertiary)" }}>
                    {item.area?.name}{item.sub_area ? ` › ${item.sub_area.name}` : ""} · {formatDate(item.date_added)}
                  </p>
                </div>
                <span className="flex-shrink-0" style={{ fontSize: "13px", color: "var(--notion-text-secondary)" }}>
                  {item.quantity} {item.unit}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {items.length === 0 && (
        <div className="text-center py-16">
          <Package
            className="mx-auto mb-4"
            style={{ width: "48px", height: "48px", color: "var(--notion-border)" }}
          />
          <h2 style={{ fontSize: "16px", fontWeight: 600, color: "var(--notion-text-secondary)", marginBottom: "8px" }}>
            No items yet
          </h2>
          <p style={{ fontSize: "14px", color: "var(--notion-text-tertiary)", marginBottom: "20px" }}>
            Start by photographing an item to add it to your inventory.
          </p>
          <Link href="/item/new">
            <Button>
              <Plus style={{ width: "14px", height: "14px" }} /> Add your first item
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
