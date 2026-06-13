"use client";

import { v4 as uuidv4 } from "uuid";
import { getDB } from "./dexie";
import { createClient } from "@/lib/supabase/client";
import type { Area, SubArea, Item, RemovalLog } from "@/lib/supabase/types";

// ─── Areas ───────────────────────────────────────────────────────────────────

export async function getAreas(): Promise<Area[]> {
  if (navigator.onLine) {
    const supabase = createClient();
    const { data } = await supabase.from("areas").select("*").order("name");
    if (data) {
      const db = getDB();
      await db.areas.bulkPut(data);
      return data;
    }
  }
  return getDB().areas.orderBy("name").toArray();
}

export async function createArea(name: string): Promise<Area> {
  const area: Area = { id: uuidv4(), name, created_at: new Date().toISOString() };
  const db = getDB();
  await db.areas.put(area);
  if (navigator.onLine) {
    const supabase = createClient();
    await supabase.from("areas").insert(area);
  } else {
    await db.sync_queue.add({ operation: "create", table: "areas", recordId: area.id, payload: area as unknown as Record<string, unknown>, created_at: new Date().toISOString() });
  }
  return area;
}

export async function deleteArea(id: string): Promise<void> {
  const db = getDB();
  await db.areas.delete(id);
  await db.sub_areas.where("area_id").equals(id).delete();
  if (navigator.onLine) {
    const supabase = createClient();
    await supabase.from("areas").delete().eq("id", id);
  } else {
    await db.sync_queue.add({ operation: "delete", table: "areas", recordId: id, payload: { id }, created_at: new Date().toISOString() });
  }
}

export async function renameArea(id: string, name: string): Promise<void> {
  const db = getDB();
  await db.areas.update(id, { name });
  if (navigator.onLine) {
    const supabase = createClient();
    await supabase.from("areas").update({ name }).eq("id", id);
  } else {
    await db.sync_queue.add({ operation: "update", table: "areas", recordId: id, payload: { id, name }, created_at: new Date().toISOString() });
  }
}

// ─── Sub-Areas ────────────────────────────────────────────────────────────────

export async function getSubAreas(areaId?: string): Promise<SubArea[]> {
  if (navigator.onLine) {
    const supabase = createClient();
    let q = supabase.from("sub_areas").select("*").order("name");
    if (areaId) q = q.eq("area_id", areaId);
    const { data } = await q;
    if (data) {
      await getDB().sub_areas.bulkPut(data);
      return data;
    }
  }
  const db = getDB();
  return areaId
    ? db.sub_areas.where("area_id").equals(areaId).sortBy("name")
    : db.sub_areas.orderBy("name").toArray();
}

export async function createSubArea(areaId: string, name: string): Promise<SubArea> {
  const sub: SubArea = { id: uuidv4(), area_id: areaId, name, created_at: new Date().toISOString() };
  const db = getDB();
  await db.sub_areas.put(sub);
  if (navigator.onLine) {
    const supabase = createClient();
    await supabase.from("sub_areas").insert(sub);
  } else {
    await db.sync_queue.add({ operation: "create", table: "sub_areas", recordId: sub.id, payload: sub as unknown as Record<string, unknown>, created_at: new Date().toISOString() });
  }
  return sub;
}

export async function deleteSubArea(id: string): Promise<void> {
  const db = getDB();
  await db.sub_areas.delete(id);
  if (navigator.onLine) {
    const supabase = createClient();
    await supabase.from("sub_areas").delete().eq("id", id);
  } else {
    await db.sync_queue.add({ operation: "delete", table: "sub_areas", recordId: id, payload: { id }, created_at: new Date().toISOString() });
  }
}

export async function renameSubArea(id: string, name: string): Promise<void> {
  const db = getDB();
  await db.sub_areas.update(id, { name });
  if (navigator.onLine) {
    const supabase = createClient();
    await supabase.from("sub_areas").update({ name }).eq("id", id);
  } else {
    await db.sync_queue.add({ operation: "update", table: "sub_areas", recordId: id, payload: { id, name }, created_at: new Date().toISOString() });
  }
}

// ─── Items ────────────────────────────────────────────────────────────────────

export async function getItems(search?: string, areaId?: string): Promise<Item[]> {
  if (navigator.onLine) {
    const supabase = createClient();
    let q = supabase.from("items").select("*, area:areas(id,name,created_at), sub_area:sub_areas(id,area_id,name,created_at)").order("date_added", { ascending: false });
    if (areaId) q = q.eq("area_id", areaId);
    if (search) q = q.ilike("name", `%${search}%`);
    const { data } = await q;
    if (data) {
      await getDB().items.bulkPut(data.map((d: Item) => ({ ...d, area: undefined, sub_area: undefined })));
      return data;
    }
  }
  const db = getDB();
  let items = await db.items.orderBy("date_added").reverse().toArray();
  if (areaId) items = items.filter((i) => i.area_id === areaId);
  if (search) items = items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));
  const areas = await db.areas.toArray();
  const subs = await db.sub_areas.toArray();
  return items.map((i) => ({
    ...i,
    area: areas.find((a) => a.id === i.area_id),
    sub_area: subs.find((s) => s.id === i.sub_area_id),
  }));
}

export async function getItem(id: string): Promise<Item | null> {
  if (navigator.onLine) {
    const supabase = createClient();
    const { data } = await supabase
      .from("items")
      .select("*, area:areas(id,name,created_at), sub_area:sub_areas(id,area_id,name,created_at)")
      .eq("id", id)
      .single();
    if (data) return data;
  }
  const db = getDB();
  const item = await db.items.get(id);
  if (!item) return null;
  const area = item.area_id ? await db.areas.get(item.area_id) : undefined;
  const sub_area = item.sub_area_id ? await db.sub_areas.get(item.sub_area_id) : undefined;
  return { ...item, area, sub_area };
}

export async function saveItem(item: Partial<Item> & { id: string }, photoDataUrl?: string): Promise<Item> {
  const now = new Date().toISOString();
  const full: Item = {
    id: item.id,
    name: item.name ?? "",
    description: item.description ?? null,
    area_id: item.area_id ?? null,
    sub_area_id: item.sub_area_id ?? null,
    quantity: item.quantity ?? 1,
    unit: item.unit ?? "pcs",
    condition: item.condition ?? "good",
    photo_url: item.photo_url ?? null,
    tags: item.tags ?? [],
    notes: item.notes ?? null,
    date_added: item.date_added ?? now,
    date_updated: now,
  };

  const db = getDB();
  await db.items.put(full);

  if (navigator.onLine) {
    const supabase = createClient();

    if (photoDataUrl) {
      const base64 = photoDataUrl.split(",")[1];
      const mime = photoDataUrl.split(";")[0].split(":")[1];
      const bytes = atob(base64);
      const arr = new Uint8Array(bytes.length);
      for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
      const blob = new Blob([arr], { type: mime });
      const ext = mime.split("/")[1] || "jpg";
      const path = `items/${full.id}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("item-photos").upload(path, blob, { upsert: true });
      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage.from("item-photos").getPublicUrl(path);
        full.photo_url = publicUrl;
        await db.items.update(full.id, { photo_url: publicUrl });
      }
    }

    await supabase.from("items").upsert({ ...full });
  } else {
    await db.sync_queue.add({ operation: "create", table: "items", recordId: full.id, payload: full as unknown as Record<string, unknown>, created_at: now });
    if (photoDataUrl) {
      await db.pending_photos.put({ item_id: full.id, dataUrl: photoDataUrl, mime_type: photoDataUrl.split(";")[0].split(":")[1] });
    }
  }

  return full;
}

export async function deleteItem(id: string): Promise<void> {
  const db = getDB();
  await db.items.delete(id);
  await db.pending_photos.delete(id);
  if (navigator.onLine) {
    const supabase = createClient();
    await supabase.from("items").delete().eq("id", id);
  } else {
    await db.sync_queue.add({ operation: "delete", table: "items", recordId: id, payload: { id }, created_at: new Date().toISOString() });
  }
}

// ─── Removal Log ──────────────────────────────────────────────────────────────

export async function removeItemQuantity(
  item: Item,
  quantityRemoved: number,
  reason: string,
  notes?: string
): Promise<void> {
  const newQty = item.quantity - quantityRemoved;
  const log: RemovalLog = {
    id: uuidv4(),
    item_id: item.id,
    item_name: item.name,
    area_name: item.area?.name ?? null,
    quantity_removed: quantityRemoved,
    reason: reason as RemovalLog["reason"],
    date: new Date().toISOString(),
    notes: notes ?? null,
  };

  const db = getDB();
  await db.removal_log.put(log);

  if (newQty <= 0) {
    await db.items.delete(item.id);
  } else {
    await db.items.update(item.id, { quantity: newQty, date_updated: new Date().toISOString() });
  }

  if (navigator.onLine) {
    const supabase = createClient();
    await supabase.from("removal_log").insert(log);
    if (newQty <= 0) {
      await supabase.from("items").delete().eq("id", item.id);
    } else {
      await supabase.from("items").update({ quantity: newQty, date_updated: log.date }).eq("id", item.id);
    }
  } else {
    await db.sync_queue.add({ operation: "create", table: "removal_log", recordId: log.id, payload: log as unknown as Record<string, unknown>, created_at: log.date });
  }
}

export async function getRemovalLog(): Promise<RemovalLog[]> {
  if (navigator.onLine) {
    const supabase = createClient();
    const { data } = await supabase.from("removal_log").select("*").order("date", { ascending: false });
    if (data) {
      await getDB().removal_log.bulkPut(data);
      return data;
    }
  }
  return getDB().removal_log.orderBy("date").reverse().toArray();
}
