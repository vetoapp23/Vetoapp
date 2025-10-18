import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useVaccinationTypes } from '@/hooks/useAppSettings';
import { Plus, Syringe } from 'lucide-react';
import { format } from 'date-fns';
import { 
  useAnimals, 
  useClients, 
  useCreateVaccination,
  useVaccinationProtocolsBySpecies
} from '@/hooks/useDatabase';

interface NewVaccinationModalProps {
  children?: React.ReactNode;
  selectedAnimalId?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function NewVaccinationModal({ 
  children, 
  selectedAnimalId,
  open,
  onOpenChange
}: NewVaccinationModalProps) {
  const { data: animals = [] } = useAnimals();
  const { data: clients = [] } = useClients();
  const createVaccinationMutation = useCreateVaccination();
  const { toast } = useToast();
  
  // Dynamic settings
  const { data: vaccinationTypes = [], isLoading: typesLoading } = useVaccinationTypes();
  
  const [internalOpen, setInternalOpen] = useState(false);
  const modalOpen = open !== undefined ? open : internalOpen;
  const setModalOpen = onOpenChange || setInternalOpen;

  // Form state
  const [formData, setFormData] = useState({
    animalId: selectedAnimalId || '',
    vaccineName: '',
    vaccineType: '',
    manufacturer: '',
    batchNumber: '',
    vaccinationDate: format(new Date(), 'yyyy-MM-dd'),
    nextDueDate: '',
    administeredBy: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation with specific messages
    if (!formData.animalId) {
      toast({
        title: "Animal manquant",
        description: "Veuillez sélectionner l'animal à vacciner.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.vaccineName?.trim()) {
      toast({
        title: "Nom du vaccin manquant",
        description: "Veuillez indiquer le nom du vaccin administré.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.vaccinationDate) {
      toast({
        title: "Date manquante",
        description: "Veuillez indiquer la date de vaccination.",
        variant: "destructive"
      });
      return;
    }

    // Validate UUID format for animal_id
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(formData.animalId)) {
      toast({
        title: "Erreur système",
        description: "L'animal sélectionné n'est pas valide. Veuillez rafraîchir la page.",
        variant: "destructive"
      });
      return;
    }

    // Validate date is not too far in the future
    const vaccinationDate = new Date(formData.vaccinationDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (vaccinationDate > today) {
      const oneMonthFromNow = new Date();
      oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
      
      if (vaccinationDate > oneMonthFromNow) {
        toast({
          title: "Date invalide",
          description: "La date de vaccination ne peut pas être plus d'un mois dans le futur.",
          variant: "destructive"
        });
        return;
      }
    }

    // Clean and validate the payload
    const payload = {
      animal_id: formData.animalId,
      vaccine_name: formData.vaccineName.trim(),
      vaccine_type: formData.vaccineType || undefined,
      manufacturer: formData.manufacturer?.trim() || undefined,
      batch_number: formData.batchNumber?.trim() || undefined,
      vaccination_date: formData.vaccinationDate,
      next_due_date: formData.nextDueDate || undefined,
      administered_by: formData.administeredBy?.trim() || undefined,
      notes: formData.notes?.trim() || undefined
    };

    try {
      await createVaccinationMutation.mutateAsync(payload);

      const selectedAnimal = animals.find(a => a.id === formData.animalId);
      const animalName = selectedAnimal?.name || "l'animal";

      toast({
        title: "✓ Vaccination enregistrée",
        description: `La vaccination de ${animalName} a été ajoutée avec succès.`
      });

      // Reset form
      setFormData({
        animalId: selectedAnimalId || '',
        vaccineName: '',
        vaccineType: '',
        manufacturer: '',
        batchNumber: '',
        vaccinationDate: format(new Date(), 'yyyy-MM-dd'),
        nextDueDate: '',
        administeredBy: '',
        notes: ''
      });

      setModalOpen(false);
    } catch (error: any) {
      console.error('Error creating vaccination:', error);
      
      let errorMessage = "Une erreur inattendue s'est produite. Veuillez réessayer.";
      
      if (error?.message) {
        const errorMsg = error.message.toLowerCase();
        
        if (errorMsg.includes('duplicate') || errorMsg.includes('unique')) {
          errorMessage = "Cette vaccination existe déjà pour cet animal à cette date.";
        } else if (errorMsg.includes('foreign key') || errorMsg.includes('animal')) {
          errorMessage = "L'animal sélectionné n'existe plus. Veuillez rafraîchir la page.";
        } else if (errorMsg.includes('network') || errorMsg.includes('fetch') || errorMsg.includes('connection')) {
          errorMessage = "Problème de connexion. Vérifiez votre connexion internet et réessayez.";
        } else if (errorMsg.includes('permission') || errorMsg.includes('authorized')) {
          errorMessage = "Vous n'avez pas les permissions nécessaires pour ajouter une vaccination.";
        } else if (errorMsg.includes('authentication')) {
          errorMessage = "Votre session a expiré. Veuillez vous reconnecter.";
        } else if (error.message.length < 100) {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "⚠ Impossible d'enregistrer la vaccination",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const selectedAnimal = animals.find(a => a.id === formData.animalId);
  const animalClient = selectedAnimal ? clients.find(c => c.id === selectedAnimal.client_id) : null;

  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nouvelle Vaccination
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Syringe className="h-5 w-5" />
            Nouvelle Vaccination
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Animal Selection */}
          <div className="space-y-2">
            <Label htmlFor="animal">Animal *</Label>
            <Select value={formData.animalId} onValueChange={(value) => setFormData({...formData, animalId: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un animal" />
              </SelectTrigger>
              <SelectContent>
                {animals.map(animal => {
                  const client = clients.find(c => c.id === animal.client_id);
                  return (
                    <SelectItem key={animal.id} value={animal.id}>
                      {animal.name} - {animal.species} ({client ? `${client.first_name} ${client.last_name}` : 'Client inconnu'})
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {selectedAnimal && animalClient && (
              <p className="text-sm text-gray-600">
                Propriétaire: {animalClient.first_name} {animalClient.last_name}
              </p>
            )}
          </div>

          {/* Vaccine Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vaccineName">Nom du vaccin *</Label>
              <Input
                id="vaccineName"
                value={formData.vaccineName}
                onChange={(e) => setFormData({...formData, vaccineName: e.target.value})}
                placeholder="ex: DHPP, Rage, FVRCP..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vaccineType">Type de vaccin</Label>
              <Select value={formData.vaccineType} onValueChange={(value) => setFormData({...formData, vaccineType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez le type" />
                </SelectTrigger>
                <SelectContent>
                  {vaccinationTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="manufacturer">Fabricant</Label>
              <Input
                id="manufacturer"
                value={formData.manufacturer}
                onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
                placeholder="ex: Zoetis, Virbac, Merial..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="batchNumber">Numéro de lot</Label>
              <Input
                id="batchNumber"
                value={formData.batchNumber}
                onChange={(e) => setFormData({...formData, batchNumber: e.target.value})}
                placeholder="Numéro de lot du vaccin"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vaccinationDate">Date de vaccination *</Label>
              <Input
                id="vaccinationDate"
                type="date"
                value={formData.vaccinationDate}
                onChange={(e) => setFormData({...formData, vaccinationDate: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nextDueDate">Prochain rappel</Label>
              <Input
                id="nextDueDate"
                type="date"
                value={formData.nextDueDate}
                onChange={(e) => setFormData({...formData, nextDueDate: e.target.value})}
                min={formData.vaccinationDate}
              />
            </div>
          </div>

          {/* Administered By */}
          {/* <div className="space-y-2">
            <Label htmlFor="administeredBy">Administré par</Label>
            <Input
              id="administeredBy"
              value={formData.administeredBy}
              onChange={(e) => setFormData({...formData, administeredBy: e.target.value})}
              placeholder="Nom du vétérinaire"
            />
          </div> */}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Notes complémentaires..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={createVaccinationMutation.isPending}>
              {createVaccinationMutation.isPending ? 'Ajout...' : 'Ajouter la vaccination'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}