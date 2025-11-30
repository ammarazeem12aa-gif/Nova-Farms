export const CURRENCY_FORMATTER = new Intl.NumberFormat('en-PK', {
  style: 'currency',
  currency: 'PKR',
  maximumFractionDigits: 0,
});

export const formatCurrency = (amount: number) => CURRENCY_FORMATTER.format(amount);

export const EXPENSE_CATEGORIES = [
  'Feed',
  'Medicine',
  'Maintenance',
  'Salaries',
  'Utilities',
  'Transport',
  'Other'
];
