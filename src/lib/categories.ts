import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeftRight,
  Banknote,
  Bus,
  Car,
  Clapperboard,
  Coffee,
  Dumbbell,
  Fuel,
  Gift,
  GraduationCap,
  HeartPulse,
  Home,
  Laptop,
  Lightbulb,
  MoreHorizontal,
  PawPrint,
  Plane,
  Repeat,
  Shirt,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Sparkles,
  TrendingUp,
  UtensilsCrossed,
  Wallet,
} from 'lucide-react';
import type { FlowType, Lang, TxType } from './types';

export interface CategoryDef {
  id: string;
  type: TxType;
  icon: LucideIcon;
  /** Hue (0–360) for the icon tint. Used at low alpha so it stays quiet in both themes. */
  hue: number;
  label: Record<Lang, string>;
}

/**
 * Categories a person actually uses in Brazil, not brand names.
 * "Netflix", "Amazon", "Instagram" were brands, not categories — they fold into subscriptions / shopping.
 */
export const CATEGORIES: CategoryDef[] = [
  { id: 'groceries', type: 'expense', icon: ShoppingCart, hue: 140, label: { pt: 'Mercado', es: 'Supermercado' } },
  { id: 'food', type: 'expense', icon: UtensilsCrossed, hue: 25, label: { pt: 'Restaurantes', es: 'Restaurantes' } },
  { id: 'drinks', type: 'expense', icon: Coffee, hue: 35, label: { pt: 'Café e lanches', es: 'Café y snacks' } },
  { id: 'transport', type: 'expense', icon: Bus, hue: 210, label: { pt: 'Transporte', es: 'Transporte' } },
  { id: 'rideshare', type: 'expense', icon: Car, hue: 220, label: { pt: 'Uber / 99', es: 'Uber / taxi' } },
  { id: 'fuel', type: 'expense', icon: Fuel, hue: 15, label: { pt: 'Combustível', es: 'Combustible' } },
  { id: 'home', type: 'expense', icon: Home, hue: 30, label: { pt: 'Moradia', es: 'Vivienda' } },
  { id: 'bills', type: 'expense', icon: Lightbulb, hue: 50, label: { pt: 'Contas da casa', es: 'Facturas' } },
  { id: 'phone', type: 'expense', icon: Smartphone, hue: 200, label: { pt: 'Celular e internet', es: 'Móvil e internet' } },
  { id: 'subscriptions', type: 'expense', icon: Repeat, hue: 265, label: { pt: 'Assinaturas', es: 'Suscripciones' } },
  { id: 'shopping', type: 'expense', icon: ShoppingBag, hue: 330, label: { pt: 'Compras', es: 'Compras' } },
  { id: 'clothes', type: 'expense', icon: Shirt, hue: 190, label: { pt: 'Roupas', es: 'Ropa' } },
  { id: 'health', type: 'expense', icon: HeartPulse, hue: 0, label: { pt: 'Saúde', es: 'Salud' } },
  { id: 'beauty', type: 'expense', icon: Sparkles, hue: 315, label: { pt: 'Beleza', es: 'Belleza' } },
  { id: 'fitness', type: 'expense', icon: Dumbbell, hue: 160, label: { pt: 'Academia', es: 'Gimnasio' } },
  { id: 'leisure', type: 'expense', icon: Clapperboard, hue: 280, label: { pt: 'Lazer', es: 'Ocio' } },
  { id: 'travel', type: 'expense', icon: Plane, hue: 195, label: { pt: 'Viagem', es: 'Viajes' } },
  { id: 'education', type: 'expense', icon: GraduationCap, hue: 240, label: { pt: 'Educação', es: 'Educación' } },
  { id: 'pets', type: 'expense', icon: PawPrint, hue: 40, label: { pt: 'Pets', es: 'Mascotas' } },
  { id: 'gifts', type: 'expense', icon: Gift, hue: 345, label: { pt: 'Presentes', es: 'Regalos' } },
  { id: 'other', type: 'expense', icon: MoreHorizontal, hue: 220, label: { pt: 'Outros', es: 'Otros' } },

  { id: 'salary', type: 'income', icon: Banknote, hue: 150, label: { pt: 'Salário', es: 'Salario' } },
  { id: 'freelance', type: 'income', icon: Laptop, hue: 210, label: { pt: 'Freela', es: 'Freelance' } },
  { id: 'investment', type: 'income', icon: TrendingUp, hue: 170, label: { pt: 'Rendimentos', es: 'Inversiones' } },
  { id: 'gift_in', type: 'income', icon: Gift, hue: 345, label: { pt: 'Presente / Pix recebido', es: 'Regalo recibido' } },
  { id: 'other_in', type: 'income', icon: Wallet, hue: 220, label: { pt: 'Outras entradas', es: 'Otros ingresos' } },

  { id: 'transfer', type: 'transfer', icon: ArrowLeftRight, hue: 220, label: { pt: 'Transferência', es: 'Transferencia' } },
];

const BY_ID = new Map(CATEGORIES.map((c) => [c.id, c]));

/** Old ids (v1 data, English legacy names, brands) → current ids. */
const LEGACY: Record<string, string> = {
  'Food & Drink': 'food',
  Shopping: 'shopping',
  Transport: 'transport',
  Entertainment: 'leisure',
  Bills: 'bills',
  Healthcare: 'health',
  Education: 'education',
  Travel: 'travel',
  Salary: 'salary',
  Freelance: 'freelance',
  Investment: 'investment',
  Gift: 'gifts',
  Other: 'other',
  healthcare: 'health',
  entertainment: 'leisure',
  going_out: 'leisure',
  nightlife: 'leisure',
  games: 'leisure',
  tickets: 'leisure',
  netflix: 'subscriptions',
  instagram: 'subscriptions',
  amazon: 'shopping',
  toys: 'shopping',
  uber: 'rideshare',
  train: 'transport',
  bike: 'transport',
  plane: 'travel',
  nails: 'beauty',
  hair: 'beauty',
  gift: 'gifts',
};

export function normalizeCategory(raw: unknown, type: TxType): string {
  if (type === 'transfer') return 'transfer';
  const id = typeof raw === 'string' ? (LEGACY[raw] ?? raw) : '';
  const def = BY_ID.get(id);
  if (def && def.type === type) return def.id;
  if (def && type === 'income' && id === 'gifts') return 'gift_in';
  if (type === 'income' && (id === 'salary' || id === 'freelance' || id === 'investment')) return id;
  return type === 'income' ? 'other_in' : 'other';
}

export function getCategory(id: string): CategoryDef {
  return BY_ID.get(id) ?? BY_ID.get('other')!;
}

export function categoriesFor(type: FlowType): CategoryDef[] {
  return CATEGORIES.filter((c) => c.type === type);
}

export function categoryLabel(id: string, lang: Lang): string {
  return getCategory(id).label[lang];
}
