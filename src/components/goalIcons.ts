import type { LucideIcon } from 'lucide-react';
import { Car, Gift, Home, Laptop, PiggyBank, Plane, Shield, Target } from 'lucide-react';
import type { GoalIcon } from '../lib/types';

export const GOAL_ICON_MAP: Record<GoalIcon, LucideIcon> = {
  target: Target,
  piggy: PiggyBank,
  shield: Shield,
  plane: Plane,
  laptop: Laptop,
  home: Home,
  car: Car,
  gift: Gift,
};
