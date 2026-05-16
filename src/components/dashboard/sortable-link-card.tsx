"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type SortableLinkCardProps = {
  link: { id: string; title: string; url: string };
  onEdit: () => void;
  onDelete: () => void;
};

/**
 * Drag-Handle separat vom Card-Body: nur der GripVertical-Button kriegt
 * die dnd-kit-`listeners`. Edit/Delete-Buttons bekommen `stopPropagation`
 * auf `onPointerDown`, damit Touch auf dem Icon nicht aus Versehen
 * ein Drag startet (Mobile-Safari-Eigenheit).
 */
export function SortableLinkCard({
  link,
  onEdit,
  onDelete,
}: SortableLinkCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
    touchAction: "none",
    userSelect: "none",
    WebkitUserSelect: "none",
    WebkitTouchCallout: "none",
  };

  // Pointer-Events auf den Action-Buttons stoppen, sodass Touch dort NICHT
  // den Card-Drag triggert. Mouse + Pointer beide stoppen.
  const stopDrag = (e: React.PointerEvent | React.MouseEvent) =>
    e.stopPropagation();

  return (
    <div
      ref={setNodeRef}
      style={style}
      onContextMenu={(e) => e.preventDefault()}
      className="group flex items-center gap-2 rounded-2xl border bg-card pl-1 pr-3 py-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
      {...attributes}
      {...listeners}
    >
      {/* Drag-Handle ist jetzt rein visuell — die ganze Card ist Activator.
          Größerer Touch-Target → iOS Safari liest die Touch-Events zuverlässig. */}
      <div
        aria-hidden="true"
        className="flex h-11 w-11 shrink-0 cursor-grab items-center justify-center rounded-md text-foreground/60 active:cursor-grabbing"
      >
        <GripVertical className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{link.title}</p>
        <p className="truncate text-xs text-muted-foreground">{link.url}</p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onEdit}
          onPointerDown={stopDrag}
          onMouseDown={stopDrag}
          aria-label={`${link.title} bearbeiten`}
          className="h-11 w-11 text-muted-foreground hover:text-foreground"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onDelete}
          onPointerDown={stopDrag}
          onMouseDown={stopDrag}
          aria-label={`${link.title} löschen`}
          className="h-11 w-11 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
