"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { removeItemQuantity } from "@/lib/db/operations";
import type { Item, RemovalReason } from "@/lib/supabase/types";

const REASONS: { value: RemovalReason; label: string }[] = [
  { value: "used",        label: "Used up" },
  { value: "discarded",   label: "Discarded / thrown away" },
  { value: "given away",  label: "Given away" },
  { value: "sold",        label: "Sold" },
  { value: "moved",       label: "Moved elsewhere" },
];

interface RemoveDialogProps {
  item: Item;
  onSuccess: () => void;
  children: React.ReactNode;
}

export function RemoveDialog({ item, onSuccess, children }: RemoveDialogProps) {
  const [open, setOpen] = useState(false);
  const [qty, setQty] = useState(String(item.quantity));
  const [reason, setReason] = useState<RemovalReason>("used");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const handleConfirm = async () => {
    const q = parseFloat(qty);
    if (!q || q <= 0 || q > item.quantity) return;
    setSaving(true);
    try {
      await removeItemQuantity(item, q, reason, notes);
      setOpen(false); onSuccess();
    } finally { setSaving(false); }
  };

  return (
    <>
      <div onClick={() => setOpen(true)}>{children}</div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove &ldquo;{item.name}&rdquo;</DialogTitle>
          </DialogHeader>
          <div className="space-y-3" style={{ padding: "0 20px 12px" }}>
            <div>
              <Label className="mb-1 block">Quantity to remove (max {item.quantity} {item.unit})</Label>
              <Input type="number" min="0.1" max={item.quantity} step="0.1" value={qty} onChange={(e) => setQty(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1 block">Reason</Label>
              <Select value={reason} onValueChange={(v) => setReason(v as RemovalReason)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{REASONS.map(({ value, label }) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1 block">Notes (optional)</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any notes…" rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={saving || !qty || parseFloat(qty) > item.quantity}
              style={{ background: "var(--notion-red-bg)", color: "var(--notion-red)", border: "none" }}
            >
              {saving ? "Removing…" : "Confirm Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
