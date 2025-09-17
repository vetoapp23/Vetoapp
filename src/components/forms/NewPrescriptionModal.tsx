import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Pill, Plus, Trash2, Calendar, User, Heart, Package, AlertTriangle, CheckCircle, ChevronDown, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useClients, Prescription, PrescriptionMedication, StockItem } from "@/contexts/ClientContext";
import { useSettings } from "@/contexts/SettingsContext";

interface NewPrescriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  petId: number;
  consultationId?: number;
}

function NewPrescriptionModal({ open, onOpenChange, petId, consultationId }: NewPrescriptionModalProps) {
  const { clients, pets, consultations, addPrescription, stockItems, updateStockItem } = useClients();
  const { toast } = useToast();
  const { settings } = useSettings();
  
  const [formData, setFormData] = useState({
    consultationId: consultationId || 0,
    clientId: 0,
    petId: petId,
    date: new Date().toISOString().split('T')[0],
    prescribedBy: settings.veterinarians.length > 0 ? settings.veterinarians[0].name : "",
    diagnosis: "",
    instructions: "",
    duration: "",
    followUpDate: "",
    notes: ""
  });

  const [medications, setMedications] = useState<Omit<PrescriptionMedication, 'id'>[]>([
    {
      name: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: "",
      quantity: 1,
      unit: "comprimés",
      refills: 0,
      cost: 0,
      isInStock: false,
      stockQuantity: 0,
      stockDeducted: false
    }
  ]);

  const [openPopovers, setOpenPopovers] = useState<{ [key: number]: boolean }>({});

  // Trouver le client et l'animal
  const pet = pets.find(p => p.id === petId);
  const client = pet ? clients.find(c => c.pets.some(p => p.id === petId)) : null;

  // Mettre à jour le clientId quand l'animal est trouvé
  useEffect(() => {
    if (pet && client) {
      setFormData(prev => ({ ...prev, clientId: client.id }));
    }
  }, [pet, client]);

  // Médicaments et suppléments disponibles en stock
  const availableMedications = stockItems.filter(item => 
    (item.category === 'medication' || item.category === 'supplement') && (item.currentStock || 0) > 0
  );

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMedicationChange = (index: number, field: string, value: string | number | boolean) => {
    const updatedMedications = [...medications];
    
    // Gestion simple des valeurs
    if (field === 'quantity' || field === 'refills' || field === 'cost') {
      const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
      updatedMedications[index] = {
        ...updatedMedications[index],
        [field]: numValue
      };
    } else if (field === 'stockDeducted') {
      updatedMedications[index] = {
        ...updatedMedications[index],
        [field]: value as boolean
      };
    } else {
      updatedMedications[index] = {
        ...updatedMedications[index],
        [field]: value
      };
    }

    // Vérifier le stock si le nom change
    if (field === 'name') {
      const stockItem = availableMedications.find(item => item.name === value);
      if (stockItem) {
        updatedMedications[index] = {
          ...updatedMedications[index],
          isInStock: true,
          stockQuantity: stockItem.currentStock || 0,
          cost: stockItem.sellingPrice || 0,
          stockDeducted: true // Marquer automatiquement comme déduit du stock
        };
      } else {
    updatedMedications[index] = {
      ...updatedMedications[index],
          isInStock: false,
          stockQuantity: 0,
          stockDeducted: false
    };
      }
    }

    setMedications(updatedMedications);
  };

  const addMedication = () => {
    setMedications([...medications, {
      name: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: "",
      quantity: 1,
      unit: "comprimés",
      refills: 0,
      cost: 0,
      isInStock: false,
      stockQuantity: 0,
      stockDeducted: false
    }]);
  };

  const removeMedication = (index: number) => {
    if (medications.length > 1) {
      setMedications(medications.filter((_, i) => i !== index));
    }
  };

  const selectMedicationFromStock = (index: number, stockItem: StockItem) => {
    handleMedicationChange(index, 'name', stockItem.name);
    setOpenPopovers(prev => ({ ...prev, [index]: false }));
  };

  const getDosageSuggestions = (medicationName: string): string[] => {
    const name = medicationName.toLowerCase();
    
    // Suggestions basées sur le type de médicament
    if (name.includes('vitamine') || name.includes('vitamin')) {
      return ['1 comprimé', '2 comprimés', '1ml', '2ml', '1 goutte', '2 gouttes'];
    }
    if (name.includes('antibiotique') || name.includes('antibiotic')) {
      return ['50mg', '100mg', '250mg', '500mg', '1 comprimé', '2 comprimés'];
    }
    if (name.includes('anti-inflammatoire') || name.includes('anti-inflammatory')) {
      return ['25mg', '50mg', '100mg', '1 comprimé', '2 comprimés', '1ml'];
    }
    if (name.includes('vermifuge') || name.includes('dewormer')) {
      return ['1 comprimé', '2 comprimés', '1ml', '2ml', '1 pipette'];
    }
    if (name.includes('pommade') || name.includes('cream') || name.includes('gel')) {
      return ['Fine couche', 'Couche mince', '1 application', '2 applications'];
    }
    if (name.includes('sirop') || name.includes('syrup')) {
      return ['1ml', '2ml', '5ml', '1 cuillère', '2 cuillères'];
    }
    if (name.includes('goutte') || name.includes('drop')) {
      return ['1 goutte', '2 gouttes', '3 gouttes', '4 gouttes', '5 gouttes'];
    }
    if (name.includes('injection') || name.includes('injectable')) {
      return ['0.1ml', '0.2ml', '0.5ml', '1ml', '2ml'];
    }
    
    // Suggestions génériques
    return ['1 comprimé', '2 comprimés', '1ml', '2ml', '50mg', '100mg', '250mg', '500mg'];
  };

  const enableManualEntry = (index: number) => {
    const updatedMedications = [...medications];
    updatedMedications[index] = {
      ...updatedMedications[index],
      name: "",
      isInStock: false,
      stockQuantity: 0
    };
    setMedications(updatedMedications);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation de base
    if (!formData.diagnosis.trim()) {
      toast({
        title: "Erreur",
        description: "Le diagnostic est obligatoire.",
        variant: "destructive"
      });
      return;
    }

    // Valider que tous les médicaments ont un nom
    const validMedications = medications.filter(med => med.name.trim() !== "");
    if (validMedications.length === 0) {
      toast({
        title: "Erreur",
        description: "Au moins un médicament doit être spécifié.",
        variant: "destructive"
      });
      return;
    }

    // Ajouter des IDs aux médicaments
    const medicationsWithIds: PrescriptionMedication[] = validMedications.map((med, index) => ({
      ...med,
      id: index + 1
    }));

    const prescriptionData: Omit<Prescription, 'id' | 'createdAt'> = {
      ...formData,
      clientName: client?.name || '',
      petName: pet?.name || '',
      status: 'active',
      medications: medicationsWithIds
    };

    try {
      // 1. Créer la prescription
      addPrescription(prescriptionData);

      // 2. Déduire le stock pour chaque médicament
      let totalCost = 0;
      for (const medication of validMedications) {
        if (medication.isInStock && medication.stockDeducted) {
          // Trouver l'item en stock
          const stockItem = stockItems.find(item => item.name === medication.name);
          if (stockItem) {
            // Déduire la quantité du stock
            const newStock = Math.max(0, (stockItem.currentStock || 0) - medication.quantity);
            updateStockItem(stockItem.id, {
              ...stockItem,
              currentStock: newStock
            });

            // Calculer le coût total pour l'affichage
            const medicationCost = medication.cost * medication.quantity;
            totalCost += medicationCost;
          }
        }
      }
    
    toast({
      title: "Prescription créée",
        description: `La prescription a été créée avec succès.${totalCost > 0 ? ` Coût total: ${totalCost} ${settings.currency}` : ''}`,
    });
    onOpenChange(false);
      
      // Réinitialiser le formulaire
      setFormData({
        consultationId: consultationId || 0,
        clientId: 0,
        petId: petId,
        date: new Date().toISOString().split('T')[0],
        prescribedBy: settings.veterinarians.length > 0 ? settings.veterinarians[0].name : "",
        diagnosis: "",
        instructions: "",
        duration: "",
        followUpDate: "",
        notes: ""
      });
      setMedications([{
        name: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
        quantity: 1,
        unit: "comprimés",
        refills: 0,
        cost: 0,
        isInStock: false,
        stockQuantity: 0,
        stockDeducted: false
      }]);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de la prescription.",
        variant: "destructive"
      });
    }
  };

  if (!pet || !client) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Nouvelle Prescription
          </DialogTitle>
          <DialogDescription>
            Prescription pour {pet.name} - {client.name}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date de prescription *</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => handleFormChange('date', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Prescrit par *</Label>
              <Select
                value={formData.prescribedBy}
                onValueChange={(value) => handleFormChange('prescribedBy', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un vétérinaire" />
                </SelectTrigger>
                <SelectContent>
                  {settings.veterinarians.length > 0 ? (
                    settings.veterinarians.map((vet) => (
                      <SelectItem key={vet.id} value={vet.name}>
                        {vet.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      Aucun vétérinaire configuré
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Diagnostic *</Label>
            <Textarea
              value={formData.diagnosis}
              onChange={(e) => handleFormChange('diagnosis', e.target.value)}
              placeholder="Diagnostic de l'animal"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Instructions générales</Label>
              <Textarea
                value={formData.instructions}
                onChange={(e) => handleFormChange('instructions', e.target.value)}
                placeholder="Instructions générales pour le propriétaire"
              />
            </div>
            <div className="space-y-2">
              <Label>Durée du traitement</Label>
              <Input
                value={formData.duration}
                onChange={(e) => handleFormChange('duration', e.target.value)}
                placeholder="ex: 7 jours, 2 semaines..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date de suivi</Label>
              <Input
                type="date"
                value={formData.followUpDate}
                onChange={(e) => handleFormChange('followUpDate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input
                value={formData.notes}
                onChange={(e) => handleFormChange('notes', e.target.value)}
                placeholder="Notes supplémentaires"
              />
            </div>
          </div>

          {/* Médicaments */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Médicaments</h3>
              <Button type="button" onClick={addMedication} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un médicament
              </Button>
            </div>

              {medications.map((medication, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">Médicament {index + 1}</h4>
                    {medication.name && (
                      <div className="flex items-center gap-1">
                        {medication.isInStock ? (
                          <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            En stock ({medication.stockQuantity})
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="bg-orange-100 text-orange-800 border-orange-200">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Non disponible en stock
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                    {medications.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeMedication(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                    <div className="space-y-2">
                      <Label>Nom du médicament *</Label>
                  <div className="space-y-2">
                    {/* Champ de saisie principal */}
                      <Input
                        value={medication.name}
                        onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                      placeholder="Nom du médicament"
                        required
                      />
                    
                    {/* Options de sélection depuis le stock */}
                    {availableMedications.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Ou sélectionner depuis le stock :</p>
                        <div className="flex flex-wrap gap-2">
                          {availableMedications.slice(0, 5).map((stockItem) => (
                            <Button
                              key={stockItem.id}
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => selectMedicationFromStock(index, stockItem)}
                              className="text-xs"
                            >
                              {stockItem.name}
                              <Badge variant="secondary" className="ml-1 text-xs">
                                {stockItem.currentStock || 0}
                              </Badge>
                            </Button>
                          ))}
                          {availableMedications.length > 5 && (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="text-xs"
                                >
                                  +{availableMedications.length - 5} autres
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-80 p-0">
                                <Command>
                                  <CommandInput placeholder="Rechercher un médicament..." />
                                  <CommandList>
                                    <CommandEmpty>Aucun médicament trouvé.</CommandEmpty>
                                    <CommandGroup>
                                      {availableMedications.slice(5).map((stockItem) => (
                                        <CommandItem
                                          key={stockItem.id}
                                          value={stockItem.name}
                                          onSelect={() => selectMedicationFromStock(index, stockItem)}
                                        >
                                          <div className="flex items-center justify-between w-full">
                                            <span>{stockItem.name}</span>
                                            <Badge variant="outline" className="ml-2">
                                              Stock: {stockItem.currentStock || 0}
                                            </Badge>
                                          </div>
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                    </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Dosage *</Label>
                    <div className="space-y-2">
                      <Input
                        value={medication.dosage}
                        onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                        placeholder="ex: 50mg, 100mg, 1 comprimé..."
                        required
                      />
                      {medication.name && (
                        <div className="text-xs text-muted-foreground">
                          <p className="font-medium">Suggestions de dosage :</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {getDosageSuggestions(medication.name).map((suggestion, idx) => (
                              <Button
                                key={idx}
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-6 text-xs px-2"
                                onClick={() => handleMedicationChange(index, 'dosage', suggestion)}
                              >
                                {suggestion}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Fréquence *</Label>
                    <div className="space-y-2">
                      <Input
                        value={medication.frequency}
                        onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                        placeholder="ex: 2x/jour, 3x/jour..."
                        required
                      />
                      <div className="text-xs text-muted-foreground">
                        <p className="font-medium">Suggestions de fréquence :</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {['1x/jour', '2x/jour', '3x/jour', '1x/12h', '1x/8h', 'Au besoin'].map((freq) => (
                            <Button
                              key={freq}
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-6 text-xs px-2"
                              onClick={() => handleMedicationChange(index, 'frequency', freq)}
                            >
                              {freq}
                            </Button>
                          ))}
                        </div>
                    </div>
                    </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Quantité</Label>
                      <Input
                        type="number"
                        value={medication.quantity}
                      onChange={(e) => handleMedicationChange(index, 'quantity', e.target.value)}
                        min="1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Unité</Label>
                      <Select 
                        value={medication.unit} 
                        onValueChange={(value) => handleMedicationChange(index, 'unit', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="comprimés">Comprimés</SelectItem>
                          <SelectItem value="ml">ml</SelectItem>
                          <SelectItem value="g">g</SelectItem>
                          <SelectItem value="mg">mg</SelectItem>
                          <SelectItem value="ampoules">Ampoules</SelectItem>
                          <SelectItem value="flacons">Flacons</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                    <Label>Coût unitaire ({settings.currency})</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={medication.cost}
                      onChange={(e) => handleMedicationChange(index, 'cost', e.target.value)}
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Instructions spécifiques</Label>
                      <Input
                        value={medication.instructions}
                        onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)}
                        placeholder="ex: Donner avec de la nourriture..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Renouvellements</Label>
                      <Input
                        type="number"
                        value={medication.refills}
                      onChange={(e) => handleMedicationChange(index, 'refills', e.target.value)}
                        min="0"
                        placeholder="0"
                      />
                    </div>
            </div>

                {/* Option pour déduire du stock */}
                {medication.isInStock && (
                  <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
                    <input
                      type="checkbox"
                      id={`stock-deduct-${index}`}
                      checked={medication.stockDeducted}
                      onChange={(e) => handleMedicationChange(index, 'stockDeducted', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor={`stock-deduct-${index}`} className="text-sm">
                      Déduire {medication.quantity} {medication.unit} du stock
                    </Label>
                    {medication.stockDeducted && (
                      <Badge variant="default" className="ml-2">
                        Stock: {medication.stockQuantity - medication.quantity}
              </Badge>
                    )}
            </div>
                )}
          </div>
            ))}
          </div>
          
          {/* Boutons d'action */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">
              Créer la prescription
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { NewPrescriptionModal };
export default NewPrescriptionModal;