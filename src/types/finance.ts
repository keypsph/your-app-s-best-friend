export type TransactionType = 'income' | 'expense' | 'investment';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  description: string;
  date: string;
  createdAt: string;
}

export interface FinancialGoal {
  id: string;
  categoryId: string;
  monthlyLimit: number;
  month: string; // YYYY-MM format
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  createdAt: string;
}

export interface MonthlyStats {
  totalIncome: number;
  totalExpenses: number;
  totalInvestments: number;
  netProfit: number;
  categoryBreakdown: { categoryId: string; amount: number; percentage: number }[];
}

export interface UserSettings {
  displayName: string;
  currency: string;
  privacyMode: boolean;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'salary', name: 'Salário', icon: 'Briefcase', color: '#10B981', type: 'income' },
  { id: 'freelance', name: 'Freelance', icon: 'Laptop', color: '#34D399', type: 'income' },
  { id: 'investments_income', name: 'Rendimentos', icon: 'TrendingUp', color: '#3B82F6', type: 'income' },
  { id: 'other_income', name: 'Outros', icon: 'Plus', color: '#6EE7B7', type: 'income' },
  
  { id: 'food', name: 'Alimentação', icon: 'Utensils', color: '#EF4444', type: 'expense' },
  { id: 'transport', name: 'Transporte', icon: 'Car', color: '#F97316', type: 'expense' },
  { id: 'housing', name: 'Moradia', icon: 'Home', color: '#F59E0B', type: 'expense' },
  { id: 'health', name: 'Saúde', icon: 'Heart', color: '#EC4899', type: 'expense' },
  { id: 'education', name: 'Educação', icon: 'GraduationCap', color: '#8B5CF6', type: 'expense' },
  { id: 'entertainment', name: 'Lazer', icon: 'Gamepad2', color: '#06B6D4', type: 'expense' },
  { id: 'shopping', name: 'Compras', icon: 'ShoppingBag', color: '#D946EF', type: 'expense' },
  { id: 'bills', name: 'Contas', icon: 'Receipt', color: '#64748B', type: 'expense' },
  { id: 'other_expense', name: 'Outros', icon: 'MoreHorizontal', color: '#94A3B8', type: 'expense' },
  
  { id: 'stocks', name: 'Ações', icon: 'LineChart', color: '#3B82F6', type: 'investment' },
  { id: 'crypto', name: 'Cripto', icon: 'Bitcoin', color: '#F59E0B', type: 'investment' },
  { id: 'fixed_income', name: 'Renda Fixa', icon: 'Lock', color: '#10B981', type: 'investment' },
  { id: 'real_estate', name: 'Imóveis', icon: 'Building', color: '#6366F1', type: 'investment' },
];
