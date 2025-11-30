
import React from 'react';
import { EggLog, LedgerEntry, Expense } from '../types';
import { Card, PageHeader } from '../components/UI';
import { useTheme } from '../components/ThemeContext';
import { formatCurrency } from '../constants';

interface BalanceSheetProps {
  eggLogs: EggLog[];
  ledger: LedgerEntry[];
  expenses: Expense[];
}

export const BalanceSheet: React.FC<BalanceSheetProps> = ({ eggLogs, ledger, expenses }) => {
  const { themeClasses, colors, isDark } = useTheme();

  const allDates = new Set<string>();
  eggLogs.forEach(l => allDates.add(l.date));
  ledger.forEach(l => allDates.add(l.date));
  expenses.forEach(e => allDates.add(e.date));

  const sortedDates = Array.from(allDates).sort().reverse();
  const manualEggLogs = eggLogs.filter(log => !log.ledgerId);

  const totalGeneralSales = manualEggLogs.reduce((sum, log) => sum + log.totalSale, 0);
  const totalLedgerSales = ledger.filter(l => l.type === 'DEBIT').reduce((sum, l) => sum + l.amount, 0);
  const totalIncome = totalGeneralSales + totalLedgerSales;
  
  const validExpenses = expenses.filter(e => e.type !== 'PAYMENT');
  const totalExpenses = validExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalBalance = totalIncome - totalExpenses;

  const dailyData = sortedDates.map(date => {
    const dailyGeneralSales = manualEggLogs.filter(l => l.date === date).reduce((sum, l) => sum + l.totalSale, 0);
    const dailyLedgerSales = ledger.filter(l => l.date === date && l.type === 'DEBIT').reduce((sum, l) => sum + l.amount, 0);
    const dailyExpense = expenses.filter(e => e.date === date && e.type !== 'PAYMENT').reduce((sum, e) => sum + e.amount, 0);
    const dailyTotalSale = dailyGeneralSales + dailyLedgerSales;

    return { date, generalSales: dailyGeneralSales, ledgerSales: dailyLedgerSales, totalSale: dailyTotalSale, expense: dailyExpense, balance: dailyTotalSale - dailyExpense };
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Balance Sheet" description="Summary of all sales (General + Ledger) and Expenses" />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className={`p-6 ${isDark ? 'bg-emerald-900/10 border-emerald-900/50' : 'border-emerald-100 bg-emerald-50/50'}`}>
          <p className={`text-sm font-medium uppercase ${isDark ? 'text-emerald-500' : 'text-emerald-800'}`}>Total Sales</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">{formatCurrency(totalIncome)}</p>
          <div className={`mt-2 text-xs ${isDark ? 'text-emerald-500/80' : 'text-emerald-700'}`}>
            <span className="opacity-75">General: {formatCurrency(totalGeneralSales)}</span>
            <span className="mx-1">•</span>
            <span className="opacity-75">Ledger: {formatCurrency(totalLedgerSales)}</span>
          </div>
        </Card>

        <Card className={`p-6 ${isDark ? 'bg-red-900/10 border-red-900/50' : 'border-red-100 bg-red-50/50'}`}>
          <p className={`text-sm font-medium uppercase ${isDark ? 'text-red-500' : 'text-red-800'}`}>Total Expenses</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{formatCurrency(totalExpenses)}</p>
        </Card>

        <Card className={`p-6 ${isDark ? 'bg-blue-900/10 border-blue-900/50' : 'border-blue-100 bg-blue-50/50'}`}>
          <p className={`text-sm font-medium uppercase ${isDark ? 'text-blue-500' : 'text-blue-800'}`}>Net Balance</p>
          <p className={`text-3xl font-bold mt-2 ${totalBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {formatCurrency(totalBalance)}
          </p>
        </Card>
      </div>

      <Card>
        <div className={`px-6 py-4 border-b ${themeClasses.tableHeader}`}>
          <h3 className={`font-semibold ${colors.textMain}`}>Daily Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className={`font-semibold border-b ${themeClasses.tableHeader}`}>
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3 text-right">General Sales</th>
                <th className="px-6 py-3 text-right">Ledger Sales</th>
                <th className={`px-6 py-3 text-right ${isDark ? 'bg-emerald-900/20 text-emerald-400' : 'bg-emerald-50 text-emerald-800'}`}>Total Sale</th>
                <th className="px-6 py-3 text-right text-red-500">Expense</th>
                <th className="px-6 py-3 text-right font-bold">Balance</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${themeClasses.divider}`}>
              {dailyData.length === 0 ? (
                <tr><td colSpan={6} className={`px-6 py-8 text-center ${colors.textMuted}`}>No financial data available.</td></tr>
              ) : (
                dailyData.map((item) => (
                  <tr key={item.date} className={themeClasses.hoverBg}>
                    <td className={`px-6 py-3 font-medium ${colors.textMain}`}>{item.date}</td>
                    <td className={`px-6 py-3 text-right ${colors.textMuted}`}>{formatCurrency(item.generalSales)}</td>
                    <td className={`px-6 py-3 text-right ${colors.textMuted}`}>{formatCurrency(item.ledgerSales)}</td>
                    <td className={`px-6 py-3 text-right font-medium text-emerald-600 ${isDark ? 'bg-emerald-900/10' : 'bg-emerald-50/30'}`}>
                      {formatCurrency(item.totalSale)}
                    </td>
                    <td className="px-6 py-3 text-right text-red-500">{formatCurrency(item.expense)}</td>
                    <td className={`px-6 py-3 text-right font-bold ${item.balance >= 0 ? colors.textMain : 'text-red-600'}`}>
                      {formatCurrency(item.balance)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
