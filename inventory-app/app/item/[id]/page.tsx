"use client";

import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { Camera, X, Loader2, Plus, Trash2, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { getItem, saveItem, deleteItem, getAreas, getSubAreas, createArea, createSubArea } from "@/lib/db/operations";
import { resizeImage, formatDateTime } from "@/lib/utils";
import { RemoveDialog } from "@/components/RemoveDialog";
import type { Item, Area, SubArea, Condition, Unit } from "@/lib/supabase/types";

const UNITS: Unit[] = ["pcs", "boxes", "kg", "g", "L", "mL", "pairs", "sets", "rolls", "other"];
const CONDITIONS: { value: Condition; label: string }[] = [
  { value: "new", label: "New" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" },
];

const sectionLabel: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 500,
  color: "var(--notion-text-tertiary)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: "8px",
  marginTop: "4px",
};

export default function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [areas, setAreas] = useState<Area[]>([]);
  const [subAreas, setSubAreas] = useState<SubArea[]>([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [areaId, setAreaId] = useState("");
  const [subAreaId, setSubAreaId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState<Unit>("pcs");
  const [condition, setCondition] = useState<Condition>("good");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showNewArea, setShowNewArea] = useState(false);
  const [newAreaName, setNewAreaName] = useState("");
  const [showNewSubArea, setShowNewSubArea] = useState(false);
  const [newSubAreaName, setNewSubAreaName] = useState("");

  useEffect(() => {
    Promise.all([getItem(id), getAreas()]).then(([i, a]) => {
      if (i) {
        setItem(i);
        setName(i.name);
        setDescription(i.description ?? "");
        setAreaId(i.area_id ?? "");
        setSubAreaId(i.sub_area_id ?? "");
        setQuantity(String(i.quantity));
        setUnit(i.unit);
        setCondition(i.condition);
        setTags(i.tags ?? []);
        setNotes(i.notes ?? "");
        if (i.area_id) getSubAreas(i.area_id).then(setSubAreas);
      }
      setAreas(a);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (areaId) getSubAreas(areaId).then(setSubAreas);
    else setSubAreas([]);
  }, [areaId]);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoDataUrl(await resizeImage(file));
  };

  const handleSave = async () => {
    if (!item || !name.trim()) return;
    setIsSaving(true);
    try {
      await saveItem(
        {
          ...item,
          name: name.trim(),
          description: description.trim() || null,
          area_id: areaId || null,
          sub_area_id: subAreaId || null,
          quantity: parseFloat(quantity) || 1,
          unit,
          condition,
          tags,
          notes: notes.trim() || null,
        },
        photoDataUrl ?? undefined
      );
      router.push("/inventory");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!item) return;
    await deleteItem(item.id);
    router.push("/inventory");
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) { setTags([...tags, t]); setTagInput(""); }
  };

  const handleAddArea = async () => {
    if (!newAreaName.trim()) return;
    const area = await createArea(newAreaName.trim());
    setAreas((prev) => [...prev, area].sort((a, b) => a.name.localeCompare(b.name)));
    setAreaId(area.id); setNewAreaName(""); setShowNewArea(false);
  };

  const handleAddSubArea = async () => {
    if (!newSubAreaName.trim() || !areaId) return;
    const sub = await createSubArea(areaId, newSubAreaName.trim());
    setSubAreas((prev) => [...prev, sub].sort((a, b) => a.name.localeCompare(b.name)));
    setSubAreaId(sub.id); setNewSubAreaName(""); setShowNewSubArea(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin" style={{ width: "24px", height: "24px", color: "var(--notion-border)" }} />
    </div>
  );
  if (!item) return (
    <div className="text-center py-16" style={{ fontSize: "14px", color: "var(--notion-text-secondary)" }}>
      Item not found.
    </div>
  );

  const currentPhoto = photoDataUrl ?? item.photo_url;

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <h1
          className="truncate"
          style={{ fontSize: "28px", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--notion-text)" }}
        >
          {item.name}
        </h1>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              style={{ color: "var(--notion-red)", flexShrink: 0 }}
            >
              <Trash2 style={{ width: "16px", height: "16px" }} />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete item?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete &ldquo;{item.name}&rdquo; from your inventory. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                style={{ background: "var(--notion-red)", color: "white" }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <p style={{ fontSize: "12px", color: "var(--notion-text-tertiary)" }}>
        Added {formatDateTime(item.date_added)} · Updated {formatDateTime(item.date_updated)}
      </p>

      {/* Photo */}
      <div>
        <p style={sectionLabel}>Photo</p>
        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} className="hidden" />
        {currentPhoto ? (
          <div className="relative">
            <img
              src={currentPhoto}
              alt={item.name}
              className="w-full object-contain"
              style={{
                maxHeight: "240px",
                border: "1px solid var(--notion-border)",
                borderRadius: "4px",
                background: "var(--notion-bg-secondary)",
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-2 right-2"
              style={{ padding: "6px", background: "rgba(0,0,0,0.5)", borderRadius: "3px", color: "white" }}
            >
              <Camera style={{ width: "14px", height: "14px" }} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex flex-col items-center justify-center gap-2"
            style={{
              height: "120px",
              border: "1px dashed var(--notion-border)",
              borderRadius: "4px",
              background: "var(--notion-bg-secondary)",
              color: "var(--notion-text-tertiary)",
            }}
          >
            <Camera style={{ width: "20px", height: "20px" }} />
            <span style={{ fontSize: "13px" }}>Add photo</span>
          </button>
        )}
      </div>

      {/* Form */}
      <div className="space-y-4">
        <p style={sectionLabel}>Item Details</p>

        <div>
          <Label>Name *</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label>Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Quantity</Label>
            <Input type="number" min="0.1" step="0.1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>
          <div>
            <Label>Unit</Label>
            <Select value={unit} onValueChange={(v) => setUnit(v as Unit)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label>Condition</Label>
          <Select value={condition} onValueChange={(v) => setCondition(v as Condition)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{CONDITIONS.map(({ value, label }) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <p style={sectionLabel}>Location</p>

        <div>
          <Label>Area</Label>
          <div className="flex gap-2">
            <Select value={areaId} onValueChange={(v) => { setAreaId(v); setSubAreaId(""); }}>
              <SelectTrigger className="flex-1"><SelectValue placeholder="Select area…" /></SelectTrigger>
              <SelectContent>{areas.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
            </Select>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={() => setShowNewArea(!showNewArea)}
              style={{ border: "1px solid var(--notion-border)", flexShrink: 0 }}
            >
              <Plus style={{ width: "14px", height: "14px" }} />
            </Button>
          </div>
          {showNewArea && (
            <div className="flex gap-2 mt-2">
              <Input value={newAreaName} onChange={(e) => setNewAreaName(e.target.value)} placeholder="New area name…" onKeyDown={(e) => e.key === "Enter" && handleAddArea()} />
              <Button type="button" size="sm" onClick={handleAddArea}>Add</Button>
            </div>
          )}
        </div>

        {areaId && (
          <div>
            <Label>Sub-Area</Label>
            <div className="flex gap-2">
              <Select value={subAreaId} onValueChange={setSubAreaId}>
                <SelectTrigger className="flex-1"><SelectValue placeholder="Select sub-area…" /></SelectTrigger>
                <SelectContent>{subAreas.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={() => setShowNewSubArea(!showNewSubArea)}
                style={{ border: "1px solid var(--notion-border)", flexShrink: 0 }}
              >
                <Plus style={{ width: "14px", height: "14px" }} />
              </Button>
            </div>
            {showNewSubArea && (
              <div className="flex gap-2 mt-2">
                <Input value={newSubAreaName} onChange={(e) => setNewSubAreaName(e.target.value)} placeholder="New sub-area name…" onKeyDown={(e) => e.key === "Enter" && handleAddSubArea()} />
                <Button type="button" size="sm" onClick={handleAddSubArea}>Add</Button>
              </div>
            )}
          </div>
        )}

        <p style={sectionLabel}>Additional</p>

        <div>
          <Label>Tags</Label>
          <div className="flex gap-2">
            <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="Add tag…" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} />
            <Button type="button" variant="secondary" size="sm" onClick={addTag} style={{ border: "1px solid var(--notion-border)" }}>Add</Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1 cursor-pointer" onClick={() => setTags(tags.filter((t) => t !== tag))}>
                  {tag} <X style={{ width: "10px", height: "10px" }} />
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div>
          <Label>Notes</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
        </div>
      </div>

      {/* Remove */}
      <div style={{ borderTop: "1px solid var(--notion-border-light)", paddingTop: "16px" }}>
        <RemoveDialog item={item} onSuccess={() => router.push("/inventory")}>
          <Button
            variant="destructive"
            className="w-full gap-2"
            style={{ border: "1px solid var(--notion-red-bg)" }}
          >
            <Minus style={{ width: "14px", height: "14px" }} /> Remove Quantity
          </Button>
        </RemoveDialog>
      </div>

      <div className="flex gap-2">
        <Button
          variant="secondary"
          onClick={() => router.back()}
          className="flex-1"
          style={{ border: "1px solid var(--notion-border)" }}
        >
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!name.trim() || isSaving} className="flex-1">
          {isSaving ? <><Loader2 style={{ width: "14px", height: "14px" }} className="animate-spin" /> Saving…</> : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
