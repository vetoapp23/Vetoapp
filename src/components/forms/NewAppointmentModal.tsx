import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, User, Heart, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useClients, useAnimals, useCreateAppointment, type Client, type Animal } from "@/hooks/useDatabase";
import { useAppointmentTypes } from '@/hooks/useAppSettings';

interface NewAppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefillClientId?: string;
  prefillPetId?: string;
  prefillType?: string;
  prefillReason?: string;
  originalVaccinationId?: string;
}

export function NewAppointmentModal({ 
  open, 
  onOpenChange,
  prefillClientId,
  prefillPetId,
  prefillType,
  prefillReason
}: NewAppointmentModalProps) {
  const { data: clients = [] } = useClients();
  const { data: animals = [] } = useAnimals();
  const createAppointment = useCreateAppointment();
  const { toast } = useToast();
  
  // Dynamic settings
  const { data: appointmentTypes = [], isLoading: typesLoading } = useAppointmentTypes();
  
  const [formData, setFormData] = useState({
    clientId: prefillClientId || "",
    animalId: prefillPetId || "",
    date: "",
    time: "",
    appointmentType: prefillType || "consultation",
    notes: prefillReason || ""
  });

  const [availableAnimals, setAvailableAnimals] = useState<Animal[]>([]);

  // Initialize available animals when modal opens with prefilled client
  useEffect(() => {
    if (prefillClientId && open) {
      const clientAnimals = animals.filter(animal => animal.client_id === prefillClientId);
      setAvailableAnimals(clientAnimals);
    }
  }, [prefillClientId, open, animals]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.clientId) {
      toast({
        title: "Client manquant",
        description: "Veuillez sélectionner le propriétaire de l'animal.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.animalId) {
      toast({
        title: "Animal manquant",
        description: "Veuillez sélectionner l'animal pour ce rendez-vous.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.date) {
      toast({
        title: "Date manquante",
        description: "Veuillez choisir une date pour le rendez-vous.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.time) {
      toast({
        title: "Heure manquante",
        description: "Veuillez choisir une heure pour le rendez-vous.",
        variant: "destructive",
      });
      return;
    }

    // Validate date is not in the past
    const appointmentDateTime = new Date(`${formData.date}T${formData.time}:00`);
    const now = new Date();
    
    if (appointmentDateTime < now) {
      toast({
        title: "Date invalide",
        description: "Vous ne pouvez pas créer un rendez-vous dans le passé. Veuillez choisir une date future.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createAppointment.mutateAsync({
        client_id: formData.clientId,
        animal_id: formData.animalId,
        appointment_date: appointmentDateTime.toISOString(),
        appointment_type: formData.appointmentType as "consultation" | "vaccination" | "surgery" | "follow-up",
        notes: formData.notes || undefined,
        duration_minutes: 30
      });

      toast({
        title: "✓ Rendez-vous créé",
        description: `Le rendez-vous a été enregistré pour le ${new Date(appointmentDateTime).toLocaleDateString('fr-FR')} à ${formData.time}.`,
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

    } catch (error: any) {
      console.error('Error creating appointment:', error);
      
      let errorMessage = "Une erreur inattendue s'est produite. Veuillez réessayer.";
      
      if (error?.message) {
        const errorMsg = error.message.toLowerCase();
        
        if (errorMsg.includes('duplicate') || errorMsg.includes('conflict')) {
          errorMessage = "Un rendez-vous existe déjà à cette date et heure. Veuillez choisir un autre créneau.";
        } else if (errorMsg.includes('client') || errorMsg.includes('animal')) {
          errorMessage = "Le client ou l'animal sélectionné n'est pas valide. Veuillez rafraîchir la page.";
        } else if (errorMsg.includes('network') || errorMsg.includes('fetch')) {
          errorMessage = "Problème de connexion. Vérifiez votre connexion internet et réessayez.";
        } else if (errorMsg.includes('permission') || errorMsg.includes('authorized')) {
          errorMessage = "Vous n'avez pas les permissions nécessaires pour créer un rendez-vous.";
        } else if (error.message.length < 100) {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "⚠ Impossible de créer le rendez-vous",
        description: errorMessage,
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

  const getAnimalName = (animal: Animal) => {
    return `${animal.name} (${animal.species})`;
  };

  // Set default date to today
  const getDefaultDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Set default time to next hour
  const getDefaultTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1, 0, 0, 0);
    return now.toTimeString().slice(0, 5);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Nouveau Rendez-vous
          </DialogTitle>
          <DialogDescription>
            Planifiez un nouveau rendez-vous pour un animal
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="client" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Client *
              </Label>
              <Select 
                value={formData.clientId} 
                onValueChange={handleClientChange}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {getClientName(client)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="animal" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Animal *
              </Label>
              <Select 
                value={formData.animalId} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, animalId: value }))}
                disabled={!formData.clientId}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un animal" />
                </SelectTrigger>
                <SelectContent>
                  {availableAnimals.map((animal) => (
                    <SelectItem key={animal.id} value={animal.id}>
                      {getAnimalName(animal)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!formData.clientId && (
                <p className="text-sm text-muted-foreground">
                  Sélectionnez d'abord un client
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date *
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date || getDefaultDate()}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Heure *
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time || getDefaultTime()}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="appointmentType">Type de rendez-vous</Label>
              <Select 
                value={formData.appointmentType} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, appointmentType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Type de rendez-vous" />
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
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={createAppointment.isPending}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={createAppointment.isPending}
              className="gap-2"
            >
              {createAppointment.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4" />
                  Créer le rendez-vous
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
