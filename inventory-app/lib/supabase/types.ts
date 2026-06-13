export type Condition = "new" | "good" | "fair" | "poor";
export type RemovalReason = "used" | "discarded" | "given away" | "sold" | "moved";
export type Unit = "pcs" | "boxes" | "kg" | "g" | "L" | "mL" | "pairs" | "sets" | "rolls" | "other";

export interface Area {
  id: string;
  name: string;
  created_at: string;
}

export interface SubArea {
  id: string;
  area_id: string;
  name: string;
  created_at: string;
}

export interface Item {
  id: string;
  name: string;
  description: string | null;
  area_id: string | null;
  sub_area_id: string | null;
  quantity: number;
  unit: Unit;
  condition: Condition;
  photo_url: string | null;
  tags: string[];
  notes: string | null;
  date_added: string;
  date_updated: string;
  // Joined fields
  area?: Area;
  sub_area?: SubArea;
}

export interface RemovalLog {
  id: string;
  item_id: string | null;
  item_name: string;
  area_name: string | null;
  quantity_removed: number;
  reason: RemovalReason;
  date: string;
  notes: string | null;
}
