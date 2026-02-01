import { Transaction, Category, FinancialGoal, SavingsGoal, UserSettings, DEFAULT_CATEGORIES } from '@/types/finance';

const STORAGE_KEYS = {
  TRANSACTIONS: 'slx_transactions',
  CATEGORIES: 'slx_categories',
  GOALS: 'slx_goals',
  SAVINGS_GOALS: 'slx_savings_goals',
  SETTINGS: 'slx_settings',
};

// Generic storage functions
function getItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Storage error:', error);
  }
}

// Transactions
export function getTransactions(): Transaction[] {
  return getItem(STORAGE_KEYS.TRANSACTIONS, []);
}

export function saveTransactions(transactions: Transaction[]): void {
  setItem(STORAGE_KEYS.TRANSACTIONS, transactions);
}

export function addTransaction(transaction: Transaction): Transaction[] {
  const transactions = getTransactions();
  transactions.unshift(transaction);
  saveTransactions(transactions);
  return transactions;
}

export function updateTransaction(id: string, updates: Partial<Transaction>): Transaction[] {
  const transactions = getTransactions();
  const index = transactions.findIndex(t => t.id === id);
  if (index !== -1) {
    transactions[index] = { ...transactions[index], ...updates };
    saveTransactions(transactions);
  }
  return transactions;
}

export function deleteTransaction(id: string): Transaction[] {
  const transactions = getTransactions().filter(t => t.id !== id);
  saveTransactions(transactions);
  return transactions;
}

// Categories
export function getCategories(): Category[] {
  const saved = getItem<Category[]>(STORAGE_KEYS.CATEGORIES, []);
  return saved.length > 0 ? saved : DEFAULT_CATEGORIES;
}

export function saveCategories(categories: Category[]): void {
  setItem(STORAGE_KEYS.CATEGORIES, categories);
}

export function addCategory(category: Category): Category[] {
  const categories = getCategories();
  categories.push(category);
  saveCategories(categories);
  return categories;
}

export function updateCategory(id: string, updates: Partial<Category>): Category[] {
  const categories = getCategories();
  const index = categories.findIndex(c => c.id === id);
  if (index !== -1) {
    categories[index] = { ...categories[index], ...updates };
    saveCategories(categories);
  }
  return categories;
}

export function deleteCategory(id: string): Category[] {
  const categories = getCategories().filter(c => c.id !== id);
  saveCategories(categories);
  return categories;
}

// Financial Goals
export function getFinancialGoals(): FinancialGoal[] {
  return getItem(STORAGE_KEYS.GOALS, []);
}

export function saveFinancialGoals(goals: FinancialGoal[]): void {
  setItem(STORAGE_KEYS.GOALS, goals);
}

export function addFinancialGoal(goal: FinancialGoal): FinancialGoal[] {
  const goals = getFinancialGoals();
  goals.push(goal);
  saveFinancialGoals(goals);
  return goals;
}

export function updateFinancialGoal(id: string, updates: Partial<FinancialGoal>): FinancialGoal[] {
  const goals = getFinancialGoals();
  const index = goals.findIndex(g => g.id === id);
  if (index !== -1) {
    goals[index] = { ...goals[index], ...updates };
    saveFinancialGoals(goals);
  }
  return goals;
}

export function deleteFinancialGoal(id: string): FinancialGoal[] {
  const goals = getFinancialGoals().filter(g => g.id !== id);
  saveFinancialGoals(goals);
  return goals;
}

// Savings Goals
export function getSavingsGoals(): SavingsGoal[] {
  return getItem(STORAGE_KEYS.SAVINGS_GOALS, []);
}

export function saveSavingsGoals(goals: SavingsGoal[]): void {
  setItem(STORAGE_KEYS.SAVINGS_GOALS, goals);
}

export function addSavingsGoal(goal: SavingsGoal): SavingsGoal[] {
  const goals = getSavingsGoals();
  goals.push(goal);
  saveSavingsGoals(goals);
  return goals;
}

export function updateSavingsGoal(id: string, updates: Partial<SavingsGoal>): SavingsGoal[] {
  const goals = getSavingsGoals();
  const index = goals.findIndex(g => g.id === id);
  if (index !== -1) {
    goals[index] = { ...goals[index], ...updates };
    saveSavingsGoals(goals);
  }
  return goals;
}

export function deleteSavingsGoal(id: string): SavingsGoal[] {
  const goals = getSavingsGoals().filter(g => g.id !== id);
  saveSavingsGoals(goals);
  return goals;
}

// User Settings
export function getSettings(): UserSettings {
  return getItem(STORAGE_KEYS.SETTINGS, {
    displayName: 'Usuário',
    currency: 'BRL',
    privacyMode: false,
  });
}

export function saveSettings(settings: UserSettings): void {
  setItem(STORAGE_KEYS.SETTINGS, settings);
}

// Export/Import for backup
export function exportAllData(): string {
  const data = {
    transactions: getTransactions(),
    categories: getCategories(),
    goals: getFinancialGoals(),
    savingsGoals: getSavingsGoals(),
    settings: getSettings(),
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
}

export function importAllData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data.transactions) saveTransactions(data.transactions);
    if (data.categories) saveCategories(data.categories);
    if (data.goals) saveFinancialGoals(data.goals);
    if (data.savingsGoals) saveSavingsGoals(data.savingsGoals);
    if (data.settings) saveSettings(data.settings);
    return true;
  } catch {
    return false;
  }
}
