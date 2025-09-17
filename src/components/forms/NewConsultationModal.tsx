import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useClients } from "@/contexts/ClientContext";
import { NewClientModal } from "./NewClientModal";
import { NewPetModal } from "./NewPetModal";
import { NewPrescriptionModal } from "./NewPrescriptionModal";
import { Plus, User, Heart, Pill } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext"; // Added for dynamic currency

interface NewConsultationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewConsultationModal({ open, onOpenChange }: NewConsultationModalProps) {
  const { clients, pets, addConsultation } = useClients();
  const { toast } = useToast();
  const { settings } = useSettings(); // Destructure currency for cost label
  const [showClientModal, setShowClientModal] = useState(false);
  const [showPetModal, setShowPetModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  
  const [formData, setFormData] = useState({
    clientId: 0,
    clientName: "",
    petId: 0,
    petName: "",
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
  const availablePets = pets.filter(pet => pet.ownerId === formData.clientId);

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
      const clientId = parseInt(value);
      const selectedClient = clients.find(c => c.id === clientId);
      setFormData(prev => ({
        ...prev,
        clientId,
        clientName: selectedClient?.name || "",
        petId: 0,
        petName: ""
      }));
    } else if (field === 'petId') {
      const petId = parseInt(value);
      const selectedPet = pets.find(p => p.id === petId);
      setFormData(prev => ({
        ...prev,
        petId,
        petName: selectedPet?.name || ""
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientId || !formData.petId) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un client et un animal.",
        variant: "destructive",
      });
      return;
    }
    
    // Add consultation to context
    addConsultation({
      clientId: formData.clientId,
      clientName: formData.clientName,
      petId: formData.petId,
      petName: formData.petName,
      date: formData.date || today,
      weight: formData.weight,
      temperature: formData.temperature,
      symptoms: formData.symptoms,
      diagnosis: formData.diagnosis,
      treatment: formData.treatment,
      medications: "", // Supprimé du formulaire
      followUp: formData.followUp,
      cost: formData.cost,
      notes: formData.notes,
      photos: formData.photos
    });
    
    toast({
      title: "Consultation enregistrée",
      description: `Consultation pour ${formData.petName} (${formData.clientName}) a été enregistrée et sauvegardée.`,
    });
    
    // Reset form
    setFormData({
      clientId: 0,
      clientName: "",
      petId: 0,
      petName: "",
      date: today,
      weight: "",
      temperature: "",
      symptoms: "",
      diagnosis: "",
      treatment: "",
      followUp: "",
      cost: "",
      notes: "",
      photos: []
    });
    
    onOpenChange(false);
  };

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setFormData({
        clientId: 0,
        clientName: "",
        petId: 0,
        petName: "",
        date: today,
        weight: "",
        temperature: "",
        symptoms: "",
        diagnosis: "",
        treatment: "",
        followUp: "",
        cost: "",
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
                        <SelectItem key={client.id} value={client.id.toString()}>
                          {client.name}
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
                    value={formData.petId.toString()} 
                    onValueChange={(value) => handleSelectChange("petId", value)}
                    disabled={!formData.clientId}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder={formData.clientId ? "Sélectionner l'animal" : "Sélectionnez d'abord un client"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePets.map(pet => (
                        <SelectItem key={pet.id} value={pet.id.toString()}>
                          {pet.name} ({pet.type})
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
            
            {/* Section pour créer une prescription */}
            <div className="space-y-2">
              <Label>Prescription</Label>
              <div className="flex items-center gap-2 p-4 border rounded-lg bg-muted/30">
                <Pill className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Créer une prescription</p>
                  <p className="text-xs text-muted-foreground">Gérez les médicaments prescrits de manière séparée</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPrescriptionModal(true)}
                  disabled={!formData.petId}
                  className="gap-2"
                >
                  <Pill className="h-4 w-4" />
                  Nouvelle Prescription
                </Button>
              </div>
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
              <Button type="submit">
                Enregistrer Consultation
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
      
      <NewPrescriptionModal 
        open={showPrescriptionModal} 
        onOpenChange={setShowPrescriptionModal}
        petId={formData.petId}
        consultationId={0} // Pas de consultation ID car on est en train de créer la consultation
      />
    </>
  );
}