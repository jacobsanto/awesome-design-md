"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Plus, LayoutGrid, TrendingDown, Search } from "lucide-react";
import { getItems, getAreas, getRemovalLog } from "@/lib/db/operations";
import type { Item, Area, RemovalLog } from "@/lib/supabase/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="space-y-6 py-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">{items.length} items tracked</p>
        </div>
        <Link href="/item/new">
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" /> Add Item
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Search items…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <Button type="submit" variant="secondary">Search</Button>
      </form>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg"><Package className="h-5 w-5 text-blue-600" /></div>
              <div><p className="text-2xl font-bold">{items.length}</p><p className="text-xs text-slate-500">Total Items</p></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg"><LayoutGrid className="h-5 w-5 text-green-600" /></div>
              <div><p className="text-2xl font-bold">{areas.length}</p><p className="text-xs text-slate-500">Areas</p></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg"><TrendingDown className="h-5 w-5 text-purple-600" /></div>
              <div><p className="text-2xl font-bold">{recentRemovals.length}</p><p className="text-xs text-slate-500">Recent Removals</p></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg"><Package className="h-5 w-5 text-orange-600" /></div>
              <div><p className="text-2xl font-bold">{items.reduce((sum, i) => sum + i.quantity, 0)}</p><p className="text-xs text-slate-500">Total Units</p></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {byArea.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Items by Area</CardTitle></CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-1">
              {byArea.map(({ area, count }) => (
                <Link key={area.id} href={`/inventory?area=${area.id}`} className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-slate-50 transition-colors group">
                  <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{area.name}</span>
                  <span className="text-sm text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{count} {count === 1 ? "item" : "items"}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {items.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recently Added</CardTitle>
              <Link href="/inventory" className="text-xs text-slate-500 hover:text-slate-700">View all →</Link>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-1">
              {items.slice(0, 5).map((item) => (
                <Link key={item.id} href={`/item/${item.id}`} className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-slate-50 transition-colors">
                  {item.photo_url ? (
                    <img src={item.photo_url} alt={item.name} className="h-10 w-10 rounded-md object-cover flex-shrink-0" />
                  ) : (
                    <div className="h-10 w-10 rounded-md bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Package className="h-5 w-5 text-slate-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.area?.name}{item.sub_area ? ` › ${item.sub_area.name}` : ""} · {formatDate(item.date_added)}</p>
                  </div>
                  <span className="text-sm text-slate-600 flex-shrink-0">{item.quantity} {item.unit}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {items.length === 0 && (
        <div className="text-center py-16">
          <Package className="h-16 w-16 text-slate-200 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-600 mb-2">No items yet</h2>
          <p className="text-slate-400 mb-6">Start by photographing an item to add it to your inventory.</p>
          <Link href="/item/new"><Button><Plus className="h-4 w-4 mr-2" /> Add your first item</Button></Link>
        </div>
      )}
    </div>
  );
}
