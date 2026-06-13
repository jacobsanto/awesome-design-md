"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Package, Search, X, ChevronDown } from "lucide-react";
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
  const [showFilter, setShowFilter] = useState(false);

  const loadItems = async () => {
    const result = await getItems(search || undefined, areaFilter || undefined);
    setItems(result);
  };

  useEffect(() => { getAreas().then(setAreas); }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadItems(); }, [search, areaFilter]);

  const filteredAreaName = areas.find((a) => a.id === areaFilter)?.name;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-[28px] font-bold text-[#37352F] tracking-tight">Inventory</h1>
        <span className="text-[12px] text-[#9B9A97]">{items.length} items</span>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#C4C1BB]" />
          <Input placeholder="Search items…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-7" />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2">
              <X className="h-3.5 w-3.5 text-[#C4C1BB] hover:text-[#787774]" />
            </button>
          )}
        </div>
        <Button variant="secondary" size="sm" onClick={() => setShowFilter(!showFilter)} className={`gap-1 ${areaFilter ? "text-[#2383E2]" : ""}`}>
          Filter <ChevronDown className="h-3 w-3" />
        </Button>
      </div>

      {showFilter && (
        <div className="flex items-center gap-3 p-3 rounded-[4px] border border-[#E9E8E4] bg-[#F7F6F3]">
          <span className="text-[11px] uppercase tracking-wide text-[#9B9A97] font-medium flex-shrink-0">Area</span>
          <Select value={areaFilter} onValueChange={setAreaFilter}>
            <SelectTrigger className="max-w-[200px]">
              <SelectValue placeholder="All areas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All areas</SelectItem>
              {areas.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
            </SelectContent>
          </Select>
          {areaFilter && (
            <button onClick={() => setAreaFilter("")} className="text-[12px] text-[#787774] hover:text-[#37352F]">Clear</button>
          )}
        </div>
      )}

      {(search || filteredAreaName) && (
        <div className="flex flex-wrap gap-1.5">
          {search && <Badge variant="blue" className="gap-1 cursor-pointer" onClick={() => setSearch("")}>"{search}" <X className="h-2.5 w-2.5" /></Badge>}
          {filteredAreaName && <Badge variant="blue" className="gap-1 cursor-pointer" onClick={() => setAreaFilter("")}>{filteredAreaName} <X className="h-2.5 w-2.5" /></Badge>}
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-20">
          <Package className="h-12 w-12 text-[#E9E8E4] mx-auto mb-4" />
          <p className="text-[13px] text-[#787774]">{search || areaFilter ? "No items match your filters." : "No items yet."}</p>
          {!search && !areaFilter && <Link href="/item/new"><Button className="mt-4">Add your first item</Button></Link>}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((item) => <ItemCard key={item.id} item={item} onUpdate={loadItems} />)}
        </div>
      )}
    </div>
  );
}

export default function InventoryPage() {
  return <Suspense><InventoryContent /></Suspense>;
}
