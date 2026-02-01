import { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { TransactionType } from '@/types/finance';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DynamicIcon } from './DynamicIcon';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const transactionTypes: { value: TransactionType; label: string; color: string }[] = [
  { value: 'income', label: 'Receita', color: 'bg-income' },
  { value: 'expense', label: 'Despesa', color: 'bg-expense' },
  { value: 'investment', label: 'Investimento', color: 'bg-investment' },
];

export function AddTransactionDialog({ open, onOpenChange }: AddTransactionDialogProps) {
  const { categories, addTransaction } = useFinance();
  
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  
  const filteredCategories = categories.filter(c => c.type === type);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !categoryId) return;
    
    addTransaction({
      amount: parseFloat(amount),
      type,
      categoryId,
      description,
      date,
    });
    
    // Reset form
    setAmount('');
    setCategoryId('');
    setDescription('');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Nova Transação</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Type selector */}
          <div className="flex gap-2">
            {transactionTypes.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => {
                  setType(t.value);
                  setCategoryId('');
                }}
                className={cn(
                  'flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all',
                  type === t.value
                    ? `${t.color} text-white shadow-lg`
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          
          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Valor</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-lg font-semibold"
              required
            />
          </div>
          
          {/* Category */}
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select value={categoryId} onValueChange={setCategoryId} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="flex h-6 w-6 items-center justify-center rounded"
                        style={{ backgroundColor: `${cat.color}20` }}
                      >
                        <DynamicIcon
                          name={cat.icon}
                          className="h-4 w-4"
                          style={{ color: cat.color }}
                        />
                      </div>
                      <span>{cat.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Input
              id="description"
              placeholder="Ex: Almoço no restaurante"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          
          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          
          {/* Submit */}
          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary-light"
            disabled={!amount || !categoryId}
          >
            Adicionar Transação
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
