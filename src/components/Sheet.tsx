import { X } from 'lucide-react';
import { useEffect, useId, useRef, type ReactNode } from 'react';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Sticky footer (primary actions), stays above the iPhone home indicator. */
  footer?: ReactNode;
  closeLabel: string;
}

/**
 * Native <dialog> (modern-web-guidance: dialog): focus trap, Esc and inert background for free.
 * Phone: bottom sheet you can drag down to dismiss, with velocity (apple-design §5–6).
 * ≥640px: centred modal.
 */
export default function Sheet({ open, onClose, title, children, footer, closeLabel }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const drag = useRef<{ y: number; t: number; dy: number; v: number; captured: boolean } | null>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      d.style.removeProperty('--drag');
    } else if (!open && d.open) {
      d.close();
    }
  }, [open]);

  // Lock page scroll behind the sheet (iOS scrolls the body through a modal otherwise).
  useEffect(() => {
    if (!open) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, [open]);

  const isPhone = () => window.matchMedia('(max-width: 639.98px)').matches;

  const onPointerDown = (e: React.PointerEvent) => {
    if (!isPhone() || e.button !== 0) return;
    // Buttons in the header (close) must keep receiving their click: never start a drag from one.
    if ((e.target as HTMLElement).closest('button')) return;
    drag.current = { y: e.clientY, t: e.timeStamp, dy: 0, v: 0, captured: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const s = drag.current;
    if (!s) return;
    const raw = e.clientY - s.y;
    // Capture only once it is really a drag (4px), so taps stay taps.
    if (!s.captured) {
      if (Math.abs(raw) < 4) return;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      ref.current?.classList.add('dragging');
      s.captured = true;
    }
    // Rubber-band upwards instead of a hard stop (apple-design §9).
    const dy = raw < 0 ? -Math.sqrt(-raw) * 2 : raw;
    const dt = Math.max(e.timeStamp - s.t, 1);
    s.v = (dy - s.dy) / dt;
    s.dy = dy;
    s.t = e.timeStamp;
    ref.current?.style.setProperty('--drag', `${dy}px`);
  };
  const onPointerUp = () => {
    const s = drag.current;
    drag.current = null;
    const d = ref.current;
    if (!s || !d || !s.captured) return;
    d.classList.remove('dragging');
    const height = d.getBoundingClientRect().height;
    // Dismiss on a quick flick or past a third of the height (momentum, not distance alone).
    if (s.v > 0.5 || s.dy > height / 3) {
      onClose();
    } else {
      d.style.setProperty('--drag', '0px');
    }
  };

  return (
    <dialog
      ref={ref}
      className="sheet"
      aria-labelledby={titleId}
      onClose={() => open && onClose()}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        // Light dismiss: a click on the ::backdrop targets the dialog itself.
        if (e.target === ref.current) onClose();
      }}
    >
      <div
        className="shrink-0 touch-none select-none px-5 pt-2 sm:px-6 sm:pt-5"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="mx-auto mb-2 h-[5px] w-9 rounded-full bg-line-strong sm:hidden" aria-hidden="true" />
        <div className="flex items-center justify-between gap-3 pb-3">
          <h2 id={titleId} className="text-lg font-semibold tracking-tight text-ink">
            {title}
          </h2>
          <button type="button" className="icon-btn press -mr-2 bg-soft" onClick={onClose} aria-label={closeLabel}>
            <X size={18} strokeWidth={2} />
          </button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-4 sm:px-6">{children}</div>
      {footer && (
        <div className="shrink-0 border-t border-line px-5 pt-3 sm:px-6" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
          {footer}
        </div>
      )}
    </dialog>
  );
}
