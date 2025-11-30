
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { ThemeProvider } from './components/ThemeContext';
import { ViewState, EggLog, Customer, LedgerEntry, Expense, Payee } from './types';
import { storage } from './services/storage';

// Views
import { EggTracker } from './views/EggTracker';
import { Customers } from './views/Customers';
import { CustomerLedger } from './views/CustomerLedger';
import { Expenses } from './views/Expenses';
import { BalanceSheet } from './views/BalanceSheet';
import { Overview } from './views/Overview';
import { Outstanding } from './views/Outstanding';
import { Settings } from './views/Settings';

const AppContent = () => {
  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');
  
  // Application Data State
  const [eggLogs, setEggLogs] = useState<EggLog[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [payees, setPayees] = useState<Payee[]>([]);

  // Initial Load
  useEffect(() => {
    setEggLogs(storage.getEggs());
    setCustomers(storage.getCustomers());
    setLedger(storage.getLedger());
    setExpenses(storage.getExpenses());
    setPayees(storage.getPayees());
  }, []);

  // Persistence Handlers
  const handleAddEggLog = (log: EggLog) => {
    const updated = [...eggLogs, log];
    setEggLogs(updated);
    storage.setEggs(updated);
  };
  const handleDeleteEggLog = (id: string) => {
    const updated = eggLogs.filter(i => i.id !== id);
    setEggLogs(updated);
    storage.setEggs(updated);
  };

  const handleAddCustomer = (customer: Customer) => {
    const updated = [...customers, customer];
    setCustomers(updated);
    storage.setCustomers(updated);
  };
  const handleDeleteCustomer = (id: string) => {
    const updated = customers.filter(i => i.id !== id);
    setCustomers(updated);
    storage.setCustomers(updated);
  };

  const handleAddLedger = (entry: LedgerEntry) => {
    const updated = [...ledger, entry];
    setLedger(updated);
    storage.setLedger(updated);

    if (entry.type === 'DEBIT' && entry.quantity && entry.quantity > 0) {
      const newEggLog: EggLog = {
        id: Date.now().toString(),
        ledgerId: entry.id,
        date: entry.date,
        collectedCount: 0,
        soldCount: entry.quantity,
        salePrice: entry.pricePerUnit || 0,
        totalSale: entry.amount
      };
      handleAddEggLog(newEggLog);
    }
  };

  const handleDeleteLedger = (id: string) => {
    const updated = ledger.filter(i => i.id !== id);
    setLedger(updated);
    storage.setLedger(updated);

    const linkedLog = eggLogs.find(log => log.ledgerId === id);
    if (linkedLog) {
      handleDeleteEggLog(linkedLog.id);
    }
  };

  const handleAddExpense = (expense: Expense) => {
    const updated = [...expenses, expense];
    setExpenses(updated);
    storage.setExpenses(updated);
  };
  const handleDeleteExpense = (id: string) => {
    const updated = expenses.filter(i => i.id !== id);
    setExpenses(updated);
    storage.setExpenses(updated);
  };

  const handleAddPayee = (payee: Payee) => {
    const updated = [...payees, payee];
    setPayees(updated);
    storage.setPayees(updated);
  };

  const handleDeletePayee = (id: string) => {
    const updated = payees.filter(i => i.id !== id);
    setPayees(updated);
    storage.setPayees(updated);
  };

  const handleImportEggs = (data: EggLog[]) => {
    setEggLogs(data);
    storage.setEggs(data);
  };

  const handleImportCustomers = (data: Customer[]) => {
    setCustomers(data);
    storage.setCustomers(data);
  };

  const handleImportLedger = (data: LedgerEntry[]) => {
    setLedger(data);
    storage.setLedger(data);
  };

  const handleImportExpenses = (data: Expense[]) => {
    setExpenses(data);
    storage.setExpenses(data);
  };

  const handleRestore = (data: any) => {
    if (!data.eggLogs || !data.customers || !data.ledger) {
      alert("Invalid backup file. Missing required data.");
      return;
    }

    setEggLogs(data.eggLogs || []);
    setCustomers(data.customers || []);
    setLedger(data.ledger || []);
    setExpenses(data.expenses || []);
    setPayees(data.payees || []);

    storage.setEggs(data.eggLogs || []);
    storage.setCustomers(data.customers || []);
    storage.setLedger(data.ledger || []);
    storage.setExpenses(data.expenses || []);
    storage.setPayees(data.payees || []);

    alert("Database restored successfully!");
  };

  const renderView = () => {
    switch (currentView) {
      case 'DASHBOARD':
        return (
          <Overview 
            eggLogs={eggLogs} 
            ledger={ledger} 
            expenses={expenses} 
            customers={customers}
            payees={payees}
          />
        );
      case 'EGGS':
        return <EggTracker data={eggLogs} onAdd={handleAddEggLog} onDelete={handleDeleteEggLog} />;
      case 'CUSTOMERS':
        return <Customers data={customers} onAdd={handleAddCustomer} onDelete={handleDeleteCustomer} />;
      case 'LEDGER':
        return <CustomerLedger customers={customers} ledger={ledger} onAdd={handleAddLedger} onDelete={handleDeleteLedger} />;
      case 'EXPENSES':
        return (
          <Expenses 
            data={expenses} 
            payees={payees}
            onAddExpense={handleAddExpense} 
            onDeleteExpense={handleDeleteExpense}
            onAddPayee={handleAddPayee}
            onDeletePayee={handleDeletePayee}
          />
        );
      case 'BALANCE_SHEET':
        return <BalanceSheet eggLogs={eggLogs} ledger={ledger} expenses={expenses} />;
      case 'OUTSTANDING':
        return <Outstanding customers={customers} ledger={ledger} payees={payees} expenses={expenses} />;
      case 'SETTINGS':
        return (
          <Settings 
            eggLogs={eggLogs} 
            customers={customers} 
            ledger={ledger} 
            expenses={expenses} 
            payees={payees} 
            onRestore={handleRestore}
            onImportEggs={handleImportEggs}
            onImportCustomers={handleImportCustomers}
            onImportLedger={handleImportLedger}
            onImportExpenses={handleImportExpenses}
          />
        );
      default:
        return (
          <Overview 
            eggLogs={eggLogs} 
            ledger={ledger} 
            expenses={expenses} 
            customers={customers}
            payees={payees}
          />
        );
    }
  };

  return (
    <Layout currentView={currentView} setCurrentView={setCurrentView}>
      {renderView()}
    </Layout>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
