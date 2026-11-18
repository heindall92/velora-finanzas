import { Check, Delete } from 'lucide-react';
import { useEffect } from 'react';
import { PIN_MAX, PIN_MIN } from '../lib/vault';

interface PinPadProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  deleteLabel: string;
  submitLabel: string;
  /** Shake the dots after a wrong PIN. */
  error?: boolean;
}

/**
 * Numeric keypad like the iPhone passcode screen. Also takes a physical keyboard (digits,
 * Backspace, Enter) for desktop. Keys are 64px: comfortable thumb targets.
 */
export default function PinPad({ value, onChange, onSubmit, disabled, deleteLabel, submitLabel, error }: PinPadProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (disabled || e.metaKey || e.ctrlKey || e.altKey) return;
      if (/^\d$/.test(e.key)) {
        if (value.length < PIN_MAX) onChange(value + e.key);
        e.preventDefault();
      } else if (e.key === 'Backspace') {
        onChange(value.slice(0, -1));
        e.preventDefault();
      } else if (e.key === 'Enter' && value.length >= PIN_MIN) {
        onSubmit();
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [value, onChange, onSubmit, disabled]);

  const press = (d: string) => !disabled && value.length < PIN_MAX && onChange(value + d);
  const slots = Math.max(PIN_MIN, Math.min(value.length + (value.length < PIN_MAX ? 1 : 0), PIN_MAX));

  return (
    <div className="mx-auto w-full max-w-[18rem]">
      <div className={`mb-8 flex h-4 justify-center gap-3.5 ${error ? 'animate-[shake_360ms_var(--ease-out)]' : ''}`} aria-live="polite" aria-label={`${value.length}`}>
        {Array.from({ length: slots }, (_, i) => (
          <span
            key={i}
            className={`h-3.5 w-3.5 rounded-full border-[1.5px] transition-colors duration-150 ${
              i < value.length ? (error ? 'border-down bg-down' : 'border-ink bg-ink') : 'border-line-strong'
            }`}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-x-6 gap-y-4">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <Key key={d} onClick={() => press(d)} disabled={disabled} label={d}>
            {d}
          </Key>
        ))}
        <Key onClick={() => onChange(value.slice(0, -1))} disabled={disabled || !value} label={deleteLabel} subtle>
          <Delete size={22} strokeWidth={1.75} />
        </Key>
        <Key onClick={() => press('0')} disabled={disabled} label="0">
          0
        </Key>
        <Key onClick={onSubmit} disabled={disabled || value.length < PIN_MIN} label={submitLabel} accent>
          <Check size={24} strokeWidth={2.25} />
        </Key>
      </div>
    </div>
  );
}

function Key({
  children,
  onClick,
  disabled,
  label,
  subtle,
  accent,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  label: string;
  subtle?: boolean;
  accent?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`press mx-auto grid h-16 w-16 place-items-center rounded-full text-[1.625rem] font-normal disabled:opacity-30 ${
        accent ? 'bg-accent text-white' : subtle ? 'text-ink-2' : 'bg-soft text-ink'
      }`}
    >
      {children}
    </button>
  );
}
