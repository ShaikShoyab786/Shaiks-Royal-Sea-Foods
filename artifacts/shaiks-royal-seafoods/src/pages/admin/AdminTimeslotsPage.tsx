import React, { useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { useRequireAuth } from '@/hooks/useAuthGuard';
import {
  UserRole,
  useListTimeslots,
  useUpdateTimeslot,
  useCreateTimeslot,
  useDeleteTimeslot,
  type TimeslotInput,
} from '@workspace/api-client-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Clock, Users, Pencil, Trash2, Plus, X, Check, Loader2, AlertTriangle,
} from 'lucide-react';

interface SlotEditState {
  label: string;
  startHour: number;
  endHour: number;
  maxOrders: number;
}

const EMPTY_NEW_SLOT: TimeslotInput = {
  label: '',
  startHour: 7,
  endHour: 11,
  isActive: true,
  maxOrders: 50,
};

export default function AdminTimeslotsPage() {
  useRequireAuth([UserRole.admin]);
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const { data: timeslots, isLoading } = useListTimeslots();
  const updateTimeslot = useUpdateTimeslot();
  const createSlot = useCreateTimeslot();
  const deleteSlot = useDeleteTimeslot();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editState, setEditState] = useState<SlotEditState | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newSlot, setNewSlot] = useState<TimeslotInput>(EMPTY_NEW_SLOT);
  const [addingSaving, setAddingSaving] = useState(false);

  // ── Toggle active ──────────────────────────────────────────────────────
  const handleToggle = (id: number, current: boolean) => {
    updateTimeslot.mutate(
      { id, data: { isActive: !current } },
      {
        onSuccess: () => {
          toast.success(!current ? 'Slot opened' : 'Slot closed');
          queryClient.invalidateQueries({ queryKey: ['/api/timeslots'] });
        },
      }
    );
  };

  // ── Inline edit ────────────────────────────────────────────────────────
  const startEdit = (slot: { id: number; label: string; startHour: number; endHour: number; maxOrders: number }) => {
    setEditingId(slot.id);
    setEditState({ label: slot.label, startHour: slot.startHour, endHour: slot.endHour, maxOrders: slot.maxOrders });
  };

  const cancelEdit = () => { setEditingId(null); setEditState(null); };

  const saveEdit = async (id: number) => {
    if (!editState) return;
    setSavingId(id);
    try {
      await new Promise<void>((resolve, reject) => {
        updateTimeslot.mutate(
          { id, data: { label: editState.label, startHour: editState.startHour, endHour: editState.endHour, maxOrders: editState.maxOrders } as any },
          {
            onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['/api/timeslots'] }); resolve(); },
            onError: (err: any) => reject(err),
          }
        );
      });
      toast.success('Slot updated');
      setEditingId(null);
      setEditState(null);
    } catch (err: any) {
      toast.error(err?.message || 'Update failed');
    } finally {
      setSavingId(null);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await deleteSlot.mutateAsync({ id, token: token || '' });
      toast.success('Time slot deleted');
      setConfirmDeleteId(null);
    } catch (err: any) {
      toast.error(err?.message || 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  // ── Add new slot ───────────────────────────────────────────────────────
  const handleAddSlot = async () => {
    if (!newSlot.label.trim()) { toast.error('Label is required'); return; }
    setAddingSaving(true);
    try {
      await createSlot.mutateAsync({ data: newSlot, token: token || '' });
      toast.success('New time slot added!');
      setNewSlot(EMPTY_NEW_SLOT);
      setShowAddForm(false);
    } catch (err: any) {
      toast.error(err?.message || 'Create failed');
    } finally {
      setAddingSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-8 flex-1">
        <div className="max-w-4xl">
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="font-serif text-3xl font-bold">Delivery Time Slots</h1>
              <p className="text-muted-foreground mt-1">Control order capacity, timing and availability for delivery windows.</p>
            </div>
            <Button
              onClick={() => setShowAddForm(p => !p)}
              className="gap-2 rounded-full shadow-md shadow-primary/20"
            >
              {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {showAddForm ? 'Cancel' : 'Add New Slot'}
            </Button>
          </div>

          {/* ── Add new slot form ── */}
          {showAddForm && (
            <Card className="mb-8 border-primary/30 bg-primary/5 shadow-lg shadow-primary/10">
              <CardHeader>
                <CardTitle className="font-serif text-xl flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" /> New Time Slot
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="sm:col-span-2">
                    <Label className="text-xs text-muted-foreground mb-1 block">Slot Label</Label>
                    <Input
                      placeholder="e.g. Morning Delivery"
                      value={newSlot.label}
                      onChange={e => setNewSlot(p => ({ ...p, label: e.target.value }))}
                      className="bg-background/50 border-primary/20 focus:border-primary/50"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Start Hour (0–23)</Label>
                    <Input
                      type="number" min={0} max={23}
                      value={newSlot.startHour}
                      onChange={e => setNewSlot(p => ({ ...p, startHour: parseInt(e.target.value) || 0 }))}
                      className="bg-background/50 border-primary/20 focus:border-primary/50 font-mono text-center"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">End Hour (1–24)</Label>
                    <Input
                      type="number" min={1} max={24}
                      value={newSlot.endHour}
                      onChange={e => setNewSlot(p => ({ ...p, endHour: parseInt(e.target.value) || 1 }))}
                      className="bg-background/50 border-primary/20 focus:border-primary/50 font-mono text-center"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Max Orders</Label>
                    <Input
                      type="number" min={1}
                      value={newSlot.maxOrders}
                      onChange={e => setNewSlot(p => ({ ...p, maxOrders: parseInt(e.target.value) || 1 }))}
                      className="bg-background/50 border-primary/20 focus:border-primary/50 font-mono text-center"
                    />
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <Switch
                      checked={newSlot.isActive}
                      onCheckedChange={v => setNewSlot(p => ({ ...p, isActive: v }))}
                    />
                    <Label className="text-sm">{newSlot.isActive ? 'Active' : 'Inactive'}</Label>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleAddSlot} disabled={addingSaving} className="gap-2 rounded-full">
                    {addingSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    {addingSaving ? 'Creating…' : 'Create Slot'}
                  </Button>
                  <Button variant="ghost" onClick={() => { setShowAddForm(false); setNewSlot(EMPTY_NEW_SLOT); }}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Slot list ── */}
          {isLoading ? (
            <div className="text-muted-foreground py-10 text-center">Loading time slots…</div>
          ) : (
            <div className="space-y-4">
              {timeslots?.map(slot => (
                <Card
                  key={slot.id}
                  className={`bg-card border-border/50 overflow-hidden transition-all duration-300 ${
                    !slot.isActive ? 'opacity-70 grayscale-[20%]' : 'border-primary/25 shadow-[0_0_20px_rgba(212,175,55,0.05)]'
                  }`}
                >
                  {/* ── Row header ── */}
                  <CardHeader className={`border-b border-border/50 ${slot.isActive ? 'bg-primary/5' : 'bg-secondary/10'}`}>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                          <Clock className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-serif text-lg font-bold truncate">{slot.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {slot.startHour}:00 – {slot.endHour}:00 &nbsp;·&nbsp; Capacity: {slot.maxOrders}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {/* Utilization */}
                        <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-3.5 w-3.5" />
                          <span className="font-mono font-bold text-foreground">{slot.currentOrders}</span>
                          <span>/ {slot.maxOrders} today</span>
                        </div>

                        {/* Active toggle */}
                        <Switch checked={slot.isActive} onCheckedChange={() => handleToggle(slot.id, slot.isActive)} />

                        {/* Edit button */}
                        {editingId !== slot.id && (
                          <Button
                            variant="ghost" size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                            onClick={() => startEdit(slot)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}

                        {/* Delete button */}
                        {confirmDeleteId !== slot.id ? (
                          <Button
                            variant="ghost" size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                            onClick={() => setConfirmDeleteId(slot.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        ) : (
                          <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/30 rounded-lg px-2 py-1">
                            <AlertTriangle className="h-3.5 w-3.5 text-red-400 shrink-0" />
                            <span className="text-xs text-red-400 font-medium">Delete?</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/20"
                              disabled={deletingId === slot.id}
                              onClick={() => handleDelete(slot.id)}
                            >
                              {deletingId === slot.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Yes'}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2 text-xs hover:bg-background/30"
                              onClick={() => setConfirmDeleteId(null)}
                            >
                              No
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  {/* ── Inline edit form ── */}
                  {editingId === slot.id && editState && (
                    <CardContent className="p-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="sm:col-span-2">
                          <Label className="text-xs text-muted-foreground mb-1 block">Label</Label>
                          <Input
                            value={editState.label}
                            onChange={e => setEditState(p => p ? { ...p, label: e.target.value } : p)}
                            className="bg-background/50 border-primary/20 focus:border-primary/50"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground mb-1 block">Start Hour (0–23)</Label>
                          <Input
                            type="number" min={0} max={23}
                            value={editState.startHour}
                            onChange={e => setEditState(p => p ? { ...p, startHour: parseInt(e.target.value) || 0 } : p)}
                            className="bg-background/50 border-primary/20 focus:border-primary/50 font-mono text-center"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground mb-1 block">End Hour (1–24)</Label>
                          <Input
                            type="number" min={1} max={24}
                            value={editState.endHour}
                            onChange={e => setEditState(p => p ? { ...p, endHour: parseInt(e.target.value) || 1 } : p)}
                            className="bg-background/50 border-primary/20 focus:border-primary/50 font-mono text-center"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground mb-1 block">Max Orders</Label>
                          <Input
                            type="number" min={1}
                            value={editState.maxOrders}
                            onChange={e => setEditState(p => p ? { ...p, maxOrders: parseInt(e.target.value) || 1 } : p)}
                            className="bg-background/50 border-primary/20 focus:border-primary/50 font-mono text-center"
                          />
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button onClick={() => saveEdit(slot.id)} disabled={savingId === slot.id}
                          className="gap-2 rounded-full">
                          {savingId === slot.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                          {savingId === slot.id ? 'Saving…' : 'Save Changes'}
                        </Button>
                        <Button variant="ghost" className="gap-1.5 text-muted-foreground" onClick={cancelEdit}>
                          <X className="h-4 w-4" /> Cancel
                        </Button>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && timeslots?.length === 0 && (
            <div className="text-center py-16">
              <Clock className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No time slots yet. Add your first one above.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
