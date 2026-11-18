import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AppData, Transaction, Account, Goal, UserProfile } from '../types';
import { defaultProfile, loadData, saveData } from '../storage';

interface AppContextType {
  data: AppData;
  isLoading: boolean;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addAccount: (account: Omit<Account, 'id'>) => Promise<void>;
  updateAccount: (id: string, account: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  addGoal: (goal: Omit<Goal, 'id'>) => Promise<void>;
  updateGoal: (id: string, goal: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  completeOnboarding: (input: {
    firstName: string;
    lastName: string;
    budget: number;
    currency?: string;
  }) => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppData>({
    transactions: [],
    accounts: [],
    goals: [],
    profile: defaultProfile(),
    version: '1.1.0',
  });
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = async () => {
    const loadedData = await loadData();
    setData(loadedData);
  };

  useEffect(() => {
    const init = async () => {
      await refreshData();
      setIsLoading(false);
    };
    init();
  }, []);

  const persistData = async (newData: AppData) => {
    setData(newData);
    await saveData(newData);
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    await persistData({
      ...data,
      transactions: [newTransaction, ...data.transactions],
    });
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    await persistData({
      ...data,
      transactions: data.transactions.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    });
  };

  const deleteTransaction = async (id: string) => {
    await persistData({
      ...data,
      transactions: data.transactions.filter((t) => t.id !== id),
    });
  };

  const addAccount = async (account: Omit<Account, 'id'>) => {
    const newAccount: Account = {
      ...account,
      id: Date.now().toString(),
    };
    await persistData({
      ...data,
      accounts: [...data.accounts, newAccount],
    });
  };

  const updateAccount = async (id: string, updates: Partial<Account>) => {
    await persistData({
      ...data,
      accounts: data.accounts.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    });
  };

  const deleteAccount = async (id: string) => {
    await persistData({
      ...data,
      accounts: data.accounts.filter((a) => a.id !== id),
    });
  };

  const addGoal = async (goal: Omit<Goal, 'id'>) => {
    const newGoal: Goal = {
      ...goal,
      id: Date.now().toString(),
    };
    await persistData({
      ...data,
      goals: [...data.goals, newGoal],
    });
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    await persistData({
      ...data,
      goals: data.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    });
  };

  const deleteGoal = async (id: string) => {
    await persistData({
      ...data,
      goals: data.goals.filter((g) => g.id !== id),
    });
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    const next = { ...data.profile, ...updates };
    if (updates.firstName !== undefined || updates.lastName !== undefined) {
      next.name = `${next.firstName} ${next.lastName}`.trim();
    }
    await persistData({
      ...data,
      profile: next,
    });
  };

  const completeOnboarding = async (input: {
    firstName: string;
    lastName: string;
    budget: number;
    currency?: string;
  }) => {
    const firstName = input.firstName.trim();
    const lastName = input.lastName.trim();
    const fullName = `${firstName} ${lastName}`.trim();
    const currency = input.currency || data.profile.currency || 'BRL';

    const startingTx: Transaction | null =
      input.budget > 0
        ? {
            id: `start-${Date.now()}`,
            type: 'income',
            amount: input.budget,
            category: 'Other',
            description: 'Saldo inicial / presupuesto',
            date: new Date().toISOString(),
            status: 'completed',
            recipientName: 'Presupuesto',
          }
        : null;

    await persistData({
      ...data,
      transactions: startingTx ? [startingTx, ...data.transactions] : data.transactions,
      profile: {
        ...data.profile,
        firstName,
        lastName,
        name: fullName,
        budget: input.budget,
        currency,
        onboardingComplete: true,
      },
    });
  };

  return (
    <AppContext.Provider
      value={{
        data,
        isLoading,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addAccount,
        updateAccount,
        deleteAccount,
        addGoal,
        updateGoal,
        deleteGoal,
        updateProfile,
        completeOnboarding,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
