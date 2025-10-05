import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, User, Heart, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useClients, useAnimals, useCreateAppointment, type Client, type Animal } from "@/hooks/useDatabase";
import { useAppointmentTypes } from '@/hooks/useAppSettings';

interface SimpleAppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SimpleAppointmentModal({ 
  open, 
  onOpenChange
}: SimpleAppointmentModalProps) {
  const { data: clients = [] } = useClients();
  const { data: animals = [] } = useAnimals();
  const createAppointment = useCreateAppointment();
  const { toast } = useToast();
  
  // Dynamic settings
  const { data: appointmentTypes = [], isLoading: typesLoading } = useAppointmentTypes();
  
  const [formData, setFormData] = useState({
    clientId: "",
    animalId: "",
    date: "",
    time: "",
    appointmentType: "consultation",
    notes: ""
  });

  const [availableAnimals, setAvailableAnimals] = useState<Animal[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientId || !formData.animalId || !formData.date || !formData.time) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create appointment date from date and time
      const appointmentDateTime = new Date(`${formData.date}T${formData.time}:00`);

      await createAppointment.mutateAsync({
        client_id: formData.clientId,
        animal_id: formData.animalId,
        appointment_date: appointmentDateTime.toISOString(),
        appointment_type: formData.appointmentType as "consultation" | "vaccination" | "surgery" | "follow-up",
        notes: formData.notes || undefined,
        duration_minutes: 30
      });

      toast({
        title: "Succès",
        description: "Rendez-vous créé avec succès",
      });

      // Reset form and close modal
      setFormData({
        clientId: "",
        animalId: "",
        date: "",
        time: "",
        appointmentType: "consultation",
        notes: ""
      });
      setAvailableAnimals([]);
      onOpenChange(false);

    } catch (error) {
      console.error('Error creating appointment:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le rendez-vous",
        variant: "destructive",
      });
    }
  };

  const handleClientChange = (clientId: string) => {
    setFormData(prev => ({ ...prev, clientId, animalId: "" }));
    
    // Filter animals for selected client
    const clientAnimals = animals.filter(animal => animal.client_id === clientId);
    setAvailableAnimals(clientAnimals);
  };

  const getClientName = (client: Client) => {
    return `${client.first_name} ${client.last_name}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Nouveau Rendez-vous
          </DialogTitle>
          <DialogDescription>
            Créer un nouveau rendez-vous pour un client et son animal
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Client Selection */}
          <div className="space-y-2">
            <Label htmlFor="client">Client *</Label>
            <Select value={formData.clientId} onValueChange={handleClientChange}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map(client => (
                  <SelectItem key={client.id} value={client.id}>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {getClientName(client)}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Animal Selection */}
          <div className="space-y-2">
            <Label htmlFor="animal">Animal *</Label>
            <Select 
              value={formData.animalId} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, animalId: value }))}
              disabled={!formData.clientId}
            >
              <SelectTrigger>
                <SelectValue placeholder={formData.clientId ? "Sélectionner un animal" : "Sélectionner d'abord un client"} />
              </SelectTrigger>
              <SelectContent>
                {availableAnimals.map(animal => (
                  <SelectItem key={animal.id} value={animal.id}>
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      {animal.name} ({animal.species})
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Heure *</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
              />
            </div>
          </div>

          {/* Appointment Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Type de rendez-vous</Label>
            <Select 
              value={formData.appointmentType} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, appointmentType: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {appointmentTypes.map((type) => (
                  <SelectItem key={type} value={type.toLowerCase().replace(/\s+/g, '-')}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              placeholder="Notes additionnelles sur le rendez-vous..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={createAppointment.isPending}
            >
              {createAppointment.isPending ? "Création..." : "Créer le rendez-vous"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
