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
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Areas & Sub-Areas</h1>
        <p className="text-slate-500 text-sm mt-0.5">Organize your storage locations</p>
      </div>

      {/* Create new area */}
      <div className="flex gap-2">
        <Input
          value={newAreaName}
          onChange={(e) => setNewAreaName(e.target.value)}
          placeholder="New area name (e.g. Kitchen)…"
          onKeyDown={(e) => e.key === "Enter" && handleCreateArea()}
        />
        <Button onClick={handleCreateArea} disabled={!newAreaName.trim()}>
          <Plus className="h-4 w-4 mr-1" /> Add Area
        </Button>
      </div>

      {/* Area list */}
      {areas.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <p>No areas yet. Add your first area above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {areas.map((area) => {
            const subs = subAreaMap[area.id] ?? [];
            const isExpanded = expanded[area.id];
            return (
              <div key={area.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {/* Area header */}
                <div className="flex items-center gap-2 p-4">
                  <button onClick={() => toggleExpand(area.id)} className="text-slate-400 hover:text-slate-600">
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>

                  {editingArea === area.id ? (
                    <div className="flex gap-2 flex-1">
                      <Input
                        value={editAreaName}
                        onChange={(e) => setEditAreaName(e.target.value)}
                        className="h-8 text-sm"
                        onKeyDown={(e) => e.key === "Enter" && handleRenameArea(area.id)}
                        autoFocus
                      />
                      <Button size="sm" onClick={() => handleRenameArea(area.id)}>Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingArea(null)}>Cancel</Button>
                    </div>
                  ) : (
                    <div className="flex items-center flex-1 gap-2">
                      <span className="font-semibold text-slate-800 flex-1">{area.name}</span>
                      <span className="text-xs text-slate-400">{subs.length} sub-area{subs.length !== 1 ? "s" : ""}</span>
                      <button
                        onClick={() => { setEditingArea(area.id); setEditAreaName(area.name); }}
                        className="p-1.5 text-slate-400 hover:text-slate-600 rounded"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button className="p-1.5 text-slate-400 hover:text-red-500 rounded">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete "{area.name}"?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will delete the area and all its sub-areas. Items will not be deleted but will lose their area assignment.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteArea(area.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>

                {/* Sub-areas */}
                {isExpanded && (
                  <div className="border-t border-slate-100 px-4 pb-4 pt-3 space-y-2">
                    {subs.map((sub) => (
                      <div key={sub.id} className="flex items-center gap-2 pl-4 py-1.5 rounded-md hover:bg-slate-50">
                        {editingSub === sub.id ? (
                          <div className="flex gap-2 flex-1">
                            <Input value={editSubName} onChange={(e) => setEditSubName(e.target.value)} className="h-7 text-sm" autoFocus onKeyDown={(e) => e.key === "Enter" && handleRenameSub(sub.id, area.id)} />
                            <Button size="sm" onClick={() => handleRenameSub(sub.id, area.id)}>Save</Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditingSub(null)}>Cancel</Button>
                          </div>
                        ) : (
                          <>
                            <span className="text-sm text-slate-600 flex-1">{sub.name}</span>
                            <button onClick={() => { setEditingSub(sub.id); setEditSubName(sub.name); }} className="p-1 text-slate-400 hover:text-slate-600">
                              <Pencil className="h-3 w-3" />
                            </button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <button className="p-1 text-slate-400 hover:text-red-500">
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete "{sub.name}"?</AlertDialogTitle>
                                  <AlertDialogDescription>Items in this sub-area will lose their sub-area assignment.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteSub(sub.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                      </div>
                    ))}

                    {/* Add sub-area */}
                    <div className="flex gap-2 pl-4 pt-1">
                      <Input
                        value={newSubArea[area.id] ?? ""}
                        onChange={(e) => setNewSubArea((prev) => ({ ...prev, [area.id]: e.target.value }))}
                        placeholder="Add sub-area…"
                        className="h-8 text-sm"
                        onKeyDown={(e) => e.key === "Enter" && handleCreateSubArea(area.id)}
                      />
                      <Button size="sm" variant="outline" onClick={() => handleCreateSubArea(area.id)} disabled={!newSubArea[area.id]?.trim()}>
                        <Plus className="h-3.5 w-3.5" />
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
