
import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line 
} from 'recharts';
import { EggLog, LedgerEntry, Expense, Customer, Payee } from '../types';
import { Card, PageHeader, Input } from '../components/UI';
import { useTheme } from '../components/ThemeContext';
import { formatCurrency } from '../constants';
import { BarChart3, Calendar, Egg, ArrowUpRight, ArrowDownLeft, FileText, Search } from 'lucide-react';

interface OverviewProps {
  eggLogs: EggLog[];
  ledger: LedgerEntry[];
  expenses: Expense[];
  customers: Customer[];
  payees: Payee[];
}

export const Overview: React.FC<OverviewProps> = ({ eggLogs, ledger, expenses, customers, payees }) => {
  const { themeClasses, colors, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'CHARTS' | 'DATE_VIEW'>('CHARTS');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // --- CHART LOGIC ---
  const allDates = new Set<string>();
  eggLogs.forEach(l => allDates.add(l.date));
  ledger.forEach(l => allDates.add(l.date));
  expenses.forEach(e => allDates.add(e.date));

  const sortedDates = Array.from(allDates).sort(); 

  const chartData = sortedDates.map(date => {
    const collected = eggLogs.filter(l => l.date === date).reduce((sum, l) => sum + l.collectedCount, 0);
    const generalSale = eggLogs.filter(l => l.date === date && !l.ledgerId).reduce((sum, l) => sum + l.totalSale, 0);
    const ledgerSale = ledger.filter(l => l.date === date && l.type === 'DEBIT').reduce((sum, l) => sum + l.amount, 0);
    const totalSale = generalSale + ledgerSale;
    const expense = expenses.filter(e => e.date === date && e.type !== 'PAYMENT').reduce((sum, e) => sum + e.amount, 0);

    return { date, Collected: collected, Sales: totalSale, Expense: expense };
  });

  const displayData = chartData.length > 30 ? chartData.slice(-30) : chartData;

  // --- DATE VIEW LOGIC ---
  const getDailyRecords = () => {
    const records: any[] = [];
    // 1. Egg Logs
    eggLogs.filter(l => l.date === selectedDate).forEach(log => {
      if (!log.ledgerId) {
         records.push({
           id: `egg-${log.id}`, type: 'EGG_LOG', category: 'Production & Cash Sale', entity: 'General',
           description: `Collected: ${log.collectedCount}, Sold: ${log.soldCount} @ ${log.salePrice}`, amount: log.totalSale, flow: 'IN'
         });
      } else {
        records.push({
           id: `egg-${log.id}`, type: 'EGG_COLLECTION', category: 'Production', entity: 'Farm',
           description: `Collected: ${log.collectedCount} eggs`, amount: 0, flow: 'NEUTRAL'
         });
      }
    });
    // 2. Ledger
    ledger.filter(l => l.date === selectedDate).forEach(entry => {
      const customer = customers.find(c => c.id === entry.customerId);
      const isSale = entry.type === 'DEBIT';
      records.push({
        id: `ledger-${entry.id}`, type: isSale ? 'CREDIT_SALE' : 'PAYMENT_RECEIVED', category: isSale ? 'Customer Sale' : 'Payment Received',
        entity: customer?.name || 'Unknown Customer', description: entry.description, amount: entry.amount, flow: 'IN'
      });
    });
    // 3. Expenses
    expenses.filter(e => e.date === selectedDate).forEach(exp => {
      const payee = payees.find(p => p.id === exp.payeeId);
      const isPayment = exp.type === 'PAYMENT';
      records.push({
        id: `exp-${exp.id}`, type: isPayment ? 'PAYMENT_SENT' : 'EXPENSE', category: isPayment ? 'Payment Sent' : 'Expense',
        entity: payee?.name || 'General / Cash', description: `${exp.category} - ${exp.description}`, amount: exp.amount, flow: 'OUT'
      });
    });
    return records;
  };

  const calculateInventoryStats = () => {
    let openingCollected = 0, openingSold = 0, todayCollected = 0, todaySold = 0;
    eggLogs.forEach(log => {
      if (log.date < selectedDate) { openingCollected += log.collectedCount; openingSold += log.soldCount; }
      else if (log.date === selectedDate) { todayCollected += log.collectedCount; todaySold += log.soldCount; }
    });
    return { openingInventory: openingCollected - openingSold, closingInventory: (openingCollected - openingSold) + (todayCollected - todaySold) };
  };

  const dailyRecords = getDailyRecords();
  const inventoryStats = calculateInventoryStats();
  const dailyTotalIn = dailyRecords.filter(r => r.flow === 'IN').reduce((sum, r) => sum + r.amount, 0);
  const dailyTotalOut = dailyRecords.filter(r => r.flow === 'OUT').reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <PageHeader title="Overview" description="Farm performance insights" />
        
        <div className={`p-1 rounded-lg border flex shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
          <button 
            onClick={() => setActiveTab('CHARTS')}
            className={`px-4 py-2 text-sm font-medium rounded-md flex items-center transition-all ${activeTab === 'CHARTS' ? themeClasses.buttonPrimary : `${colors.textMuted} hover:${colors.bgPage}`}`}
          >
            <BarChart3 className="w-4 h-4 mr-2" /> Visual Insights
          </button>
          <button 
            onClick={() => setActiveTab('DATE_VIEW')}
            className={`px-4 py-2 text-sm font-medium rounded-md flex items-center transition-all ${activeTab === 'DATE_VIEW' ? themeClasses.buttonPrimary : `${colors.textMuted} hover:${colors.bgPage}`}`}
          >
            <Calendar className="w-4 h-4 mr-2" /> Date View
          </button>
        </div>
      </div>

      {activeTab === 'CHARTS' ? (
        <>
          <Card className="p-6">
            <h3 className={`text-lg font-semibold mb-4 ${colors.textMain}`}>Daily Egg Collection</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={displayData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#e5e7eb'} />
                  <XAxis dataKey="date" tick={{fontSize: 12, fill: isDark ? '#94a3b8' : '#666'}} tickMargin={10} />
                  <YAxis tick={{fill: isDark ? '#94a3b8' : '#666'}} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: isDark ? '#1e293b' : '#fff', color: isDark ? '#fff' : '#000', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend />
                  <Line type="monotone" dataKey="Collected" stroke="#f59e0b" strokeWidth={3} dot={false} activeDot={{ r: 6 }} name="Eggs Collected" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className={`text-lg font-semibold mb-4 ${colors.textMain}`}>Income vs Expense</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={displayData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#e5e7eb'} />
                  <XAxis dataKey="date" tick={{fontSize: 12, fill: isDark ? '#94a3b8' : '#666'}} tickMargin={10} />
                  <YAxis tickFormatter={(value) => `Rs ${value/1000}k`} tick={{fill: isDark ? '#94a3b8' : '#666'}} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: isDark ? '#1e293b' : '#fff', color: isDark ? '#fff' : '#000', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend />
                  <Bar dataKey="Sales" fill="#10b981" name="Total Sales" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Expense" fill="#ef4444" name="Expenses" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </>
      ) : (
        <>
          <Card className={`p-6 ${isDark ? 'bg-blue-900/10 border-blue-900/50' : 'bg-blue-50/30 border-blue-100'}`}>
             <div className="flex flex-col md:flex-row items-end gap-4">
                <div className="w-full md:w-auto">
                   <Input label="Select Date" type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
                </div>
                <div className="flex-1 flex flex-wrap gap-4 w-full justify-end items-center">
                   {/* Inventory Stats Mini */}
                   <div className={`p-2 rounded-lg border text-center mr-4 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white/60 border-gray-200'}`}>
                      <p className={`text-[10px] uppercase font-semibold ${colors.textMuted}`}>Opening Inv.</p>
                      <p className={`text-sm font-bold ${colors.textMain}`}>{inventoryStats.openingInventory.toLocaleString()}</p>
                   </div>
                   <div className={`p-2 rounded-lg border text-center mr-4 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white/60 border-gray-200'}`}>
                      <p className={`text-[10px] uppercase font-semibold ${colors.textMuted}`}>Closing Inv.</p>
                      <p className={`text-sm font-bold ${colors.textMain}`}>{inventoryStats.closingInventory.toLocaleString()}</p>
                   </div>

                   {/* Financial Stats */}
                   <div className="text-right">
                      <p className={`text-xs uppercase font-semibold ${colors.textMuted}`}>Total In (Sales/Rcvd)</p>
                      <p className="text-xl font-bold text-emerald-600">{formatCurrency(dailyTotalIn)}</p>
                   </div>
                   <div className={`text-right pl-4 border-l ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
                      <p className={`text-xs uppercase font-semibold ${colors.textMuted}`}>Total Out (Exp/Paid)</p>
                      <p className="text-xl font-bold text-red-600">{formatCurrency(dailyTotalOut)}</p>
                   </div>
                   <div className={`text-right pl-4 border-l ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
                      <p className={`text-xs uppercase font-semibold ${colors.textMuted}`}>Net Flow</p>
                      <p className={`text-xl font-bold ${dailyTotalIn - dailyTotalOut >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        {formatCurrency(dailyTotalIn - dailyTotalOut)}
                      </p>
                   </div>
                </div>
             </div>
          </Card>

          <Card>
            <div className={`px-6 py-4 border-b flex items-center ${themeClasses.tableHeader}`}>
              <FileText className={`w-4 h-4 mr-2 ${colors.textMuted}`} />
              <h3 className={`font-semibold ${colors.textMain}`}>Transactions for {selectedDate}</h3>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-sm text-left">
                  <thead className={`font-semibold border-b ${themeClasses.tableHeader}`}>
                     <tr>
                        <th className="px-6 py-3">Type</th>
                        <th className="px-6 py-3">Entity / Name</th>
                        <th className="px-6 py-3">Description</th>
                        <th className="px-6 py-3 text-right">Amount</th>
                     </tr>
                  </thead>
                  <tbody className={`divide-y ${themeClasses.divider}`}>
                     {dailyRecords.length === 0 ? (
                        <tr>
                           <td colSpan={4} className={`px-6 py-12 text-center ${colors.textMuted}`}>
                              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                              No records found for this date.
                           </td>
                        </tr>
                     ) : (
                        dailyRecords.map((record) => (
                           <tr key={record.id} className={themeClasses.hoverBg}>
                              <td className="px-6 py-3">
                                 <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border
                                    ${record.type === 'EGG_LOG' 
                                      ? (isDark ? 'bg-amber-900/30 text-amber-500 border-amber-900/50' : 'bg-amber-50 text-amber-700 border-amber-100')
                                      : record.type === 'EGG_COLLECTION' 
                                      ? (isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-gray-100 text-gray-600 border-gray-200')
                                      : record.type === 'CREDIT_SALE' 
                                      ? (isDark ? 'bg-emerald-900/30 text-emerald-500 border-emerald-900/50' : 'bg-emerald-50 text-emerald-700 border-emerald-100')
                                      : record.type === 'PAYMENT_RECEIVED' 
                                      ? (isDark ? 'bg-blue-900/30 text-blue-500 border-blue-900/50' : 'bg-blue-50 text-blue-700 border-blue-100')
                                      : record.type === 'PAYMENT_SENT' 
                                      ? (isDark ? 'bg-purple-900/30 text-purple-500 border-purple-900/50' : 'bg-purple-50 text-purple-700 border-purple-100')
                                      : (isDark ? 'bg-red-900/30 text-red-500 border-red-900/50' : 'bg-red-50 text-red-700 border-red-100') // Expense
                                    }
                                 `}>
                                    {record.type === 'EGG_LOG' && <Egg className="w-3 h-3 mr-1"/>}
                                    {record.type === 'CREDIT_SALE' && <ArrowUpRight className="w-3 h-3 mr-1"/>}
                                    {record.type === 'PAYMENT_SENT' && <ArrowUpRight className="w-3 h-3 mr-1"/>}
                                    {(record.type === 'PAYMENT_RECEIVED' || record.type === 'EXPENSE') && <ArrowDownLeft className="w-3 h-3 mr-1"/>}
                                    {record.category}
                                 </span>
                              </td>
                              <td className={`px-6 py-3 font-medium ${colors.textMain}`}>{record.entity}</td>
                              <td className={`px-6 py-3 ${colors.textMuted}`}>{record.description}</td>
                              <td className={`px-6 py-3 text-right font-bold 
                                 ${record.flow === 'IN' ? 'text-emerald-600' : 
                                   record.flow === 'OUT' ? 'text-red-600' : 'text-gray-400'}
                              `}>
                                 {record.flow === 'OUT' ? '-' : '+'}{formatCurrency(record.amount)}
                              </td>
                           </tr>
                        ))
                     )}
                  </tbody>
               </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};
