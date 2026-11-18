import { useEffect } from 'react';
import { useApp, type Toast } from '../state/AppState';

function ToastItem({ toast, onDone }: { toast: Toast; onDone: () => void }) {
  useEffect(() => {
    // Longer when there's an action to take (undo), short otherwise.
    const ms = toast.action ? 6000 : 3200;
    const id = window.setTimeout(onDone, ms);
    return () => window.clearTimeout(id);
  }, [toast, onDone]);

  return (
    <div
      className="toast pointer-events-auto flex min-h-12 items-center gap-3 rounded-2xl bg-tip py-2 pl-4 pr-2 text-sm text-white shadow-[var(--shadow-pop)]"
      role={toast.tone === 'error' ? 'alert' : 'status'}
    >
      <span className="flex-1 py-1.5">{toast.message}</span>
      {toast.action && (
        <button
          type="button"
          className="press min-h-9 rounded-xl px-3 font-semibold text-[#8db8ff]"
          onClick={() => {
            toast.action!.run();
            onDone();
          }}
        >
          {toast.action.label}
        </button>
      )}
    </div>
  );
}

export default function Toaster() {
  const { toasts, dismissToast } = useApp();
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-[60] flex flex-col items-center gap-2 px-4 lg:bottom-6 lg:left-auto lg:right-6 lg:items-end"
      aria-live="polite"
    >
      {toasts.map((x) => (
        <div key={x.id} className="w-full max-w-sm">
          <ToastItem toast={x} onDone={() => dismissToast(x.id)} />
        </div>
      ))}
    </div>
  );
}
