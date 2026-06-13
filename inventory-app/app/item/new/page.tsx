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
  { value: "new", label: "New" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" },
];

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

  useEffect(() => {
    getAreas().then(setAreas);
  }, []);

  useEffect(() => {
    if (areaId) {
      getSubAreas(areaId).then(setSubAreas);
      setSubAreaId("");
    } else {
      setSubAreas([]);
    }
  }, [areaId]);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const resized = await resizeImage(file);
    setPhotoDataUrl(resized);
    setIdentifyError(null);
  };

  const handleIdentify = async () => {
    if (!photoDataUrl) return;
    setIsIdentifying(true);
    setIdentifyError(null);
    try {
      const base64 = photoDataUrl.split(",")[1];
      const mime = photoDataUrl.split(";")[0].split(":")[1];
      const byteString = atob(base64);
      const arr = new Uint8Array(byteString.length);
      for (let i = 0; i < byteString.length; i++) arr[i] = byteString.charCodeAt(i);
      const blob = new Blob([arr], { type: mime });

      const fd = new FormData();
      fd.append("image", blob, "photo.jpg");
      const res = await fetch("/api/identify", { method: "POST", body: fd });
      const data = await res.json();

      if (data.error) throw new Error(data.error);

      if (data.name) setName(data.name);
      if (data.description) setDescription(data.description);
      if (data.condition) setCondition(data.condition as Condition);
      if (data.tags?.length) setTags(data.tags);

      // Try to match area by name
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
        } else {
          setNewAreaName(data.suggestedArea);
          setShowNewArea(true);
        }
      }
    } catch (err) {
      setIdentifyError(err instanceof Error ? err.message : "Could not identify item");
    } finally {
      setIsIdentifying(false);
    }
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
      setTagInput("");
    }
  };

  const handleAddArea = async () => {
    if (!newAreaName.trim()) return;
    const area = await createArea(newAreaName.trim());
    setAreas((prev) => [...prev, area].sort((a, b) => a.name.localeCompare(b.name)));
    setAreaId(area.id);
    setNewAreaName("");
    setShowNewArea(false);
  };

  const handleAddSubArea = async () => {
    if (!newSubAreaName.trim() || !areaId) return;
    const sub = await createSubArea(areaId, newSubAreaName.trim());
    setSubAreas((prev) => [...prev, sub].sort((a, b) => a.name.localeCompare(b.name)));
    setSubAreaId(sub.id);
    setNewSubAreaName("");
    setShowNewSubArea(false);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      const id = uuidv4();
      await saveItem(
        {
          id,
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

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add Item</h1>
        <p className="text-slate-500 text-sm mt-0.5">Photograph or manually enter a new item</p>
      </div>

      {/* Photo Section */}
      <div className="space-y-3">
        <Label>Photo (optional)</Label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhotoChange}
          className="hidden"
        />
        {photoDataUrl ? (
          <div className="relative">
            <img
              src={photoDataUrl}
              alt="Item photo"
              className="w-full max-h-64 object-contain rounded-xl border border-slate-200 bg-slate-50"
            />
            <button
              onClick={() => setPhotoDataUrl(null)}
              className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full text-white hover:bg-black/70"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-40 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-slate-400 hover:text-slate-500 transition-colors bg-slate-50"
          >
            <Camera className="h-8 w-8" />
            <span className="text-sm font-medium">Take photo or choose file</span>
          </button>
        )}

        {photoDataUrl && (
          <Button
            variant="outline"
            onClick={handleIdentify}
            disabled={isIdentifying}
            className="w-full gap-2"
          >
            {isIdentifying ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Identifying…</>
            ) : (
              <><Sparkles className="h-4 w-4" /> Identify with AI</>
            )}
          </Button>
        )}

        {identifyError && (
          <p className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-md">
            AI unavailable: {identifyError}. Please fill in the details manually.
          </p>
        )}
      </div>

      {/* Form */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Power drill"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description…"
            className="mt-1"
            rows={2}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="0.1"
              step="0.1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Unit</Label>
            <Select value={unit} onValueChange={(v) => setUnit(v as Unit)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>Condition</Label>
          <Select value={condition} onValueChange={(v) => setCondition(v as Condition)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CONDITIONS.map(({ value, label }) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Area */}
        <div>
          <Label>Area</Label>
          <div className="flex gap-2 mt-1">
            <Select value={areaId} onValueChange={setAreaId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select area…" />
              </SelectTrigger>
              <SelectContent>
                {areas.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setShowNewArea(!showNewArea)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {showNewArea && (
            <div className="flex gap-2 mt-2">
              <Input
                value={newAreaName}
                onChange={(e) => setNewAreaName(e.target.value)}
                placeholder="New area name…"
                onKeyDown={(e) => e.key === "Enter" && handleAddArea()}
              />
              <Button type="button" size="sm" onClick={handleAddArea}>Add</Button>
            </div>
          )}
        </div>

        {/* Sub-Area */}
        {areaId && (
          <div>
            <Label>Sub-Area</Label>
            <div className="flex gap-2 mt-1">
              <Select value={subAreaId} onValueChange={setSubAreaId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select sub-area…" />
                </SelectTrigger>
                <SelectContent>
                  {subAreas.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setShowNewSubArea(!showNewSubArea)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {showNewSubArea && (
              <div className="flex gap-2 mt-2">
                <Input
                  value={newSubAreaName}
                  onChange={(e) => setNewSubAreaName(e.target.value)}
                  placeholder="New sub-area name…"
                  onKeyDown={(e) => e.key === "Enter" && handleAddSubArea()}
                />
                <Button type="button" size="sm" onClick={handleAddSubArea}>Add</Button>
              </div>
            )}
          </div>
        )}

        {/* Tags */}
        <div>
          <Label>Tags</Label>
          <div className="flex gap-2 mt-1">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Add tag…"
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
            />
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
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional notes…"
            className="mt-1"
            rows={2}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={() => router.back()} className="flex-1">
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!name.trim() || isSaving} className="flex-1">
          {isSaving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving…</> : "Save Item"}
        </Button>
      </div>
    </div>
  );
}
