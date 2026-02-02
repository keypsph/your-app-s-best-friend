import { useState, useMemo } from 'react';
import { Plus, Trash2, Settings2, Megaphone, Cpu, Wallet, TrendingUp, Calculator } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DynamicIcon } from '@/components/finance/DynamicIcon';
import { parseISO, format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

export default function IncomeDistribution() {
  const {
    transactions,
    categories,
    incomeSources,
    wallets,
    walletTransactions,
    addIncomeSource,
    updateIncomeSource,
    deleteIncomeSource,
    formatCurrency,
    currentMonth,
  } = useFinance();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    distributions: [
      { walletId: 'marketing', percentage: 30 },
      { walletId: 'equipment', percentage: 20 },
      { walletId: 'free_profit', percentage: 50 },
    ],
  });

  const monthDate = parseISO(`${currentMonth}-01`);
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);

  // Calculate wallet balances for current month
  const walletStats = useMemo(() => {
    const monthWalletTx = walletTransactions.filter(wt => {
      const date = parseISO(wt.date);
      return isWithinInterval(date, { start: monthStart, end: monthEnd });
    });

    return wallets.map(wallet => {
      const credits = monthWalletTx
        .filter(wt => wt.walletId === wallet.id && wt.type === 'credit')
        .reduce((sum, wt) => sum + wt.amount, 0);
      const debits = monthWalletTx
        .filter(wt => wt.walletId === wallet.id && wt.type === 'debit')
        .reduce((sum, wt) => sum + wt.amount, 0);

      return {
        ...wallet,
        monthlyCredits: credits,
        monthlyDebits: debits,
        monthlyBalance: credits - debits,
      };
    });
  }, [wallets, walletTransactions, monthStart, monthEnd]);

  // Calculate Marketing ROI
  const marketingROI = useMemo(() => {
    const monthTx = transactions.filter(t => {
      const date = parseISO(t.date);
      return isWithinInterval(date, { start: monthStart, end: monthEnd });
    });

    // Digital income (find categories with 'digital' or 'streaming' in id)
    const digitalIncomeCategories = categories.filter(c =>
      c.type === 'income' && (c.id.includes('digital') || c.id.includes('streaming'))
    );
    const digitalIncome = monthTx
      .filter(t => t.type === 'income' && digitalIncomeCategories.some(c => c.id === t.categoryId))
      .reduce((sum, t) => sum + t.amount, 0);

    // Marketing expenses
    const marketingExpenses = monthTx
      .filter(t => t.type === 'expense' && t.categoryId === 'marketing')
      .reduce((sum, t) => sum + t.amount, 0);

    const roi = marketingExpenses > 0 ? digitalIncome / marketingExpenses : 0;

    return { digitalIncome, marketingExpenses, roi };
  }, [transactions, categories, monthStart, monthEnd]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const totalPercentage = formData.distributions.reduce((sum, d) => sum + d.percentage, 0);
    if (totalPercentage !== 100) {
      alert('As porcentagens devem somar 100%');
      return;
    }

    if (editingSource) {
      updateIncomeSource(editingSource, formData);
    } else {
      addIncomeSource(formData);
    }

    setFormData({
      name: '',
      distributions: [
        { walletId: 'marketing', percentage: 30 },
        { walletId: 'equipment', percentage: 20 },
        { walletId: 'free_profit', percentage: 50 },
      ],
    });
    setEditingSource(null);
    setDialogOpen(false);
  };

  const openEditDialog = (source: typeof incomeSources[0]) => {
    setEditingSource(source.id);
    setFormData({
      name: source.name,
      distributions: source.distributions,
    });
    setDialogOpen(true);
  };

  const updateDistribution = (walletId: string, percentage: number) => {
    setFormData(prev => ({
      ...prev,
      distributions: prev.distributions.map(d =>
        d.walletId === walletId ? { ...d, percentage } : d
      ),
    }));
  };

  const getWalletIcon = (walletId: string) => {
    switch (walletId) {
      case 'marketing': return Megaphone;
      case 'equipment': return Cpu;
      default: return Wallet;
    }
  };

  return (
    <div className="safe-top safe-bottom min-h-full p-4 pb-24 lg:p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Divisão de Renda</h1>
          <p className="text-muted-foreground">Configure como sua renda é distribuída</p>
        </div>
        <Button onClick={() => {
          setEditingSource(null);
          setFormData({
            name: '',
            distributions: [
              { walletId: 'marketing', percentage: 30 },
              { walletId: 'equipment', percentage: 20 },
              { walletId: 'free_profit', percentage: 50 },
            ],
          });
          setDialogOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Fonte
        </Button>
      </div>

      {/* Marketing ROI Card */}
      {marketingROI.marketingExpenses > 0 && (
        <Card className="mb-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calculator className="h-5 w-5 text-primary" />
              Retorno do Marketing (ROI)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">Investido em Marketing</p>
                <p className="text-xl font-bold text-expense">{formatCurrency(marketingROI.marketingExpenses)}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">Receita Digital</p>
                <p className="text-xl font-bold text-income">{formatCurrency(marketingROI.digitalIncome)}</p>
              </div>
              <div className="rounded-lg bg-primary/20 p-4">
                <p className="text-sm text-muted-foreground">Multiplicador</p>
                <p className="text-2xl font-bold text-primary">{marketingROI.roi.toFixed(1)}x</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Você investiu {formatCurrency(marketingROI.marketingExpenses)} em marketing e gerou {formatCurrency(marketingROI.digitalIncome)} em receita digital.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Wallet Balances */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {walletStats.map(wallet => {
          const Icon = getWalletIcon(wallet.id);
          const usagePercentage = wallet.monthlyCredits > 0
            ? (wallet.monthlyDebits / wallet.monthlyCredits) * 100
            : 0;

          return (
            <Card key={wallet.id} className="border-border bg-card">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${wallet.color}20` }}
                  >
                    <Icon className="h-6 w-6" style={{ color: wallet.color }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{wallet.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Recebido: {formatCurrency(wallet.monthlyCredits)}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-muted-foreground">Usado: {formatCurrency(wallet.monthlyDebits)}</span>
                    <span className="font-semibold" style={{ color: wallet.color }}>
                      {usagePercentage.toFixed(0)}%
                    </span>
                  </div>
                  <Progress
                    value={Math.min(usagePercentage, 100)}
                    className="h-2"
                    style={{ '--progress-color': wallet.color } as React.CSSProperties}
                  />
                </div>

                <div className="mt-3 flex justify-between rounded-lg bg-muted/50 p-3">
                  <span className="text-sm text-muted-foreground">Saldo Restante</span>
                  <span className="font-bold" style={{ color: wallet.color }}>
                    {formatCurrency(wallet.monthlyBalance)}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Income Sources */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Fontes de Renda Configuradas</CardTitle>
        </CardHeader>
        <CardContent>
          {incomeSources.length > 0 ? (
            <div className="space-y-4">
              {incomeSources.map(source => (
                <div key={source.id} className="rounded-lg border border-border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="font-semibold">{source.name}</h4>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(source)}
                      >
                        <Settings2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => deleteIncomeSource(source.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {source.distributions.map(dist => {
                      const wallet = wallets.find(w => w.id === dist.walletId);
                      return (
                        <div
                          key={dist.walletId}
                          className="flex items-center justify-between rounded-lg bg-muted/50 p-2"
                        >
                          <span className="text-sm">{wallet?.name}</span>
                          <span className="font-semibold" style={{ color: wallet?.color }}>
                            {dist.percentage}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <Settings2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">Nenhuma fonte de renda configurada</p>
              <Button className="mt-4" onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeira Fonte
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSource ? 'Editar Fonte de Renda' : 'Nova Fonte de Renda'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="sourceName">Nome da Fonte</Label>
              <Input
                id="sourceName"
                placeholder="Ex: Renda Digital"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-3">
              <Label>Distribuição (%)</Label>
              {wallets.map(wallet => {
                const dist = formData.distributions.find(d => d.walletId === wallet.id);
                return (
                  <div key={wallet.id} className="flex items-center gap-3">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${wallet.color}20` }}
                    >
                      <DynamicIcon
                        name={wallet.icon}
                        className="h-4 w-4"
                        style={{ color: wallet.color }}
                      />
                    </div>
                    <span className="flex-1 text-sm">{wallet.name}</span>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      className="w-20 text-center"
                      value={dist?.percentage || 0}
                      onChange={(e) => updateDistribution(wallet.id, parseInt(e.target.value) || 0)}
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                );
              })}
              <p className="text-xs text-muted-foreground">
                Total: {formData.distributions.reduce((sum, d) => sum + d.percentage, 0)}% (deve ser 100%)
              </p>
            </div>

            <Button type="submit" className="w-full">
              {editingSource ? 'Salvar Alterações' : 'Criar Fonte'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
