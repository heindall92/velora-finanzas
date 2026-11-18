import type { CurrencyCode } from './money';

export type Lang = 'pt' | 'es';
export type ThemePref = 'system' | 'light' | 'dark';
export type TxType = 'expense' | 'income';
export type CardColor = 'blue' | 'black' | 'red' | 'green' | 'orange' | 'mauve';
export type GoalIcon = 'target' | 'plane' | 'shield' | 'laptop' | 'home' | 'car' | 'gift' | 'piggy';

export interface Transaction {
  id: string;
  type: TxType;
  /** Always positive; the sign comes from `type`. */
  amount: number;
  category: string;
  note: string;
  /** Local calendar date, YYYY-MM-DD. A day, not an instant: avoids timezone off-by-one. */
  date: string;
  /** ISO instant, for stable ordering within a day. */
  createdAt: string;
}

export interface Goal {
  id: string;
  name: string;
  icon: GoalIcon;
  target: number;
  saved: number;
  /** YYYY-MM-DD, optional. */
  deadline?: string;
  createdAt: string;
}

export interface Profile {
  firstName: string;
  lastName: string;
  currency: CurrencyCode;
  language: Lang;
  theme: ThemePref;
  /** Monthly spending limit. 0 = no budget. Not a balance. */
  budget: number;
  cardColor: CardColor;
  hideBalance: boolean;
  onboardingComplete: boolean;
}

export interface AppData {
  version: 2;
  profile: Profile;
  transactions: Transaction[];
  goals: Goal[];
}
