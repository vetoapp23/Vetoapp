import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useClients, useAnimals, useUpdateConsultation, type Consultation } from "@/hooks/useDatabase";
import type { CreateConsultationData } from "@/lib/database";
import { useSettings } from "@/contexts/SettingsContext";

interface ConsultationEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  consultation: Consultation | null;
}

export function ConsultationEditModalNew({ open, onOpenChange, consultation }: ConsultationEditModalProps) {
  const { data: clients = [] } = useClients();
  const { data: animals = [] } = useAnimals();
  const updateConsultationMutation = useUpdateConsultation();
  const { toast } = useToast();
  const { settings } = useSettings();
  
  const [formData, setFormData] = useState({
    client_id: "",
    animal_id: "",
    consultation_date: "",
    consultation_type: "routine",
    weight: "",
    temperature: "",
    symptoms: "",
    diagnosis: "",
    treatment: "",
    notes: "",
    cost: "",
    follow_up_date: "",
    follow_up_notes: "",
    status: "completed"
  });

  // Filtrer les animaux selon le client sélectionné
  const availablePets = animals.filter(animal => animal.client_id === formData.client_id);

  useEffect(() => {
    if (consultation && open) {
      setFormData({
        client_id: consultation.client_id || "",
        animal_id: consultation.animal_id || "",
        consultation_date: consultation.consultation_date ? consultation.consultation_date.split('T')[0] : "",
        consultation_type: consultation.consultation_type || "routine",
        weight: consultation.weight?.toString() || "",
        temperature: consultation.temperature?.toString() || "",
        symptoms: consultation.symptoms || "",
        diagnosis: consultation.diagnosis || "",
        treatment: consultation.treatment || "",
        notes: consultation.notes || "",
        cost: consultation.cost?.toString() || "",
        follow_up_date: consultation.follow_up_date || "",
        follow_up_notes: consultation.follow_up_notes || "",
        status: consultation.status || "completed"
      });
    }
  }, [consultation, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // When client changes, reset animal selection
    if (field === 'client_id') {
      setFormData(prev => ({
        ...prev,
        animal_id: ""
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!consultation) return;

    // Validation basique
    if (!formData.client_id || !formData.animal_id) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un client et un animal.",
        variant: "destructive",
      });
      return;
    }

    try {
      const updateData: Partial<CreateConsultationData> = {
        client_id: formData.client_id,
        animal_id: formData.animal_id,
        consultation_date: formData.consultation_date + 'T00:00:00.000Z',
        consultation_type: formData.consultation_type,
        symptoms: formData.symptoms || undefined,
        diagnosis: formData.diagnosis || undefined,
        treatment: formData.treatment || undefined,
        notes: formData.notes || undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        temperature: formData.temperature ? parseFloat(formData.temperature) : undefined,
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
        follow_up_date: formData.follow_up_date || null,
        follow_up_notes: formData.follow_up_notes || undefined,
        status: formData.status as "scheduled" | "in-progress" | "completed" | "cancelled"
      };

      await updateConsultationMutation.mutateAsync({ 
        id: consultation.id, 
        data: updateData 
      });

      toast({
        title: "Consultation modifiée",
        description: "La consultation a été modifiée avec succès.",
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error updating consultation:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la modification de la consultation.",
        variant: "destructive",
      });
    }
  };

  const selectedClient = clients.find(client => client.id === formData.client_id);
  const selectedAnimal = animals.find(animal => animal.id === formData.animal_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier la consultation</DialogTitle>
          <DialogDescription>
            Modifiez les informations de la consultation
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client_id">Client *</Label>
              <Select value={formData.client_id} onValueChange={(value) => handleSelectChange('client_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.first_name} {client.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="animal_id">Animal *</Label>
              <Select value={formData.animal_id} onValueChange={(value) => handleSelectChange('animal_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un animal" />
                </SelectTrigger>
                <SelectContent>
                  {availablePets.map((animal) => (
                    <SelectItem key={animal.id} value={animal.id}>
                      {animal.name} ({animal.species})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="consultation_date">Date de consultation *</Label>
              <Input
                id="consultation_date"
                type="date"
                value={formData.consultation_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="consultation_type">Type de consultation</Label>
              <Select value={formData.consultation_type} onValueChange={(value) => handleSelectChange('consultation_type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="routine">Routine</SelectItem>
                  <SelectItem value="emergency">Urgence</SelectItem>
                  <SelectItem value="follow-up">Suivi</SelectItem>
                  <SelectItem value="vaccination">Vaccination</SelectItem>
                  <SelectItem value="surgery">Chirurgie</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Poids (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder="Ex: 5.2"
                value={formData.weight}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="temperature">Température (°C)</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                placeholder="Ex: 38.5"
                value={formData.temperature}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="symptoms">Symptômes</Label>
            <Textarea
              id="symptoms"
              placeholder="Décrivez les symptômes observés..."
              value={formData.symptoms}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="diagnosis">Diagnostic</Label>
            <Textarea
              id="diagnosis"
              placeholder="Diagnostic posé..."
              value={formData.diagnosis}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="treatment">Traitement</Label>
            <Textarea
              id="treatment"
              placeholder="Traitement prescrit..."
              value={formData.treatment}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost">Coût ({settings.currency})</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.cost}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="follow_up_date">Date de suivi</Label>
              <Input
                id="follow_up_date"
                type="date"
                value={formData.follow_up_date}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="follow_up_notes">Notes de suivi</Label>
            <Textarea
              id="follow_up_notes"
              placeholder="Notes pour le suivi..."
              value={formData.follow_up_notes}
              onChange={handleChange}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes supplémentaires</Label>
            <Textarea
              id="notes"
              placeholder="Notes supplémentaires..."
              value={formData.notes}
              onChange={handleChange}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Statut</Label>
            <Select value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Programmé</SelectItem>
                <SelectItem value="in-progress">En cours</SelectItem>
                <SelectItem value="completed">Terminé</SelectItem>
                <SelectItem value="cancelled">Annulé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={updateConsultationMutation.isPending}>
              {updateConsultationMutation.isPending ? "Modification..." : "Modifier"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}