
export interface EggLog {
  id: string;
  ledgerId?: string;
  date: string;
  collectedCount: number;
  soldCount: number;
  salePrice: number;
  totalSale: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
}

export interface Payee {
  id: string;
  name: string;
  type: string;
  phone?: string;
}

export interface LedgerEntry {
  id: string;
  customerId: string;
  date: string;
  description: string;
  type: 'DEBIT' | 'CREDIT';
  amount: number;
  pricePerUnit?: number;
  quantity?: number;
}

export interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  payeeId?: string;
  type: 'INVOICE' | 'PAYMENT';
}

export type Theme = 'LIGHT' | 'DARK' | 'FUN';

export interface FarmSettings {
  farmName: string;
  phone: string;
  location: string;
  theme: Theme;
}

export type ViewState = 
  | 'DASHBOARD'
  | 'EGGS'
  | 'CUSTOMERS'
  | 'LEDGER'
  | 'EXPENSES'
  | 'BALANCE_SHEET'
  | 'OUTSTANDING'
  | 'SETTINGS';
