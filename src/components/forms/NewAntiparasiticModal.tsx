// Nouveau modal antiparasitaire
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useClients, AntiparasiticProtocol, StockItem } from '@/contexts/ClientContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useToast } from '@/hooks/use-toast';
import { format, addDays } from 'date-fns';
import { Plus, Package, CheckCircle, Search, ChevronDown, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface NewAntiparasiticModalProps {
  children?: React.ReactNode;
  selectedPetId?: number;
  selectedClientId?: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  editingAntiparasitic?: any;
}

export default function NewAntiparasiticModal({ children, selectedClientId, selectedPetId, open, onOpenChange, editingAntiparasitic }: NewAntiparasiticModalProps) {
  const { clients, pets, addAntiparasitic, updateAntiparasitic, getAntiparasiticProtocolsBySpecies, addAppointment, stockItems } = useClients();
  const { settings } = useSettings();
  const { toast } = useToast();
  const [internalOpen, setInternalOpen] = useState(false);
  const modalOpen = open !== undefined ? open : internalOpen;
  const setModalOpen = onOpenChange || setInternalOpen;

  const [formData, setFormData] = useState({
    clientId: selectedClientId?.toString() || '',
    petId: selectedPetId?.toString() || '',
    dateGiven: format(new Date(), 'yyyy-MM-dd'),
    nextDueDate: '',
    dosage: '',
    administrationRoute: '',
    veterinarian: '',
    notes: '',
    batchNumber: '',
    manufacturer: '',
    weight: '',
    cost: '',
    sideEffects: ''
  });
  const [selectedProtocols, setSelectedProtocols] = useState<AntiparasiticProtocol[]>([]);
  
  // États pour la gestion du stock
  const [openPopover, setOpenPopover] = useState(false);
  const [manualEntryMode, setManualEntryMode] = useState(false);
  const [availableAntiparasitics, setAvailableAntiparasitics] = useState<StockItem[]>([]);
  
  // Protection contre undefined
  const safeSelectedProtocols = selectedProtocols || [];
  const [nextDueDates, setNextDueDates] = useState<Record<string, string>>({});

  useEffect(() => {
    if (selectedClientId) setFormData(prev => ({ ...prev, clientId: selectedClientId.toString(), petId: '' }));
    if (selectedPetId) setFormData(prev => ({ ...prev, petId: selectedPetId.toString() }));
  }, [selectedClientId, selectedPetId]);

  // Synchroniser les antiparasitaires disponibles en stock
  useEffect(() => {
    const antiparasitics = stockItems
      .filter(item => 
        item.category === 'medication' && 
        item.isActive && 
        item.currentStock > 0
      )
      .sort((a, b) => a.name.localeCompare(b.name));
    setAvailableAntiparasitics(antiparasitics);
    // Antiparasitics list updated
  }, [stockItems]);

  // Pré-remplir le formulaire pour l'édition
  useEffect(() => {
    if (editingAntiparasitic) {
      setFormData({
        clientId: editingAntiparasitic.clientId.toString(),
        petId: editingAntiparasitic.petId.toString(),
        dateGiven: editingAntiparasitic.dateGiven,
        nextDueDate: editingAntiparasitic.nextDueDate || '',
        dosage: editingAntiparasitic.dosage || '',
        administrationRoute: editingAntiparasitic.administrationRoute || '',
        veterinarian: editingAntiparasitic.veterinarian || '',
        notes: editingAntiparasitic.notes || '',
        batchNumber: editingAntiparasitic.batchNumber || '',
        manufacturer: editingAntiparasitic.manufacturer || '',
        weight: editingAntiparasitic.weight || '',
        cost: editingAntiparasitic.cost || '',
        sideEffects: editingAntiparasitic.sideEffects || ''
      });
    }
  }, [editingAntiparasitic]);

  // Initialize defaults for each protocol interval
  useEffect(() => {
    if (safeSelectedProtocols.length && formData.dateGiven) {
      const defaults: Record<string, string> = {};
      safeSelectedProtocols.forEach(protocol => {
        protocol.intervals.forEach(interval => {
          const key = `${protocol.id}-${interval.offsetDays}`;
          defaults[key] = format(
            addDays(new Date(formData.dateGiven), interval.offsetDays),
            'yyyy-MM-dd'
          );
        });
      });
      setNextDueDates(defaults);
    } else {
      setNextDueDates({});
    }
  }, [safeSelectedProtocols, formData.dateGiven]);

  const availableProtocols = formData.petId
    ? getAntiparasiticProtocolsBySpecies(
        pets.find(p => p.id === parseInt(formData.petId))?.type || ''
      )
    : [];

  // Fonction pour sélectionner un antiparasitaire depuis le stock
  const selectAntiparasiticFromStock = (stockItem: StockItem) => {
    setFormData(prev => ({
      ...prev,
      productName: stockItem.name,
      manufacturer: stockItem.manufacturer || prev.manufacturer,
      cost: stockItem.sellingPrice.toString()
    }));
    setOpenPopover(false);
    setManualEntryMode(false);
  };

  // Fonction pour activer la saisie manuelle
  const enableManualEntry = () => {
    setManualEntryMode(true);
    setOpenPopover(false);
  };

  // Fonction pour revenir au mode sélection
  const enableSelectionMode = () => {
    setManualEntryMode(false);
    setFormData(prev => ({
      ...prev,
      productName: '',
      manufacturer: '',
      cost: ''
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId || !formData.petId) {
      toast({ title: 'Erreur', description: 'Client et animal requis.', variant: 'destructive' });
      return;
    }
    const client = clients.find(c => c.id === parseInt(formData.clientId));
    const pet = pets.find(p => p.id === parseInt(formData.petId));
    if (!client || !pet) {
      toast({ title: 'Erreur', description: 'Client ou animal introuvable.', variant: 'destructive' });
      return;
    }

    // Mode édition
    if (editingAntiparasitic) {
      updateAntiparasitic(editingAntiparasitic.id, {
        clientId: parseInt(formData.clientId),
        clientName: client.name,
        petId: parseInt(formData.petId),
        petName: pet.name,
        productName: editingAntiparasitic.productName,
        productType: editingAntiparasitic.productType,
        targetParasites: editingAntiparasitic.targetParasites,
        dateGiven: formData.dateGiven,
        nextDueDate: formData.nextDueDate,
        dosage: formData.dosage,
        administrationRoute: formData.administrationRoute as any,
        veterinarian: formData.veterinarian,
        notes: formData.notes,
        batchNumber: formData.batchNumber,
        manufacturer: formData.manufacturer,
        weight: formData.weight,
        status: editingAntiparasitic.status,
        cost: formData.cost,
        sideEffects: formData.sideEffects
      });
      
      toast({
        title: 'Traitement modifié',
        description: `Le traitement ${editingAntiparasitic.productName} a été mis à jour avec succès.`
      });
      
      setModalOpen(false);
      return;
    }

    if (safeSelectedProtocols.length > 0) {
      // Traiter chaque protocole sélectionné
      safeSelectedProtocols.forEach(protocol => {
        protocol.intervals.forEach(interval => {
          const key = `${protocol.id}-${interval.offsetDays}`;
          // Assign dateGiven per interval: original uses form date, reminders use their due date
          const dueDate = nextDueDates[key] || '';
          const entryDate = interval.offsetDays === 0 ? formData.dateGiven : dueDate;
          addAntiparasitic({
            clientId: client.id,
            clientName: client.name,
            petId: pet.id,
            petName: pet.name,
            productName: `${protocol.name} (${interval.label})`, 
            productType: protocol.productType,
            targetParasites: protocol.targetParasites,
            dateGiven: entryDate,
            nextDueDate: dueDate,
            dosage: formData.dosage,
            administrationRoute: formData.administrationRoute || protocol.productType as any,
            veterinarian: formData.veterinarian,
            notes: formData.notes,
            batchNumber: formData.batchNumber,
            manufacturer: formData.manufacturer || protocol.manufacturer || '',
            weight: formData.weight,
            status: interval.offsetDays === 0 ? 'completed' : 'scheduled',
            cost: formData.cost,
            sideEffects: formData.sideEffects
          });
        });
      });
      
      // Programmer rappels antiparasitaires
      safeSelectedProtocols.forEach(protocol => {
        (protocol.intervals || []).forEach(interval => {
          const key = `${protocol.id}-${interval.offsetDays}`;
          const dueDate = nextDueDates[key];
          if (dueDate && interval.offsetDays > 0) { // Seuls les rappels futurs
            addAppointment({
              clientId: client.id,
              clientName: client.name,
              petId: pet.id,
              petName: pet.name,
              date: dueDate,
              time: '09:00',
              type: 'consultation',
              duration: 15,
              reason: `Rappel antiparasitaire ${protocol.name}`,
              status: 'scheduled',
              reminderSent: false
            });
          }
        });
      });
      
      toast({ 
        title: 'Traitements ajoutés', 
        description: `${safeSelectedProtocols.reduce((total, p) => total + p.intervals.length, 0)} traitement(s) enregistré(s) dans le dossier médical et rappels programmés.` 
      });
    } else {
      // Traitement manuel sans protocole
      const productName = formData.notes || 'Traitement antiparasitaire';
      addAntiparasitic({
        clientId: client.id,
        clientName: client.name,
        petId: pet.id,
        petName: pet.name,
        productName: productName,
        productType: 'external' as any,
        targetParasites: 'Non spécifié' as any,
        dateGiven: formData.dateGiven,
        nextDueDate: formData.nextDueDate,
        dosage: formData.dosage,
        administrationRoute: formData.administrationRoute as any,
        veterinarian: formData.veterinarian,
        notes: formData.notes,
        batchNumber: formData.batchNumber,
        manufacturer: formData.manufacturer,
        weight: formData.weight,
        status: 'completed',
        cost: formData.cost,
        sideEffects: formData.sideEffects
      });
      
      // Programmer rappel si date spécifiée
      if (formData.nextDueDate) {
        addAppointment({
          clientId: client.id,
          clientName: client.name,
          petId: pet.id,
          petName: pet.name,
          date: formData.nextDueDate,
          time: '09:00',
          type: 'consultation',
          duration: 15,
          reason: `Rappel antiparasitaire ${productName}`,
          status: 'scheduled',
          reminderSent: false
        });
      }
      
      toast({ 
        title: 'Traitement ajouté', 
        description: `Traitement pour ${pet.name} enregistré dans le dossier médical.` 
      });
    }

    // Antiparasitic added successfully and synced to medical records

    // Reset and close
    setSelectedProtocols([]);
    setFormData({ 
      clientId: selectedClientId?.toString() || '', 
      petId: selectedPetId?.toString() || '', 
      dateGiven: format(new Date(), 'yyyy-MM-dd'), 
      nextDueDate: '', 
      dosage: '', 
      administrationRoute: '', 
      veterinarian: '', 
      notes: '', 
      batchNumber: '', 
      manufacturer: '', 
      weight: '', 
      cost: '', 
      sideEffects: '' 
    });
    setModalOpen(false);
  };

  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      {!editingAntiparasitic && (
      <DialogTrigger asChild>
        {children || <Button className="gap-2"><Plus className="h-4 w-4" />Nouveau traitement</Button>}
      </DialogTrigger>
      )}
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingAntiparasitic ? `Modifier ${editingAntiparasitic.productName}` : 'Nouveau traitement antiparasitaire'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Client & Pet Select */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {editingAntiparasitic && (
              <div className="col-span-2 text-sm text-blue-600 bg-blue-50 p-2 rounded-md border border-blue-200">
                <strong>Mode édition :</strong> Vous modifiez uniquement ce traitement spécifique. 
                Le client et l'animal sont verrouillés. Les protocoles ne sont pas affichés car ils ne s'appliquent qu'à la création.
              </div>
            )}
            <div>
              <Label>Client *</Label>
              <Select 
                value={formData.clientId} 
                onValueChange={v => setFormData(prev => ({ ...prev, clientId: v, petId: '' }))}
                disabled={editingAntiparasitic}
              >
                <SelectTrigger><SelectValue placeholder="Sélectionner un client" /></SelectTrigger>
                <SelectContent>
                  {clients && Array.isArray(clients) && clients.length > 0 ? (
                    clients.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)
                  ) : (
                    <SelectItem value="no-clients" disabled>
                      Aucun client trouvé
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Animal *</Label>
              <Select 
                value={formData.petId} 
                onValueChange={v => setFormData(prev => ({ ...prev, petId: v }))} 
                disabled={!formData.clientId || editingAntiparasitic}
              >
                <SelectTrigger><SelectValue placeholder="Sélectionner un animal" /></SelectTrigger>
                <SelectContent>
                  {pets.filter(p => p.ownerId === parseInt(formData.clientId)).map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name} ({p.type})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* Protocol Selection */}
          {availableProtocols.length > 0 && !editingAntiparasitic && (
            <div className="space-y-2">
              <Label>Protocoles suggérés ({pets.find(p => p.id===parseInt(formData.petId))?.type})</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {availableProtocols.map(protocol => {
                  const checked = safeSelectedProtocols.some(p => p.id === protocol.id);
                  return (
                    <div key={protocol.id} className="flex items-center p-2 border rounded hover:bg-muted/50">
                      <Checkbox checked={checked} onCheckedChange={val => val ? setSelectedProtocols(prev => [...prev, protocol]) : setSelectedProtocols(prev => prev.filter(x => x.id !== protocol.id))} />
                      <label className="ml-2 flex-1 text-sm">
                        <div className="font-medium">{protocol.name}</div>
                        <div className="text-xs text-gray-600">{protocol.description}</div>
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {/* Selected Protocols Overview */}
          {safeSelectedProtocols.length > 0 ? (
            <Card className="mb-4">
              <CardHeader><CardTitle className="text-sm">Protocoles sélectionnés</CardTitle></CardHeader>
              <CardContent>
                <ul className="list-disc list-inside text-sm">
                  {safeSelectedProtocols.map(p => <li key={p.id}>{p.name}</li>)}
                </ul>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Label>Produit antiparasitaire</Label>
                  <Badge variant="outline" className="text-xs">
                    {availableAntiparasitics.length} antiparasitaires en stock
                  </Badge>
                </div>
                
                {manualEntryMode ? (
                  <div className="space-y-2">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Search className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">Saisie manuelle</span>
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={enableSelectionMode} className="text-xs">
                          Changer
                        </Button>
                      </div>
                      <Input
                        value={formData.productName}
                        onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
                        placeholder="Nom du produit antiparasitaire (non disponible en stock)"
                        className="bg-white"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Popover open={openPopover} onOpenChange={setOpenPopover}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" role="combobox" aria-expanded={openPopover} className="flex-1 justify-between">
                            {formData.productName || "Sélectionner un antiparasitaire..."}
                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0">
                          <Command>
                            <CommandInput placeholder="Rechercher un antiparasitaire..." />
                            <CommandList>
                              <CommandEmpty>Aucun antiparasitaire trouvé.</CommandEmpty>
                              <CommandGroup>
                                {availableAntiparasitics.map((stockItem) => (
                                  <CommandItem
                                    key={stockItem.id}
                                    value={stockItem.name}
                                    onSelect={() => selectAntiparasiticFromStock(stockItem)}
                                    className="flex flex-col items-start gap-1 p-3"
                                  >
                                    <div className="flex items-center justify-between w-full">
                                      <div className="flex items-center gap-2">
                                        <Package className="h-4 w-4 text-blue-600" />
                                        <span className="font-medium">{stockItem.name}</span>
                                      </div>
                                      <Badge variant={stockItem.currentStock >= 5 ? "default" : "destructive"} className="ml-2">
                                        {stockItem.currentStock} en stock
                                      </Badge>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                      {stockItem.manufacturer && (<span>Fabricant: {stockItem.manufacturer}</span>)}
                                      <span>Prix: {stockItem.sellingPrice.toFixed(2)} {settings.currency}</span>
                                    </div>
                                  </CommandItem>
                                ))}
                                <CommandItem onSelect={enableManualEntry}>
                                  <div className="flex items-center gap-2 text-blue-600 p-2">
                                    <Search className="h-4 w-4" />
                                    <div>
                                      <span className="font-medium">Saisie manuelle</span>
                                      <p className="text-sm text-gray-500">Antiparasitaire non disponible en stock</p>
                                    </div>
                                  </div>
                                </CommandItem>
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      {formData.productName && (
                        <Button type="button" variant="outline" size="sm" onClick={enableManualEntry} className="px-3" title="Passer en saisie manuelle">
                          <Search className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    {/* Badge de statut du stock */}
                    {formData.productName && (
                      <div className="flex items-center gap-2">
                        {(() => {
                          const stockItem = availableAntiparasitics.find(item => 
                            item.name.toLowerCase() === formData.productName.toLowerCase()
                          );
                          if (stockItem) {
                            if (stockItem.currentStock >= 1) {
                              return (
                                <Badge variant="default" className="bg-green-100 text-green-800">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  En stock ({stockItem.currentStock})
                                </Badge>
                              );
                            } else {
                              return (
                                <Badge variant="destructive">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Stock insuffisant
                                </Badge>
                              );
                            }
                          } else {
                            return (
                              <Badge variant="secondary">
                                <Search className="h-3 w-3 mr-1" />
                                Non en stock
                              </Badge>
                            );
                          }
                        })()}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div>
                <Label>Type</Label>
                <Input value={formData.administrationRoute} onChange={e => setFormData(prev => ({ ...prev, administrationRoute: e.target.value }))} placeholder="Type (oral, topical...)" />
              </div>
            </div>
          )}
          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Date d'administration *</Label>
              <Input type="date" value={formData.dateGiven} onChange={e=>setFormData(prev=>({...prev,dateGiven:e.target.value}))} required />
            </div>
            {!safeSelectedProtocols.length && (
              <div>
                <Label>Date de rappel</Label>
                <Input type="date" value={formData.nextDueDate} onChange={e=>setFormData(prev=>({...prev,nextDueDate:e.target.value}))} />
              </div>
            )}
          </div>
          {/* Interval-specific dates */}
          {safeSelectedProtocols.length > 0 && (
            <div className="space-y-4 mb-4">
              {safeSelectedProtocols.map(protocol => (
                <div key={protocol.id} className="space-y-2">
                  <div className="font-medium text-sm">Étapes pour {protocol.name}</div>
                  {protocol.intervals.map(interval => {
                    const key = `${protocol.id}-${interval.offsetDays}`;
                    return (
                      <div key={key} className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
                        <div className="text-sm">{interval.label} (+{interval.offsetDays} jours)</div>
                        <div>
                          <Label>Date exacte</Label>
                          <Input type="date" id={key} value={nextDueDates[key] || ''} onChange={e=>setNextDueDates(prev=>({...prev,[key]:e.target.value}))} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
          {/* Other fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Dosage</Label>
              <Input value={formData.dosage} onChange={e=>setFormData(prev=>({...prev,dosage:e.target.value}))} placeholder="Dosage" />
            </div>
            <div>
              <Label>Vétérinaire</Label>
              <Select value={formData.veterinarian} onValueChange={v=>setFormData(prev=>({...prev,veterinarian:v}))}>
                <SelectTrigger><SelectValue placeholder="Sélectionner un vétérinaire" /></SelectTrigger>
                <SelectContent>
                  {(settings.veterinarians || [])
                    .filter(vet => vet.isActive)
                    .map(vet => (
                      <SelectItem key={vet.id} value={vet.name}>
                        {vet.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Numéro de lot</Label>
              <Input value={formData.batchNumber} onChange={e=>setFormData(prev=>({...prev,batchNumber:e.target.value}))} placeholder="Numéro de lot" />
            </div>
            <div>
              <Label>Fabricant</Label>
              <Input value={formData.manufacturer} onChange={e=>setFormData(prev=>({...prev,manufacturer:e.target.value}))} placeholder="Fabricant" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Poids</Label>
              <Input value={formData.weight} onChange={e=>setFormData(prev=>({...prev,weight:e.target.value}))} placeholder="Poids" />
            </div>
            <div>
              <Label>Coût</Label>
              <Input type="number" step="0.01" value={formData.cost} onChange={e=>setFormData(prev=>({...prev,cost:e.target.value}))} placeholder="0.00" />
            </div>
          </div>
          <div>
            <Label>Effets indésirables</Label>
            <Input value={formData.sideEffects} onChange={e=>setFormData(prev=>({...prev,sideEffects:e.target.value}))} placeholder="Effets indésirables" />
          </div>

          {/* Résumé du stock */}
          {formData.productName && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Résumé du stock
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const stockItem = availableAntiparasitics.find(item => 
                    item.name.toLowerCase() === formData.productName.toLowerCase()
                  );
                  if (stockItem) {
                    return (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{stockItem.name}</span>
                          <Badge variant={stockItem.currentStock >= 1 ? "default" : "destructive"}>
                            {stockItem.currentStock} en stock
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <div>Fabricant: {stockItem.manufacturer || 'Non spécifié'}</div>
                          <div>Prix de vente: {stockItem.sellingPrice.toFixed(2)} {settings.currency}</div>
                          <div>Stock minimum: {stockItem.minimumStock}</div>
                          {stockItem.currentStock <= stockItem.minimumStock && (
                            <div className="text-orange-600 font-medium mt-1">
                              ⚠️ Stock bas - Réapprovisionnement recommandé
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Search className="h-4 w-4" />
                          <span>Antiparasitaire non disponible en stock</span>
                        </div>
                        <div className="mt-1">L'antiparasitaire sera administré sans impact sur le stock.</div>
                      </div>
                    );
                  }
                })()}
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" type="button" onClick={()=>onOpenChange ? onOpenChange(false) : setInternalOpen(false)}>Annuler</Button>
            <Button type="submit">Ajouter</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
