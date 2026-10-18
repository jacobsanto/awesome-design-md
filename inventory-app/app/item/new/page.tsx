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

const sectionLabel: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 500,
  color: "var(--notion-text-tertiary)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: "8px",
  marginTop: "4px",
};

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
    <div className="space-y-5 pb-8">
      {/* Page header */}
      <div>
        <h1 style={{ fontSize: "28px", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--notion-text)" }}>
          Add Item
        </h1>
        <p style={{ fontSize: "14px", color: "var(--notion-text-secondary)", marginTop: "2px" }}>
          Photograph or manually enter a new item
        </p>
      </div>

      {/* Photo section */}
      <div>
        <p style={sectionLabel}>Photo</p>
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
              className="w-full object-contain"
              style={{
                maxHeight: "240px",
                border: "1px solid var(--notion-border)",
                borderRadius: "4px",
                background: "var(--notion-bg-secondary)",
              }}
            />
            <button
              onClick={() => setPhotoDataUrl(null)}
              className="absolute top-2 right-2"
              style={{
                padding: "4px",
                background: "rgba(0,0,0,0.5)",
                borderRadius: "3px",
                color: "white",
              }}
            >
              <X style={{ width: "14px", height: "14px" }} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex flex-col items-center justify-center gap-2 transition-colors"
            style={{
              height: "140px",
              border: "1px dashed var(--notion-border)",
              borderRadius: "4px",
              background: "var(--notion-bg-secondary)",
              color: "var(--notion-text-tertiary)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--notion-text-placeholder)";
              (e.currentTarget as HTMLElement).style.color = "var(--notion-text-secondary)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--notion-border)";
              (e.currentTarget as HTMLElement).style.color = "var(--notion-text-tertiary)";
            }}
          >
            <Camera style={{ width: "24px", height: "24px" }} />
            <span style={{ fontSize: "13px" }}>Take photo or choose file</span>
          </button>
        )}

        {photoDataUrl && (
          <Button
            variant="secondary"
            onClick={handleIdentify}
            disabled={isIdentifying}
            className="w-full gap-2 mt-2"
            style={{ border: "1px solid var(--notion-border)" }}
          >
            {isIdentifying ? (
              <><Loader2 style={{ width: "14px", height: "14px" }} className="animate-spin" /> Identifying…</>
            ) : (
              <><Sparkles style={{ width: "14px", height: "14px" }} /> Identify with AI</>
            )}
          </Button>
        )}

        {identifyError && (
          <p
            className="px-3 py-2 mt-2"
            style={{
              fontSize: "13px",
              color: "var(--notion-yellow)",
              background: "var(--notion-yellow-bg)",
              borderRadius: "3px",
            }}
          >
            AI unavailable: {identifyError}. Please fill in the details manually.
          </p>
        )}
      </div>

      {/* Form fields */}
      <div className="space-y-4">
        <p style={sectionLabel}>Item Details</p>

        <div>
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Power drill"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description…"
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
            />
          </div>
          <div>
            <Label>Unit</Label>
            <Select value={unit} onValueChange={(v) => setUnit(v as Unit)}>
              <SelectTrigger>
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
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CONDITIONS.map(({ value, label }) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Location section */}
        <p style={sectionLabel}>Location</p>

        <div>
          <Label>Area</Label>
          <div className="flex gap-2">
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

        {areaId && (
          <div>
            <Label>Sub-Area</Label>
            <div className="flex gap-2">
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

        {/* Tags & Notes section */}
        <p style={sectionLabel}>Additional</p>

        <div>
          <Label>Tags</Label>
          <div className="flex gap-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Add tag…"
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
            />
            <Button type="button" variant="secondary" size="sm" onClick={addTag} style={{ border: "1px solid var(--notion-border)" }}>
              Add
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="gap-1 cursor-pointer"
                  onClick={() => setTags(tags.filter((t) => t !== tag))}
                >
                  {tag} <X style={{ width: "10px", height: "10px" }} />
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
            rows={2}
          />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button variant="secondary" onClick={() => router.back()} className="flex-1" style={{ border: "1px solid var(--notion-border)" }}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!name.trim() || isSaving} className="flex-1">
          {isSaving ? <><Loader2 style={{ width: "14px", height: "14px" }} className="animate-spin" /> Saving…</> : "Save Item"}
        </Button>
      </div>
    </div>
  );
}
