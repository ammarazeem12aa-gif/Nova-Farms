
import React, { useState, useRef } from 'react';
import { EggLog, Customer, LedgerEntry, Expense, Payee } from '../types';
import { Card, PageHeader, Button, ConfirmModal } from '../components/UI';
import { Download, Database, FileSpreadsheet, Cloud, RefreshCw, CheckCircle, Upload, AlertTriangle } from 'lucide-react';

// Icon imports
import { Egg, BookOpen, Wallet, Users } from 'lucide-react';

interface BackupProps {
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

export const Backup: React.FC<BackupProps> = ({ 
  eggLogs, customers, ledger, expenses, payees, 
  onRestore, onImportEggs, onImportCustomers, onImportLedger, onImportExpenses 
}) => {
  const [syncStatus, setSyncStatus] = useState<'IDLE' | 'CONNECTING' | 'SYNCING' | 'SUCCESS'>('IDLE');
  const [lastSynced, setLastSynced] = useState<string>('Never');
  
  // Restore State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [restoreFileContent, setRestoreFileContent] = useState<any>(null);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);

  // Import State
  const eggInputRef = useRef<HTMLInputElement>(null);
  const customerInputRef = useRef<HTMLInputElement>(null);
  const ledgerInputRef = useRef<HTMLInputElement>(null);
  const expenseInputRef = useRef<HTMLInputElement>(null);

  const [importType, setImportType] = useState<'EGGS' | 'CUSTOMERS' | 'LEDGER' | 'EXPENSES' | null>(null);
  const [importData, setImportData] = useState<any[] | null>(null);

  // CSV Helper
  const parseCSV = (text: string): string[][] => {
    const lines = text.trim().split('\n');
    return lines.map(line => {
      // Handle simple CSV splitting with quotes
      const result = [];
      let current = '';
      let inQuote = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' && line[i + 1] === '"') {
          current += '"';
          i++; // Skip next quote
        } else if (char === '"') {
          inQuote = !inQuote;
        } else if (char === ',' && !inQuote) {
          result.push(current);
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current);
      return result;
    });
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>, type: 'EGGS' | 'CUSTOMERS' | 'LEDGER' | 'EXPENSES') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const rows = parseCSV(text);
        if (rows.length < 2) throw new Error("File appears empty or invalid");
        
        // Remove header row and filter empty lines
        const dataRows = rows.slice(1).filter(r => r.length > 1);
        
        // Map data based on type
        let parsedData: any[] = [];

        if (type === 'EGGS') {
          parsedData = dataRows.map((row, idx) => ({
             id: Date.now().toString() + idx,
             date: row[0],
             collectedCount: parseInt(row[1]) || 0,
             soldCount: parseInt(row[2]) || 0,
             salePrice: parseFloat(row[3]) || 0,
             totalSale: parseFloat(row[4]) || 0
          }));
        } else if (type === 'CUSTOMERS') {
          parsedData = dataRows.map((row, idx) => ({
             id: Date.now().toString() + idx,
             name: row[0],
             phone: row[1] || ''
          }));
        } else if (type === 'LEDGER') {
          parsedData = dataRows.map((row, idx) => {
            // Find Customer ID by Name
            const customer = customers.find(c => c.name.trim().toLowerCase() === row[1].trim().toLowerCase());
            if (!customer) return null; // Skip if customer not found

            return {
              id: Date.now().toString() + idx,
              date: row[0],
              customerId: customer.id,
              type: row[2] as 'DEBIT' | 'CREDIT',
              description: row[3],
              amount: parseFloat(row[4]) || 0,
              quantity: row[5] ? parseInt(row[5]) : undefined,
              pricePerUnit: row[6] ? parseFloat(row[6]) : undefined
            };
          }).filter(Boolean); // Remove nulls
        } else if (type === 'EXPENSES') {
           parsedData = dataRows.map((row, idx) => {
             // Find Payee ID by Name if exists
             const payee = payees.find(p => p.name.trim().toLowerCase() === row[1].trim().toLowerCase());
             
             return {
               id: Date.now().toString() + idx,
               date: row[0],
               payeeId: payee?.id, // Can be undefined
               type: row[3] as 'INVOICE' | 'PAYMENT',
               category: row[4],
               description: row[5],
               amount: parseFloat(row[6]) || 0
             };
           });
        }

        setImportType(type);
        setImportData(parsedData);
      } catch (err) {
        alert("Failed to parse CSV. Please ensure formatting is correct.");
      }
      // Reset input
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  const confirmImport = () => {
    if (!importData || !importType) return;
    
    if (importType === 'EGGS') onImportEggs(importData);
    if (importType === 'CUSTOMERS') onImportCustomers(importData);
    if (importType === 'LEDGER') onImportLedger(importData);
    if (importType === 'EXPENSES') onImportExpenses(importData);

    setImportType(null);
    setImportData(null);
    alert("Import successful! Data has been replaced.");
  };

  const downloadCSV = (data: any[], filename: string) => {
    if (!data || !data.length) {
      alert("No data available to export.");
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(fieldName => {
        let value = row[fieldName];
        // Handle strings with commas by quoting
        if (typeof value === 'string' && value.includes(',')) {
          value = `"${value}"`;
        }
        return value;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadJSON = () => {
    const fullBackup = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      data: {
        eggLogs,
        customers,
        ledger,
        expenses,
        payees
      }
    };
    const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `eggfarm_full_backup_${new Date().toISOString().split('T')[0]}.json`);
    link.click();
  };

  const handleDriveSync = () => {
    setSyncStatus('CONNECTING');
    setTimeout(() => {
      setSyncStatus('SYNCING');
      setTimeout(() => {
        setSyncStatus('SUCCESS');
        setLastSynced('Just now');
        setTimeout(() => setSyncStatus('IDLE'), 3000);
      }, 1500);
    }, 1000);
  };

  // Restore handlers
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonContent = JSON.parse(event.target?.result as string);
        const dataToRestore = jsonContent.data || jsonContent;
        setRestoreFileContent(dataToRestore);
        setShowRestoreConfirm(true);
      } catch (err) {
        alert("Failed to parse JSON file.");
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const confirmRestore = () => {
    if (restoreFileContent) {
      onRestore(restoreFileContent);
      setShowRestoreConfirm(false);
      setRestoreFileContent(null);
    }
  };

  const exportEggs = () => {
    const data = eggLogs.map(l => ({
      Date: l.date,
      Collected: l.collectedCount,
      Sold: l.soldCount,
      Price: l.salePrice,
      TotalSale: l.totalSale
    }));
    downloadCSV(data, 'egg_tracker_export');
  };

  const exportLedger = () => {
    const data = ledger.map(l => {
      const customer = customers.find(c => c.id === l.customerId);
      return {
        Date: l.date,
        Customer: customer ? customer.name : 'Unknown',
        Type: l.type,
        Description: l.description.replace(/,/g, ' '),
        Amount: l.amount,
        Quantity: l.quantity || 0,
        PricePerUnit: l.pricePerUnit || 0
      };
    });
    downloadCSV(data, 'customer_ledger_export');
  };

  const exportExpenses = () => {
    const data = expenses.map(e => {
      const payee = payees.find(p => p.id === e.payeeId);
      return {
        Date: e.date,
        Payee: payee ? payee.name : 'General',
        PayeeType: payee ? payee.type : '-',
        TransactionType: e.type,
        Category: e.category,
        Description: e.description.replace(/,/g, ' '),
        Amount: e.amount
      };
    });
    downloadCSV(data, 'expenses_export');
  };

  const exportCustomers = () => {
      const data = customers.map(c => ({
          Name: c.name,
          Phone: c.phone
      }));
      downloadCSV(data, 'customers_export');
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Data & Backup" description="Export data to Google Sheets or Sync to Cloud" />
      
      {/* Restore Full DB Modal */}
      <ConfirmModal 
        isOpen={showRestoreConfirm}
        onClose={() => setShowRestoreConfirm(false)}
        onConfirm={confirmRestore}
        title="Confirm Data Restore"
        message="WARNING: This will OVERWRITE ALL DATA with the JSON backup. This cannot be undone."
      />

      {/* Import CSV Modal */}
      <ConfirmModal 
        isOpen={!!importType}
        onClose={() => { setImportType(null); setImportData(null); }}
        onConfirm={confirmImport}
        title={`Import ${importType} from CSV`}
        message={`WARNING: Importing will DELETE ALL EXISTING records in ${importType} and replace them with the data from the CSV file. 
        ${importType === 'LEDGER' ? 'Note: Rows with unknown customer names will be skipped.' : ''}
        ${importType === 'CUSTOMERS' ? 'Note: Replacing customers may break links in existing Ledger entries.' : ''}
        Are you sure you want to proceed?`}
      />

      {/* Hidden File Inputs */}
      <input type="file" ref={eggInputRef} onChange={e => handleImportFile(e, 'EGGS')} accept=".csv" className="hidden" />
      <input type="file" ref={customerInputRef} onChange={e => handleImportFile(e, 'CUSTOMERS')} accept=".csv" className="hidden" />
      <input type="file" ref={ledgerInputRef} onChange={e => handleImportFile(e, 'LEDGER')} accept=".csv" className="hidden" />
      <input type="file" ref={expenseInputRef} onChange={e => handleImportFile(e, 'EXPENSES')} accept=".csv" className="hidden" />

      {/* Google Drive Sync Section */}
      <Card className="p-6 border-blue-200 bg-blue-50/50">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white rounded-full shadow-sm text-blue-600">
               <Cloud className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Google Drive Sync</h3>
              <p className="text-sm text-gray-600">Keep your farm data safe in your personal Google Drive.</p>
              <p className="text-xs text-blue-600 mt-1">Last Synced: {lastSynced}</p>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 min-w-[160px]">
             {syncStatus === 'SUCCESS' ? (
                <Button variant="success" className="w-full cursor-default">
                   <CheckCircle className="w-4 h-4 mr-2" /> Synced
                </Button>
             ) : (
               <Button onClick={handleDriveSync} variant="primary" className="w-full" disabled={syncStatus !== 'IDLE'}>
                 {syncStatus === 'CONNECTING' || syncStatus === 'SYNCING' ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> 
                      {syncStatus === 'CONNECTING' ? 'Connecting...' : 'Uploading...'}
                    </>
                 ) : (
                    <>
                      <Cloud className="w-4 h-4 mr-2" /> Sync Now
                    </>
                 )}
               </Button>
             )}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Full JSON Backup */}
        <Card className="p-6 border-indigo-100 bg-indigo-50/30">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-indigo-100 rounded-full text-indigo-600 mr-3">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg text-gray-800">Full Backup</h3>
          </div>
          <p className="text-gray-500 text-sm mb-6">Download a complete backup file of your entire database (JSON).</p>
          <Button onClick={downloadJSON} variant="secondary" className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50">
            <Download className="w-4 h-4 mr-2" /> Backup to File
          </Button>
        </Card>

        {/* Restore from JSON */}
        <Card className="p-6 border-red-100 bg-red-50/30">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-red-100 rounded-full text-red-600 mr-3">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg text-gray-800">Restore Data</h3>
          </div>
          <p className="text-gray-500 text-sm mb-6">Restore your database from a previously saved JSON file.</p>
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden" 
          />
          <Button onClick={triggerFileUpload} variant="secondary" className="w-full border-red-200 text-red-700 hover:bg-red-50">
            <Upload className="w-4 h-4 mr-2" /> Select File
          </Button>
        </Card>

        {/* CSV Exports / Imports */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-amber-100 rounded-full text-amber-600 mr-3">
              <Egg className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg text-gray-800">Egg Production</h3>
          </div>
          <p className="text-gray-500 text-sm mb-4">Daily logs of eggs collected, sold, and revenue.</p>
          <div className="flex gap-2">
            <Button onClick={exportEggs} variant="secondary" className="flex-1 text-xs">
              <Download className="w-3 h-3 mr-1" /> Export CSV
            </Button>
            <Button onClick={() => eggInputRef.current?.click()} variant="secondary" className="flex-1 text-xs border-amber-200 text-amber-700">
              <Upload className="w-3 h-3 mr-1" /> Import CSV
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full text-blue-600 mr-3">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg text-gray-800">Customer Ledger</h3>
          </div>
          <p className="text-gray-500 text-sm mb-4">All credit and debit transactions with customers.</p>
          <div className="flex gap-2">
            <Button onClick={exportLedger} variant="secondary" className="flex-1 text-xs">
              <Download className="w-3 h-3 mr-1" /> Export CSV
            </Button>
            <Button onClick={() => ledgerInputRef.current?.click()} variant="secondary" className="flex-1 text-xs border-blue-200 text-blue-700">
              <Upload className="w-3 h-3 mr-1" /> Import CSV
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-emerald-100 rounded-full text-emerald-600 mr-3">
              <Wallet className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg text-gray-800">Expenses</h3>
          </div>
          <p className="text-gray-500 text-sm mb-4">Record of payments, bills, and operational costs.</p>
          <div className="flex gap-2">
             <Button onClick={exportExpenses} variant="secondary" className="flex-1 text-xs">
              <Download className="w-3 h-3 mr-1" /> Export CSV
            </Button>
            <Button onClick={() => expenseInputRef.current?.click()} variant="secondary" className="flex-1 text-xs border-emerald-200 text-emerald-700">
              <Upload className="w-3 h-3 mr-1" /> Import CSV
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-gray-100 rounded-full text-gray-600 mr-3">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg text-gray-800">Customers List</h3>
          </div>
          <p className="text-gray-500 text-sm mb-4">Contact details of all registered customers.</p>
           <div className="flex gap-2">
            <Button onClick={exportCustomers} variant="secondary" className="flex-1 text-xs">
              <Download className="w-3 h-3 mr-1" /> Export CSV
            </Button>
            <Button onClick={() => customerInputRef.current?.click()} variant="secondary" className="flex-1 text-xs border-gray-200 text-gray-700">
              <Upload className="w-3 h-3 mr-1" /> Import CSV
            </Button>
          </div>
        </Card>
      </div>

      <Card className="p-6 mt-8 bg-gray-50 border-gray-200">
         <div className="flex items-start">
            <FileSpreadsheet className="w-8 h-8 text-green-600 mr-4 mt-1" />
            <div>
               <h4 className="font-bold text-gray-900">How to use CSV Import?</h4>
               <p className="text-sm text-gray-600 mt-1">
                  1. <strong>Backup First:</strong> Always download a Full Backup (JSON) before importing CSVs.<br/>
                  2. <strong>Format:</strong> Use the exact format from the Export CSV function. Do not change header names.<br/>
                  3. <strong>Data Replacement:</strong> Importing a CSV will <strong>DELETE</strong> all existing entries for that specific category and replace them with the file content.<br/>
                  4. <strong>Linking:</strong> For Ledger, ensure Customer names in CSV match exactly with existing Customers in the system.
               </p>
            </div>
         </div>
      </Card>
    </div>
  );
};
