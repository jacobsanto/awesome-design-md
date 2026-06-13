"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { getAreas, getSubAreas, createArea, createSubArea, deleteArea, deleteSubArea, renameArea, renameSubArea } from "@/lib/db/operations";
import type { Area, SubArea } from "@/lib/supabase/types";

export default function AreasPage() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [subAreaMap, setSubAreaMap] = useState<Record<string, SubArea[]>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [newAreaName, setNewAreaName] = useState("");
  const [editingArea, setEditingArea] = useState<string | null>(null);
  const [editAreaName, setEditAreaName] = useState("");
  const [newSubArea, setNewSubArea] = useState<Record<string, string>>({});
  const [editingSub, setEditingSub] = useState<string | null>(null);
  const [editSubName, setEditSubName] = useState("");

  const load = async () => {
    const a = await getAreas();
    setAreas(a);
    const map: Record<string, SubArea[]> = {};
    for (const area of a) {
      map[area.id] = await getSubAreas(area.id);
    }
    setSubAreaMap(map);
  };

  useEffect(() => { load(); }, []);

  const handleCreateArea = async () => {
    if (!newAreaName.trim()) return;
    await createArea(newAreaName.trim());
    setNewAreaName("");
    load();
  };

  const handleRenameArea = async (id: string) => {
    if (!editAreaName.trim()) return;
    await renameArea(id, editAreaName.trim());
    setEditingArea(null);
    load();
  };

  const handleDeleteArea = async (id: string) => {
    await deleteArea(id);
    load();
  };

  const handleCreateSubArea = async (areaId: string) => {
    if (!newSubArea[areaId]?.trim()) return;
    await createSubArea(areaId, newSubArea[areaId].trim());
    setNewSubArea((prev) => ({ ...prev, [areaId]: "" }));
    load();
  };

  const handleRenameSub = async (id: string, areaId: string) => {
    if (!editSubName.trim()) return;
    await renameSubArea(id, editSubName.trim());
    setEditingSub(null);
    load();
  };

  const handleDeleteSub = async (id: string) => {
    await deleteSubArea(id);
    load();
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6 pb-4">
      {/* Page header */}
      <div>
        <h1 style={{ fontSize: "28px", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--notion-text)" }}>
          Areas & Sub-Areas
        </h1>
        <p style={{ fontSize: "14px", color: "var(--notion-text-secondary)", marginTop: "2px" }}>
          Organize your storage locations
        </p>
      </div>

      {/* Add area */}
      <div className="flex gap-2">
        <Input
          value={newAreaName}
          onChange={(e) => setNewAreaName(e.target.value)}
          placeholder="New area name (e.g. Kitchen)…"
          onKeyDown={(e) => e.key === "Enter" && handleCreateArea()}
        />
        <Button onClick={handleCreateArea} disabled={!newAreaName.trim()}>
          <Plus style={{ width: "14px", height: "14px" }} /> Add Area
        </Button>
      </div>

      {/* Area list */}
      {areas.length === 0 ? (
        <div className="text-center py-12" style={{ color: "var(--notion-text-tertiary)", fontSize: "14px" }}>
          <p>No areas yet. Add your first area above.</p>
        </div>
      ) : (
        <div
          style={{
            border: "1px solid var(--notion-border)",
            borderRadius: "4px",
            background: "var(--notion-bg)",
            overflow: "hidden",
          }}
        >
          {areas.map((area, areaIdx) => {
            const subs = subAreaMap[area.id] ?? [];
            const isExpanded = expanded[area.id];
            return (
              <div
                key={area.id}
                style={{ borderBottom: areaIdx < areas.length - 1 ? "1px solid var(--notion-border-light)" : "none" }}
              >
                {/* Area row */}
                <div
                  className="flex items-center gap-2 px-3 transition-colors"
                  style={{ height: "36px" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "var(--notion-bg-secondary)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                >
                  <button
                    onClick={() => toggleExpand(area.id)}
                    style={{ color: "var(--notion-text-tertiary)", flexShrink: 0 }}
                  >
                    {isExpanded
                      ? <ChevronDown style={{ width: "14px", height: "14px" }} />
                      : <ChevronRight style={{ width: "14px", height: "14px" }} />
                    }
                  </button>

                  {editingArea === area.id ? (
                    <div className="flex gap-2 flex-1">
                      <Input
                        value={editAreaName}
                        onChange={(e) => setEditAreaName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleRenameArea(area.id)}
                        autoFocus
                      />
                      <Button size="sm" onClick={() => handleRenameArea(area.id)}>Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingArea(null)}>Cancel</Button>
                    </div>
                  ) : (
                    <div className="flex items-center flex-1 gap-2 min-w-0">
                      <span
                        className="flex-1 truncate"
                        style={{ fontSize: "13px", fontWeight: 500, color: "var(--notion-text)" }}
                      >
                        {area.name}
                      </span>
                      <span style={{ fontSize: "12px", color: "var(--notion-text-tertiary)", flexShrink: 0 }}>
                        {subs.length} sub-area{subs.length !== 1 ? "s" : ""}
                      </span>
                      <button
                        onClick={() => { setEditingArea(area.id); setEditAreaName(area.name); }}
                        className="flex-shrink-0 p-1 transition-colors"
                        style={{ color: "var(--notion-text-tertiary)", borderRadius: "3px" }}
                        onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = "var(--notion-text)"}
                        onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = "var(--notion-text-tertiary)"}
                      >
                        <Pencil style={{ width: "12px", height: "12px" }} />
                      </button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            className="flex-shrink-0 p-1 transition-colors"
                            style={{ color: "var(--notion-text-tertiary)", borderRadius: "3px" }}
                            onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = "var(--notion-red)"}
                            onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = "var(--notion-text-tertiary)"}
                          >
                            <Trash2 style={{ width: "12px", height: "12px" }} />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete &ldquo;{area.name}&rdquo;?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will delete the area and all its sub-areas. Items will not be deleted but will lose their area assignment.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteArea(area.id)}
                              style={{ background: "var(--notion-red)", color: "white" }}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>

                {/* Sub-areas */}
                {isExpanded && (
                  <div style={{ borderTop: "1px solid var(--notion-border-light)", background: "var(--notion-bg-secondary)" }}>
                    {subs.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center gap-2 pl-8 pr-3 transition-colors"
                        style={{
                          height: "32px",
                          borderBottom: "1px solid var(--notion-border-light)",
                        }}
                        onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = "var(--notion-bg-hover)"}
                        onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = "transparent"}
                      >
                        {editingSub === sub.id ? (
                          <div className="flex gap-2 flex-1">
                            <Input
                              value={editSubName}
                              onChange={(e) => setEditSubName(e.target.value)}
                              autoFocus
                              onKeyDown={(e) => e.key === "Enter" && handleRenameSub(sub.id, area.id)}
                            />
                            <Button size="sm" onClick={() => handleRenameSub(sub.id, area.id)}>Save</Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditingSub(null)}>Cancel</Button>
                          </div>
                        ) : (
                          <>
                            <span className="flex-1 truncate" style={{ fontSize: "13px", color: "var(--notion-text-secondary)" }}>
                              {sub.name}
                            </span>
                            <button
                              onClick={() => { setEditingSub(sub.id); setEditSubName(sub.name); }}
                              className="p-1 flex-shrink-0"
                              style={{ color: "var(--notion-text-tertiary)" }}
                              onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = "var(--notion-text)"}
                              onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = "var(--notion-text-tertiary)"}
                            >
                              <Pencil style={{ width: "11px", height: "11px" }} />
                            </button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <button
                                  className="p-1 flex-shrink-0"
                                  style={{ color: "var(--notion-text-tertiary)" }}
                                  onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = "var(--notion-red)"}
                                  onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = "var(--notion-text-tertiary)"}
                                >
                                  <Trash2 style={{ width: "11px", height: "11px" }} />
                                </button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete &ldquo;{sub.name}&rdquo;?</AlertDialogTitle>
                                  <AlertDialogDescription>Items in this sub-area will lose their sub-area assignment.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteSub(sub.id)}
                                    style={{ background: "var(--notion-red)", color: "white" }}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                      </div>
                    ))}

                    {/* Add sub-area */}
                    <div className="flex gap-2 pl-8 pr-3 py-2">
                      <Input
                        value={newSubArea[area.id] ?? ""}
                        onChange={(e) => setNewSubArea((prev) => ({ ...prev, [area.id]: e.target.value }))}
                        placeholder="Add sub-area…"
                        onKeyDown={(e) => e.key === "Enter" && handleCreateSubArea(area.id)}
                      />
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleCreateSubArea(area.id)}
                        disabled={!newSubArea[area.id]?.trim()}
                        style={{ border: "1px solid var(--notion-border)", flexShrink: 0 }}
                      >
                        <Plus style={{ width: "12px", height: "12px" }} />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
