
import React, { useState } from 'react';
import { useTheme } from '../components/ThemeContext';
import { Backup } from './Backup'; 
import { EggLog, Customer, LedgerEntry, Expense, Payee, Theme } from '../types';
import { Card, PageHeader, Input, Button } from '../components/UI';
import { Settings as SettingsIcon, Database, Save, Moon, Sun, PartyPopper } from 'lucide-react';

interface SettingsProps {
  eggLogs: EggLog[];
  customers: Customer[];
  ledger: LedgerEntry[];
  expenses: Expense[];
  payees: Payee[];
  onRestore: (data: any) => void;
  onImportEggs: (data: EggLog[]) => void;
  onImportCustomers: (data: Customer[]) => void;
  onImportLedger: (data: LedgerEntry[]) => void;
  onImportExpenses: (data: Expense[]) => void;
}

export const Settings: React.FC<SettingsProps> = (props) => {
  const { settings, updateSettings, themeClasses, colors, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'DATA'>('GENERAL');
  const [farmName, setFarmName] = useState(settings.farmName);
  const [phone, setPhone] = useState(settings.phone);
  const [location, setLocation] = useState(settings.location);

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({ farmName, phone, location });
    alert("Settings saved successfully!");
  };

  const handleThemeChange = (newTheme: Theme) => { updateSettings({ theme: newTheme }); };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <PageHeader title="Settings" description="Configure farm details and manage data" />
        <div className={`p-1 rounded-lg border flex ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
          <button 
            onClick={() => setActiveTab('GENERAL')}
            className={`px-4 py-2 text-sm font-medium rounded-md flex items-center transition-all ${activeTab === 'GENERAL' ? themeClasses.buttonPrimary : `${colors.textMuted} hover:${colors.bgPage}`}`}
          >
            <SettingsIcon className="w-4 h-4 mr-2" /> General
          </button>
          <button 
            onClick={() => setActiveTab('DATA')}
            className={`px-4 py-2 text-sm font-medium rounded-md flex items-center transition-all ${activeTab === 'DATA' ? themeClasses.buttonPrimary : `${colors.textMuted} hover:${colors.bgPage}`}`}
          >
            <Database className="w-4 h-4 mr-2" /> Data & Backup
          </button>
        </div>
      </div>

      {activeTab === 'GENERAL' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className={`text-lg font-semibold mb-4 ${colors.textMain}`}>Farm Details</h3>
            <form onSubmit={handleSaveGeneral} className="space-y-4">
              <Input label="Farm Name" value={farmName} onChange={e => setFarmName(e.target.value)} />
              <Input label="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} />
              <Input label="Location" value={location} onChange={e => setLocation(e.target.value)} />
              <Button type="submit" variant="primary" className="w-full">
                <Save className="w-4 h-4 mr-2" /> Save Details
              </Button>
            </form>
          </Card>

          <Card className="p-6">
            <h3 className={`text-lg font-semibold mb-4 ${colors.textMain}`}>Appearance</h3>
            <p className={`text-sm mb-4 ${colors.textMuted}`}>Customize the look and feel of Nova Farms.</p>
            
            <div className="grid grid-cols-1 gap-3">
              <button onClick={() => handleThemeChange('LIGHT')} className={`flex items-center p-4 rounded-xl border-2 transition-all ${settings.theme === 'LIGHT' ? 'border-amber-500 bg-amber-50' : `${colors.border} ${isDark ? 'hover:bg-slate-800' : 'hover:bg-gray-50'}`}`}>
                <div className="p-2 rounded-full bg-amber-100 text-amber-600 mr-4"><Sun className="w-6 h-6" /></div>
                <div className="text-left">
                  <p className="font-bold text-gray-900">Light Mode</p>
                  <p className="text-xs text-gray-500">Classic clean look</p>
                </div>
              </button>
              <button onClick={() => handleThemeChange('DARK')} className={`flex items-center p-4 rounded-xl border-2 transition-all ${settings.theme === 'DARK' ? 'border-blue-500 bg-slate-800' : `${colors.border} hover:bg-gray-50`}`}>
                <div className="p-2 rounded-full bg-slate-700 text-blue-400 mr-4"><Moon className="w-6 h-6" /></div>
                <div className="text-left">
                  <p className={`font-bold ${settings.theme === 'DARK' ? 'text-white' : 'text-gray-900'}`}>Dark Mode</p>
                  <p className="text-xs text-gray-500">Easy on the eyes</p>
                </div>
              </button>
              <button onClick={() => handleThemeChange('FUN')} className={`flex items-center p-4 rounded-xl border-2 transition-all ${settings.theme === 'FUN' ? 'border-fuchsia-500 bg-fuchsia-50' : `${colors.border} hover:bg-gray-50`}`}>
                <div className="p-2 rounded-full bg-fuchsia-100 text-fuchsia-600 mr-4"><PartyPopper className="w-6 h-6" /></div>
                <div className="text-left">
                  <p className="font-bold text-gray-900">Fun Mode</p>
                  <p className="text-xs text-gray-500">Vibrant pinks and purples</p>
                </div>
              </button>
            </div>
          </Card>
        </div>
      ) : (
        <Backup {...props} />
      )}
    </div>
  );
};
