import Dexie, { type Table } from "dexie";
import type { Area, SubArea, Item, RemovalLog } from "@/lib/supabase/types";

export interface SyncQueueEntry {
  id?: number;
  operation: "create" | "update" | "delete";
  table: "areas" | "sub_areas" | "items" | "removal_log";
  recordId: string;
  payload: Record<string, unknown>;
  created_at: string;
}

export interface PendingPhoto {
  item_id: string;
  dataUrl: string;
  mime_type: string;
}

class InventoryDB extends Dexie {
  areas!: Table<Area>;
  sub_areas!: Table<SubArea>;
  items!: Table<Item>;
  removal_log!: Table<RemovalLog>;
  sync_queue!: Table<SyncQueueEntry>;
  pending_photos!: Table<PendingPhoto>;

  constructor() {
    super("InventoryDB");
    this.version(1).stores({
      areas: "id, name, created_at",
      sub_areas: "id, area_id, name, created_at",
      items: "id, name, area_id, sub_area_id, date_added, date_updated",
      removal_log: "id, item_id, date",
      sync_queue: "++id, operation, table, recordId, created_at",
      pending_photos: "item_id",
    });
  }
}

let dbInstance: InventoryDB | null = null;

export function getDB(): InventoryDB {
  if (!dbInstance) {
    dbInstance = new InventoryDB();
  }
  return dbInstance;
}
