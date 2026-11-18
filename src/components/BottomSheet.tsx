import { useEffect, useId, useRef } from 'react';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

/**
 * Modal accesible con <dialog native>.
 * Modern Web Guidance `dialog`: showModal(), Esc nativo, sin role/aria-modal manuales.
 */
export default function BottomSheet({ open, onClose, children, title }: BottomSheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="sheet-dialog"
      aria-labelledby={title ? titleId : undefined}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        // Light dismiss: click outside the panel
        const rect = dialogRef.current?.getBoundingClientRect();
        if (!rect) return;
        const { clientX: x, clientY: y } = e;
        const outside =
          x < rect.left || x > rect.right || y < rect.top || y > rect.bottom;
        if (outside) onClose();
      }}
    >
      <div
        className="sheet-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-handle sm:hidden" aria-hidden="true" />
        {title && (
          <h3 id={titleId} className="px-6 pb-3 text-xl font-semibold tracking-tight text-slate-900">
            {title}
          </h3>
        )}
        <div className="px-6 pb-2">{children}</div>
      </div>
    </dialog>
  );
}
