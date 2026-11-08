"use client";

import { useEffect, useId, useRef } from "react";

type Props = { open: boolean; onClose: () => void; title: string; children: React.ReactNode };

/** Usa <dialog>: el navegador atrapa el foco, cierra con Esc y lo devuelve al botón de origen. */
export function BottomSheet({ open, onClose, title, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = `${useId()}-title`;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby={titleId}
      className="m-0 mt-auto max-h-[90vh] w-full max-w-none overflow-y-auto rounded-t-[22px] bg-surface p-5 text-ink backdrop:bg-black/50 sm:m-auto sm:max-w-[520px] sm:rounded-[22px]"
    >
      <h2 id={titleId} className="mb-3 font-display text-[22px] font-semibold">
        {title}
      </h2>
      {children}
    </dialog>
  );
}
