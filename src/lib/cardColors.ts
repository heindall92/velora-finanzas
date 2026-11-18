export type CardColorId = 'blue' | 'black' | 'red' | 'green' | 'orange' | 'mauve';

export interface CardColorOption {
  id: CardColorId;
  label: string;
  /** Clases Tailwind para el gradiente de la tarjeta */
  gradient: string;
  /** Sombra acorde al color */
  shadow: string;
  /** Muestra en el selector */
  swatch: string;
}

export const CARD_COLORS: CardColorOption[] = [
  {
    id: 'blue',
    label: 'Azul',
    gradient: 'from-sky-400 via-blue-500 to-blue-700',
    shadow: 'shadow-[0_16px_40px_rgba(0,102,255,0.35)]',
    swatch: 'bg-gradient-to-br from-sky-400 to-blue-700',
  },
  {
    id: 'black',
    label: 'Negro',
    gradient: 'from-slate-700 via-slate-900 to-black',
    shadow: 'shadow-[0_16px_40px_rgba(15,23,42,0.45)]',
    swatch: 'bg-gradient-to-br from-slate-700 to-black',
  },
  {
    id: 'red',
    label: 'Rojo',
    gradient: 'from-rose-400 via-red-500 to-red-700',
    shadow: 'shadow-[0_16px_40px_rgba(220,38,38,0.35)]',
    swatch: 'bg-gradient-to-br from-rose-400 to-red-700',
  },
  {
    id: 'green',
    label: 'Verde',
    gradient: 'from-emerald-400 via-green-500 to-emerald-700',
    shadow: 'shadow-[0_16px_40px_rgba(16,185,129,0.35)]',
    swatch: 'bg-gradient-to-br from-emerald-400 to-emerald-700',
  },
  {
    id: 'orange',
    label: 'Naranja',
    gradient: 'from-amber-400 via-orange-500 to-orange-700',
    shadow: 'shadow-[0_16px_40px_rgba(249,115,22,0.35)]',
    swatch: 'bg-gradient-to-br from-amber-400 to-orange-700',
  },
  {
    id: 'mauve',
    label: 'Malva',
    gradient: 'from-violet-300 via-fuchsia-400 to-purple-700',
    shadow: 'shadow-[0_16px_40px_rgba(168,85,247,0.35)]',
    swatch: 'bg-gradient-to-br from-violet-300 to-purple-700',
  },
];

export function resolveCardColor(color?: string): CardColorOption {
  const byId = CARD_COLORS.find((c) => c.id === color);
  if (byId) return byId;

  // Compatibilidad con valores antiguos (clases Tailwind guardadas)
  const byGradient = CARD_COLORS.find(
    (c) => color === c.gradient || (color && color.includes(c.gradient.split(' ')[0]))
  );
  if (byGradient) return byGradient;

  if (color?.includes('purple') || color?.includes('violet') || color?.includes('fuchsia')) {
    return CARD_COLORS.find((c) => c.id === 'mauve')!;
  }
  if (color?.includes('green') || color?.includes('emerald')) {
    return CARD_COLORS.find((c) => c.id === 'green')!;
  }
  if (color?.includes('red') || color?.includes('rose')) {
    return CARD_COLORS.find((c) => c.id === 'red')!;
  }
  if (color?.includes('orange') || color?.includes('amber')) {
    return CARD_COLORS.find((c) => c.id === 'orange')!;
  }
  if (color?.includes('slate') || color?.includes('black') || color?.includes('gray')) {
    return CARD_COLORS.find((c) => c.id === 'black')!;
  }

  return CARD_COLORS[0];
}
