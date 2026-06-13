"use client";

import Link from "next/link";
import { Package, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Item } from "@/lib/supabase/types";
import { RemoveDialog } from "@/components/RemoveDialog";

interface ItemCardProps {
  item: Item;
  onUpdate: () => void;
}

const conditionColor = {
  new: "success",
  good: "secondary",
  fair: "warning",
  poor: "destructive",
} as const;

export function ItemCard({ item, onUpdate }: ItemCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group">
      <Link href={`/item/${item.id}`}>
        <div className="aspect-square bg-slate-50 relative overflow-hidden">
          {item.photo_url ? (
            <img
              src={item.photo_url}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-10 w-10 text-slate-200" />
            </div>
          )}
          <div className="absolute top-1.5 right-1.5">
            <Badge variant={conditionColor[item.condition]} className="text-[10px] px-1.5 py-0">
              {item.condition}
            </Badge>
          </div>
        </div>
        <div className="p-3">
          <p className="text-sm font-semibold text-slate-800 truncate leading-tight">{item.name}</p>
          {item.area && (
            <p className="text-xs text-slate-400 mt-0.5 truncate">
              {item.area.name}{item.sub_area ? ` › ${item.sub_area.name}` : ""}
            </p>
          )}
          <p className="text-xs text-slate-600 mt-1 font-medium">
            {item.quantity} {item.unit}
          </p>
        </div>
      </Link>
      <div className="px-3 pb-3">
        <RemoveDialog item={item} onSuccess={onUpdate}>
          <button className="w-full flex items-center justify-center gap-1 text-xs text-slate-400 hover:text-red-500 py-1 rounded border border-slate-100 hover:border-red-200 transition-colors">
            <Minus className="h-3 w-3" /> Remove
          </button>
        </RemoveDialog>
      </div>
    </div>
  );
}
