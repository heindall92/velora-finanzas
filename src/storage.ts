import localforage from 'localforage';
import type { AppData, UserProfile } from './types';

const STORAGE_KEY = 'velora_finance_data';
const STORAGE_VERSION = '1.1.0';

const store = localforage.createInstance({
  name: 'VeloraFinance',
  storeName: 'finance_data',
});

export const defaultProfile = (): UserProfile => ({
  name: '',
  firstName: '',
  lastName: '',
  currency: 'BRL',
  language: 'es',
  budget: 0,
  onboardingComplete: false,
});

const defaultData = (): AppData => ({
  transactions: [],
  accounts: [
    {
      id: '1',
      name: 'Velora',
      type: 'card',
      lastFour: '3827',
      balance: 0,
      color: 'blue',
    },
  ],
  goals: [],
  profile: defaultProfile(),
  version: STORAGE_VERSION,
});

function migrateProfile(raw: Partial<UserProfile> | undefined): UserProfile {
  const base = defaultProfile();
  if (!raw) return base;

  const firstName = raw.firstName ?? '';
  const lastName = raw.lastName ?? '';
  const legacyName = raw.name ?? '';
  const name =
    firstName || lastName
      ? `${firstName} ${lastName}`.trim()
      : legacyName;

  const resolvedFirst =
    firstName || (legacyName && legacyName !== 'Usuario' ? legacyName.split(' ')[0] : '');
  const resolvedLast =
    lastName ||
    (legacyName.includes(' ') && legacyName !== 'Usuario'
      ? legacyName.split(' ').slice(1).join(' ')
      : '');

  return {
    ...base,
    ...raw,
    firstName: resolvedFirst,
    lastName: resolvedLast,
    name: name === 'Usuario' ? '' : name,
    budget: typeof raw.budget === 'number' ? raw.budget : 0,
    currency: raw.currency || 'BRL',
    language: raw.language || 'es',
    // Solo cuenta limpia + onboarding explícito; sin datos demo
    onboardingComplete: raw.onboardingComplete === true,
  };
}

export const loadData = async (): Promise<AppData> => {
  try {
    const data = await store.getItem<AppData>(STORAGE_KEY);
    if (!data) return defaultData();
    return {
      ...defaultData(),
      ...data,
      profile: migrateProfile(data.profile),
      version: STORAGE_VERSION,
    };
  } catch (error) {
    console.error('Error loading data:', error);
    return defaultData();
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
    const parsed = JSON.parse(jsonString) as AppData;
    const data: AppData = {
      ...defaultData(),
      ...parsed,
      profile: migrateProfile(parsed.profile),
    };
    await saveData(data);
  } catch (error) {
    console.error('Error importing data:', error);
    throw new Error('Invalid JSON format');
  }
};

export const clearAllData = async (): Promise<void> => {
  await store.clear();
};
