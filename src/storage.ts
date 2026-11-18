import localforage from 'localforage';
import type { AppData } from './types';

const STORAGE_KEY = 'velora_finance_data';
const STORAGE_VERSION = '1.0.0';

const store = localforage.createInstance({
  name: 'VeloraFinance',
  storeName: 'finance_data',
});

const defaultData: AppData = {
  transactions: [],
  accounts: [
    {
      id: '1',
      name: 'Velora',
      type: 'card',
      lastFour: '3827',
      balance: 0,
      color: 'from-blue-500 to-purple-600',
    },
  ],
  goals: [],
  profile: {
    name: 'Usuario',
    currency: 'BRL',
    language: 'es',
  },
  version: STORAGE_VERSION,
};

export const loadData = async (): Promise<AppData> => {
  try {
    const data = await store.getItem<AppData>(STORAGE_KEY);
    return data || defaultData;
  } catch (error) {
    console.error('Error loading data:', error);
    return defaultData;
  }
};

export const saveData = async (data: AppData): Promise<void> => {
  try {
    await store.setItem(STORAGE_KEY, { ...data, version: STORAGE_VERSION });
  } catch (error) {
    console.error('Error saving data:', error);
    throw error;
  }
};

export const exportData = async (): Promise<string> => {
  const data = await loadData();
  return JSON.stringify(data, null, 2);
};

export const importData = async (jsonString: string): Promise<void> => {
  try {
    const data = JSON.parse(jsonString) as AppData;
    await saveData(data);
  } catch (error) {
    console.error('Error importing data:', error);
    throw new Error('Invalid JSON format');
  }
};

export const clearAllData = async (): Promise<void> => {
  await store.clear();
};

export const loadDemoData = async (): Promise<void> => {
  const demoData: AppData = {
    transactions: [
      {
        id: '1',
        type: 'expense',
        amount: 9.99,
        category: 'Food & Drink',
        description: 'Starbucks',
        date: new Date().toISOString(),
        status: 'completed',
        recipientName: 'Starbucks',
      },
      {
        id: '2',
        type: 'expense',
        amount: 65.30,
        category: 'Shopping',
        description: 'Compra online',
        date: new Date(Date.now() - 86400000).toISOString(),
        status: 'completed',
        recipientName: 'Amazon',
      },
      {
        id: '3',
        type: 'expense',
        amount: 15.99,
        category: 'Entertainment',
        description: 'Suscripción',
        date: new Date(Date.now() - 172800000).toISOString(),
        status: 'completed',
        recipientName: 'Netflix',
      },
      {
        id: '4',
        type: 'income',
        amount: 2500,
        category: 'Salary',
        description: 'Salario mensual',
        date: new Date(Date.now() - 259200000).toISOString(),
        status: 'completed',
      },
    ],
    accounts: [
      {
        id: '1',
        name: 'Velora',
        type: 'card',
        lastFour: '3827',
        balance: 8642.50,
        color: 'from-blue-500 to-purple-600',
      },
    ],
    goals: [
      {
        id: '1',
        name: 'Viajar a Bali',
        description: 'Vacaciones de verano',
        targetAmount: 5500,
        currentAmount: 2850,
        icon: '✈️',
        color: 'from-blue-400 to-cyan-500',
        deadline: '2027-07-01',
        imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&auto=format&fit=crop',
      },
      {
        id: '2',
        name: 'Fondo de emergencia',
        description: '6 meses de gastos',
        targetAmount: 15000,
        currentAmount: 4200,
        icon: '💰',
        color: 'from-green-400 to-emerald-500',
      },
      {
        id: '3',
        name: 'Nuevo portátil',
        targetAmount: 1500,
        currentAmount: 850,
        icon: '💻',
        color: 'from-purple-400 to-pink-500',
      },
    ],
    profile: {
      name: 'Ayesha Rahman',
      email: 'ayesha@ejemplo.com',
      currency: 'BRL',
      language: 'es',
    },
    version: STORAGE_VERSION,
  };
  
  await saveData(demoData);
};
