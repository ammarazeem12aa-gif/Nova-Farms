
import React, { useState, useMemo } from 'react';
import { Customer, LedgerEntry } from '../types';
import { Card, Button, Input, Select, PageHeader, ConfirmModal } from '../components/UI';
import { useTheme } from '../components/ThemeContext';
import { formatCurrency } from '../constants';
import { Save, Trash2, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface LedgerProps {
  customers: Customer[];
  ledger: LedgerEntry[];
  onAdd: (entry: LedgerEntry) => void;
  onDelete: (id: string) => void;
}

export const CustomerLedger: React.FC<LedgerProps> = ({ customers, ledger, onAdd, onDelete }) => {
  const { themeClasses, colors, isDark } = useTheme();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  
  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<'DEBIT' | 'CREDIT'>('DEBIT');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [qty, setQty] = useState('');
  const [price, setPrice] = useState('');

  // Delete Modal State
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const customerOptions = customers.map(c => ({ value: c.id, label: c.name }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !amount) return;
    let finalDesc = description;
    if (type === 'DEBIT' && qty && price && !description) { finalDesc = `${qty} Eggs @ ${price}`; }
    onAdd({
      id: Date.now().toString(),
      customerId: selectedCustomerId,
      date,
      type,
      amount: parseFloat(amount),
      description: finalDesc,
      quantity: qty ? parseInt(qty) : undefined,
      pricePerUnit: price ? parseFloat(price) : undefined,
    });
    setAmount(''); setDescription(''); setQty(''); setPrice('');
  };

  React.useEffect(() => {
    if (qty && price) { setAmount((parseFloat(qty) * parseFloat(price)).toString()); }
  }, [qty, price]);

  const customerLedger = useMemo(() => {
    if (!selectedCustomerId) return [];
    return ledger.filter(l => l.customerId === selectedCustomerId).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [ledger, selectedCustomerId]);

  let runningBalance = 0;
  const ledgerWithBalance = customerLedger.map(entry => {
    if (entry.type === 'DEBIT') runningBalance += entry.amount; else runningBalance -= entry.amount;
    return { ...entry, balance: runningBalance };
  });
  const displayLedger = [...ledgerWithBalance].reverse();

  const handleConfirmDelete = () => { if (deleteId) { onDelete(deleteId); setDeleteId(null); } };

  return (
    <div className="space-y-6">
      <PageHeader title="Customer Ledger" description="Track sales, payments, and balances for individual customers" />
      <ConfirmModal 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Ledger Entry"
        message="Are you sure you want to delete this transaction? This action cannot be undone."
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-4">
             <Select label="Select Customer" value={selectedCustomerId} onChange={e => setSelectedCustomerId(e.target.value)} options={customerOptions} />
          </Card>

          {selectedCustomerId && (
            <Card className={`p-6 ${isDark ? 'bg-amber-900/10 border-amber-900/50' : 'bg-amber-50 border-amber-200'}`}>
               <h3 className={`text-sm font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-amber-500' : 'text-amber-800'}`}>Current Balance</h3>
               <p className={`text-3xl font-bold ${runningBalance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                 {formatCurrency(runningBalance)}
               </p>
               <p className={`text-xs mt-1 ${isDark ? 'text-amber-500/80' : 'text-amber-700'}`}>
                 {runningBalance > 0 ? 'Customer owes you' : 'You owe customer / Advance'}
               </p>
            </Card>
          )}

          {selectedCustomerId && (
            <Card className="p-4">
              <h3 className={`font-semibold mb-4 border-b pb-2 ${colors.textMain} ${colors.border}`}>New Transaction</h3>
              <form onSubmit={handleSubmit} className="space-y-3">
                <Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
                
                <div className="flex space-x-2">
                  <button type="button" onClick={() => setType('DEBIT')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${type === 'DEBIT' 
                      ? (isDark ? 'bg-red-900/20 border-red-800 text-red-500' : 'bg-red-50 border-red-200 text-red-700') 
                      : (isDark ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-gray-200 text-gray-600')}`}
                  >
                    Sale (Debit)
                  </button>
                  <button type="button" onClick={() => setType('CREDIT')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${type === 'CREDIT' 
                      ? (isDark ? 'bg-emerald-900/20 border-emerald-800 text-emerald-500' : 'bg-emerald-50 border-emerald-200 text-emerald-700') 
                      : (isDark ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-gray-200 text-gray-600')}`}
                  >
                    Payment (Credit)
                  </button>
                </div>

                {type === 'DEBIT' && (
                  <div className={`grid grid-cols-2 gap-2 p-2 rounded ${isDark ? 'bg-slate-950' : 'bg-gray-50'}`}>
                    <Input label="Qty (Eggs)" type="number" value={qty} onChange={e => setQty(e.target.value)} />
                    <Input label="Price" type="number" value={price} onChange={e => setPrice(e.target.value)} />
                  </div>
                )}

                <Input label="Total Amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} required />
                <Input label="Description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional note..." />

                <Button type="submit" variant="primary" className="w-full mt-2">
                  <Save className="w-4 h-4 mr-2" /> Save Entry
                </Button>
              </form>
            </Card>
          )}
        </div>

        <div className="lg:col-span-3">
          <Card className="h-full">
            {!selectedCustomerId ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <ArrowDownLeft className="w-12 h-12 mb-2 opacity-20" />
                <p>Select a customer to view their ledger</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className={`font-semibold border-b ${themeClasses.tableHeader}`}>
                    <tr>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Description</th>
                      <th className="px-6 py-3 text-right">Debit (Sale)</th>
                      <th className="px-6 py-3 text-right">Credit (Rcvd)</th>
                      <th className="px-6 py-3 text-right">Balance</th>
                      <th className="px-6 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${themeClasses.divider}`}>
                    {displayLedger.length === 0 ? (
                      <tr><td colSpan={6} className={`px-6 py-8 text-center ${colors.textMuted}`}>No transactions recorded.</td></tr>
                    ) : (
                      displayLedger.map((entry) => (
                        <tr key={entry.id} className={`group ${themeClasses.hoverBg}`}>
                          <td className={`px-6 py-3 ${colors.textMain}`}>{entry.date}</td>
                          <td className={`px-6 py-3 ${colors.textMuted}`}>
                            <span className="flex items-center">
                              {entry.type === 'DEBIT' ? <ArrowUpRight className="w-3 h-3 text-red-400 mr-1" /> : <ArrowDownLeft className="w-3 h-3 text-emerald-400 mr-1" />}
                              {entry.description || (entry.type === 'DEBIT' ? 'Sale' : 'Payment')}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-right text-red-600">{entry.type === 'DEBIT' ? formatCurrency(entry.amount) : '-'}</td>
                          <td className="px-6 py-3 text-right text-emerald-600">{entry.type === 'CREDIT' ? formatCurrency(entry.amount) : '-'}</td>
                          <td className={`px-6 py-3 text-right font-bold ${colors.textMain}`}>{formatCurrency(entry.balance)}</td>
                          <td className="px-6 py-3 text-center">
                             <button onClick={() => setDeleteId(entry.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
