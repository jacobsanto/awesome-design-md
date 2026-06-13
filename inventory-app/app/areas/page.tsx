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
    for (const area of a) map[area.id] = await getSubAreas(area.id);
    setSubAreaMap(map);
  };

  useEffect(() => { load(); }, []);

  const handleCreateArea = async () => {
    if (!newAreaName.trim()) return;
    await createArea(newAreaName.trim());
    setNewAreaName(""); load();
  };
  const handleRenameArea = async (id: string) => {
    if (!editAreaName.trim()) return;
    await renameArea(id, editAreaName.trim());
    setEditingArea(null); load();
  };
  const handleDeleteArea = async (id: string) => { await deleteArea(id); load(); };
  const handleCreateSubArea = async (areaId: string) => {
    if (!newSubArea[areaId]?.trim()) return;
    await createSubArea(areaId, newSubArea[areaId].trim());
    setNewSubArea((p) => ({ ...p, [areaId]: "" })); load();
  };
  const handleRenameSub = async (id: string) => {
    if (!editSubName.trim()) return;
    await renameSubArea(id, editSubName.trim());
    setEditingSub(null); load();
  };
  const handleDeleteSub = async (id: string) => { await deleteSubArea(id); load(); };

  return (
    <div className="max-w-[600px] space-y-6 pb-8">
      <div>
        <h1 className="text-[28px] font-bold text-[#37352F] tracking-tight">Areas</h1>
        <p className="text-[13px] text-[#787774] mt-1">Manage your storage locations and sub-areas</p>
      </div>

      {/* Add area */}
      <div className="flex gap-2">
        <Input
          value={newAreaName}
          onChange={(e) => setNewAreaName(e.target.value)}
          placeholder="New area (e.g. Kitchen)…"
          onKeyDown={(e) => e.key === "Enter" && handleCreateArea()}
        />
        <Button onClick={handleCreateArea} disabled={!newAreaName.trim()} size="sm">
          <Plus className="h-3.5 w-3.5 mr-1" /> Add Area
        </Button>
      </div>

      {/* Area list */}
      {areas.length === 0 ? (
        <p className="text-[13px] text-[#9B9A97] py-8 text-center">No areas yet. Add your first one above.</p>
      ) : (
        <div className="rounded-[4px] border border-[#E9E8E4] bg-white divide-y divide-[#F1F1EF]">
          {areas.map((area) => {
            const subs = subAreaMap[area.id] ?? [];
            const isExpanded = expanded[area.id];
            return (
              <div key={area.id}>
                {/* Area row */}
                <div className="flex items-center gap-1 px-3 h-9 hover:bg-[#F7F6F3] group transition-colors">
                  <button onClick={() => setExpanded((p) => ({ ...p, [area.id]: !p[area.id] }))} className="text-[#9B9A97] hover:text-[#37352F] mr-0.5">
                    {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                  </button>

                  {editingArea === area.id ? (
                    <div className="flex gap-2 flex-1">
                      <Input value={editAreaName} onChange={(e) => setEditAreaName(e.target.value)} className="h-6 text-[12px]" autoFocus onKeyDown={(e) => e.key === "Enter" && handleRenameArea(area.id)} />
                      <Button size="sm" onClick={() => handleRenameArea(area.id)}>Save</Button>
                      <Button size="sm" variant="secondary" onClick={() => setEditingArea(null)}>Cancel</Button>
                    </div>
                  ) : (
                    <>
                      <span className="text-[13px] font-medium text-[#37352F] flex-1">{area.name}</span>
                      <span className="text-[11px] text-[#9B9A97] mr-2">{subs.length} sub-area{subs.length !== 1 ? "s" : ""}</span>
                      <div className="hidden group-hover:flex items-center gap-0.5">
                        <button onClick={() => { setEditingArea(area.id); setEditAreaName(area.name); }} className="p-1 text-[#9B9A97] hover:text-[#37352F] rounded-[3px] hover:bg-[#EFEFEF]">
                          <Pencil className="h-3 w-3" />
                        </button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button className="p-1 text-[#9B9A97] hover:text-[#EB5757] rounded-[3px] hover:bg-[#FBE4E4]">
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete "{area.name}"?</AlertDialogTitle>
                              <AlertDialogDescription>This deletes the area and all its sub-areas. Items will lose their area assignment.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteArea(area.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </>
                  )}
                </div>

                {/* Sub-areas */}
                {isExpanded && (
                  <div className="bg-[#FAFAF9] divide-y divide-[#F1F1EF]">
                    {subs.map((sub) => (
                      <div key={sub.id} className="flex items-center gap-1 pl-8 pr-3 h-8 hover:bg-[#F7F6F3] group transition-colors">
                        {editingSub === sub.id ? (
                          <div className="flex gap-2 flex-1">
                            <Input value={editSubName} onChange={(e) => setEditSubName(e.target.value)} className="h-6 text-[12px]" autoFocus onKeyDown={(e) => e.key === "Enter" && handleRenameSub(sub.id)} />
                            <Button size="sm" onClick={() => handleRenameSub(sub.id)}>Save</Button>
                            <Button size="sm" variant="secondary" onClick={() => setEditingSub(null)}>Cancel</Button>
                          </div>
                        ) : (
                          <>
                            <span className="text-[12px] text-[#787774] flex-1">{sub.name}</span>
                            <div className="hidden group-hover:flex items-center gap-0.5">
                              <button onClick={() => { setEditingSub(sub.id); setEditSubName(sub.name); }} className="p-1 text-[#9B9A97] hover:text-[#37352F] rounded-[3px] hover:bg-[#EFEFEF]">
                                <Pencil className="h-2.5 w-2.5" />
                              </button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <button className="p-1 text-[#9B9A97] hover:text-[#EB5757] rounded-[3px] hover:bg-[#FBE4E4]"><Trash2 className="h-2.5 w-2.5" /></button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete "{sub.name}"?</AlertDialogTitle>
                                    <AlertDialogDescription>Items in this sub-area will lose their sub-area assignment.</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteSub(sub.id)}>Delete</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                    {/* Add sub-area row */}
                    <div className="flex gap-2 pl-8 pr-3 py-2">
                      <Input
                        value={newSubArea[area.id] ?? ""}
                        onChange={(e) => setNewSubArea((p) => ({ ...p, [area.id]: e.target.value }))}
                        placeholder="Add sub-area…"
                        className="text-[12px]"
                        onKeyDown={(e) => e.key === "Enter" && handleCreateSubArea(area.id)}
                      />
                      <Button size="sm" variant="secondary" onClick={() => handleCreateSubArea(area.id)} disabled={!newSubArea[area.id]?.trim()}>
                        <Plus className="h-3 w-3" />
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
