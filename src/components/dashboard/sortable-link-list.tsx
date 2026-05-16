"use client";

import { useEffect, useState, useTransition } from "react";
import { Plus } from "lucide-react";
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SortableLinkCard } from "@/components/dashboard/sortable-link-card";
import { LinkForm } from "@/components/dashboard/link-form";
import { DeleteLinkDialog } from "@/components/dashboard/delete-link-dialog";
import { reorderLinks } from "@/app/dashboard/actions";
import type { LinkActionState } from "@/app/dashboard/actions";

type Link = { id: string; title: string; url: string };

type SortableLinkListProps = {
  links: Link[];
  onPreviewReload: (ts: number) => void;
};

export function SortableLinkList({
  links,
  onPreviewReload,
}: SortableLinkListProps) {
  const [items, setItems] = useState<Link[]>(links);
  const [, startTransition] = useTransition();

  const [createOpen, setCreateOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [deletingLink, setDeletingLink] = useState<Link | null>(null);

  // Sync lokaler State, wenn props.links sich ändert (nach Create/Edit/Delete
  // via revalidatePath → Server-Component re-rendert mit neuer Array-Referenz).
  useEffect(() => {
    setItems(links);
  }, [links]);

  // Mouse + Touch getrennt statt PointerSensor:
  //  - Desktop-Mouse: sofortiger Drag ab 5px Bewegung (kein Delay nötig — Mouse
  //    kann nicht "aus Versehen scrollen", weil Scroll am Desktop via Wheel läuft).
  //  - Touch: 150ms Long-Press + 5px Toleranz — trennt sauber zwischen
  //    "Tap auf Edit/Delete", "Scroll mit dem Finger" und "Card greifen".
  //  - Keyboard: dnd-kit-Default (Tab → Space → Arrow → Space).
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      // Distance-basiert statt delay: Drag startet, sobald der Finger sich
      // 8px bewegt. Robuster auf echtem iOS Safari als delay-basiert (dort
      // schluckt der Browser oft den delay-Timer). Risikolos hier, weil der
      // Handle nichts anderes tut als Drag (kein Tap-Toggle).
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((l) => l.id === active.id);
    const newIndex = items.findIndex((l) => l.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const previous = items;
    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);

    startTransition(async () => {
      const result = await reorderLinks(next.map((l) => l.id));
      if (result.status === "error") {
        setItems(previous);
        toast.error(result.message);
        return;
      }
      onPreviewReload(Date.now());
    });
  }

  const handleResult = (state: LinkActionState) => {
    if (state.status === "success") onPreviewReload(state.ts);
  };
  const handleCreateResult = (state: LinkActionState) => {
    handleResult(state);
    if (state.status === "success") setCreateOpen(false);
  };
  const handleEditResult = (state: LinkActionState) => {
    handleResult(state);
    if (state.status === "success") setEditingLink(null);
  };

  return (
    <section aria-label="Links" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Links</h2>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Link hinzufügen
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState onAddClick={() => setCreateOpen(true)} />
      ) : (
        <DndContext
          id="sortable-link-list"
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map((l) => l.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {items.map((link) => (
                <SortableLinkCard
                  key={link.id}
                  link={link}
                  onEdit={() => setEditingLink(link)}
                  onDelete={() => setDeletingLink(link)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Create-Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neuen Link hinzufügen</DialogTitle>
            <DialogDescription>
              Titel + HTTPS-URL. Erscheint sofort in der Vorschau.
            </DialogDescription>
          </DialogHeader>
          {createOpen ? (
            <LinkForm
              mode="create"
              onResult={handleCreateResult}
              onCancel={() => setCreateOpen(false)}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Edit-Dialog — neu gemounted pro Link, damit useActionState resettet */}
      <Dialog
        open={editingLink !== null}
        onOpenChange={(open) => !open && setEditingLink(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link bearbeiten</DialogTitle>
            <DialogDescription>
              Änderungen erscheinen sofort in der Vorschau.
            </DialogDescription>
          </DialogHeader>
          {editingLink ? (
            <LinkForm
              mode="edit"
              link={editingLink}
              onResult={handleEditResult}
              onCancel={() => setEditingLink(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Delete-Dialog */}
      {deletingLink ? (
        <DeleteLinkDialog
          link={deletingLink}
          onClose={() => setDeletingLink(null)}
          onResult={handleResult}
        />
      ) : null}

    </section>
  );
}

function EmptyState({ onAddClick }: { onAddClick: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed bg-card/50 px-6 py-10 text-center space-y-3">
      <p className="text-base font-medium">Noch keine Links</p>
      <p className="text-sm text-muted-foreground">
        Leg deinen ersten Link an, damit Besucher etwas zum Klicken haben.
      </p>
      <Button type="button" onClick={onAddClick}>
        <Plus className="mr-2 h-4 w-4" />
        Ersten Link anlegen
      </Button>
    </div>
  );
}
