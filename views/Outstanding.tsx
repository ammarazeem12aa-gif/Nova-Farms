
import React from 'react';
import { Customer, LedgerEntry, Payee, Expense } from '../types';
import { Card, PageHeader } from '../components/UI';
import { useTheme } from '../components/ThemeContext';
import { formatCurrency } from '../constants';
import { AlertCircle, TrendingDown, TrendingUp, MessageCircle } from 'lucide-react';

interface OutstandingProps {
  customers: Customer[];
  ledger: LedgerEntry[];
  payees: Payee[];
  expenses: Expense[];
}

export const Outstanding: React.FC<OutstandingProps> = ({ customers, ledger, payees, expenses }) => {
  const { themeClasses, colors, isDark, settings } = useTheme();

  const customerBalances = customers.map(customer => {
    const entries = ledger.filter(l => l.customerId === customer.id);
    const debit = entries.filter(l => l.type === 'DEBIT').reduce((sum, l) => sum + l.amount, 0);
    const credit = entries.filter(l => l.type === 'CREDIT').reduce((sum, l) => sum + l.amount, 0);
    return { 
      id: customer.id, 
      name: customer.name, 
      phone: customer.phone,
      type: 'CUSTOMER', 
      balance: debit - credit, 
      lastActive: entries.length > 0 ? entries.sort((a,b) => b.date.localeCompare(a.date))[0].date : 'N/A' 
    };
  }).filter(c => c.balance !== 0);

  const payeeBalances = payees.map(payee => {
    const entries = expenses.filter(e => e.payeeId === payee.id);
    const invoices = entries.filter(e => e.type !== 'PAYMENT').reduce((sum, e) => sum + e.amount, 0);
    const payments = entries.filter(e => e.type === 'PAYMENT').reduce((sum, e) => sum + e.amount, 0);
    return { 
      id: payee.id, 
      name: payee.name, 
      phone: payee.phone,
      type: payee.type, 
      balance: invoices - payments, 
      lastActive: entries.length > 0 ? entries.sort((a,b) => b.date.localeCompare(a.date))[0].date : 'N/A' 
    };
  }).filter(p => p.balance !== 0);

  const totalReceivables = customerBalances.filter(c => c.balance > 0).reduce((sum, c) => sum + c.balance, 0);
  const totalPayables = customerBalances.filter(c => c.balance < 0).reduce((sum, c) => sum + Math.abs(c.balance), 0) + payeeBalances.filter(p => p.balance > 0).reduce((sum, p) => sum + p.balance, 0);
  const allBalances = [...customerBalances, ...payeeBalances].sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance));

  const getWhatsAppLink = (name: string, phone: string | undefined, balance: number, type: string) => {
    if (!phone) return null;
    
    // Remove non-numeric characters for the link
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) return null;

    let message = '';
    const formattedAmount = formatCurrency(Math.abs(balance));

    if (type === 'CUSTOMER') {
      if (balance > 0) {
        message = `Hello ${name}, this is a reminder from ${settings.farmName} regarding your outstanding balance of ${formattedAmount}. Please clear it at your earliest convenience.`;
      } else {
        message = `Hello ${name}, your current advance balance with ${settings.farmName} is ${formattedAmount}.`;
      }
    } else {
      // Payee logic
      if (balance > 0) {
        message = `Hello ${name}, contacting you regarding the payable amount of ${formattedAmount} from ${settings.farmName}.`;
      } else {
         message = `Hello ${name}, regarding the overpaid balance of ${formattedAmount}.`;
      }
    }
    
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Outstanding Balances" description="Overview of Payables and Receivables" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <Card className={`p-6 ${isDark ? 'bg-red-900/10 border-red-900/50' : 'bg-red-50/50 border-red-100'}`}>
            <div className="flex items-center justify-between mb-2">
               <h3 className={`text-sm font-semibold uppercase ${isDark ? 'text-red-500' : 'text-red-800'}`}>Total Receivables</h3>
               <TrendingDown className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-3xl font-bold text-red-600">{formatCurrency(totalReceivables)}</p>
            <p className={`text-xs mt-1 ${isDark ? 'text-red-500/80' : 'text-red-700'}`}>Pending from Customers</p>
         </Card>

         <Card className={`p-6 ${isDark ? 'bg-amber-900/10 border-amber-900/50' : 'bg-amber-50/50 border-amber-100'}`}>
            <div className="flex items-center justify-between mb-2">
               <h3 className={`text-sm font-semibold uppercase ${isDark ? 'text-amber-500' : 'text-amber-800'}`}>Total Payables</h3>
               <TrendingUp className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-3xl font-bold text-amber-600">{formatCurrency(totalPayables)}</p>
            <p className={`text-xs mt-1 ${isDark ? 'text-amber-500/80' : 'text-amber-700'}`}>Vendors, Salaries & Customer Advances</p>
         </Card>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className={`font-semibold border-b ${themeClasses.tableHeader}`}>
              <tr>
                <th className="px-6 py-3">Entity Name</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Last Active</th>
                <th className="px-6 py-3 text-right">Balance Status</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3 text-center">Contact</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${themeClasses.divider}`}>
              {allBalances.length === 0 ? (
                <tr>
                  <td colSpan={6} className={`px-6 py-12 text-center flex flex-col items-center justify-center ${colors.textMuted}`}>
                    <AlertCircle className="w-12 h-12 mb-2 text-emerald-400 opacity-50" />
                    <span className="text-lg">All clean! No outstanding balances.</span>
                  </td>
                </tr>
              ) : (
                allBalances.map((item) => {
                  let statusColor = '', statusText = '', amount = Math.abs(item.balance);
                  if (item.type === 'CUSTOMER') {
                     if (item.balance > 0) { statusColor = 'text-red-600'; statusText = 'Owes You'; } 
                     else { statusColor = 'text-amber-600'; statusText = 'Advance'; }
                  } else {
                     if (item.balance > 0) { statusColor = 'text-amber-600'; statusText = 'You Owe'; } 
                     else { statusColor = 'text-emerald-600'; statusText = 'Overpaid'; }
                  }

                  const waLink = getWhatsAppLink(item.name, item.phone, item.balance, item.type);

                  return (
                    <tr key={`${item.type}-${item.id}`} className={themeClasses.hoverBg}>
                      <td className={`px-6 py-3 font-medium ${colors.textMain}`}>{item.name}</td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium 
                          ${item.type === 'CUSTOMER' ? (isDark ? 'bg-slate-800 text-slate-300' : 'bg-gray-100 text-gray-800') : ''}
                          ${item.type === 'VENDOR' ? (isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800') : ''}
                          ${item.type === 'EMPLOYEE' ? (isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-800') : ''}
                        `}>
                          {item.type}
                        </span>
                      </td>
                      <td className={`px-6 py-3 ${colors.textMuted}`}>{item.lastActive}</td>
                      <td className={`px-6 py-3 text-right font-medium ${statusColor}`}>{statusText}</td>
                      <td className={`px-6 py-3 text-right font-bold ${colors.textMain}`}>{formatCurrency(amount)}</td>
                      <td className="px-6 py-3 text-center">
                        {waLink ? (
                          <a 
                            href={waLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center p-2 rounded-full text-white bg-green-500 hover:bg-green-600 transition-colors shadow-sm"
                            title="Send WhatsApp Reminder"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                        ) : (
                          <span className={`text-xs ${colors.textMuted} opacity-50`}>No Phone</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
