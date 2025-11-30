
import React, { useState } from 'react';
import { Customer } from '../types';
import { Card, Button, Input, PageHeader, ConfirmModal } from '../components/UI';
import { useTheme } from '../components/ThemeContext';
import { Plus, UserX } from 'lucide-react';

interface CustomersProps {
  data: Customer[];
  onAdd: (customer: Customer) => void;
  onDelete: (id: string) => void;
}

export const Customers: React.FC<CustomersProps> = ({ data, onAdd, onDelete }) => {
  const { themeClasses, colors, isDark } = useTheme();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({ id: Date.now().toString(), name, phone });
    setName(''); setPhone('');
  };

  const handleConfirmDelete = () => { if (deleteId) { onDelete(deleteId); setDeleteId(null); } };

  return (
    <div className="space-y-6">
      <PageHeader title="Customers" description="Manage your customer base" />
      <ConfirmModal 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Customer"
        message="Are you sure you want to delete this customer? This will NOT delete their ledger history, but the customer name will be removed."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card className="p-6 sticky top-6">
            <h3 className={`text-lg font-semibold mb-4 ${colors.textMain}`}>Add New Customer</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Full Name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. John Doe" required />
              <Input label="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. 0300-1234567" />
              <Button type="submit" variant="primary" className="w-full">
                <Plus className="w-4 h-4 mr-2" /> Add Customer
              </Button>
            </form>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className={`font-semibold border-b ${themeClasses.tableHeader}`}>
                  <tr>
                    <th className="px-6 py-3">Customer Name</th>
                    <th className="px-6 py-3">Phone</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${themeClasses.divider}`}>
                  {data.length === 0 ? (
                    <tr><td colSpan={3} className={`px-6 py-8 text-center ${colors.textMuted}`}>No customers yet.</td></tr>
                  ) : (
                    data.map((customer) => (
                      <tr key={customer.id} className={themeClasses.hoverBg}>
                        <td className={`px-6 py-3 font-medium ${colors.textMain}`}>{customer.name}</td>
                        <td className={`px-6 py-3 ${colors.textMuted}`}>{customer.phone || '-'}</td>
                        <td className="px-6 py-3 text-right">
                          <button onClick={() => setDeleteId(customer.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1" title="Delete Customer">
                            <UserX className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
