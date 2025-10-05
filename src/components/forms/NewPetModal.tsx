import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAnimalSpecies, useAnimalBreeds, useAnimalColors } from "@/hooks/useAppSettings";
import { useClients, useCreateAnimal, useAnimals } from "@/hooks/useDatabase";
import { AlertTriangle, Loader2 } from "lucide-react";
import type { CreateAnimalData } from "@/lib/database";

interface NewPetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewPetModal({ open, onOpenChange }: NewPetModalProps) {
  const { data: clients = [] } = useClients();
  const { data: animals = [] } = useAnimals();
  const createAnimalMutation = useCreateAnimal();
  const { toast } = useToast();
  
  // Dynamic settings hooks
  const { data: animalSpecies = [] } = useAnimalSpecies();
  const { data: allAnimalBreeds = {} } = useAnimalBreeds(); // Get all breeds as object
  const { data: animalColors = [] } = useAnimalColors();
  
  // Form errors state
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    breed: "",
    gender: "",
    birthDate: "",
    weight: "",
    color: "",
    ownerId: "",
    microchip: "",
    medicalNotes: "",
    photo: "", // added official photo
    status: "vivant", // added status field
    // Propriétés du pedigree
    hasPedigree: false,
    officialName: "",
    pedigreeNumber: "",
    breeder: "",
    fatherName: "",
    fatherPedigree: "",
    fatherBreed: "",
    fatherTitles: "",
    motherName: "",
    motherPedigree: "",
    motherBreed: "",
    motherTitles: "",
    pedigreePhoto: ""
  });

  // Filter breeds based on selected type
  const availableBreeds = formData.type && allAnimalBreeds[formData.type] 
    ? allAnimalBreeds[formData.type] 
    : [];

  // Form validation function
  const validateForm = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    // Required fields validation
    if (!formData.name.trim()) {
      errors.name = "Le nom de l'animal est obligatoire";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Le nom doit contenir au moins 2 caractères";
    } else if (formData.name.trim().length > 50) {
      errors.name = "Le nom ne peut pas dépasser 50 caractères";
    }
    
    if (!formData.type) {
      errors.type = "Le type d'animal est obligatoire";
    }
    
    if (!formData.ownerId) {
      errors.ownerId = "Le propriétaire est obligatoire";
    }
    
    // Optional fields validation
    if (formData.weight && (isNaN(Number(formData.weight)) || Number(formData.weight) <= 0)) {
      errors.weight = "Le poids doit être un nombre positif";
    }
    
    if (formData.weight && Number(formData.weight) > 1000) {
      errors.weight = "Le poids semble anormalement élevé (max: 1000kg)";
    }
    
    // Microchip validation
    if (formData.microchip && formData.microchip.trim()) {
      const microchipRegex = /^[0-9A-Fa-f]{15}$/; // Standard 15-digit microchip
      if (!microchipRegex.test(formData.microchip.trim())) {
        errors.microchip = "Le numéro de puce doit contenir exactement 15 caractères alphanumériques";
      }
      
      // Check for existing microchip
      const existingAnimal = animals.find(animal => 
        animal.microchip_number === formData.microchip.trim()
      );
      if (existingAnimal) {
        errors.microchip = "Un animal avec ce numéro de puce existe déjà";
      }
    }
    
    // Birth date validation
    if (formData.birthDate) {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      
      if (birthDate > today) {
        errors.birthDate = "La date de naissance ne peut pas être dans le futur";
      }
      
      // Check if animal is not too old (reasonable limit: 30 years)
      const maxAge = new Date();
      maxAge.setFullYear(maxAge.getFullYear() - 30);
      if (birthDate < maxAge) {
        errors.birthDate = "La date de naissance semble trop ancienne";
      }
    }
    
    return errors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[id]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user makes selection
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateForm();
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      toast({
        title: "Erreurs de validation",
        description: "Veuillez corriger les erreurs dans le formulaire",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create animal data compatible with database
      const animalData: CreateAnimalData = {
        client_id: formData.ownerId,
        name: formData.name.trim(),
        species: formData.type,
        breed: formData.breed?.trim() || undefined,
        color: formData.color?.trim() || undefined,
        sex: formData.gender === 'male' ? 'Mâle' : (formData.gender === 'female' ? 'Femelle' : 'Inconnu'),
        weight: formData.weight ? Number(formData.weight) : undefined,
        birth_date: formData.birthDate || undefined,
        // Only include microchip_number if it's not empty to avoid unique constraint violation
        ...(formData.microchip && formData.microchip.trim() ? { microchip_number: formData.microchip.trim() } : {}),
        notes: formData.medicalNotes?.trim() || undefined,
        photo_url: formData.photo?.trim() || undefined,
        status: formData.status === 'healthy' ? 'vivant' : (formData.status === 'urgent' ? 'décédé' : 'perdu')
      };

      await createAnimalMutation.mutateAsync(animalData);
    
      toast({
        title: "Animal ajouté avec succès",
        description: `${formData.name} a été ajouté et sauvegardé dans la base de données.`,
      });
      
      // Reset form with all required properties
      setFormData({
        name: "",
        type: "",
        breed: "",
        gender: "",
        birthDate: "",
        weight: "",
        color: "",
        ownerId: "",
        microchip: "",
        medicalNotes: "",
        photo: "",
        status: "vivant", // reset status to default
        hasPedigree: false,
        officialName: "",
        pedigreeNumber: "",
        breeder: "",
        fatherName: "",
        fatherPedigree: "",
        fatherBreed: "",
        fatherTitles: "",
        motherName: "",
        motherPedigree: "",
        motherBreed: "",
        motherTitles: "",
        pedigreePhoto: ""
      });
      
      // Clear any form errors
      setFormErrors({});
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating animal:', error);
      
      // Enhanced error handling with specific messages
      let errorMessage = "Une erreur inattendue s'est produite";
      
      if (error instanceof Error) {
        const errorMsg = error.message.toLowerCase();
        
        if (errorMsg.includes('microchip') || errorMsg.includes('unique')) {
          errorMessage = "Ce numéro de puce électronique est déjà utilisé par un autre animal";
          setFormErrors({ microchip: errorMessage });
        } else if (errorMsg.includes('client') || errorMsg.includes('foreign key')) {
          errorMessage = "Le propriétaire sélectionné n'est plus valide. Veuillez en choisir un autre.";
          setFormErrors({ ownerId: errorMessage });
        } else if (errorMsg.includes('name') || errorMsg.includes('not null')) {
          errorMessage = "Tous les champs obligatoires doivent être remplis";
        } else if (errorMsg.includes('authentication') || errorMsg.includes('not authenticated')) {
          errorMessage = "Votre session a expiré. Veuillez vous reconnecter.";
        } else if (errorMsg.includes('network') || errorMsg.includes('connection')) {
          errorMessage = "Problème de connexion. Vérifiez votre connexion internet.";
        } else if (errorMsg.includes('permission') || errorMsg.includes('access')) {
          errorMessage = "Vous n'avez pas les permissions nécessaires pour effectuer cette action.";
        } else {
          // Extract meaningful part of the error message
          if (error.message.includes('Error creating animal:')) {
            errorMessage = error.message.replace('Error creating animal:', '').trim();
          } else {
            errorMessage = error.message;
          }
        }
      }
      
      toast({
        title: "Erreur lors de l'ajout de l'animal",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        onOpenChange(newOpen);
        if (!newOpen) {
          // Reset form and errors when closing
          setFormErrors({});
          setIsSubmitting(false);
        }
      }}
    >
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouvel Animal</DialogTitle>
          <DialogDescription>
            Ajoutez un nouvel animal à votre base de données.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Summary */}
          {Object.keys(formErrors).length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Veuillez corriger les erreurs suivantes :
                <ul className="mt-2 ml-4 list-disc">
                  {Object.values(formErrors).map((error, index) => (
                    <li key={index} className="text-sm">{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className={formErrors.name ? "text-destructive" : ""}>
                Nom de l'animal *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleChange}
                required
                className={formErrors.name ? "border-destructive focus:border-destructive" : ""}
              />
              {formErrors.name && (
                <p className="text-sm text-destructive">{formErrors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className={formErrors.type ? "text-destructive" : ""}>
                Type d'animal *
              </Label>
              <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
                <SelectTrigger className={formErrors.type ? "border-destructive focus:border-destructive" : ""}>
                  <SelectValue placeholder="Sélectionner le type" />
                </SelectTrigger>
                <SelectContent>
                  {animalSpecies.map(species => (
                    <SelectItem key={species} value={species}>
                      {species}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.type && (
                <p className="text-sm text-destructive">{formErrors.type}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="breed">Race</Label>
              <Select value={formData.breed} onValueChange={(value) => handleSelectChange("breed", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner la race" />
                </SelectTrigger>
                <SelectContent>
                  {availableBreeds.length > 0 ? (
                    availableBreeds.map(breed => (
                      <SelectItem key={breed} value={breed}>
                        {breed}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="not-available" disabled>
                      {formData.type ? "Aucune race disponible" : "Sélectionnez d'abord un type"}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Sexe</Label>
              <Select value={formData.gender} onValueChange={(value) => handleSelectChange("gender", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le sexe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Mâle</SelectItem>
                  <SelectItem value="female">Femelle</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="birthDate" className={formErrors.birthDate ? "text-destructive" : ""}>
                Date de naissance
              </Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                className={formErrors.birthDate ? "border-destructive focus:border-destructive" : ""}
              />
              {formErrors.birthDate && (
                <p className="text-sm text-destructive">{formErrors.birthDate}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight" className={formErrors.weight ? "text-destructive" : ""}>
                Poids (kg)
              </Label>
              <Input
                id="weight"
                value={formData.weight}
                onChange={handleChange}
                type="number"
                step="0.1"
                min="0"
                max="1000"
                placeholder="Ex: 5.2"
                className={formErrors.weight ? "border-destructive focus:border-destructive" : ""}
              />
              {formErrors.weight && (
                <p className="text-sm text-destructive">{formErrors.weight}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="color">Couleur</Label>
              <Select value={formData.color} onValueChange={(value) => handleSelectChange("color", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner la couleur" />
                </SelectTrigger>
                <SelectContent>
                  {animalColors.map(color => (
                    <SelectItem key={color} value={color}>
                      {color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              {/* Champ vide pour maintenir la grille */}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className={formErrors.ownerId ? "text-destructive" : ""}>
              Propriétaire *
            </Label>
            {clients.length === 0 ? (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-yellow-800 text-sm">
                  Aucun client disponible. Veuillez d'abord ajouter un client.
                </p>
              </div>
            ) : (
              <Select value={formData.ownerId.toString()} onValueChange={(value) => handleSelectChange("ownerId", value)}>
                <SelectTrigger className={formErrors.ownerId ? "border-destructive focus:border-destructive" : ""}>
                  <SelectValue placeholder="Sélectionner le propriétaire" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.first_name} {client.last_name} - {client.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {formErrors.ownerId && (
              <p className="text-sm text-destructive">{formErrors.ownerId}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="microchip" className={formErrors.microchip ? "text-destructive" : ""}>
              Numéro de puce électronique
            </Label>
            <Input
              id="microchip"
              value={formData.microchip}
              onChange={handleChange}
              className={formErrors.microchip ? "border-destructive focus:border-destructive" : ""}
              placeholder="15 caractères alphanumériques"
            />
            {formErrors.microchip && (
              <p className="text-sm text-destructive">{formErrors.microchip}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="medicalNotes">Notes médicales</Label>
            <Textarea
              id="medicalNotes"
              value={formData.medicalNotes}
              onChange={handleChange}
              placeholder="Allergies, conditions médicales, notes importantes..."
            />
          </div>
          
          <div className="space-y-2">
            <Label>État de santé</Label>
            <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner l'état de santé" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="healthy">En bonne santé</SelectItem>
                <SelectItem value="treatment">En traitement</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

     
          {/* Official Photo */}
          <div className="space-y-2">
            <Label>Photo de l'animal</Label>
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => setFormData(prev => ({ ...prev, photo: reader.result as string }));
                reader.readAsDataURL(file);
              }}
            />
            {formData.photo && (
              <img src={formData.photo} alt="preview" className="h-24 w-24 object-cover rounded" />
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || Object.keys(formErrors).length > 0}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {isSubmitting ? "Ajout en cours..." : "Ajouter Animal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}