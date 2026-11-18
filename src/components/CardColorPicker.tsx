import { Check } from 'lucide-react';
import { CARD_COLORS, resolveCardColor, type CardColorId } from '../lib/cardColors';

interface CardColorPickerProps {
  value?: string;
  onChange: (id: CardColorId) => void;
  labels?: { es: string; pt: string } | null;
  lang?: string;
}

/** Solo personaliza el color visual de la tarjeta bancaria (no la UI global). */
export default function CardColorPicker({
  value,
  onChange,
  lang = 'es',
}: CardColorPickerProps) {
  const current = resolveCardColor(value);

  const labels: Record<CardColorId, { es: string; pt: string }> = {
    blue: { es: 'Azul', pt: 'Azul' },
    black: { es: 'Negro', pt: 'Preto' },
    red: { es: 'Rojo', pt: 'Vermelho' },
    green: { es: 'Verde', pt: 'Verde' },
    orange: { es: 'Naranja', pt: 'Laranja' },
    mauve: { es: 'Malva', pt: 'Malva' },
  };

  return (
    <div>
      <div
        className="flex flex-wrap gap-3"
        role="radiogroup"
        aria-label={lang === 'pt' ? 'Cor do cartão' : 'Color de la tarjeta'}
      >
        {CARD_COLORS.map((c) => {
          const selected = current.id === c.id;
          const name = lang === 'pt' ? labels[c.id].pt : labels[c.id].es;
          return (
            <button
              key={c.id}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={name}
              title={name}
              onClick={() => onChange(c.id)}
              className={`pressable relative h-11 w-11 rounded-full ${c.swatch} ${
                selected ? 'ring-2 ring-blue-600 ring-offset-2 ring-offset-[var(--bg-elevated)]' : ''
              }`}
            >
              {selected && (
                <span className="absolute inset-0 flex items-center justify-center text-white">
                  <Check size={16} strokeWidth={2.5} />
                </span>
              )}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-[var(--text-muted)]">
        {lang === 'pt' ? labels[current.id].pt : labels[current.id].es}
        {' · '}
        {lang === 'pt'
          ? 'só afeta o cartão, não os botões'
          : 'solo afecta a la tarjeta, no a los botones'}
      </p>
    </div>
  );
}
