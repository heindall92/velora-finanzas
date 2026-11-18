import type { LucideIcon } from 'lucide-react';
import {
  ClipboardList,
  Target,
  PiggyBank,
  Shield,
  Wallet,
  Plane,
  Laptop,
} from 'lucide-react';
import { EXPENSE_CATEGORIES, getCategoryDef } from '../lib/expenseCategories';

export { categoryLabel, normalizeCategory } from '../lib/expenseCategories';

export const categoryStyles: Record<string, string> = Object.fromEntries(
  EXPENSE_CATEGORIES.map((c) => [c.id, c.tone])
);

export const goalIcons: Record<string, LucideIcon> = {
  travel: Plane,
  emergency: Shield,
  laptop: Laptop,
  savings: PiggyBank,
  target: Target,
  wallet: Wallet,
};

export function CategoryIcon({
  category,
  size = 20,
  className = '',
}: {
  category: string;
  size?: number;
  className?: string;
}) {
  const Icon = getCategoryDef(category).icon;
  return <Icon size={size} strokeWidth={1.75} className={className} />;
}

export function GoalIcon({
  name,
  size = 20,
  className = '',
}: {
  name?: string;
  size?: number;
  className?: string;
}) {
  const key = (name || 'target').toLowerCase();
  const Icon =
    key.includes('viaj') || key.includes('travel') || key.includes('vacac')
      ? Plane
      : key.includes('emerg') || key.includes('fondo')
        ? Shield
        : key.includes('portátil') || key.includes('laptop') || key.includes('comput')
          ? Laptop
          : key.includes('ahorro') || key.includes('saving') || key.includes('poupan')
            ? PiggyBank
            : Target;
  return <Icon size={size} strokeWidth={1.75} className={className} />;
}

/** Fallback genérico si se necesita un icono suelto */
export const FallbackCategoryIcon: LucideIcon = ClipboardList;
