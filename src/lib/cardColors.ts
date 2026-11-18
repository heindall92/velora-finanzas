import type { CardColor, Lang } from './types';

/** The balance card is the "plastic": the one surface the person can colour. Buttons stay brand blue. */
export const CARD_STYLES: Record<CardColor, { bg: string; label: Record<Lang, string> }> = {
  blue: { bg: 'linear-gradient(135deg, #2f80ff 0%, #0057e0 55%, #0040a8 100%)', label: { pt: 'Azul', es: 'Azul' } },
  black: { bg: 'linear-gradient(135deg, #3a3d45 0%, #1c1e23 55%, #0b0c0e 100%)', label: { pt: 'Preto', es: 'Negro' } },
  red: { bg: 'linear-gradient(135deg, #f0525a 0%, #d12a35 55%, #a3141f 100%)', label: { pt: 'Vermelho', es: 'Rojo' } },
  green: { bg: 'linear-gradient(135deg, #1fb57a 0%, #0c8a59 55%, #066540 100%)', label: { pt: 'Verde', es: 'Verde' } },
  orange: { bg: 'linear-gradient(135deg, #ff9a3c 0%, #f06a12 55%, #c24b04 100%)', label: { pt: 'Laranja', es: 'Naranja' } },
  mauve: { bg: 'linear-gradient(135deg, #b48cf2 0%, #8a5ad6 55%, #6533b0 100%)', label: { pt: 'Malva', es: 'Malva' } },
};
