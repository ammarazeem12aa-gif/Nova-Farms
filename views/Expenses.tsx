
import React, { useState } from 'react';
import { Expense, Payee } from '../types';
import { EXPENSE_CATEGORIES, formatCurrency } from '../constants';
import { Card, Button, Input, Select, PageHeader, ConfirmModal } from '../components/UI';
import { useTheme } from '../components/ThemeContext';
import { Plus, Trash2, Users, Receipt, Briefcase, User, Tag } from 'lucide-react';

interface ExpensesProps {
  data: Expense[];
  payees: Payee[];
  onAddExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onAddPayee: (payee: Payee) => void;
  onDeletePayee: (id: string) => void;
}

export const Expenses: React.FC<ExpensesProps> = ({ 
  data, payees, onAddExpense, onDeleteExpense, onAddPayee, onDeletePayee 
}) => {
  const { themeClasses, colors, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'LOG' | 'ACCOUNTS'>('LOG');
  
  // Expense Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedPayeeId, setSelectedPayeeId] = useState('');
  const [transactionType, setTransactionType] = useState<'INVOICE' | 'PAYMENT'>('INVOICE');

  // Payee Form State
  const [payeeName, setPayeeName] = useState('');
  const [payeeType, setPayeeType] = useState('VENDOR');
  const [customPayeeType, setCustomPayeeType] = useState('');
  const [payeePhone, setPayeePhone] = useState('');

  // Delete Modal State
  const [deleteItem, setDeleteItem] = useState<{ id: string; type: 'EXPENSE' | 'PAYEE' } | null>(null);

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    onAddExpense({
      id: Date.now().toString(),
      date,
      category: transactionType === 'PAYMENT' ? 'Payment' : category,
      description,
      amount: parseFloat(amount),
      payeeId: selectedPayeeId || undefined,
      type: transactionType
    });
    setAmount('');
    setDescription('');
  };

  const handlePayeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payeeName) return;
    const finalType = (payeeType === 'OTHER' ? customPayeeType : payeeType).toUpperCase();
    if (!finalType) return;
    onAddPayee({ id: Date.now().toString(), name: payeeName, type: finalType, phone: payeePhone });
    setPayeeName(''); setPayeePhone(''); setPayeeType('VENDOR'); setCustomPayeeType('');
  };

  const handleConfirmDelete = () => {
    if (!deleteItem) return;
    deleteItem.type === 'EXPENSE' ? onDeleteExpense(deleteItem.id) : onDeletePayee(deleteItem.id);
    setDeleteItem(null);
  };

  const sortedData = [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const categoryOptions = EXPENSE_CATEGORIES.map(c => ({ value: c, label: c }));
  const payeeOptions = payees.map(p => ({ value: p.id, label: `${p.name} (${p.type})` }));
  const existingTypes = Array.from(new Set(payees.map(p => p.type)));
  const allTypeOptions = Array.from(new Set(['VENDOR', 'EMPLOYEE', ...existingTypes]));

  return (
    <div className="space-y-6">
      <ConfirmModal 
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleConfirmDelete}
        title={deleteItem?.type === 'EXPENSE' ? "Delete Expense" : "Delete Account"}
        message={deleteItem?.type === 'EXPENSE' 
          ? "Are you sure you want to delete this expense record?" 
          : "Are you sure you want to delete this account? Note: This will not delete associated expense history."}
      />

      <div className="flex justify-between items-start">
        <PageHeader title="Expenses & Accounts" description="Track costs, salaries, and vendor balances" />
        <div className={`p-1 rounded-lg border flex shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
          <button 
            onClick={() => setActiveTab('LOG')}
            className={`px-4 py-2 text-sm font-medium rounded-md flex items-center transition-all ${activeTab === 'LOG' ? themeClasses.buttonPrimary : `${colors.textMuted} hover:${colors.bgPage}`}`}
          >
            <Receipt className="w-4 h-4 mr-2" /> Daily Expenses
          </button>
          <button 
            onClick={() => setActiveTab('ACCOUNTS')}
            className={`px-4 py-2 text-sm font-medium rounded-md flex items-center transition-all ${activeTab === 'ACCOUNTS' ? themeClasses.buttonPrimary : `${colors.textMuted} hover:${colors.bgPage}`}`}
          >
            <Users className="w-4 h-4 mr-2" /> Manage Accounts
          </button>
        </div>
      </div>

      {activeTab === 'LOG' ? (
        <>
          <Card className="p-4 md:p-6">
            <form onSubmit={handleExpenseSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
                <Select label="Account (Optional)" value={selectedPayeeId} onChange={e => setSelectedPayeeId(e.target.value)} options={payeeOptions} />
                
                {selectedPayeeId ? (
                   <div className="flex flex-col space-y-1">
                      <label className={`text-sm font-medium ${colors.textMain}`}>Transaction Type</label>
                      <div className={`flex rounded-lg p-1 ${isDark ? 'bg-slate-950' : 'bg-gray-100'}`}>
                         <button type="button" onClick={() => setTransactionType('INVOICE')}
                           className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${transactionType === 'INVOICE' 
                             ? (isDark ? 'bg-slate-700 text-white shadow' : 'bg-white shadow text-gray-900') 
                             : (isDark ? 'text-slate-500 hover:text-slate-300' : 'text-gray-500 hover:text-gray-700')}`}
                         >
                           Bill / Due
                         </button>
                         <button type="button" onClick={() => setTransactionType('PAYMENT')}
                           className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${transactionType === 'PAYMENT' 
                             ? (isDark ? 'bg-emerald-900/50 text-emerald-400 shadow' : 'bg-white shadow text-emerald-700') 
                             : (isDark ? 'text-slate-500 hover:text-slate-300' : 'text-gray-500 hover:text-gray-700')}`}
                         >
                           Payment
                         </button>
                      </div>
                   </div>
                ) : (
                  <div className="flex flex-col space-y-1 opacity-50">
                    <label className={`text-sm font-medium ${colors.textMain}`}>Transaction Type</label>
                    <div className={`py-2 px-3 border rounded-lg text-sm ${isDark ? 'bg-slate-900 border-slate-700 text-slate-500' : 'bg-gray-100 border-gray-200 text-gray-500'}`}>
                      Cash Expense
                    </div>
                  </div>
                )}
                
                {transactionType === 'INVOICE' && (
                  <Select label="Category" value={category} onChange={e => setCategory(e.target.value)} options={categoryOptions} required />
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-3">
                  <Input label="Description" value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. 5 Bags Layer Feed" />
                </div>
                <div className="md:col-span-1">
                   <Input label="Amount (PKR)" type="number" value={amount} onChange={e => setAmount(e.target.value)} required />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                 <Button type="submit" variant="primary">
                  <Plus className="w-4 h-4 mr-2" /> 
                  {transactionType === 'PAYMENT' ? 'Record Payment' : 'Record Expense'}
                </Button>
              </div>
            </form>
          </Card>

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className={`font-semibold border-b ${themeClasses.tableHeader}`}>
                  <tr>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Account / Payee</th>
                    <th className="px-6 py-3">Details</th>
                    <th className="px-6 py-3 text-right">Amount</th>
                    <th className="px-6 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${themeClasses.divider}`}>
                  {sortedData.length === 0 ? (
                    <tr><td colSpan={5} className={`px-6 py-8 text-center ${colors.textMuted}`}>No expenses recorded.</td></tr>
                  ) : (
                    sortedData.map((expense) => {
                      const payee = payees.find(p => p.id === expense.payeeId);
                      const isPayment = expense.type === 'PAYMENT';
                      return (
                        <tr key={expense.id} className={themeClasses.hoverBg}>
                          <td className={`px-6 py-3 ${colors.textMain}`}>{expense.date}</td>
                          <td className="px-6 py-3">
                            {payee ? (
                               <div className="flex items-center">
                                  {payee.type === 'VENDOR' ? <Briefcase className="w-3 h-3 mr-1.5 text-blue-500" /> : 
                                   payee.type === 'EMPLOYEE' ? <User className="w-3 h-3 mr-1.5 text-purple-500" /> :
                                   <Tag className="w-3 h-3 mr-1.5 text-gray-500" />}
                                  <div className="flex flex-col">
                                    <span className={`font-medium ${colors.textMain}`}>{payee.name}</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full w-fit ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-500'}`}>{payee.type}</span>
                                  </div>
                               </div>
                            ) : (
                              <span className="text-gray-400 italic">General / Cash</span>
                            )}
                          </td>
                          <td className="px-6 py-3">
                            <div className="flex flex-col">
                              <span className={`font-medium ${colors.textMain}`}>{expense.category}</span>
                              <span className={`text-xs ${colors.textMuted}`}>{expense.description}</span>
                            </div>
                          </td>
                          <td className={`px-6 py-3 text-right font-medium ${isPayment ? 'text-emerald-600' : 'text-red-600'}`}>
                            {isPayment ? '-' : ''}{formatCurrency(expense.amount)}
                          </td>
                          <td className="px-6 py-3 text-center">
                            <button 
                              onClick={() => setDeleteItem({ id: expense.id, type: 'EXPENSE' })}
                              className="text-gray-400 hover:text-red-500 transition-colors p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
             <Card className="p-6 sticky top-6">
              <h3 className={`text-lg font-semibold mb-4 ${colors.textMain}`}>Add New Account</h3>
              <form onSubmit={handlePayeeSubmit} className="space-y-4">
                <Input label="Name" value={payeeName} onChange={e => setPayeeName(e.target.value)} placeholder="e.g. Ali Traders" required />
                <div className="flex flex-col space-y-1">
                  <label className={`text-sm font-medium ${colors.textMain}`}>Account Type</label>
                  <select 
                    value={payeeType} 
                    onChange={e => setPayeeType(e.target.value)}
                    className={`px-3 py-2 border rounded-lg outline-none ${themeClasses.input}`}
                  >
                    {allTypeOptions.map(t => <option key={t} value={t} className={isDark ? "bg-slate-900" : ""}>{t}</option>)}
                    <option value="OTHER" className={isDark ? "bg-slate-900" : ""}>+ Custom Type...</option>
                  </select>
                </div>
                {payeeType === 'OTHER' && (
                  <Input label="Custom Type Name" value={customPayeeType} onChange={e => setCustomPayeeType(e.target.value)} placeholder="e.g. CONTRACTOR" required />
                )}
                <Input label="Phone" value={payeePhone} onChange={e => setPayeePhone(e.target.value)} />
                <Button type="submit" variant="primary" className="w-full">
                  <Plus className="w-4 h-4 mr-2" /> Add Account
                </Button>
              </form>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card>
              <div className={`px-6 py-4 border-b ${themeClasses.tableHeader}`}>
                <h3 className={`font-semibold ${colors.textMain}`}>Accounts List</h3>
              </div>
              <table className="w-full text-sm text-left">
                <thead className={`font-semibold border-b ${themeClasses.tableHeader}`}>
                  <tr>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${themeClasses.divider}`}>
                   {payees.length === 0 ? (
                    <tr><td colSpan={3} className={`px-6 py-8 text-center ${colors.textMuted}`}>No accounts added yet.</td></tr>
                   ) : (
                     payees.map(p => (
                       <tr key={p.id} className={themeClasses.hoverBg}>
                         <td className={`px-6 py-3 font-medium ${colors.textMain}`}>{p.name}</td>
                         <td className="px-6 py-3">
                           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                             ${p.type === 'VENDOR' 
                               ? (isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800') 
                               : p.type === 'EMPLOYEE' 
                               ? (isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-800') 
                               : (isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-800')}`}>
                             {p.type}
                           </span>
                         </td>
                         <td className="px-6 py-3 text-right">
                            <button 
                              onClick={() => setDeleteItem({ id: p.id, type: 'PAYEE' })}
                              className="text-gray-400 hover:text-red-500 transition-colors p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                         </td>
                       </tr>
                     ))
                   )}
                </tbody>
              </table>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
