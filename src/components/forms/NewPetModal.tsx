import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useClients, useCreateAnimal, useAnimals } from "@/hooks/useDatabase";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const owner = clients.find(c => c.id === formData.ownerId);
    if (!owner) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un propriétaire valide.",
      });
      return;
    }
    
    // Check for existing microchip number if one is provided
    if (formData.microchip && formData.microchip.trim()) {
      const existingAnimal = animals.find(animal => animal.microchip_number === formData.microchip.trim());
      if (existingAnimal) {
        toast({
          title: "Erreur",
          description: "Un animal avec ce numéro de puce existe déjà.",
          variant: "destructive",
        });
        return;
      }
    }
    
    try {
      // Create animal data compatible with database
      const animalData: CreateAnimalData = {
        client_id: formData.ownerId,
        name: formData.name,
        species: formData.type as 'Chien' | 'Chat' | 'Oiseau' | 'Lapin' | 'Furet' | 'Autre',
        breed: formData.breed || undefined,
        color: formData.color || undefined,
        sex: formData.gender === 'male' ? 'Mâle' : (formData.gender === 'female' ? 'Femelle' : 'Inconnu'),
        weight: formData.weight ? Number(formData.weight) : undefined,
        birth_date: formData.birthDate || undefined,
        // Only include microchip_number if it's not empty to avoid unique constraint violation
        ...(formData.microchip && formData.microchip.trim() ? { microchip_number: formData.microchip.trim() } : {}),
        notes: formData.medicalNotes || undefined,
        photo_url: formData.photo || undefined,
        status: formData.status === 'healthy' ? 'vivant' : (formData.status === 'urgent' ? 'décédé' : 'perdu')
      };

      await createAnimalMutation.mutateAsync(animalData);
    
      toast({
        title: "Animal ajouté",
        description: `${formData.name} a été ajouté et sauvegardé avec succès.`,
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
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'ajout de l'animal",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouvel Animal</DialogTitle>
          <DialogDescription>
            Ajoutez un nouvel animal à votre base de données.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de l'animal *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Type d'animal *</Label>
              <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type" />
                </SelectTrigger>
                <SelectContent>
               
                    <><SelectItem value="Chien">Chien</SelectItem>
                    <SelectItem value="Chat">Chat</SelectItem>
                    <SelectItem value="Oiseau">Oiseau</SelectItem>
                    <SelectItem value="Lapin">Lapin</SelectItem>
                    <SelectItem value="Furet">Furet</SelectItem>
                    <SelectItem value="Souris">Souris</SelectItem>
                    <SelectItem value="Hamster">Hamster</SelectItem>
                    <SelectItem value="Reptile">Reptile</SelectItem>
                    <SelectItem value="Autre">Autre</SelectItem>
                    </>

                
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="breed">Race</Label>
              <Input
                id="breed"
                value={formData.breed}
                onChange={handleChange}
              />
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
              <Label htmlFor="birthDate">Date de naissance</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Poids (kg)</Label>
              <Input
                id="weight"
                value={formData.weight}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="color">Couleur</Label>
              <Input
                id="color"
                value={formData.color}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              {/* Champ vide pour maintenir la grille */}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Propriétaire *</Label>
            {clients.length === 0 ? (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-yellow-800 text-sm">
                  Aucun client disponible. Veuillez d'abord ajouter un client.
                </p>
              </div>
            ) : (
              <Select value={formData.ownerId.toString()} onValueChange={(value) => handleSelectChange("ownerId", value)}>
                <SelectTrigger>
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
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="microchip">Numéro de puce électronique</Label>
            <Input
              id="microchip"
              value={formData.microchip}
              onChange={handleChange}
            />
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">
              Ajouter Animal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}