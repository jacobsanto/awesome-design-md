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

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-slate-300" /></div>;
  if (!item) return <div className="text-center py-16 text-slate-500">Item not found.</div>;

  const currentPhoto = photoDataUrl ?? item.photo_url;

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 truncate">{item.name}</h1>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50">
              <Trash2 className="h-5 w-5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete item?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete "{item.name}" from your inventory. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <p className="text-xs text-slate-400">
        Added {formatDateTime(item.date_added)} · Updated {formatDateTime(item.date_updated)}
      </p>

      {/* Photo */}
      <div className="space-y-2">
        <Label>Photo</Label>
        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} className="hidden" />
        {currentPhoto ? (
          <div className="relative">
            <img src={currentPhoto} alt={item.name} className="w-full max-h-64 object-contain rounded-xl border border-slate-200 bg-slate-50" />
            <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-2 right-2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70">
              <Camera className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button onClick={() => fileInputRef.current?.click()} className="w-full h-36 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-slate-400 bg-slate-50">
            <Camera className="h-6 w-6" />
            <span className="text-sm">Add photo</span>
          </button>
        )}
      </div>

      {/* Form */}
      <div className="space-y-4">
        <div>
          <Label>Name *</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label>Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1" rows={2} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Quantity</Label>
            <Input type="number" min="0.1" step="0.1" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>Unit</Label>
            <Select value={unit} onValueChange={(v) => setUnit(v as Unit)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>{UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label>Condition</Label>
          <Select value={condition} onValueChange={(v) => setCondition(v as Condition)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>{CONDITIONS.map(({ value, label }) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        {/* Area */}
        <div>
          <Label>Area</Label>
          <div className="flex gap-2 mt-1">
            <Select value={areaId} onValueChange={(v) => { setAreaId(v); setSubAreaId(""); }}>
              <SelectTrigger className="flex-1"><SelectValue placeholder="Select area…" /></SelectTrigger>
              <SelectContent>{areas.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
            </Select>
            <Button type="button" variant="outline" size="icon" onClick={() => setShowNewArea(!showNewArea)}><Plus className="h-4 w-4" /></Button>
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
            <div className="flex gap-2 mt-1">
              <Select value={subAreaId} onValueChange={setSubAreaId}>
                <SelectTrigger className="flex-1"><SelectValue placeholder="Select sub-area…" /></SelectTrigger>
                <SelectContent>{subAreas.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
              <Button type="button" variant="outline" size="icon" onClick={() => setShowNewSubArea(!showNewSubArea)}><Plus className="h-4 w-4" /></Button>
            </div>
            {showNewSubArea && (
              <div className="flex gap-2 mt-2">
                <Input value={newSubAreaName} onChange={(e) => setNewSubAreaName(e.target.value)} placeholder="New sub-area name…" onKeyDown={(e) => e.key === "Enter" && handleAddSubArea()} />
                <Button type="button" size="sm" onClick={handleAddSubArea}>Add</Button>
              </div>
            )}
          </div>
        )}

        {/* Tags */}
        <div>
          <Label>Tags</Label>
          <div className="flex gap-2 mt-1">
            <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="Add tag…" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} />
            <Button type="button" variant="outline" size="sm" onClick={addTag}>Add</Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1 cursor-pointer" onClick={() => setTags(tags.filter((t) => t !== tag))}>
                  {tag} <X className="h-3 w-3" />
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div>
          <Label>Notes</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1" rows={2} />
        </div>
      </div>

      {/* Remove */}
      <div className="border-t pt-4">
        <RemoveDialog item={item} onSuccess={() => router.push("/inventory")}>
          <Button variant="outline" className="w-full gap-2 text-red-600 border-red-200 hover:bg-red-50">
            <Minus className="h-4 w-4" /> Remove Quantity
          </Button>
        </RemoveDialog>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => router.back()} className="flex-1">Cancel</Button>
        <Button onClick={handleSave} disabled={!name.trim() || isSaving} className="flex-1">
          {isSaving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving…</> : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
