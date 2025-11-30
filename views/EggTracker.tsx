
import React, { useState } from 'react';
import { EggLog } from '../types';
import { Card, Button, Input, PageHeader, ConfirmModal } from '../components/UI';
import { useTheme } from '../components/ThemeContext';
import { formatCurrency } from '../constants';
import { Plus, Trash2, Link as LinkIcon, Package, Calendar, List, ArrowDown, ArrowUp } from 'lucide-react';

interface EggTrackerProps {
  data: EggLog[];
  onAdd: (log: EggLog) => void;
  onDelete: (id: string) => void;
}

export const EggTracker: React.FC<EggTrackerProps> = ({ data, onAdd, onDelete }) => {
  const { themeClasses, colors, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'LOG' | 'DATE_VIEW'>('LOG');
  
  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [collected, setCollected] = useState<string>('');
  
  // Date View State
  const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0]);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const collectedCount = parseInt(collected) || 0;
    if (!collectedCount) return;

    const newLog: EggLog = {
      id: Date.now().toString(),
      date,
      collectedCount,
      soldCount: 0,
      salePrice: 0,
      totalSale: 0
    };

    onAdd(newLog);
    setCollected('');
  };

  const sortedData = [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const totalCollected = data.reduce((sum, log) => sum + log.collectedCount, 0);
  const totalSold = data.reduce((sum, log) => sum + log.soldCount, 0);
  const currentInventory = totalCollected - totalSold;

  const calculateDailyStats = (targetDate: string) => {
    let openingCollected = 0, openingSold = 0, todayCollected = 0, todaySold = 0;
    data.forEach(log => {
      if (log.date < targetDate) { openingCollected += log.collectedCount; openingSold += log.soldCount; }
      else if (log.date === targetDate) { todayCollected += log.collectedCount; todaySold += log.soldCount; }
    });
    return { openingInventory: openingCollected - openingSold, closingInventory: (openingCollected - openingSold) + (todayCollected - todaySold), todayCollected, todaySold };
  };

  const dailyStats = calculateDailyStats(viewDate);
  const dailyLogs = data.filter(l => l.date === viewDate);

  const handleConfirmDelete = () => {
    if (deleteId) { onDelete(deleteId); setDeleteId(null); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <PageHeader title="Track Eggs" description="Daily collection and inventory management" />
        <div className={`p-1 rounded-lg border flex shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
          <button 
            onClick={() => setActiveTab('LOG')}
            className={`px-4 py-2 text-sm font-medium rounded-md flex items-center transition-all ${activeTab === 'LOG' ? themeClasses.buttonPrimary : `${colors.textMuted} hover:${colors.bgPage}`}`}
          >
            <List className="w-4 h-4 mr-2" /> Daily Log
          </button>
          <button 
            onClick={() => setActiveTab('DATE_VIEW')}
            className={`px-4 py-2 text-sm font-medium rounded-md flex items-center transition-all ${activeTab === 'DATE_VIEW' ? themeClasses.buttonPrimary : `${colors.textMuted} hover:${colors.bgPage}`}`}
          >
            <Calendar className="w-4 h-4 mr-2" /> Date View
          </button>
        </div>
      </div>
      
      <ConfirmModal 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Egg Log"
        message="Are you sure you want to delete this log entry?"
      />

      {activeTab === 'LOG' && (
        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
          <div className="flex-1"></div>
          <Card className={`p-4 flex items-center shadow-sm ${isDark ? 'bg-amber-900/10 border-amber-900/50' : 'bg-amber-50 border-amber-200'}`}>
            <div className={`p-3 rounded-full mr-4 ${isDark ? 'bg-amber-900/50 text-amber-500' : 'bg-amber-100 text-amber-600'}`}>
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className={`text-sm font-medium uppercase tracking-wide ${isDark ? 'text-amber-500' : 'text-amber-800'}`}>Current Stock</p>
              <p className={`text-2xl font-bold ${colors.textMain}`}>{currentInventory.toLocaleString()} <span className={`text-sm font-normal ${colors.textMuted}`}>eggs</span></p>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'LOG' ? (
        <>
          <Card className="p-4 md:p-6">
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
              </div>
              <div className="flex-1">
                <Input label="Collected Quantity" type="number" placeholder="0" value={collected} onChange={e => setCollected(e.target.value)} />
              </div>
              <div className="md:w-auto w-full">
                <Button type="submit" variant="primary" className="w-full md:w-auto">
                  <Plus className="w-4 h-4 mr-2" /> Add Collection
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
                    <th className="px-6 py-3 text-right">Collected</th>
                    <th className="px-6 py-3 text-right">Sold</th>
                    <th className="px-6 py-3 text-right">Price/Egg</th>
                    <th className="px-6 py-3 text-right">Total Sale</th>
                    <th className="px-6 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${themeClasses.divider}`}>
                  {sortedData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className={`px-6 py-8 text-center ${colors.textMuted}`}>
                        No records found. Start adding daily logs above.
                      </td>
                    </tr>
                  ) : (
                    sortedData.map((log) => (
                      <tr key={log.id} className={themeClasses.hoverBg}>
                        <td className={`px-6 py-3 font-medium flex items-center ${colors.textMain}`}>
                          {log.date}
                          {log.ledgerId && (
                            <span title="Synced from Customer Ledger" className="ml-2 text-blue-400">
                              <LinkIcon className="w-3 h-3" />
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-right text-blue-500 font-medium">{log.collectedCount > 0 ? log.collectedCount.toLocaleString() : '-'}</td>
                        <td className={`px-6 py-3 text-right ${colors.textMain}`}>{log.soldCount > 0 ? log.soldCount.toLocaleString() : '-'}</td>
                        <td className={`px-6 py-3 text-right ${colors.textMain}`}>{log.salePrice > 0 ? formatCurrency(log.salePrice) : '-'}</td>
                        <td className="px-6 py-3 text-right font-medium text-emerald-600">{log.totalSale > 0 ? formatCurrency(log.totalSale) : '-'}</td>
                        <td className="px-6 py-3 text-center">
                          <button 
                            onClick={() => setDeleteId(log.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                            title={log.ledgerId ? "Warning: Synced entry" : "Delete"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : (
        <div className="space-y-6">
          <Card className={`p-4 ${themeClasses.subtleBg}`}>
             <div className="flex flex-col md:flex-row items-center gap-4">
               <div className="w-full md:w-1/3">
                 <Input label="Select Date" type="date" value={viewDate} onChange={e => setViewDate(e.target.value)} />
               </div>
             </div>
          </Card>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <Card className="p-4 border-l-4 border-blue-400">
                <p className={`text-xs font-semibold uppercase ${colors.textMuted}`}>Opening Inventory</p>
                <p className={`text-xl font-bold ${colors.textMain}`}>{dailyStats.openingInventory.toLocaleString()}</p>
             </Card>
             <Card className="p-4 border-l-4 border-amber-400">
                <p className={`text-xs font-semibold uppercase ${colors.textMuted}`}>Collected Today</p>
                <div className="flex items-center text-amber-600">
                   <ArrowUp className="w-4 h-4 mr-1"/>
                   <p className="text-xl font-bold">{dailyStats.todayCollected.toLocaleString()}</p>
                </div>
             </Card>
             <Card className="p-4 border-l-4 border-red-400">
                <p className={`text-xs font-semibold uppercase ${colors.textMuted}`}>Sold Today</p>
                <div className="flex items-center text-red-600">
                   <ArrowDown className="w-4 h-4 mr-1"/>
                   <p className="text-xl font-bold">{dailyStats.todaySold.toLocaleString()}</p>
                </div>
             </Card>
             <Card className={`p-4 border-l-4 border-emerald-400 ${isDark ? 'bg-emerald-900/10' : 'bg-emerald-50/50'}`}>
                <p className={`text-xs font-semibold uppercase ${colors.textMuted}`}>Closing Inventory</p>
                <p className="text-xl font-bold text-emerald-600">{dailyStats.closingInventory.toLocaleString()}</p>
             </Card>
          </div>

          <Card>
            <div className={`px-6 py-4 border-b ${themeClasses.tableHeader}`}>
              <h3 className={`font-semibold ${colors.textMain}`}>Inventory Logs for {viewDate}</h3>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-sm text-left">
                  <thead className={`font-semibold border-b ${themeClasses.tableHeader}`}>
                     <tr>
                        <th className="px-6 py-3">Type</th>
                        <th className="px-6 py-3 text-right">Qty</th>
                        <th className="px-6 py-3 text-right">Details</th>
                     </tr>
                  </thead>
                  <tbody className={`divide-y ${themeClasses.divider}`}>
                     {dailyLogs.length === 0 ? (
                        <tr><td colSpan={3} className={`px-6 py-8 text-center ${colors.textMuted}`}>No activity recorded for this date.</td></tr>
                     ) : (
                        dailyLogs.map(log => (
                           <React.Fragment key={log.id}>
                              {log.collectedCount > 0 && (
                                 <tr className={`${themeClasses.hoverBg}`}>
                                    <td className="px-6 py-3 text-amber-600 font-medium flex items-center">
                                       <Plus className="w-3 h-3 mr-2" /> Collection
                                    </td>
                                    <td className={`px-6 py-3 text-right font-bold ${colors.textMain}`}>{log.collectedCount}</td>
                                    <td className={`px-6 py-3 text-right ${colors.textMuted}`}>Daily Production</td>
                                 </tr>
                              )}
                              {log.soldCount > 0 && (
                                 <tr className={`${themeClasses.hoverBg}`}>
                                    <td className="px-6 py-3 text-red-600 font-medium flex items-center">
                                       <LinkIcon className="w-3 h-3 mr-2" /> Sale
                                    </td>
                                    <td className={`px-6 py-3 text-right font-bold ${colors.textMain}`}>{log.soldCount}</td>
                                    <td className={`px-6 py-3 text-right ${colors.textMuted}`}>
                                       {log.ledgerId ? 'Synced from Ledger' : 'Manual Entry'} 
                                       ({formatCurrency(log.salePrice)}/egg)
                                    </td>
                                 </tr>
                              )}
                           </React.Fragment>
                        ))
                     )}
                  </tbody>
               </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
