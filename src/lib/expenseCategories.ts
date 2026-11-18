import type { LucideIcon } from 'lucide-react';
import {
  UtensilsCrossed,
  Coffee,
  Wine,
  PartyPopper,
  ShoppingBag,
  Shirt,
  Baby,
  Fuel,
  Gift,
  Plane,
  TrainFront,
  Ticket,
  Car,
  ShoppingCart,
  Sparkles,
  Scissors,
  Hand,
  Repeat,
  Tv,
  AtSign,
  Package,
  HeartPulse,
  Lightbulb,
  GraduationCap,
  Clapperboard,
  Banknote,
  Laptop,
  TrendingUp,
  ClipboardList,
  Home,
  Smartphone,
  Gamepad2,
  Dumbbell,
  PawPrint,
  Bus,
  Bike,
} from 'lucide-react';
import type { TransactionCategory } from '../types';

export interface ExpenseCategoryDef {
  id: TransactionCategory;
  icon: LucideIcon;
  tone: string;
  labelEs: string;
  labelPt: string;
  /** Solo gastos en el picker de Inicio */
  expense?: boolean;
}

/** Catálogo de categorías con icono Lucide asociado */
export const EXPENSE_CATEGORIES: ExpenseCategoryDef[] = [
  { id: 'subscriptions', icon: Repeat, tone: 'bg-violet-100 text-violet-700', labelEs: 'Suscripciones', labelPt: 'Assinaturas', expense: true },
  { id: 'netflix', icon: Tv, tone: 'bg-red-100 text-red-700', labelEs: 'Netflix', labelPt: 'Netflix', expense: true },
  { id: 'amazon', icon: Package, tone: 'bg-amber-100 text-amber-800', labelEs: 'Amazon', labelPt: 'Amazon', expense: true },
  { id: 'instagram', icon: AtSign, tone: 'bg-pink-100 text-pink-700', labelEs: 'Instagram', labelPt: 'Instagram', expense: true },
  { id: 'uber', icon: Car, tone: 'bg-slate-200 text-slate-800', labelEs: 'Uber', labelPt: 'Uber', expense: true },
  { id: 'food', icon: UtensilsCrossed, tone: 'bg-emerald-100 text-emerald-700', labelEs: 'Comida', labelPt: 'Comida', expense: true },
  { id: 'drinks', icon: Coffee, tone: 'bg-orange-100 text-orange-700', labelEs: 'Bebida', labelPt: 'Bebida', expense: true },
  { id: 'nightlife', icon: Wine, tone: 'bg-purple-100 text-purple-700', labelEs: 'Salida / bar', labelPt: 'Saída / bar', expense: true },
  { id: 'going_out', icon: PartyPopper, tone: 'bg-fuchsia-100 text-fuchsia-700', labelEs: 'Salida', labelPt: 'Saída', expense: true },
  { id: 'clothes', icon: Shirt, tone: 'bg-sky-100 text-sky-700', labelEs: 'Ropa', labelPt: 'Roupas', expense: true },
  { id: 'toys', icon: Baby, tone: 'bg-yellow-100 text-yellow-800', labelEs: 'Juguetes', labelPt: 'Brinquedos', expense: true },
  { id: 'fuel', icon: Fuel, tone: 'bg-stone-200 text-stone-800', labelEs: 'Combustible', labelPt: 'Combustível', expense: true },
  { id: 'gift', icon: Gift, tone: 'bg-pink-100 text-pink-700', labelEs: 'Regalo', labelPt: 'Presente', expense: true },
  { id: 'travel', icon: Plane, tone: 'bg-cyan-100 text-cyan-700', labelEs: 'Viaje', labelPt: 'Viagem', expense: true },
  { id: 'tickets', icon: Ticket, tone: 'bg-indigo-100 text-indigo-700', labelEs: 'Boletos', labelPt: 'Bilhetes', expense: true },
  { id: 'train', icon: TrainFront, tone: 'bg-blue-100 text-blue-700', labelEs: 'Tren', labelPt: 'Trem', expense: true },
  { id: 'plane', icon: Plane, tone: 'bg-sky-100 text-sky-800', labelEs: 'Avión', labelPt: 'Avião', expense: true },
  { id: 'groceries', icon: ShoppingCart, tone: 'bg-lime-100 text-lime-800', labelEs: 'Compra de comida', labelPt: 'Compras de comida', expense: true },
  { id: 'beauty', icon: Sparkles, tone: 'bg-rose-100 text-rose-700', labelEs: 'Belleza', labelPt: 'Beleza', expense: true },
  { id: 'nails', icon: Hand, tone: 'bg-rose-100 text-rose-600', labelEs: 'Uñas', labelPt: 'Unhas', expense: true },
  { id: 'hair', icon: Scissors, tone: 'bg-amber-100 text-amber-700', labelEs: 'Pelo', labelPt: 'Cabelo', expense: true },
  { id: 'shopping', icon: ShoppingBag, tone: 'bg-rose-100 text-rose-700', labelEs: 'Compras', labelPt: 'Compras', expense: true },
  { id: 'transport', icon: Bus, tone: 'bg-amber-100 text-amber-700', labelEs: 'Transporte', labelPt: 'Transporte', expense: true },
  { id: 'bike', icon: Bike, tone: 'bg-teal-100 text-teal-700', labelEs: 'Bicicleta', labelPt: 'Bicicleta', expense: true },
  { id: 'bills', icon: Lightbulb, tone: 'bg-sky-100 text-sky-700', labelEs: 'Facturas', labelPt: 'Contas', expense: true },
  { id: 'home', icon: Home, tone: 'bg-stone-100 text-stone-700', labelEs: 'Hogar', labelPt: 'Casa', expense: true },
  { id: 'phone', icon: Smartphone, tone: 'bg-blue-100 text-blue-700', labelEs: 'Móvil', labelPt: 'Celular', expense: true },
  { id: 'games', icon: Gamepad2, tone: 'bg-indigo-100 text-indigo-700', labelEs: 'Juegos', labelPt: 'Jogos', expense: true },
  { id: 'fitness', icon: Dumbbell, tone: 'bg-emerald-100 text-emerald-800', labelEs: 'Deporte', labelPt: 'Esporte', expense: true },
  { id: 'pets', icon: PawPrint, tone: 'bg-orange-100 text-orange-800', labelEs: 'Mascotas', labelPt: 'Pets', expense: true },
  { id: 'healthcare', icon: HeartPulse, tone: 'bg-red-100 text-red-700', labelEs: 'Salud', labelPt: 'Saúde', expense: true },
  { id: 'education', icon: GraduationCap, tone: 'bg-indigo-100 text-indigo-700', labelEs: 'Educación', labelPt: 'Educação', expense: true },
  { id: 'entertainment', icon: Clapperboard, tone: 'bg-blue-100 text-blue-700', labelEs: 'Entretenimiento', labelPt: 'Entretenimento', expense: true },
  { id: 'other', icon: ClipboardList, tone: 'bg-slate-100 text-slate-700', labelEs: 'Otro', labelPt: 'Outro', expense: true },
  // Ingresos (no en picker de gastos)
  { id: 'salary', icon: Banknote, tone: 'bg-emerald-100 text-emerald-700', labelEs: 'Salario', labelPt: 'Salário' },
  { id: 'freelance', icon: Laptop, tone: 'bg-blue-100 text-blue-700', labelEs: 'Freelance', labelPt: 'Freelance' },
  { id: 'investment', icon: TrendingUp, tone: 'bg-teal-100 text-teal-700', labelEs: 'Inversión', labelPt: 'Investimento' },
];

/** Mapear categorías legacy (inglés) a ids nuevos */
const LEGACY_MAP: Record<string, TransactionCategory> = {
  'Food & Drink': 'food',
  Shopping: 'shopping',
  Transport: 'transport',
  Entertainment: 'entertainment',
  Bills: 'bills',
  Healthcare: 'healthcare',
  Education: 'education',
  Travel: 'travel',
  Salary: 'salary',
  Freelance: 'freelance',
  Investment: 'investment',
  Gift: 'gift',
  Other: 'other',
};

export function normalizeCategory(raw: string): TransactionCategory {
  if (LEGACY_MAP[raw]) return LEGACY_MAP[raw];
  const found = EXPENSE_CATEGORIES.find((c) => c.id === raw);
  return found ? found.id : 'other';
}

export function categoryLabel(id: string, lang: string): string {
  const cat = EXPENSE_CATEGORIES.find((c) => c.id === normalizeCategory(id));
  if (!cat) return id;
  return lang === 'pt' ? cat.labelPt : cat.labelEs;
}

export function getCategoryDef(id: string): ExpenseCategoryDef {
  const norm = normalizeCategory(id);
  return (
    EXPENSE_CATEGORIES.find((c) => c.id === norm) ||
    EXPENSE_CATEGORIES.find((c) => c.id === 'other')!
  );
}

export function expensePickerCategories(): ExpenseCategoryDef[] {
  return EXPENSE_CATEGORIES.filter((c) => c.expense);
}
