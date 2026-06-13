"use client";

import { getDB } from "./dexie";
import { createClient } from "@/lib/supabase/client";

export async function syncQueue(): Promise<void> {
  if (typeof window === "undefined" || !navigator.onLine) return;

  const db = getDB();
  const supabase = createClient();
  const entries = await db.sync_queue.orderBy("id").toArray();

  for (const entry of entries) {
    try {
      if (entry.operation === "create" || entry.operation === "update") {
        const { error } = await supabase
          .from(entry.table)
          .upsert(entry.payload as Record<string, unknown>);
        if (error) throw error;
      } else if (entry.operation === "delete") {
        const { error } = await supabase
          .from(entry.table)
          .delete()
          .eq("id", entry.recordId);
        if (error) throw error;
      }
      await db.sync_queue.delete(entry.id!);
    } catch {
      // Leave in queue to retry later
      break;
    }
  }

  // Upload pending photos
  const pendingPhotos = await db.pending_photos.toArray();
  for (const pending of pendingPhotos) {
    try {
      const base64 = pending.dataUrl.split(",")[1];
      const bytes = atob(base64);
      const arr = new Uint8Array(bytes.length);
      for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
      const blob = new Blob([arr], { type: pending.mime_type });

      const ext = pending.mime_type.split("/")[1] || "jpg";
      const path = `items/${pending.item_id}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("item-photos")
        .upload(path, blob, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("item-photos")
        .getPublicUrl(path);

      await supabase
        .from("items")
        .update({ photo_url: publicUrl })
        .eq("id", pending.item_id);

      await db.items
        .where("id")
        .equals(pending.item_id)
        .modify({ photo_url: publicUrl });

      await db.pending_photos.delete(pending.item_id);
    } catch {
      break;
    }
  }
}
