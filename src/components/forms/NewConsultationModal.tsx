import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useClients, useAnimals, useCreateConsultation } from "@/hooks/useDatabase";
import { NewClientModal } from "./NewClientModal";
import { NewPetModal } from "./NewPetModal";

import { Plus, User, Heart } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext"; // Added for dynamic currency
import type { Animal, Client, CreateConsultationData } from "@/lib/database";

interface NewConsultationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewConsultationModal({ open, onOpenChange }: NewConsultationModalProps) {
  const { data: clients = [], isLoading: clientsLoading } = useClients();
  const { data: animals = [], isLoading: animalsLoading } = useAnimals();
  const createConsultationMutation = useCreateConsultation();
  const { toast } = useToast();
  const { settings } = useSettings(); // Destructure currency for cost label
  const [showClientModal, setShowClientModal] = useState(false);
  const [showPetModal, setShowPetModal] = useState(false);

  
  const [formData, setFormData] = useState({
    clientId: "",
    clientName: "",
    animalId: "",
    animalName: "",
    date: "",
    weight: "",
    temperature: "",
    symptoms: "",
    diagnosis: "",
    treatment: "",
    followUp: "",
    cost: settings.defaultConsultationPrice.toString(),
    notes: "",
    photos: [] as string[] // Added photos array
  });

  // Filtrer les animaux selon le client sélectionné
  const availablePets = animals.filter(animal => animal.client_id === formData.clientId);

  // Get today's date in YYYY-MM-DD format for default date
  const today = new Date().toISOString().split('T')[0];

  // Mettre à jour le prix par défaut quand les paramètres changent
  useEffect(() => {
    if (settings.defaultConsultationPrice && !formData.cost) {
      setFormData(prev => ({ ...prev, cost: settings.defaultConsultationPrice.toString() }));
    }
  }, [settings.defaultConsultationPrice, formData.cost]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
    if (field === 'clientId') {
      const selectedClient = clients.find(c => c.id === value);
      setFormData(prev => ({
        ...prev,
        clientId: value,
        clientName: selectedClient ? `${selectedClient.first_name} ${selectedClient.last_name}` : "",
        animalId: "",
        animalName: ""
      }));
    } else if (field === 'animalId') {
      const selectedAnimal = animals.find(a => a.id === value);
      setFormData(prev => ({
        ...prev,
        animalId: value,
        animalName: selectedAnimal?.name || ""
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientId || !formData.animalId) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un client et un animal.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Create consultation data for database
      const consultationData: CreateConsultationData & { consultation_date: string } = {
        client_id: formData.clientId,
        animal_id: formData.animalId,
        consultation_type: 'routine',
        consultation_date: formData.date || today,
        weight: formData.weight ? Math.min(parseFloat(formData.weight), 999.9) : undefined,
        temperature: formData.temperature ? Math.min(parseFloat(formData.temperature), 99.9) : undefined,
        symptoms: formData.symptoms,
        diagnosis: formData.diagnosis,
        treatment: formData.treatment,
        follow_up_notes: formData.followUp,
        notes: formData.notes
      };

      await createConsultationMutation.mutateAsync(consultationData);
      
      toast({
        title: "Consultation enregistrée",
        description: `Consultation pour ${formData.animalName} (${formData.clientName}) a été enregistrée avec succès.`,
      });
      
      // Reset form
      setFormData({
        clientId: "",
        clientName: "",
        animalId: "",
        animalName: "",
        date: today,
        weight: "",
        temperature: "",
        symptoms: "",
        diagnosis: "",
        treatment: "",
        followUp: "",
        cost: settings.defaultConsultationPrice.toString(),
        notes: "",
        photos: []
      });
      
      onOpenChange(false);
    } catch (error) {
      // Error already handled by toast notification
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer la consultation. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setFormData({
        clientId: "",
        clientName: "",
        animalId: "",
        animalName: "",
        date: today,
        weight: "",
        temperature: "",
        symptoms: "",
        diagnosis: "",
        treatment: "",
        followUp: "",
        cost: settings.defaultConsultationPrice.toString(),
        notes: "",
        photos: []
      });
    }
  }, [open, today]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouvelle Consultation</DialogTitle>
            <DialogDescription>
              Enregistrez une nouvelle consultation vétérinaire.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Client *</Label>
                <div className="flex gap-2">
                  <Select 
                    value={formData.clientId.toString()} 
                    onValueChange={(value) => handleSelectChange("clientId", value)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Sélectionner le client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.first_name} {client.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="outline"
                    onClick={() => setShowClientModal(true)}
                    className="px-2"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Animal *</Label>
                <div className="flex gap-2">
                  <Select 
                    value={formData.animalId} 
                    onValueChange={(value) => handleSelectChange("animalId", value)}
                    disabled={!formData.clientId}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder={formData.clientId ? "Sélectionner l'animal" : "Sélectionnez d'abord un client"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePets.map(animal => (
                        <SelectItem key={animal.id} value={animal.id}>
                          {animal.name} ({animal.species})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="outline"
                    onClick={() => setShowPetModal(true)}
                    className="px-2"
                    disabled={!formData.clientId}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date || today}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Poids (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  min="0"
                  max="999.9"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="ex: 25.5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="temperature">Température (°C)</Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  min="0"
                  max="99.9"
                  value={formData.temperature}
                  onChange={handleChange}
                  placeholder="ex: 38.5"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="symptoms">Symptômes observés</Label>
              <Textarea
                id="symptoms"
                value={formData.symptoms}
                onChange={handleChange}
                placeholder="Décrivez les symptômes et observations..."
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="diagnosis">Diagnostic</Label>
              <Textarea
                id="diagnosis"
                value={formData.diagnosis}
                onChange={handleChange}
                placeholder="Diagnostic posé..."
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="treatment">Traitement administré</Label>
              <Textarea
                id="treatment"
                value={formData.treatment}
                onChange={handleChange}
                placeholder="Traitements, injections, interventions..."
                rows={3}
              />
            </div>
            

            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="followUp">Suivi recommandé</Label>
                <Input
                  id="followUp"
                  value={formData.followUp}
                  onChange={handleChange}
                  placeholder="ex: Contrôle dans 1 semaine"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost">Coût ({settings.currency})</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={handleChange}
                  placeholder="ex: 85.50"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes additionnelles</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Notes diverses, recommandations..."
                rows={3}
              />
            </div>
            {/* Photos upload */}
            <div className="space-y-2 col-span-2">
              <Label>Photos de la consultation</Label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={async (e) => {
                  const files = Array.from(e.target.files || []);
                  const urls = await Promise.all(files.map(file => {
                    return new Promise<string>((res, rej) => {
                      const reader = new FileReader();
                      reader.onload = () => res(reader.result as string);
                      reader.onerror = () => rej();
                      reader.readAsDataURL(file);
                    });
                  }));
                  setFormData(prev => ({ ...prev, photos: [...prev.photos, ...urls] }));
                }}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
              {formData.photos.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pt-2">
                  {formData.photos.map((src, idx) => (
                    <div key={idx} className="relative">
                      <img src={src} alt={`photo-${idx}`} className="h-24 w-24 object-cover rounded" />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== idx) }))}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={!formData.animalId || createConsultationMutation.isPending}>
                {createConsultationMutation.isPending ? "Enregistrement..." : "Enregistrer Consultation"}
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