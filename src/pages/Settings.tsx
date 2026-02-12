import { useState } from 'react';
import { Eye, EyeOff, Download, Upload, User } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { exportAllData, importAllData } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const { settings, updateSettings, refreshData } = useFinance();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState(settings.displayName);

  const handleExport = () => {
    try {
      const data = exportAllData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `slx-finance-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Backup exportado',
        description: 'Seus dados foram salvos com sucesso!',
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Erro ao exportar',
        description: 'Não foi possível exportar o backup.',
        variant: 'destructive',
      });
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importAllData(content);
      
      if (success) {
        refreshData();
        toast({
          title: 'Backup restaurado',
          description: 'Seus dados foram importados com sucesso!',
        });
      } else {
        toast({
          title: 'Erro na importação',
          description: 'O arquivo de backup é inválido.',
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSaveName = () => {
    updateSettings({ displayName });
    toast({
      title: 'Nome atualizado',
      description: 'Suas configurações foram salvas.',
    });
  };

  return (
    <div className="safe-top safe-bottom min-h-full p-4 pb-24 lg:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">Personalize seu app</p>
      </div>

      {/* Profile */}
      <Card className="mb-6 border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5" />
            Perfil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="displayName">Nome de Exibição</Label>
              <div className="flex gap-2">
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Seu nome"
                />
                <Button onClick={handleSaveName}>Salvar</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card className="mb-6 border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Preferências</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Privacy Mode */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.privacyMode ? (
                <EyeOff className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Eye className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <p className="font-semibold">Modo Privacidade</p>
                <p className="text-sm text-muted-foreground">
                  Oculta os valores monetários
                </p>
              </div>
            </div>
            <Switch
              checked={settings.privacyMode}
              onCheckedChange={(checked) => updateSettings({ privacyMode: checked })}
            />
          </div>

          {/* Currency */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Moeda</p>
              <p className="text-sm text-muted-foreground">
                Selecione sua moeda
              </p>
            </div>
            <Select
              value={settings.currency}
              onValueChange={(value) => updateSettings({ currency: value })}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BRL">R$ BRL</SelectItem>
                <SelectItem value="USD">$ USD</SelectItem>
                <SelectItem value="EUR">€ EUR</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Backup */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Backup e Restauração</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Exporte seus dados para fazer backup ou importe um backup existente.
          </p>
          
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={handleExport} variant="outline" className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Exportar Backup
            </Button>
            
            <Button variant="outline" className="relative flex-1" asChild>
              <label>
                <Upload className="mr-2 h-4 w-4" />
                Importar Backup
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
              </label>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* App Info */}
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p className="gradient-text font-semibold">SLX Finance</p>
        <p>Versão 1.0.0</p>
        <p className="mt-2">Feito com 💜 para seu controle financeiro</p>
      </div>
    </div>
  );
}
