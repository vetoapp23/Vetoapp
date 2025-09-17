import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useClients } from "@/contexts/ClientContext";
import { FarmIntervention } from "@/contexts/ClientContext";
import { useSettings } from "@/contexts/SettingsContext"; // Added for dynamic currency

interface NewFarmInterventionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  farmId?: number;
  farmName?: string;
}

const NewFarmInterventionModal = ({ open, onOpenChange, farmId, farmName }: NewFarmInterventionModalProps) => {
  const { addFarmIntervention, farms } = useClients();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    farmId: "",
    farmName: "",
    date: "",
    type: "" as FarmIntervention['type'],
    animals: "",
    veterinarian: "",
    description: "",
    status: "scheduled" as FarmIntervention['status'],
    followUp: "",
    cost: "",
    notes: ""
  });

  useEffect(() => {
    if (open) {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        farmId: farmId?.toString() || "",
        farmName: farmName || "",
        date: today,
        type: "" as FarmIntervention['type'],
        animals: "",
        veterinarian: "",
        description: "",
        status: "scheduled" as FarmIntervention['status'],
        followUp: "",
        cost: "",
        notes: ""
      });
    }
  }, [open, farmId, farmName]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const { settings } = useSettings(); // Destructure currency
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.farmId || !formData.date || !formData.type || !formData.description) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    const selectedFarm = farms.find(f => f.id === parseInt(formData.farmId));
    if (!selectedFarm) {
      toast({
        title: "Erreur",
        description: "Exploitation non trouvée",
        variant: "destructive"
      });
      return;
    }

    const newIntervention = {
      farmId: parseInt(formData.farmId),
      farmName: selectedFarm.name,
      date: formData.date,
      type: formData.type,
      animals: formData.animals,
      veterinarian: formData.veterinarian,
      description: formData.description,
      status: formData.status,
      followUp: formData.followUp,
      cost: formData.cost ? parseFloat(formData.cost) : undefined,
      notes: formData.notes
    };

    addFarmIntervention(newIntervention);
    
    toast({
      title: "Succès",
      description: "Intervention programmée avec succès"
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouvelle Intervention</DialogTitle>
          <DialogDescription>
            Programmez une nouvelle intervention vétérinaire
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="farmId">Exploitation *</Label>
              <Select value={formData.farmId} onValueChange={(value) => {
                const farm = farms.find(f => f.id === parseInt(value));
                handleChange("farmId", value);
                handleChange("farmName", farm?.name || "");
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une exploitation" />
                </SelectTrigger>
                <SelectContent>
                  {farms.map((farm) => (
                    <SelectItem key={farm.id} value={farm.id.toString()}>
                      {farm.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type d'intervention *</Label>
              <Select value={formData.type} onValueChange={(value) => handleChange("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vaccination">Vaccination</SelectItem>
                  <SelectItem value="controle">Contrôle sanitaire</SelectItem>
                  <SelectItem value="urgence">Urgence</SelectItem>
                  <SelectItem value="chirurgie">Chirurgie</SelectItem>
                  <SelectItem value="prevention">Prévention</SelectItem>
                  <SelectItem value="consultation">Consultation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Programmée</SelectItem>
                  <SelectItem value="ongoing">En cours</SelectItem>
                  <SelectItem value="completed">Terminée</SelectItem>
                  <SelectItem value="cancelled">Annulée</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="animals">Animaux concernés</Label>
              <Input
                id="animals"
                value={formData.animals}
                onChange={(e) => handleChange("animals", e.target.value)}
                placeholder="15 bovins, 50 poules..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="veterinarian">Vétérinaire</Label>
              <Input
                id="veterinarian"
                value={formData.veterinarian}
                onChange={(e) => handleChange("veterinarian", e.target.value)}
                placeholder="Dr. Dupont"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Détails de l'intervention..."
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost">Coût ({settings.currency})</Label>
              <Input
                id="cost"
                type="number"
                value={formData.cost}
                onChange={(e) => handleChange("cost", e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="followUp">Suivi</Label>
              <Input
                id="followUp"
                value={formData.followUp}
                onChange={(e) => handleChange("followUp", e.target.value)}
                placeholder="Contrôle dans 6 mois"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Informations complémentaires..."
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">
              Programmer Intervention
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewFarmInterventionModal;
