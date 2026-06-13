"use client";

import Link from "next/link";
import { Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Item } from "@/lib/supabase/types";
import { RemoveDialog } from "@/components/RemoveDialog";

interface ItemCardProps {
  item: Item;
  onUpdate: () => void;
}

const conditionVariant = {
  new:  "success",
  good: "secondary",
  fair: "warning",
  poor: "destructive",
} as const;

export function ItemCard({ item, onUpdate }: ItemCardProps) {
  return (
    <div
      className="bg-white rounded-[4px] overflow-hidden flex flex-col transition-colors duration-100 group"
      style={{ border: "1px solid #E9E8E4" }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#C4C1BB")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#E9E8E4")}
    >
      <Link href={`/item/${item.id}`} className="flex-1">
        {/* Image */}
        <div className="aspect-square bg-[#F7F6F3] relative overflow-hidden">
          {item.photo_url ? (
            <img
              src={item.photo_url}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-8 w-8 text-[#C4C1BB]" />
            </div>
          )}
          <div className="absolute top-1.5 left-1.5">
            <Badge variant={conditionVariant[item.condition]}>
              {item.condition}
            </Badge>
          </div>
        </div>
        {/* Text */}
        <div className="px-2.5 py-2">
          <p className="text-[13px] font-medium text-[#37352F] truncate leading-snug">{item.name}</p>
          {item.area && (
            <p className="text-[11px] text-[#9B9A97] mt-0.5 truncate">
              {item.area.name}{item.sub_area ? ` / ${item.sub_area.name}` : ""}
            </p>
          )}
          <p className="text-[11px] text-[#787774] mt-0.5">{item.quantity} {item.unit}</p>
        </div>
      </Link>
      {/* Remove row */}
      <div className="px-2.5 pb-2">
        <RemoveDialog item={item} onSuccess={onUpdate}>
          <button className="w-full text-[11px] text-[#9B9A97] hover:text-[#EB5757] hover:bg-[#FBE4E4] py-1 rounded-[3px] transition-colors duration-100 text-center">
            Remove
          </button>
        </RemoveDialog>
      </div>
    </div>
  );
}
