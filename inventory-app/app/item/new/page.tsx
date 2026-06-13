"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Camera, Sparkles, X, Loader2, Plus } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { saveItem, getAreas, getSubAreas, createArea, createSubArea } from "@/lib/db/operations";
import { resizeImage } from "@/lib/utils";
import type { Area, SubArea, Condition, Unit } from "@/lib/supabase/types";

const UNITS: Unit[] = ["pcs", "boxes", "kg", "g", "L", "mL", "pairs", "sets", "rolls", "other"];
const CONDITIONS: { value: Condition; label: string }[] = [
  { value: "new", label: "New" }, { value: "good", label: "Good" },
  { value: "fair", label: "Fair" }, { value: "poor", label: "Poor" },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-medium uppercase tracking-wide text-[#9B9A97] mb-3 mt-6 first:mt-0">{children}</p>;
}

export default function NewItemPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [identifyError, setIdentifyError] = useState<string | null>(null);
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
  const [areas, setAreas] = useState<Area[]>([]);
  const [subAreas, setSubAreas] = useState<SubArea[]>([]);
  const [newAreaName, setNewAreaName] = useState("");
  const [showNewArea, setShowNewArea] = useState(false);
  const [newSubAreaName, setNewSubAreaName] = useState("");
  const [showNewSubArea, setShowNewSubArea] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { getAreas().then(setAreas); }, []);
  useEffect(() => {
    if (areaId) { getSubAreas(areaId).then(setSubAreas); setSubAreaId(""); }
    else setSubAreas([]);
  }, [areaId]);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoDataUrl(await resizeImage(file));
    setIdentifyError(null);
  };

  const handleIdentify = async () => {
    if (!photoDataUrl) return;
    setIsIdentifying(true); setIdentifyError(null);
    try {
      const base64 = photoDataUrl.split(",")[1];
      const mime = photoDataUrl.split(";")[0].split(":")[1];
      const byteString = atob(base64);
      const arr = new Uint8Array(byteString.length);
      for (let i = 0; i < byteString.length; i++) arr[i] = byteString.charCodeAt(i);
      const fd = new FormData();
      fd.append("image", new Blob([arr], { type: mime }), "photo.jpg");
      const res = await fetch("/api/identify", { method: "POST", body: fd });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (data.name) setName(data.name);
      if (data.description) setDescription(data.description);
      if (data.condition) setCondition(data.condition as Condition);
      if (data.tags?.length) setTags(data.tags);
      if (data.suggestedArea) {
        const match = areas.find((a) => a.name.toLowerCase() === data.suggestedArea.toLowerCase());
        if (match) {
          setAreaId(match.id);
          if (data.suggestedSubArea) {
            const subs = await getSubAreas(match.id);
            setSubAreas(subs);
            const subMatch = subs.find((s) => s.name.toLowerCase().includes(data.suggestedSubArea.toLowerCase()));
            if (subMatch) setSubAreaId(subMatch.id);
          }
        } else { setNewAreaName(data.suggestedArea); setShowNewArea(true); }
      }
    } catch (err) {
      setIdentifyError(err instanceof Error ? err.message : "Could not identify item");
    } finally { setIsIdentifying(false); }
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) { setTags([...tags, t]); setTagInput(""); }
  };

  const handleAddArea = async () => {
    if (!newAreaName.trim()) return;
    const area = await createArea(newAreaName.trim());
    setAreas((p) => [...p, area].sort((a, b) => a.name.localeCompare(b.name)));
    setAreaId(area.id); setNewAreaName(""); setShowNewArea(false);
  };

  const handleAddSubArea = async () => {
    if (!newSubAreaName.trim() || !areaId) return;
    const sub = await createSubArea(areaId, newSubAreaName.trim());
    setSubAreas((p) => [...p, sub].sort((a, b) => a.name.localeCompare(b.name)));
    setSubAreaId(sub.id); setNewSubAreaName(""); setShowNewSubArea(false);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      await saveItem({ id: uuidv4(), name: name.trim(), description: description.trim() || null,
        area_id: areaId || null, sub_area_id: subAreaId || null, quantity: parseFloat(quantity) || 1,
        unit, condition, tags, notes: notes.trim() || null }, photoDataUrl ?? undefined);
      router.push("/inventory");
    } finally { setIsSaving(false); }
  };

  return (
    <div className="max-w-[560px] space-y-0 pb-8">
      <h1 className="text-[28px] font-bold text-[#37352F] tracking-tight mb-6">Add Item</h1>

      {/* Photo */}
      <SectionLabel>Photo</SectionLabel>
      <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} className="hidden" />
      {photoDataUrl ? (
        <div className="relative mb-3">
          <img src={photoDataUrl} alt="Item" className="w-full max-h-60 object-contain rounded-[4px] border border-[#E9E8E4] bg-[#F7F6F3]" />
          <button onClick={() => setPhotoDataUrl(null)} className="absolute top-2 right-2 p-1.5 bg-black/40 rounded-[3px] text-white hover:bg-black/60 transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button onClick={() => fileInputRef.current?.click()}
          className="w-full h-32 rounded-[4px] border border-dashed border-[#C4C1BB] flex flex-col items-center justify-center gap-2 text-[#9B9A97] hover:border-[#787774] hover:text-[#787774] transition-colors bg-[#F7F6F3] mb-3">
          <Camera className="h-6 w-6" />
          <span className="text-[13px]">Take photo or choose file</span>
        </button>
      )}
      {photoDataUrl && (
        <Button variant="secondary" onClick={handleIdentify} disabled={isIdentifying} className="w-full gap-1.5 mb-1">
          {isIdentifying ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Identifying…</> : <><Sparkles className="h-3.5 w-3.5" /> Identify with AI</>}
        </Button>
      )}
      {identifyError && (
        <p className="text-[12px] text-[#DFAB01] bg-[#FBF3DB] px-2.5 py-2 rounded-[3px] border border-[#E9E8E4] mt-2">
          AI unavailable: {identifyError}
        </p>
      )}

      {/* Details */}
      <SectionLabel>Details</SectionLabel>
      <div className="space-y-3">
        <div>
          <Label className="mb-1 block">Name *</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Power drill" />
        </div>
        <div>
          <Label className="mb-1 block">Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description…" rows={2} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="mb-1 block">Quantity</Label>
            <Input type="number" min="0.1" step="0.1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1 block">Unit</Label>
            <Select value={unit} onValueChange={(v) => setUnit(v as Unit)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label className="mb-1 block">Condition</Label>
          <Select value={condition} onValueChange={(v) => setCondition(v as Condition)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{CONDITIONS.map(({ value, label }) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      {/* Location */}
      <SectionLabel>Location</SectionLabel>
      <div className="space-y-3">
        <div>
          <Label className="mb-1 block">Area</Label>
          <div className="flex gap-2">
            <Select value={areaId} onValueChange={setAreaId}>
              <SelectTrigger className="flex-1"><SelectValue placeholder="Select area…" /></SelectTrigger>
              <SelectContent>{areas.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
            </Select>
            <Button type="button" variant="secondary" size="icon" onClick={() => setShowNewArea(!showNewArea)}><Plus className="h-3.5 w-3.5" /></Button>
          </div>
          {showNewArea && (
            <div className="flex gap-2 mt-2">
              <Input value={newAreaName} onChange={(e) => setNewAreaName(e.target.value)} placeholder="New area name…" onKeyDown={(e) => e.key === "Enter" && handleAddArea()} />
              <Button size="sm" onClick={handleAddArea}>Add</Button>
            </div>
          )}
        </div>
        {areaId && (
          <div>
            <Label className="mb-1 block">Sub-Area</Label>
            <div className="flex gap-2">
              <Select value={subAreaId} onValueChange={setSubAreaId}>
                <SelectTrigger className="flex-1"><SelectValue placeholder="Select sub-area…" /></SelectTrigger>
                <SelectContent>{subAreas.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
              <Button type="button" variant="secondary" size="icon" onClick={() => setShowNewSubArea(!showNewSubArea)}><Plus className="h-3.5 w-3.5" /></Button>
            </div>
            {showNewSubArea && (
              <div className="flex gap-2 mt-2">
                <Input value={newSubAreaName} onChange={(e) => setNewSubAreaName(e.target.value)} placeholder="New sub-area name…" onKeyDown={(e) => e.key === "Enter" && handleAddSubArea()} />
                <Button size="sm" onClick={handleAddSubArea}>Add</Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tags & Notes */}
      <SectionLabel>Tags & Notes</SectionLabel>
      <div className="space-y-3">
        <div>
          <Label className="mb-1 block">Tags</Label>
          <div className="flex gap-2">
            <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="Add tag…" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} />
            <Button type="button" variant="secondary" size="sm" onClick={addTag}>Add</Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1 cursor-pointer" onClick={() => setTags(tags.filter((t) => t !== tag))}>
                  {tag} <X className="h-2.5 w-2.5" />
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div>
          <Label className="mb-1 block">Notes</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any additional notes…" rows={2} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-6">
        <Button variant="secondary" onClick={() => router.back()} className="flex-1">Cancel</Button>
        <Button onClick={handleSave} disabled={!name.trim() || isSaving} className="flex-1">
          {isSaving ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Saving…</> : "Save Item"}
        </Button>
      </div>
    </div>
  );
}
