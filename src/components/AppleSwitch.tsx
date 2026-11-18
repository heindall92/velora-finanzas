interface AppleSwitchProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
  id?: string;
}

/** Interruptor estilo Apple (iOS) */
export default function AppleSwitch({
  checked,
  onChange,
  label,
  description,
  id,
}: AppleSwitchProps) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3.5">
      <div className="min-w-0 flex-1">
        <label htmlFor={id} className="block font-medium text-[var(--text)]">
          {label}
        </label>
        {description && (
          <p className="text-sm text-[var(--text-muted)]">{description}</p>
        )}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`apple-switch ${checked ? 'apple-switch-on' : ''}`}
      >
        <span className="apple-switch-knob" />
      </button>
    </div>
  );
}
