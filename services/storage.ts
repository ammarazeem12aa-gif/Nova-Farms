
import { EggLog, Customer, LedgerEntry, Expense, Payee, FarmSettings } from '../types';

const KEYS = {
  EGGS: 'eggfarm_eggs',
  CUSTOMERS: 'eggfarm_customers',
  LEDGER: 'eggfarm_ledger',
  EXPENSES: 'eggfarm_expenses',
  PAYEES: 'eggfarm_payees',
  SETTINGS: 'eggfarm_settings',
};

const DEFAULT_SETTINGS: FarmSettings = {
  farmName: 'Nova Farms',
  phone: '',
  location: '',
  theme: 'LIGHT'
};

export const storage = {
  getEggs: (): EggLog[] => JSON.parse(localStorage.getItem(KEYS.EGGS) || '[]'),
  setEggs: (data: EggLog[]) => localStorage.setItem(KEYS.EGGS, JSON.stringify(data)),

  getCustomers: (): Customer[] => JSON.parse(localStorage.getItem(KEYS.CUSTOMERS) || '[]'),
  setCustomers: (data: Customer[]) => localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(data)),

  getLedger: (): LedgerEntry[] => JSON.parse(localStorage.getItem(KEYS.LEDGER) || '[]'),
  setLedger: (data: LedgerEntry[]) => localStorage.setItem(KEYS.LEDGER, JSON.stringify(data)),

  getExpenses: (): Expense[] => JSON.parse(localStorage.getItem(KEYS.EXPENSES) || '[]'),
  setExpenses: (data: Expense[]) => localStorage.setItem(KEYS.EXPENSES, JSON.stringify(data)),

  getPayees: (): Payee[] => JSON.parse(localStorage.getItem(KEYS.PAYEES) || '[]'),
  setPayees: (data: Payee[]) => localStorage.setItem(KEYS.PAYEES, JSON.stringify(data)),

  getSettings: (): FarmSettings => {
    const saved = localStorage.getItem(KEYS.SETTINGS);
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  },
  setSettings: (data: FarmSettings) => localStorage.setItem(KEYS.SETTINGS, JSON.stringify(data)),
};
