import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, User, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useClients, useAnimals, useCreateAppointment, type CreateAppointmentData } from "@/hooks/useDatabase";

interface SimpleAppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SimpleAppointmentModal({ open, onOpenChange }: SimpleAppointmentModalProps) {
  const { data: clients = [] } = useClients();
  const { data: animals = [] } = useAnimals();
  const createAppointmentMutation = useCreateAppointment();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<CreateAppointmentData>({
    client_id: "",
    animal_id: "",
    appointment_date: "",
    duration_minutes: 30,
    appointment_type: "consultation",
    notes: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.client_id || !formData.appointment_date) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
      return;
    }

    // Combine date and time into a proper datetime string
    const appointmentDateTime = new Date(formData.appointment_date).toISOString();
    
    createAppointmentMutation.mutate({
      ...formData,
      appointment_date: appointmentDateTime
    }, {
      onSuccess: () => {
        toast({
          title: "Rendez-vous créé",
          description: "Le rendez-vous a été créé avec succès.",
        });
        onOpenChange(false);
        // Reset form
        setFormData({
          client_id: "",
          animal_id: "",
          appointment_date: "",
          duration_minutes: 30,
          appointment_type: "consultation",
          notes: ""
        });
      },
      onError: (error) => {
        toast({
          title: "Erreur",
          description: `Impossible de créer le rendez-vous: ${error.message}`,
          variant: "destructive"
        });
      }
    });
  };

  // Filter animals by selected client
  const clientAnimals = formData.client_id 
    ? animals.filter(animal => animal.client_id === formData.client_id)
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Nouveau rendez-vous
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client">Client *</Label>
            <Select 
              value={formData.client_id} 
              onValueChange={(value) => setFormData(prev => ({ 
                ...prev, 
                client_id: value,
                animal_id: "" // Reset animal selection when client changes
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {client.first_name} {client.last_name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.client_id && (
            <div className="space-y-2">
              <Label htmlFor="animal">Animal</Label>
              <Select 
                value={formData.animal_id || ""} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, animal_id: value || undefined }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un animal (optionnel)" />
                </SelectTrigger>
                <SelectContent>
                  {clientAnimals.map((animal) => (
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
          )}

          <div className="space-y-2">
            <Label htmlFor="appointment_date">Date et heure *</Label>
            <Input
              id="appointment_date"
              type="datetime-local"
              value={formData.appointment_date}
              onChange={(e) => setFormData(prev => ({ ...prev, appointment_date: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="appointment_type">Type de consultation</Label>
            <Select 
              value={formData.appointment_type} 
              onValueChange={(value) => setFormData(prev => ({ 
                ...prev, 
                appointment_type: value as CreateAppointmentData['appointment_type']
              }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="consultation">Consultation</SelectItem>
                <SelectItem value="vaccination">Vaccination</SelectItem>
                <SelectItem value="surgery">Chirurgie</SelectItem>
                <SelectItem value="follow-up">Suivi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Durée (minutes)</Label>
            <Select 
              value={formData.duration_minutes?.toString() || "30"} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, duration_minutes: parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">1 heure</SelectItem>
                <SelectItem value="90">1h30</SelectItem>
                <SelectItem value="120">2 heures</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Notes sur le rendez-vous..."
              value={formData.notes || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={createAppointmentMutation.isPending || !formData.client_id || !formData.appointment_date}
            >
              {createAppointmentMutation.isPending ? "Création..." : "Créer le rendez-vous"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
