"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Package, Search, X, SlidersHorizontal } from "lucide-react";
import { getItems, getAreas } from "@/lib/db/operations";
import type { Item, Area } from "@/lib/supabase/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ItemCard } from "@/components/ItemCard";

function InventoryContent() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<Item[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [areaFilter, setAreaFilter] = useState(searchParams.get("area") ?? "");
  const [showFilters, setShowFilters] = useState(false);

  const loadItems = async () => {
    const result = await getItems(search || undefined, areaFilter || undefined);
    setItems(result);
  };

  useEffect(() => {
    getAreas().then(setAreas);
  }, []);

  useEffect(() => {
    loadItems();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, areaFilter]);

  const filteredAreaName = areas.find((a) => a.id === areaFilter)?.name;

  return (
    <div className="space-y-4 pb-4">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 style={{ fontSize: "28px", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--notion-text)" }}>
          Inventory
        </h1>
        <span style={{ fontSize: "14px", color: "var(--notion-text-secondary)" }}>{items.length} items</span>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search
            className="absolute left-2 top-1/2 -translate-y-1/2"
            style={{ width: "14px", height: "14px", color: "var(--notion-text-tertiary)" }}
          />
          <Input
            placeholder="Search items…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-7"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2"
              style={{ color: "var(--notion-text-tertiary)" }}
            >
              <X style={{ width: "12px", height: "12px" }} />
            </button>
          )}
        </div>
        <Button
          variant="secondary"
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          style={showFilters || areaFilter ? { background: "var(--notion-bg-hover)" } : {}}
        >
          <SlidersHorizontal style={{ width: "14px", height: "14px" }} />
        </Button>
      </div>

      {showFilters && (
        <div
          className="p-3 space-y-3"
          style={{
            background: "var(--notion-bg-secondary)",
            borderRadius: "4px",
            border: "1px solid var(--notion-border)",
          }}
        >
          <div>
            <label
              className="block mb-1"
              style={{ fontSize: "11px", fontWeight: 500, color: "var(--notion-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}
            >
              Filter by Area
            </label>
            <Select value={areaFilter} onValueChange={setAreaFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All areas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All areas</SelectItem>
                {areas.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Active filters */}
      {(search || areaFilter) && (
        <div className="flex flex-wrap gap-2">
          {search && (
            <Badge variant="outline" className="gap-1 cursor-pointer" onClick={() => setSearch("")}>
              Search: {search} <X style={{ width: "10px", height: "10px" }} />
            </Badge>
          )}
          {filteredAreaName && (
            <Badge variant="outline" className="gap-1 cursor-pointer" onClick={() => setAreaFilter("")}>
              {filteredAreaName} <X style={{ width: "10px", height: "10px" }} />
            </Badge>
          )}
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-16">
          <Package
            className="mx-auto mb-4"
            style={{ width: "48px", height: "48px", color: "var(--notion-border)" }}
          />
          <p style={{ fontSize: "14px", color: "var(--notion-text-secondary)" }}>
            {search || areaFilter ? "No items match your filters." : "No items yet."}
          </p>
          {!search && !areaFilter && (
            <Link href="/item/new">
              <Button className="mt-4">Add your first item</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} onUpdate={loadItems} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function InventoryPage() {
  return (
    <Suspense>
      <InventoryContent />
    </Suspense>
  );
}
