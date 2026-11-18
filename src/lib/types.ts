import type { CurrencyCode } from './money';

export type Lang = 'pt' | 'es';
export type ThemePref = 'system' | 'light' | 'dark';
export type TxType = 'expense' | 'income' | 'transfer';
/** Types that carry a category (a transfer is money moving between your own accounts, not spending). */
export type FlowType = 'expense' | 'income';
export type AccountKind = 'checking' | 'credit' | 'savings' | 'cash';
export type CardColor = 'blue' | 'black' | 'red' | 'green' | 'orange' | 'mauve';
export type GoalIcon = 'target' | 'plane' | 'shield' | 'laptop' | 'home' | 'car' | 'gift' | 'piggy';

export interface Transaction {
  id: string;
  type: TxType;
  /** Always positive; the sign comes from `type`. */
  amount: number;
  /** For transfers: 'transfer'. */
  category: string;
  /** Account the money leaves (expense, transfer) or enters (income). Optional: v2 data has none. */
  accountId?: string;
  /** Transfers only: account the money goes to. */
  toAccountId?: string;
  note: string;
  /** Local calendar date, YYYY-MM-DD. A day, not an instant: avoids timezone off-by-one. */
  date: string;
  /** ISO instant, for stable ordering within a day. */
  createdAt: string;
}

export interface Account {
  id: string;
  name: string;
  kind: AccountKind;
  /** Bank preset id (colour + initials), see lib/banks.ts. */
  bank: string;
  /**
   * Balance on the day it was added. Negative for a credit card with an open bill (it is a debt).
   * Current balance = opening + movements on this account.
   */
  opening: number;
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
  /** Monthly spending limit per expense category id. */
  categoryLimits: Record<string, number>;
  onboardingComplete: boolean;
}

export interface AppData {
  version: 3;
  profile: Profile;
  accounts: Account[];
  transactions: Transaction[];
  goals: Goal[];
}
