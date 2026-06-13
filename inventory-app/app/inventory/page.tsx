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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Inventory</h1>
        <span className="text-sm text-slate-500">{items.length} items</span>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search items…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
            </button>
          )}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          className={showFilters || areaFilter ? "border-slate-900" : ""}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {showFilters && (
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Filter by Area</label>
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
              Search: {search} <X className="h-3 w-3" />
            </Badge>
          )}
          {filteredAreaName && (
            <Badge variant="outline" className="gap-1 cursor-pointer" onClick={() => setAreaFilter("")}>
              {filteredAreaName} <X className="h-3 w-3" />
            </Badge>
          )}
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-16 w-16 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500">
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
