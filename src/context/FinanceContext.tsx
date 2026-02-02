import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Transaction,
  Category,
  FinancialGoal,
  SavingsGoal,
  UserSettings,
  MonthlyStats,
  IncomeSource,
  Wallet,
  WalletTransaction,
} from '@/types/finance';
import * as storage from '@/lib/storage';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

interface FinanceContextType {
  // Data
  transactions: Transaction[];
  categories: Category[];
  financialGoals: FinancialGoal[];
  savingsGoals: SavingsGoal[];
  settings: UserSettings;
  incomeSources: IncomeSource[];
  wallets: Wallet[];
  walletTransactions: WalletTransaction[];
  
  // Current month filter
  currentMonth: string;
  setCurrentMonth: (month: string) => void;
  
  // Computed
  monthlyStats: MonthlyStats;
  
  // Transaction actions
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  
  // Category actions
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  getCategoryById: (id: string) => Category | undefined;
  
  // Goal actions
  addFinancialGoal: (goal: Omit<FinancialGoal, 'id'>) => void;
  updateFinancialGoal: (id: string, updates: Partial<FinancialGoal>) => void;
  deleteFinancialGoal: (id: string) => void;
  
  // Savings goal actions
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt'>) => void;
  updateSavingsGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;
  
  // Income source actions
  addIncomeSource: (source: Omit<IncomeSource, 'id'>) => void;
  updateIncomeSource: (id: string, updates: Partial<IncomeSource>) => void;
  deleteIncomeSource: (id: string) => void;
  
  // Wallet actions
  addWalletTransaction: (transaction: Omit<WalletTransaction, 'id'>) => void;
  
  // Settings
  updateSettings: (settings: Partial<UserSettings>) => void;
  
  // Utils
  formatCurrency: (value: number) => string;
  refreshData: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [financialGoals, setFinancialGoals] = useState<FinancialGoal[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [settings, setSettings] = useState<UserSettings>(storage.getSettings());
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>([]);

  const refreshData = useCallback(() => {
    setTransactions(storage.getTransactions());
    setCategories(storage.getCategories());
    setFinancialGoals(storage.getFinancialGoals());
    setSavingsGoals(storage.getSavingsGoals());
    setSettings(storage.getSettings());
    setIncomeSources(storage.getIncomeSources());
    setWallets(storage.getWallets());
    setWalletTransactions(storage.getWalletTransactions());
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const getCategoryById = useCallback((id: string) => {
    return categories.find(c => c.id === id);
  }, [categories]);

  // Calculate monthly stats
  const monthlyStats = React.useMemo((): MonthlyStats => {
    const monthDate = parseISO(`${currentMonth}-01`);
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);
    
    const monthTransactions = transactions.filter(t => {
      const date = parseISO(t.date);
      return isWithinInterval(date, { start, end });
    });
    
    const totalIncome = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalInvestments = monthTransactions
      .filter(t => t.type === 'investment')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const netProfit = totalIncome - totalExpenses - totalInvestments;
    
    // Category breakdown for expenses
    const expensesByCategory = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.categoryId] = (acc[t.categoryId] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);
    
    const categoryBreakdown = Object.entries(expensesByCategory)
      .map(([categoryId, amount]) => ({
        categoryId,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
    
    // Income breakdown by category
    const incomeByCategory = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => {
        acc[t.categoryId] = (acc[t.categoryId] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);
    
    const incomeBreakdown = Object.entries(incomeByCategory)
      .map(([categoryId, amount]) => ({
        categoryId,
        amount,
        percentage: totalIncome > 0 ? (amount / totalIncome) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
    
    return {
      totalIncome,
      totalExpenses,
      totalInvestments,
      netProfit,
      categoryBreakdown,
      incomeBreakdown,
    };
  }, [transactions, currentMonth]);

  const formatCurrency = useCallback((value: number) => {
    if (settings.privacyMode) return '••••••';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: settings.currency,
    }).format(value);
  }, [settings.currency, settings.privacyMode]);

  // Transaction actions
  const addTransactionHandler = useCallback((data: Omit<Transaction, 'id' | 'createdAt'>) => {
    const transaction: Transaction = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    const updated = storage.addTransaction(transaction);
    setTransactions(updated);
    
    // If there's a savings contribution, update the savings goal
    if (data.savingsGoalId && data.savingsContribution && data.savingsContribution > 0) {
      const goal = savingsGoals.find(g => g.id === data.savingsGoalId);
      if (goal) {
        const updatedGoals = storage.updateSavingsGoal(data.savingsGoalId, {
          currentAmount: goal.currentAmount + data.savingsContribution,
        });
        setSavingsGoals(updatedGoals);
      }
    }
  }, [savingsGoals]);

  const updateTransactionHandler = useCallback((id: string, updates: Partial<Transaction>) => {
    const updated = storage.updateTransaction(id, updates);
    setTransactions(updated);
  }, []);

  const deleteTransactionHandler = useCallback((id: string) => {
    const updated = storage.deleteTransaction(id);
    setTransactions(updated);
  }, []);

  // Category actions
  const addCategoryHandler = useCallback((data: Omit<Category, 'id'>) => {
    const category: Category = {
      ...data,
      id: crypto.randomUUID(),
    };
    const updated = storage.addCategory(category);
    setCategories(updated);
  }, []);

  const updateCategoryHandler = useCallback((id: string, updates: Partial<Category>) => {
    const updated = storage.updateCategory(id, updates);
    setCategories(updated);
  }, []);

  const deleteCategoryHandler = useCallback((id: string) => {
    const updated = storage.deleteCategory(id);
    setCategories(updated);
  }, []);

  // Financial goal actions
  const addFinancialGoalHandler = useCallback((data: Omit<FinancialGoal, 'id'>) => {
    const goal: FinancialGoal = {
      ...data,
      id: crypto.randomUUID(),
    };
    const updated = storage.addFinancialGoal(goal);
    setFinancialGoals(updated);
  }, []);

  const updateFinancialGoalHandler = useCallback((id: string, updates: Partial<FinancialGoal>) => {
    const updated = storage.updateFinancialGoal(id, updates);
    setFinancialGoals(updated);
  }, []);

  const deleteFinancialGoalHandler = useCallback((id: string) => {
    const updated = storage.deleteFinancialGoal(id);
    setFinancialGoals(updated);
  }, []);

  // Savings goal actions
  const addSavingsGoalHandler = useCallback((data: Omit<SavingsGoal, 'id' | 'createdAt'>) => {
    const goal: SavingsGoal = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    const updated = storage.addSavingsGoal(goal);
    setSavingsGoals(updated);
  }, []);

  const updateSavingsGoalHandler = useCallback((id: string, updates: Partial<SavingsGoal>) => {
    const updated = storage.updateSavingsGoal(id, updates);
    setSavingsGoals(updated);
  }, []);

  const deleteSavingsGoalHandler = useCallback((id: string) => {
    const updated = storage.deleteSavingsGoal(id);
    setSavingsGoals(updated);
  }, []);

  // Income source actions
  const addIncomeSourceHandler = useCallback((data: Omit<IncomeSource, 'id'>) => {
    const source: IncomeSource = {
      ...data,
      id: crypto.randomUUID(),
    };
    const updated = storage.addIncomeSource(source);
    setIncomeSources(updated);
  }, []);

  const updateIncomeSourceHandler = useCallback((id: string, updates: Partial<IncomeSource>) => {
    const updated = storage.updateIncomeSource(id, updates);
    setIncomeSources(updated);
  }, []);

  const deleteIncomeSourceHandler = useCallback((id: string) => {
    const updated = storage.deleteIncomeSource(id);
    setIncomeSources(updated);
  }, []);

  // Wallet transaction actions
  const addWalletTransactionHandler = useCallback((data: Omit<WalletTransaction, 'id'>) => {
    const transaction: WalletTransaction = {
      ...data,
      id: crypto.randomUUID(),
    };
    const updated = storage.addWalletTransaction(transaction);
    setWalletTransactions(updated);
  }, []);

  // Settings
  const updateSettingsHandler = useCallback((updates: Partial<UserSettings>) => {
    const updated = { ...settings, ...updates };
    storage.saveSettings(updated);
    setSettings(updated);
  }, [settings]);

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        categories,
        financialGoals,
        savingsGoals,
        settings,
        currentMonth,
        setCurrentMonth,
        monthlyStats,
        incomeSources,
        wallets,
        walletTransactions,
        addTransaction: addTransactionHandler,
        updateTransaction: updateTransactionHandler,
        deleteTransaction: deleteTransactionHandler,
        addCategory: addCategoryHandler,
        updateCategory: updateCategoryHandler,
        deleteCategory: deleteCategoryHandler,
        getCategoryById,
        addFinancialGoal: addFinancialGoalHandler,
        updateFinancialGoal: updateFinancialGoalHandler,
        deleteFinancialGoal: deleteFinancialGoalHandler,
        addSavingsGoal: addSavingsGoalHandler,
        updateSavingsGoal: updateSavingsGoalHandler,
        deleteSavingsGoal: deleteSavingsGoalHandler,
        addIncomeSource: addIncomeSourceHandler,
        updateIncomeSource: updateIncomeSourceHandler,
        deleteIncomeSource: deleteIncomeSourceHandler,
        addWalletTransaction: addWalletTransactionHandler,
        updateSettings: updateSettingsHandler,
        formatCurrency,
        refreshData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
