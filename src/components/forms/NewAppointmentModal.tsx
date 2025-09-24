import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Heart, AlertCircle, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useClients, useAnimals, useCreateAppointment, useAppointments, type Client, type Animal } from "@/hooks/useDatabase";
import { useSettings } from "@/contexts/SettingsContext";
import { NewClientModal } from "@/components/forms/NewClientModal";
import { NewPetModal } from "@/components/forms/NewPetModal";
import { generateTimeSlots, isSlotAvailable } from "@/utils/scheduleUtils";

interface NewAppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Props pour pré-remplir le formulaire
  prefillClientId?: string;
  prefillPetId?: string;
  prefillType?: 'consultation' | 'vaccination' | 'chirurgie' | 'urgence' | 'controle' | 'sterilisation' | 'dentaire';
  prefillReason?: string;
  originalVaccinationId?: string; // ID du vaccin original pour les rappels
}

export function NewAppointmentModal({ 
  open, 
  onOpenChange, 
  prefillClientId, 
  prefillPetId, 
  prefillType, 
  prefillReason,
  originalVaccinationId,
}: NewAppointmentModalProps) {
  const { data: clients = [] } = useClients();
  const { data: animals = [] } = useAnimals();
  const { data: appointments = [] } = useAppointments();
  const createAppointment = useCreateAppointment();
  const { settings } = useSettings();
  const { toast } = useToast();
  
  const [showClientModal, setShowClientModal] = useState(false);
  const [showPetModal, setShowPetModal] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<{ time: string; isAvailable: boolean; isLunchBreak: boolean }[]>([]);
  
  const [formData, setFormData] = useState({
    clientId: "",
    petId: "",
    date: "",
    time: "",
    type: "" as 'consultation' | 'vaccination' | 'chirurgie' | 'urgence' | 'controle' | 'sterilisation' | 'dentaire',
    duration: 30,
    reason: "",
    notes: ""
  });

  const [availablePets, setAvailablePets] = useState<Animal[]>([]);
  const [conflicts, setConflicts] = useState<string[]>([]);

  // Réinitialiser le formulaire quand le modal s'ouvre
  useEffect(() => {
    if (open) {
      setFormData({
        clientId: prefillClientId || "",
        petId: prefillPetId || "",
        date: "",
        time: "",
        type: prefillType || "" as any,
        duration: 30,
        reason: prefillReason || "",
        notes: ""
      });
      setAvailablePets([]);
      setConflicts([]);
    }
  }, [open, prefillClientId, prefillPetId, prefillType, prefillReason]);

    // Helper function to get animals for a client
  const getAnimalsForClient = (clientId: string) => {
    return animals.filter(animal => animal.client_id === clientId);
  };

  // Gérer le pré-remplissage des animaux quand le modal s'ouvre
  useEffect(() => {
    if (open && prefillClientId && prefillPetId) {
      const petsForClient = getAnimalsForClient(prefillClientId);
      setAvailablePets(petsForClient);
      
      // Vérifier si l'animal spécifié appartient bien au client
      if (petsForClient.find(pet => pet.id === prefillPetId)) {
        setFormData(prev => ({ ...prev, petId: prefillPetId }));
      } else {
        setFormData(prev => ({ ...prev, petId: "" }));
      }
    }
  }, [open, prefillClientId, prefillPetId, animals]);

  // Mettre à jour les animaux disponibles quand le client change
  useEffect(() => {
    if (formData.clientId) {
      const petsForClient = getAnimalsForClient(formData.clientId);
      setAvailablePets(petsForClient);
      
      // Réinitialiser l'animal sélectionné si le client change
      if (!prefillPetId || !petsForClient.find(pet => pet.id === formData.petId)) {
        setFormData(prev => ({ ...prev, petId: "" }));
      }
    } else {
      setAvailablePets([]);
    }
  }, [formData.clientId, animals, prefillPetId]);

  // Mettre à jour les animaux disponibles quand le client change
  useEffect(() => {
    if (formData.clientId > 0) {
      const petsForClient = getPetsByOwnerId(formData.clientId);
      setAvailablePets(petsForClient);
      // Ne pas reset petId si on a un prefillPetId valide
      if (!prefillPetId || !petsForClient.find(p => p.id === prefillPetId)) {
        setFormData(prev => ({ ...prev, petId: 0 }));
      }
    } else {
      setAvailablePets([]);
    }
  }, [formData.clientId, getPetsByOwnerId, prefillPetId]);

  // Générer les créneaux disponibles quand la date change
  useEffect(() => {
    if (formData.date) {
      const slots = generateTimeSlots(formData.date, settings.scheduleSettings, appointments);
      setAvailableSlots(slots);
      // Réinitialiser l'heure si elle n'est plus disponible
      if (formData.time && !isSlotAvailable(formData.date, formData.time, settings.scheduleSettings, appointments)) {
        setFormData(prev => ({ ...prev, time: "" }));
      }
    } else {
      setAvailableSlots([]);
    }
  }, [formData.date, settings.scheduleSettings, appointments]);

  // Vérifier les conflits de rendez-vous
  useEffect(() => {
    if (formData.date && formData.time && formData.duration) {
      checkConflicts();
    }
  }, [formData.date, formData.time, formData.duration]);

  const checkConflicts = () => {
    const newConflicts: string[] = [];
    const appointmentStart = new Date(`${formData.date}T${formData.time}`);
    const appointmentEnd = new Date(appointmentStart.getTime() + formData.duration * 60000);

    // Vérifier les heures d'ouverture (8h-18h)
    const startHour = appointmentStart.getHours();
    const endHour = appointmentEnd.getHours();
    
    if (startHour < 8 || endHour > 18) {
      newConflicts.push("Le rendez-vous doit être entre 8h00 et 18h00");
    }

    // Vérifier les weekends
    const dayOfWeek = appointmentStart.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      newConflicts.push("Pas de rendez-vous le weekend");
    }

    setConflicts(newConflicts);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'clientId' || field === 'petId' || field === 'duration' ? parseInt(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (conflicts.length > 0) {
      toast({
        title: "Conflits détectés",
        description: conflicts.join(", "),
        variant: "destructive"
      });
      return;
    }

    if (!formData.clientId || !formData.petId || !formData.date || !formData.time || !formData.type) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
      return;
    }

    const selectedClient = clients.find(c => c.id === formData.clientId);
    const selectedPet = pets.find(p => p.id === formData.petId);

    if (!selectedClient || !selectedPet) {
      toast({
        title: "Erreur",
        description: "Client ou animal non trouvé.",
        variant: "destructive"
      });
      return;
    }

    addAppointment({
      clientId: formData.clientId,
      clientName: selectedClient.name,
      petId: formData.petId,
      petName: selectedPet.name,
      date: formData.date,
      time: formData.time,
      type: formData.type,
      duration: formData.duration,
      reason: formData.reason,
      notes: formData.notes,
      status: 'scheduled',
      reminderSent: false
    });
    // Si c'est un rappel de vaccination, créer le rappel de vaccination
    if (prefillType === 'vaccination' && originalVaccinationId) {
      createVaccinationReminder(originalVaccinationId, formData.date, formData.time);
      toast({
        title: "Rappel enregistré",
        description: "Le rappel de vaccination a été ajouté."
      });
    }
    
    toast({
      title: "Rendez-vous planifié",
      description: `RDV pour ${selectedPet.name} (${selectedClient.name}) prévu le ${formData.date} à ${formData.time}.`,
    });
    
    onOpenChange(false);
  };

  const getToday = () => new Date().toISOString().split('T')[0];

  const getTypeLabel = (type: string) => {
    const labels = {
      consultation: "Consultation générale",
      vaccination: "Vaccination",
      chirurgie: "Chirurgie",
      urgence: "Urgence",
      controle: "Contrôle post-opératoire",
      sterilisation: "Stérilisation",
      dentaire: "Soins dentaires"
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Nouveau Rendez-vous
            </DialogTitle>
            <DialogDescription>
              Planifiez un nouveau rendez-vous pour un client et son animal.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Sélection Client et Animal */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Client *</Label>
                {clients.length === 0 ? (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-yellow-800 text-sm">
                      Aucun client disponible.
                    </p>
                    <Button 
                      type="button" 
                      size="sm" 
                      variant="outline" 
                      className="mt-2 gap-1"
                      onClick={() => setShowClientModal(true)}
                    >
                      <Plus className="h-3 w-3" />
                      Ajouter Client
                    </Button>
                  </div>
                ) : (
                  <Select value={formData.clientId.toString()} onValueChange={(value) => handleSelectChange("clientId", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3" />
                            {client.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>Animal *</Label>
                {formData.clientId === 0 ? (
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                    <p className="text-gray-600 text-sm">
                      Sélectionnez d'abord un client
                    </p>
                  </div>
                ) : availablePets.length === 0 ? (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-yellow-800 text-sm">
                      Aucun animal pour ce client.
                    </p>
                    <Button 
                      type="button" 
                      size="sm" 
                      variant="outline" 
                      className="mt-2 gap-1"
                      onClick={() => setShowPetModal(true)}
                    >
                      <Plus className="h-3 w-3" />
                      Ajouter Animal
                    </Button>
                  </div>
                ) : (
                  <Select value={formData.petId.toString()} onValueChange={(value) => handleSelectChange("petId", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner l'animal" />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePets.map(pet => (
                        <SelectItem key={pet.id} value={pet.id.toString()}>
                          <div className="flex items-center gap-2">
                            <Heart className="h-3 w-3" />
                            {pet.name} ({pet.type})
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
            
            {/* Date et Heure */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={getToday()}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Heure *</Label>
                {formData.date ? (
                  <div className="space-y-2">
                    <Select
                      value={formData.time}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, time: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un créneau" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {availableSlots.map((slot) => (
                          <SelectItem 
                            key={slot.time} 
                            value={slot.time}
                            disabled={!slot.isAvailable}
                          >
                            <div className="flex items-center gap-2">
                              <span>{slot.time}</span>
                              {slot.isLunchBreak && (
                                <Badge variant="secondary" className="text-xs">Pause</Badge>
                              )}
                              {!slot.isAvailable && (
                                <Badge variant="destructive" className="text-xs">Occupé</Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {availableSlots.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        Aucun créneau disponible pour cette date
                      </p>
                    )}
                  </div>
                ) : (
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={handleChange}
                    disabled
                    placeholder="Sélectionnez d'abord une date"
                  />
                )}
              </div>
            </div>
            
            {/* Type et Durée */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type de consultation *</Label>
                <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type de RDV" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consultation">Consultation générale</SelectItem>
                    <SelectItem value="vaccination">Vaccination</SelectItem>
                    <SelectItem value="chirurgie">Chirurgie</SelectItem>
                    <SelectItem value="urgence">Urgence</SelectItem>
                    <SelectItem value="controle">Contrôle post-opératoire</SelectItem>
                    <SelectItem value="sterilisation">Stérilisation</SelectItem>
                    <SelectItem value="dentaire">Soins dentaires</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Durée (minutes)</Label>
                <Select value={formData.duration.toString()} onValueChange={(value) => handleSelectChange("duration", value)}>
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
            </div>
            
            {/* Motif */}
            <div className="space-y-2">
              <Label htmlFor="reason">Motif de consultation</Label>
              <Input
                id="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="ex: Vaccination annuelle, boiterie, contrôle..."
              />
            </div>
            
            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Instructions spéciales, préparation nécessaire..."
              />
            </div>

            {/* Alertes de conflits */}
            {conflicts.length > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">Conflits détectés :</span>
                </div>
                <ul className="mt-2 text-sm text-red-700">
                  {conflicts.map((conflict, index) => (
                    <li key={index}>• {conflict}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Résumé du rendez-vous */}
            {formData.clientId && formData.petId && formData.date && formData.time && formData.type && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h4 className="font-medium text-blue-900 mb-2">Résumé du rendez-vous :</h4>
                <div className="space-y-1 text-sm text-blue-800">
                  <p><strong>Client :</strong> {clients.find(c => c.id === formData.clientId)?.name}</p>
                  <p><strong>Animal :</strong> {pets.find(p => p.id === formData.petId)?.name}</p>
                  <p><strong>Date :</strong> {new Date(formData.date).toLocaleDateString('fr-FR')}</p>
                  <p><strong>Heure :</strong> {formData.time}</p>
                  <p><strong>Type :</strong> {getTypeLabel(formData.type)}</p>
                  <p><strong>Durée :</strong> {formData.duration} minutes</p>
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={conflicts.length > 0}>
                Planifier RDV
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <NewClientModal 
        open={showClientModal} 
        onOpenChange={setShowClientModal} 
      />
      <NewPetModal 
        open={showPetModal} 
        onOpenChange={setShowPetModal} 
      />
    </>
  );
}