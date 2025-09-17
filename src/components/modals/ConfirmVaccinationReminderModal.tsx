import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useClients } from '@/contexts/ClientContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface ConfirmVaccinationReminderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vaccination: any;
}

export function ConfirmVaccinationReminderModal({ 
  open, 
  onOpenChange, 
  vaccination 
}: ConfirmVaccinationReminderModalProps) {
  const { confirmVaccinationReminder, calculateDueDateFromProtocol } = useClients();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    datePerformed: format(new Date(), 'yyyy-MM-dd'),
    veterinarian: '',
    batchNumber: '',
    notes: '',
    newNextDueDate: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.veterinarian) {
      toast({
        title: "Erreur",
        description: "Le nom du vétérinaire est requis",
        variant: "destructive"
      });
      return;
    }

    // Calculer la nouvelle date de rappel si pas fournie
    let newNextDueDate = formData.newNextDueDate;
    if (!newNextDueDate && vaccination) {
      const calculatedDate = calculateDueDateFromProtocol(
        vaccination.vaccineName,
        'chien', // TODO: récupérer l'espèce du pet
        formData.datePerformed
      );
      newNextDueDate = calculatedDate || '';
    }

    const result = confirmVaccinationReminder(vaccination.id, {
      datePerformed: formData.datePerformed,
      veterinarian: formData.veterinarian,
      batchNumber: formData.batchNumber,
      notes: formData.notes,
      newNextDueDate: newNextDueDate
    });

    if (result) {
      toast({
        title: "Rappel confirmé",
        description: `Le rappel de ${vaccination.vaccineName} a été confirmé et enregistré`,
      });
      
      // Reset form
      setFormData({
        datePerformed: format(new Date(), 'yyyy-MM-dd'),
        veterinarian: '',
        batchNumber: '',
        notes: '',
        newNextDueDate: ''
      });
      
      onOpenChange(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (!vaccination) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Confirmer le rappel de vaccination</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-muted/50 p-3 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Vaccination à confirmer :</h4>
            <p className="text-sm text-muted-foreground">
              <strong>{vaccination.vaccineName}</strong> pour {vaccination.petName}
            </p>
            <p className="text-sm text-muted-foreground">
              Rappel prévu le : {new Date(vaccination.nextDueDate).toLocaleDateString('fr-FR')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="datePerformed">Date d'administration *</Label>
                <Input
                  id="datePerformed"
                  name="datePerformed"
                  type="date"
                  value={formData.datePerformed}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="veterinarian">Vétérinaire *</Label>
                <Input
                  id="veterinarian"
                  name="veterinarian"
                  value={formData.veterinarian}
                  onChange={handleChange}
                  placeholder="Nom du vétérinaire"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="batchNumber">Numéro de lot</Label>
              <Input
                id="batchNumber"
                name="batchNumber"
                value={formData.batchNumber}
                onChange={handleChange}
                placeholder="Numéro de lot du vaccin"
              />
            </div>

            <div>
              <Label htmlFor="newNextDueDate">Nouvelle date de rappel</Label>
              <Input
                id="newNextDueDate"
                name="newNextDueDate"
                type="date"
                value={formData.newNextDueDate}
                onChange={handleChange}
                placeholder="Date du prochain rappel"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Laissez vide pour utiliser la date calculée selon le protocole
              </p>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Notes sur l'administration du vaccin"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit">
                Confirmer le rappel
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
