import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Pill, Plus, Trash2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useClients, Prescription, PrescriptionMedication } from "@/contexts/ClientContext";

interface PrescriptionEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prescription: Prescription | null;
}

export function PrescriptionEditModal({ open, onOpenChange, prescription }: PrescriptionEditModalProps) {
  const { updatePrescription } = useClients();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    date: "",
    prescribedBy: "",
    diagnosis: "",
    instructions: "",
    duration: "",
    followUpDate: "",
    status: "" as Prescription['status'],
    notes: ""
  });

  const [medications, setMedications] = useState<PrescriptionMedication[]>([]);

  // Réinitialiser le formulaire quand le modal s'ouvre
  useEffect(() => {
    if (open && prescription) {
      setFormData({
        date: prescription.date,
        prescribedBy: prescription.prescribedBy,
        diagnosis: prescription.diagnosis,
        instructions: prescription.instructions,
        duration: prescription.duration,
        followUpDate: prescription.followUpDate || "",
        status: prescription.status,
        notes: prescription.notes || ""
      });
      setMedications([...prescription.medications]);
    }
  }, [open, prescription]);

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
  };

  const handleMedicationChange = (index: number, field: string, value: string | number) => {
    const updatedMedications = [...medications];
    updatedMedications[index] = {
      ...updatedMedications[index],
      [field]: field === 'quantity' || field === 'refills' || field === 'cost' ? Number(value) : value
    };
    setMedications(updatedMedications);
  };

  const addMedication = () => {
    const newId = Math.max(...medications.map(m => m.id), 0) + 1;
    setMedications([...medications, {
      id: newId,
      name: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: "",
      quantity: 1,
      unit: "comprimés",
      refills: 0,
      cost: 0
    }]);
  };

  const removeMedication = (index: number) => {
    if (medications.length > 1) {
      setMedications(medications.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prescription) return;

    // Valider que tous les médicaments ont un nom
    const validMedications = medications.filter(med => med.name.trim() !== "");
    if (validMedications.length === 0) {
      toast({
        title: "Erreur",
        description: "Au moins un médicament doit être spécifié.",
        variant: "destructive"
      });
      return;
    }

    updatePrescription(prescription.id, {
      date: formData.date,
      prescribedBy: formData.prescribedBy,
      diagnosis: formData.diagnosis,
      medications: validMedications,
      instructions: formData.instructions,
      duration: formData.duration,
      followUpDate: formData.followUpDate || undefined,
      status: formData.status,
      notes: formData.notes
    });
    
    toast({
      title: "Prescription mise à jour",
      description: "La prescription a été modifiée avec succès.",
    });
    
    onOpenChange(false);
  };

  const calculateTotalCost = () => {
    return medications.reduce((total, med) => total + (med.cost || 0), 0);
  };

  if (!prescription) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Modifier la Prescription
          </DialogTitle>
          <DialogDescription>
            Modifiez la prescription pour {prescription.petName} ({prescription.clientName}).
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations générales */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date de prescription *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prescribedBy">Prescrit par *</Label>
              <Input
                id="prescribedBy"
                value={formData.prescribedBy}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="diagnosis">Diagnostic *</Label>
            <Input
              id="diagnosis"
              value={formData.diagnosis}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Durée du traitement</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="followUpDate">Date de suivi</Label>
              <Input
                id="followUpDate"
                type="date"
                value={formData.followUpDate}
                onChange={handleChange}
                min={formData.date}
              />
            </div>
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Terminée</SelectItem>
                  <SelectItem value="discontinued">Arrêtée</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Médicaments */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Médicaments prescrits</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={addMedication}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Ajouter médicament
              </Button>
            </div>

            <div className="space-y-4">
              {medications.map((medication, index) => (
                <div key={medication.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Médicament {index + 1}</h4>
                    {medications.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeMedication(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nom du médicament *</Label>
                      <Input
                        value={medication.name}
                        onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Dosage *</Label>
                      <Input
                        value={medication.dosage}
                        onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Fréquence *</Label>
                      <Input
                        value={medication.frequency}
                        onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Durée</Label>
                      <Input
                        value={medication.duration}
                        onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Quantité</Label>
                      <Input
                        type="number"
                        value={medication.quantity}
                        onChange={(e) => handleMedicationChange(index, 'quantity', parseInt(e.target.value))}
                        min="1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Unité</Label>
                      <Select 
                        value={medication.unit} 
                        onValueChange={(value) => handleMedicationChange(index, 'unit', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="comprimés">Comprimés</SelectItem>
                          <SelectItem value="ml">ml</SelectItem>
                          <SelectItem value="g">g</SelectItem>
                          <SelectItem value="mg">mg</SelectItem>
                          <SelectItem value="ampoules">Ampoules</SelectItem>
                          <SelectItem value="flacons">Flacons</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Coût (€)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={medication.cost}
                        onChange={(e) => handleMedicationChange(index, 'cost', parseFloat(e.target.value))}
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Instructions spécifiques</Label>
                      <Input
                        value={medication.instructions}
                        onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Renouvellements</Label>
                      <Input
                        type="number"
                        value={medication.refills}
                        onChange={(e) => handleMedicationChange(index, 'refills', parseInt(e.target.value))}
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Coût total */}
            <div className="flex justify-end">
              <Badge variant="outline" className="text-lg px-4 py-2">
                Coût total: {calculateTotalCost().toFixed(2)}€
              </Badge>
            </div>
          </div>

          {/* Instructions générales */}
          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions générales</Label>
            <Textarea
              id="instructions"
              value={formData.instructions}
              onChange={handleChange}
              rows={3}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" className="gap-2">
              <Save className="h-4 w-4" />
              Sauvegarder
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
