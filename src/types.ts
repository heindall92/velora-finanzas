export type TransactionType = 'income' | 'expense' | 'transfer';

export type TransactionCategory =
  | 'Food & Drink'
  | 'Shopping'
  | 'Transport'
  | 'Entertainment'
  | 'Bills'
  | 'Healthcare'
  | 'Education'
  | 'Travel'
  | 'Salary'
  | 'Freelance'
  | 'Investment'
  | 'Gift'
  | 'Other';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: TransactionCategory;
  description: string;
  date: string;
  accountId?: string;
  recipientName?: string;
  recipientAvatar?: string;
  status?: 'completed' | 'pending' | 'failed';
}

export interface Account {
  id: string;
  name: string;
  type: 'card' | 'cash' | 'savings';
  lastFour?: string;
  balance: number;
  color: string;
}

export interface Goal {
  id: string;
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  icon?: string;
  color?: string;
  deadline?: string;
  imageUrl?: string;
}

export interface UserProfile {
  name: string;
  firstName: string;
  lastName: string;
  email?: string;
  currency: string;
  language: string;
  avatar?: string;
  /** Presupuesto mensual (sin datos bancarios) */
  budget: number;
  onboardingComplete: boolean;
}

export interface AppData {
  transactions: Transaction[];
  accounts: Account[];
  goals: Goal[];
  profile: UserProfile;
  version: string;
}
