import { Trash2, Edit2 } from 'lucide-react';
import { Transaction, Category } from '@/types/finance';
import { useFinance } from '@/context/FinanceContext';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DynamicIcon } from './DynamicIcon';

interface TransactionItemProps {
  transaction: Transaction;
  category?: Category;
  onEdit?: (transaction: Transaction) => void;
}

export function TransactionItem({ transaction, category, onEdit }: TransactionItemProps) {
  const { formatCurrency, deleteTransaction } = useFinance();
  
  const amountClass = {
    income: 'amount-income',
    expense: 'amount-expense',
    investment: 'amount-investment',
  }[transaction.type];
  
  const prefix = transaction.type === 'income' ? '+' : '-';
  
  return (
    <div className="group flex items-center gap-4 rounded-xl bg-card p-4 transition-all duration-200 hover:bg-card-elevated animate-fade-in">
      {/* Category Icon */}
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${category?.color}20` }}
      >
        <DynamicIcon 
          name={category?.icon || 'CircleDot'} 
          className="h-6 w-6"
          style={{ color: category?.color }}
        />
      </div>
      
      {/* Details */}
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-foreground">
          {transaction.description || category?.name || 'Transação'}
        </p>
        <p className="text-sm text-muted-foreground">
          {format(parseISO(transaction.date), "d 'de' MMM", { locale: ptBR })}
        </p>
      </div>
      
      {/* Amount */}
      <div className="text-right">
        <p className={cn('text-lg font-bold', amountClass)}>
          {prefix} {formatCurrency(transaction.amount)}
        </p>
      </div>
      
      {/* Actions (visible on hover) */}
      <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {onEdit && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(transaction)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:bg-destructive/10"
          onClick={() => deleteTransaction(transaction.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
