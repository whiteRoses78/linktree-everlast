"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteLink, type LinkActionState } from "@/app/dashboard/actions";

const INITIAL_STATE: LinkActionState = { status: "idle", ts: 0 };

type DeleteLinkDialogProps = {
  link: { id: string; title: string };
  onClose: () => void;
  onResult: (state: LinkActionState) => void;
};

export function DeleteLinkDialog({
  link,
  onClose,
  onResult,
}: DeleteLinkDialogProps) {
  const boundAction = deleteLink.bind(null, link.id);
  const [state, formAction, isPending] = useActionState(
    boundAction,
    INITIAL_STATE,
  );

  const lastTsRef = useRef(0);
  useEffect(() => {
    if (state.status !== "idle" && state.ts !== lastTsRef.current) {
      lastTsRef.current = state.ts;
      onResult(state);
      if (state.status === "success") {
        onClose();
      }
    }
  }, [state, onResult, onClose]);

  return (
    <AlertDialog open onOpenChange={(open) => !open && !isPending && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Diesen Link löschen?</AlertDialogTitle>
          <AlertDialogDescription>
            „{link.title}" wird endgültig entfernt. Diese Aktion kann nicht
            rückgängig gemacht werden.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {state.status === "error" ? (
          <p className="text-sm text-destructive" role="alert">
            {state.message}
          </p>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Abbrechen</AlertDialogCancel>
          <form action={formAction}>
            <AlertDialogAction
              type="submit"
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? "Lösche…" : "Löschen"}
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
