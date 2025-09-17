import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useClients, AccountingEntry } from '@/contexts/ClientContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Calculator, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  Edit,
  Trash2,
  FileText,
  Lightbulb,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Interface pour les suggestions
interface AccountingSuggestion {
  description: string;
  amount: number;
  type: 'revenue' | 'expense';
  frequency: 'monthly' | 'annual' | 'occasional';
  source: string;
}

// Suggestions prédéfinies pour les charges et recettes
const ACCOUNTING_SUGGESTIONS: { monthly: AccountingSuggestion[]; annual: AccountingSuggestion[]; occasional: AccountingSuggestion[] } = {
  monthly: [
    { description: 'Salaire Secrétaire', amount: 3000, type: 'expense', frequency: 'monthly', source: 'salary' },
    { description: 'CNSS Secrétaire', amount: 700, type: 'expense', frequency: 'monthly', source: 'insurance' },
    { description: 'CNSS Vétérinaire', amount: 1500, type: 'expense', frequency: 'monthly', source: 'insurance' },
    { description: 'Loyer', amount: 3000, type: 'expense', frequency: 'monthly', source: 'rent' },
    { description: 'Eau et Électricité', amount: 300, type: 'expense', frequency: 'monthly', source: 'other' }
  ],
  annual: [
    { description: 'Impôts', amount: 3000, type: 'expense', frequency: 'annual', source: 'tax' },
    { description: 'Cotisation Ordre des Vétérinaires', amount: 1200, type: 'expense', frequency: 'annual', source: 'other' }
  ],
  occasional: [
    { description: 'Maintenance Équipement', amount: 500, type: 'expense', frequency: 'occasional', source: 'other' },
    { description: 'Formation Professionnelle', amount: 800, type: 'expense', frequency: 'occasional', source: 'other' },
    { description: 'Achat Matériel', amount: 1200, type: 'expense', frequency: 'occasional', source: 'other' }
  ]
};

const Accounting: React.FC = () => {
  const { 
    accountingEntries, 
    addAccountingEntry, 
    updateAccountingEntry, 
    deleteAccountingEntry,
    generateAccountingSummary,
    consultations,
    vaccinations,
    antiparasitics,
    prescriptions,
    stockMovements,
    stockItems
  } = useClients();
  const { settings } = useSettings();
  const { toast } = useToast();

  const [selectedPeriod, setSelectedPeriod] = useState<string>('month');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isAddEntryModalOpen, setIsAddEntryModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<AccountingEntry | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [customSuggestions, setCustomSuggestions] = useState<{ monthly: AccountingSuggestion[]; annual: AccountingSuggestion[]; occasional: AccountingSuggestion[] }>(ACCOUNTING_SUGGESTIONS);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [editingSuggestion, setEditingSuggestion] = useState<AccountingSuggestion | null>(null);

  // Formulaire pour la configuration des suggestions
  const [suggestionFormData, setSuggestionFormData] = useState({
    description: '',
    amount: '',
    type: 'expense' as 'revenue' | 'expense',
    frequency: 'monthly' as 'monthly' | 'annual' | 'occasional',
    source: 'other' as any
  });

  // Formulaire pour ajouter/modifier une entrée
  const [formData, setFormData] = useState({
    type: 'revenue' as 'revenue' | 'expense',
    frequency: 'occasional' as 'monthly' | 'annual' | 'occasional',
    description: '',
    amount: '',
    date: '',
    source: 'other' as any,
    notes: ''
  });

  // Initialiser les dates
  useEffect(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    setStartDate(format(startOfMonth, 'yyyy-MM-dd'));
    setEndDate(format(endOfMonth, 'yyyy-MM-dd'));
  }, []);

  // Calculer le résumé quand les dates changent
  useEffect(() => {
    if (startDate && endDate) {
      const period = selectedPeriod === 'month' 
        ? format(new Date(startDate), 'yyyy-MM', { locale: fr })
        : selectedPeriod === 'year'
        ? format(new Date(startDate), 'yyyy', { locale: fr })
        : selectedPeriod === 'day'
        ? format(new Date(startDate), 'dd/MM/yyyy', { locale: fr })
        : `${format(new Date(startDate), 'dd/MM/yyyy')} - ${format(new Date(endDate), 'dd/MM/yyyy')}`;
      
      const calculatedSummary = generateAccountingSummary(period, startDate, endDate);
      setSummary(calculatedSummary);
    }
  }, [startDate, endDate, selectedPeriod, accountingEntries, consultations, vaccinations, antiparasitics, prescriptions, stockMovements, generateAccountingSummary]);

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    const now = new Date();
    
    switch (period) {
      case 'day':
        const today = format(now, 'yyyy-MM-dd');
        setStartDate(today);
        setEndDate(today);
        break;
      case 'month':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        setStartDate(format(startOfMonth, 'yyyy-MM-dd'));
        setEndDate(format(endOfMonth, 'yyyy-MM-dd'));
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        const startOfQuarter = new Date(now.getFullYear(), quarter * 3, 1);
        const endOfQuarter = new Date(now.getFullYear(), quarter * 3 + 3, 0);
        setStartDate(format(startOfQuarter, 'yyyy-MM-dd'));
        setEndDate(format(endOfQuarter, 'yyyy-MM-dd'));
        break;
      case 'year':
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const endOfYear = new Date(now.getFullYear(), 11, 31);
        setStartDate(format(startOfYear, 'yyyy-MM-dd'));
        setEndDate(format(endOfYear, 'yyyy-MM-dd'));
        break;
    }
  };

  const handleAddEntry = () => {
    if (!formData.description || !formData.amount || !formData.date) return;

    const entryData = {
      type: formData.type,
      category: 'manual' as const,
      frequency: formData.frequency,
      description: formData.description,
      amount: parseFloat(formData.amount),
      date: formData.date,
      source: formData.source,
      notes: formData.notes
    };

    if (editingEntry) {
      updateAccountingEntry(editingEntry.id, entryData);
      setEditingEntry(null);
    } else {
      addAccountingEntry(entryData);
    }

    // Reset form
    setFormData({
      type: 'revenue',
      frequency: 'occasional',
      description: '',
      amount: '',
      date: '',
      source: 'other',
      notes: ''
    });
    setIsAddEntryModalOpen(false);
  };

  const handleEditEntry = (entry: AccountingEntry) => {
    setEditingEntry(entry);
    setFormData({
      type: entry.type,
      frequency: entry.frequency,
      description: entry.description,
      amount: entry.amount.toString(),
      date: entry.date,
      source: entry.source || 'other',
      notes: entry.notes || ''
    });
    setIsAddEntryModalOpen(true);
  };

  const handleDeleteEntry = (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette entrée ?')) {
      deleteAccountingEntry(id);
    }
  };

  const handleApplySuggestion = (suggestion: AccountingSuggestion) => {
    setFormData({
      ...formData,
      type: suggestion.type,
      frequency: suggestion.frequency || 'occasional',
      description: suggestion.description,
      amount: suggestion.amount.toString(),
      source: suggestion.source,
      date: formData.date || format(new Date(), 'yyyy-MM-dd')
    });
    setShowSuggestions(false);
  };

  const handleAddSuggestion = () => {
    if (!suggestionFormData.description || !suggestionFormData.amount) return;

    const newSuggestion: AccountingSuggestion = {
      description: suggestionFormData.description,
      amount: parseFloat(suggestionFormData.amount),
      type: suggestionFormData.type,
      frequency: suggestionFormData.frequency,
      source: suggestionFormData.source
    };

    if (editingSuggestion) {
      // Modifier une suggestion existante
      const updatedSuggestions = { ...customSuggestions };
      const category = editingSuggestion.frequency;
      const index = updatedSuggestions[category].findIndex(s => s === editingSuggestion);
      if (index !== -1) {
        updatedSuggestions[category][index] = newSuggestion;
      }
      setCustomSuggestions(updatedSuggestions);
      setEditingSuggestion(null);
    } else {
      // Ajouter une nouvelle suggestion
      const updatedSuggestions = { ...customSuggestions };
      const category = suggestionFormData.frequency;
      updatedSuggestions[category].push(newSuggestion);
      setCustomSuggestions(updatedSuggestions);
    }

    // Reset form
    setSuggestionFormData({
      description: '',
      amount: '',
      type: 'expense',
      frequency: 'monthly',
      source: 'other'
    });
    setIsConfigModalOpen(false);
  };

  const handleEditSuggestion = (suggestion: AccountingSuggestion) => {
    setEditingSuggestion(suggestion);
    setSuggestionFormData({
      description: suggestion.description,
      amount: suggestion.amount.toString(),
      type: suggestion.type,
      frequency: suggestion.frequency,
      source: suggestion.source
    });
    setIsConfigModalOpen(true);
  };

  const handleDeleteSuggestion = (suggestion: AccountingSuggestion) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette suggestion ?')) {
      const updatedSuggestions = { ...customSuggestions };
      const category = suggestion.frequency;
      updatedSuggestions[category] = updatedSuggestions[category].filter(s => s !== suggestion);
      setCustomSuggestions(updatedSuggestions);
    }
  };

  const filteredEntries = accountingEntries.filter(entry => {
    const entryDate = new Date(entry.date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return entryDate >= start && entryDate <= end;
  });

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} ${settings.currency}`;
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'consultation': return '🩺';
      case 'vaccination': return '💉';
      case 'antiparasitic': return '💊';
      case 'prescription': return '📋';
      case 'stock_purchase': return '📦';
      case 'salary': return '👥';
      case 'rent': return '🏢';
      case 'tax': return '📊';
      case 'insurance': return '🛡️';
      default: return '📄';
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calculator className="h-8 w-8" />
            Gestion Comptable
          </h1>
          <p className="text-muted-foreground">
            Suivi des recettes et charges de votre clinique vétérinaire
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddEntryModalOpen} onOpenChange={setIsAddEntryModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingEntry(null); setFormData({ type: 'revenue', frequency: 'occasional', description: '', amount: '', date: '', source: 'other', notes: '' }); }}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une entrée
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingEntry ? 'Modifier l\'entrée comptable' : 'Ajouter une entrée comptable'}
                </DialogTitle>
                <DialogDescription>
                  {editingEntry ? 'Modifiez les informations de cette entrée.' : 'Ajoutez une nouvelle recette ou charge manuelle.'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Suggestions prédéfinies */}
                <div className="border rounded-lg p-4 bg-muted/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-600" />
                      <Label className="text-sm font-medium">Suggestions prédéfinies</Label>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSuggestions(!showSuggestions)}
                    >
                      {showSuggestions ? <X className="h-4 w-4" /> : <Lightbulb className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  {showSuggestions && (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Charges mensuelles</h4>
                        <div className="grid grid-cols-1 gap-2">
                          {customSuggestions.monthly.map((suggestion, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              className="justify-start text-left h-auto p-2"
                              onClick={() => handleApplySuggestion(suggestion)}
                            >
                              <div className="flex justify-between items-center w-full">
                                <span className="text-sm">{suggestion.description}</span>
                                <span className="text-sm font-medium text-muted-foreground">
                                  {suggestion.amount} {settings.currency}
                                </span>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Charges annuelles</h4>
                        <div className="grid grid-cols-1 gap-2">
                          {customSuggestions.annual.map((suggestion, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              className="justify-start text-left h-auto p-2"
                              onClick={() => handleApplySuggestion(suggestion)}
                            >
                              <div className="flex justify-between items-center w-full">
                                <span className="text-sm">{suggestion.description}</span>
                                <span className="text-sm font-medium text-muted-foreground">
                                  {suggestion.amount} {settings.currency}
                                </span>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Charges occasionnelles</h4>
                        <div className="grid grid-cols-1 gap-2">
                          {customSuggestions.occasional.map((suggestion, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              className="justify-start text-left h-auto p-2"
                              onClick={() => handleApplySuggestion(suggestion)}
                            >
                              <div className="flex justify-between items-center w-full">
                                <span className="text-sm">{suggestion.description}</span>
                                <span className="text-sm font-medium text-muted-foreground">
                                  {suggestion.amount} {settings.currency}
                                </span>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select value={formData.type} onValueChange={(value: 'revenue' | 'expense') => setFormData({ ...formData, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="revenue">Recette</SelectItem>
                        <SelectItem value="expense">Charge</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="frequency">Fréquence</Label>
                    <Select value={formData.frequency} onValueChange={(value: 'monthly' | 'annual' | 'occasional') => setFormData({ ...formData, frequency: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Mensuel</SelectItem>
                        <SelectItem value="annual">Annuel</SelectItem>
                        <SelectItem value="occasional">Occasionnel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ex: Salaire employé, Loyer, etc."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Montant ({settings.currency})</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="source">Source</Label>
                  <Select value={formData.source} onValueChange={(value) => setFormData({ ...formData, source: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="salary">Salaire</SelectItem>
                      <SelectItem value="rent">Loyer</SelectItem>
                      <SelectItem value="tax">Impôts</SelectItem>
                      <SelectItem value="insurance">Assurance</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notes">Notes (optionnel)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Informations supplémentaires..."
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddEntryModalOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleAddEntry}>
                    {editingEntry ? 'Modifier' : 'Ajouter'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Sélecteur de période */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Période d'analyse
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex gap-2">
              <Button
                variant={selectedPeriod === 'day' ? 'default' : 'outline'}
                onClick={() => handlePeriodChange('day')}
                size="sm"
              >
                Ce jour
              </Button>
              <Button
                variant={selectedPeriod === 'month' ? 'default' : 'outline'}
                onClick={() => handlePeriodChange('month')}
                size="sm"
              >
                Ce mois
              </Button>
              <Button
                variant={selectedPeriod === 'quarter' ? 'default' : 'outline'}
                onClick={() => handlePeriodChange('quarter')}
                size="sm"
              >
                Ce trimestre
              </Button>
              <Button
                variant={selectedPeriod === 'year' ? 'default' : 'outline'}
                onClick={() => handlePeriodChange('year')}
                size="sm"
              >
                Cette année
              </Button>
            </div>
            
            <div className="flex gap-2 items-center">
              <Label htmlFor="startDate">Du</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-40"
              />
              <Label htmlFor="endDate">Au</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-40"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Résumé financier */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Recettes</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.totalRevenue)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                <div>Consultations: {formatCurrency(summary.revenueBreakdown.consultations)}</div>
                <div>Vaccinations: {formatCurrency(summary.revenueBreakdown.vaccinations)}</div>
                <div>Antiparasitaires: {formatCurrency(summary.revenueBreakdown.antiparasitics)}</div>
                <div>Prescriptions: {formatCurrency(summary.revenueBreakdown.prescriptions)}</div>
                <div>Manuelles: {formatCurrency(summary.revenueBreakdown.manualEntries)}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Charges</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(summary.totalExpenses)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                <div>Achats stock: {formatCurrency(summary.expenseBreakdown.stockPurchases)}</div>
                <div>Salaires: {formatCurrency(summary.expenseBreakdown.salaries)}</div>
                <div>Loyer: {formatCurrency(summary.expenseBreakdown.rent)}</div>
                <div>Impôts: {formatCurrency(summary.expenseBreakdown.taxes)}</div>
                <div>Autres: {formatCurrency(summary.expenseBreakdown.other)}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Résultat Net</CardTitle>
              <DollarSign className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${summary.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(summary.netIncome)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {summary.netIncome >= 0 ? 'Bénéfice' : 'Perte'}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Onglets pour les entrées comptables et la configuration */}
      <Tabs defaultValue="entries" className="space-y-4">
        <TabsList>
          <TabsTrigger value="entries">Entrées Comptables</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
        </TabsList>
        
        <TabsContent value="entries">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Entrées comptables automatiques et manuelles
              </CardTitle>
              <CardDescription>
                Entrées générées automatiquement (consultations, vaccinations, etc.) et entrées manuelles ajoutées
              </CardDescription>
            </CardHeader>
            <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Fréquence</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{format(new Date(entry.date), 'dd/MM/yyyy', { locale: fr })}</TableCell>
                  <TableCell>
                    <Badge variant={entry.type === 'revenue' ? 'default' : 'destructive'}>
                      {entry.type === 'revenue' ? 'Recette' : 'Charge'}
                    </Badge>
                  </TableCell>
                  <TableCell>{entry.description}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{getSourceIcon(entry.source || 'other')}</span>
                      <span className="text-sm">
                        {entry.category === 'automatic' ? 'Automatique' : 'Manuel'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {entry.frequency === 'monthly' ? 'Mensuel' : 
                       entry.frequency === 'annual' ? 'Annuel' : 'Occasionnel'}
                    </Badge>
                  </TableCell>
                  <TableCell className={`font-medium ${entry.type === 'revenue' ? 'text-green-600' : 'text-red-600'}`}>
                    {entry.type === 'revenue' ? '+' : '-'}{formatCurrency(entry.amount)}
                  </TableCell>
                  <TableCell>
                    {entry.category === 'manual' && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditEntry(entry)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteEntry(entry.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredEntries.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Aucune entrée comptable pour cette période
            </div>
          )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="configuration">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Configuration des Suggestions
              </CardTitle>
              <CardDescription>
                Configurez les suggestions prédéfinies pour faciliter la saisie des charges et recettes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Suggestions Mensuelles</h3>
                <Button onClick={() => { setEditingSuggestion(null); setSuggestionFormData({ description: '', amount: '', type: 'expense', frequency: 'monthly', source: 'other' }); setIsConfigModalOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter
                </Button>
              </div>
              
              <div className="grid gap-3">
                {customSuggestions.monthly.map((suggestion, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{suggestion.description}</span>
                      <span className="text-sm text-muted-foreground">{suggestion.amount} {settings.currency}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditSuggestion(suggestion)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteSuggestion(suggestion)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Suggestions Annuelles</h3>
                <Button onClick={() => { setEditingSuggestion(null); setSuggestionFormData({ description: '', amount: '', type: 'expense', frequency: 'annual', source: 'other' }); setIsConfigModalOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter
                </Button>
              </div>
              
              <div className="grid gap-3">
                {customSuggestions.annual.map((suggestion, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{suggestion.description}</span>
                      <span className="text-sm text-muted-foreground">{suggestion.amount} {settings.currency}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditSuggestion(suggestion)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteSuggestion(suggestion)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Suggestions Occasionnelles</h3>
                <Button onClick={() => { setEditingSuggestion(null); setSuggestionFormData({ description: '', amount: '', type: 'expense', frequency: 'occasional', source: 'other' }); setIsConfigModalOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter
                </Button>
              </div>
              
              <div className="grid gap-3">
                {customSuggestions.occasional.map((suggestion, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{suggestion.description}</span>
                      <span className="text-sm text-muted-foreground">{suggestion.amount} {settings.currency}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditSuggestion(suggestion)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteSuggestion(suggestion)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal pour configurer les suggestions */}
      <Dialog open={isConfigModalOpen} onOpenChange={setIsConfigModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSuggestion ? 'Modifier la suggestion' : 'Ajouter une suggestion'}
            </DialogTitle>
            <DialogDescription>
              {editingSuggestion ? 'Modifiez les informations de cette suggestion.' : 'Ajoutez une nouvelle suggestion prédéfinie.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="suggestion-type">Type</Label>
                <Select value={suggestionFormData.type} onValueChange={(value: 'revenue' | 'expense') => setSuggestionFormData({ ...suggestionFormData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="revenue">Recette</SelectItem>
                    <SelectItem value="expense">Charge</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="suggestion-frequency">Fréquence</Label>
                <Select value={suggestionFormData.frequency} onValueChange={(value: 'monthly' | 'annual' | 'occasional') => setSuggestionFormData({ ...suggestionFormData, frequency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Mensuel</SelectItem>
                    <SelectItem value="annual">Annuel</SelectItem>
                    <SelectItem value="occasional">Occasionnel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="suggestion-description">Description</Label>
              <Input
                id="suggestion-description"
                value={suggestionFormData.description}
                onChange={(e) => setSuggestionFormData({ ...suggestionFormData, description: e.target.value })}
                placeholder="Ex: Salaire employé, Loyer, etc."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="suggestion-amount">Montant ({settings.currency})</Label>
                <Input
                  id="suggestion-amount"
                  type="number"
                  step="0.01"
                  value={suggestionFormData.amount}
                  onChange={(e) => setSuggestionFormData({ ...suggestionFormData, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <Label htmlFor="suggestion-source">Source</Label>
                <Select value={suggestionFormData.source} onValueChange={(value) => setSuggestionFormData({ ...suggestionFormData, source: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="salary">Salaire</SelectItem>
                    <SelectItem value="rent">Loyer</SelectItem>
                    <SelectItem value="tax">Impôts</SelectItem>
                    <SelectItem value="insurance">Assurance</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsConfigModalOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleAddSuggestion}>
                {editingSuggestion ? 'Modifier' : 'Ajouter'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Accounting;