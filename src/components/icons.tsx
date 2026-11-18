import type { LucideIcon } from 'lucide-react';
import {
  UtensilsCrossed,
  ShoppingBag,
  Car,
  Clapperboard,
  Lightbulb,
  HeartPulse,
  GraduationCap,
  Plane,
  Banknote,
  Laptop,
  TrendingUp,
  Gift,
  ClipboardList,
  Target,
  PiggyBank,
  Shield,
  Wallet,
} from 'lucide-react';
import type { TransactionCategory } from '../types';

export const categoryIcons: Record<TransactionCategory, LucideIcon> = {
  'Food & Drink': UtensilsCrossed,
  Shopping: ShoppingBag,
  Transport: Car,
  Entertainment: Clapperboard,
  Bills: Lightbulb,
  Healthcare: HeartPulse,
  Education: GraduationCap,
  Travel: Plane,
  Salary: Banknote,
  Freelance: Laptop,
  Investment: TrendingUp,
  Gift: Gift,
  Other: ClipboardList,
};

export const categoryStyles: Record<string, string> = {
  'Food & Drink': 'bg-emerald-100 text-emerald-700',
  Shopping: 'bg-rose-100 text-rose-700',
  Transport: 'bg-amber-100 text-amber-700',
  Entertainment: 'bg-violet-100 text-violet-700',
  Bills: 'bg-sky-100 text-sky-700',
  Healthcare: 'bg-red-100 text-red-700',
  Education: 'bg-indigo-100 text-indigo-700',
  Travel: 'bg-cyan-100 text-cyan-700',
  Salary: 'bg-emerald-100 text-emerald-700',
  Freelance: 'bg-blue-100 text-blue-700',
  Investment: 'bg-teal-100 text-teal-700',
  Gift: 'bg-pink-100 text-pink-700',
  Other: 'bg-slate-100 text-slate-700',
};

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
  const Icon = categoryIcons[category as TransactionCategory] ?? ClipboardList;
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
    key.includes('bali') || key.includes('viaj') || key.includes('travel')
      ? Plane
      : key.includes('emerg') || key.includes('fondo')
        ? Shield
        : key.includes('portátil') || key.includes('laptop') || key.includes('comput')
          ? Laptop
          : key.includes('ahorro') || key.includes('saving')
            ? PiggyBank
            : Target;
  return <Icon size={size} strokeWidth={1.75} className={className} />;
}
