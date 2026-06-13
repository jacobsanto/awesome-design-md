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
    <div
      className="bg-white overflow-hidden group transition-colors"
      style={{
        border: "1px solid var(--notion-border)",
        borderRadius: "4px",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--notion-text-placeholder)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--notion-border)";
      }}
    >
      <Link href={`/item/${item.id}`}>
        <div className="aspect-square relative overflow-hidden" style={{ background: "var(--notion-bg-secondary)" }}>
          {item.photo_url ? (
            <img
              src={item.photo_url}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package style={{ width: "32px", height: "32px", color: "var(--notion-border)" }} />
            </div>
          )}
          <div className="absolute top-1.5 right-1.5">
            <Badge variant={conditionColor[item.condition]}>
              {item.condition}
            </Badge>
          </div>
        </div>
        <div style={{ padding: "10px 12px" }}>
          <p
            className="truncate leading-tight"
            style={{ fontSize: "13px", fontWeight: 500, color: "var(--notion-text)" }}
          >
            {item.name}
          </p>
          {item.area && (
            <p className="truncate mt-0.5" style={{ fontSize: "12px", color: "var(--notion-text-tertiary)" }}>
              {item.area.name}{item.sub_area ? ` › ${item.sub_area.name}` : ""}
            </p>
          )}
          <p className="mt-0.5" style={{ fontSize: "12px", color: "var(--notion-text-secondary)" }}>
            {item.quantity} {item.unit}
          </p>
        </div>
      </Link>
      <div style={{ padding: "0 12px 10px" }}>
        <RemoveDialog item={item} onSuccess={onUpdate}>
          <button
            className="w-full flex items-center justify-center gap-1 py-1 transition-colors"
            style={{
              fontSize: "12px",
              color: "var(--notion-text-tertiary)",
              border: "1px solid var(--notion-border-light)",
              borderRadius: "3px",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "var(--notion-red)";
              (e.currentTarget as HTMLElement).style.background = "var(--notion-red-bg)";
              (e.currentTarget as HTMLElement).style.borderColor = "var(--notion-red-bg)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "var(--notion-text-tertiary)";
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.borderColor = "var(--notion-border-light)";
            }}
          >
            <Minus style={{ width: "10px", height: "10px" }} /> Remove
          </button>
        </RemoveDialog>
      </div>
    </div>
  );
}
