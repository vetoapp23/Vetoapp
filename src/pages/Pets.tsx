import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Heart, User, Calendar, Stethoscope, Eye, Edit, Activity, Grid, List, Loader2, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { NewPetModal } from "@/components/forms/NewPetModal";
import { NewConsultationModal } from "@/components/forms/NewConsultationModal";
import { PetViewModal } from "@/components/modals/PetViewModal";
import { SimplePetDossierModal } from "@/components/modals/SimplePetDossierModal";
import { MedicalStats } from "@/components/MedicalStats";
import { useAnimals, useClients, useUpdateAnimal, useClientStats, useConsultations, useVaccinations } from "@/hooks/useDatabase";
import type { Animal, Client, CreateAnimalData } from "@/lib/database";
import { useSettings } from "@/contexts/SettingsContext";
import { useDisplayPreference } from "@/hooks/use-display-preference";
import { calculateAge } from "@/lib/utils";

// Import the original Pet interface from ClientContext for compatibility
import { Pet } from "@/contexts/ClientContext";

const statusStyles = {
  healthy: "bg-secondary text-secondary-foreground",
  treatment: "bg-accent text-accent-foreground", 
  urgent: "bg-destructive text-destructive-foreground"
};

// Interface extending Pet to include database ID
interface PetUI extends Pet {
  dbId: string; // Store original DB UUID for updates
  dbClientId: string; // Store client's DB UUID
}

// Convert database Animal to old Pet format
const convertAnimalToPet = (animal: Animal, clients: Client[]): PetUI => {
  const client = clients.find(c => c.id === animal.client_id);
  const clientName = client ? `${client.first_name} ${client.last_name}` : 'Propriétaire inconnu';
  
  // Convert UUID to number for compatibility (using hash)
  const petId = Math.abs(animal.id.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0));
  
  const clientId = Math.abs(animal.client_id.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0));
  
  return {
    id: petId,
    name: animal.name,
    type: animal.species,
    breed: animal.breed || '',
    gender: animal.sex === 'Mâle' ? 'male' : (animal.sex === 'Femelle' ? 'female' : undefined),
    birthDate: animal.birth_date || '',
    weight: animal.weight ? animal.weight.toString() : '',
    color: animal.color || '',
    microchip: animal.microchip_number || '',
    medicalNotes: animal.notes || '',
    photo: animal.photo_url || '',
    ownerId: clientId,
    owner: clientName,
    status: animal.status === 'vivant' ? 'healthy' : (animal.status === 'décédé' ? 'urgent' : 'treatment'),
    lastVisit: animal.updated_at ? new Date(animal.updated_at).toLocaleDateString('fr-FR') : 'Jamais',
    nextAppointment: undefined,
    vaccinations: [],
    // Store original DB IDs for updates
    dbId: animal.id,
    dbClientId: animal.client_id
  };
};

const PetsContent = () => {
  const { data: animals = [], isLoading: animalsLoading } = useAnimals();
  const { data: clients = [], isLoading: clientsLoading } = useClients();
  const { data: stats } = useClientStats();
  const updateAnimalMutation = useUpdateAnimal();
  
  // Convert animals to pets format for compatibility
  const pets = animals.map(animal => convertAnimalToPet(animal, clients));
  // Import consultation and vaccination hooks
  const { data: consultations = [] } = useConsultations();
  const { data: vaccinations = [] } = useVaccinations();
  
  // Get consultations for a specific pet
  const getConsultationsByPetId = useCallback((petId: string | number) => {
    const animalId = typeof petId === 'string' ? petId : pets.find(p => p.id === petId)?.dbId;
    if (!animalId) return [];
    return consultations.filter(c => c.animal_id === animalId);
  }, [pets, consultations]);

  // Get vaccinations for a specific pet
  const getVaccinationsByPetId = useCallback((petId: string | number) => {
    const animalId = typeof petId === 'string' ? petId : pets.find(p => p.id === petId)?.dbId;
    if (!animalId) return [];
    return vaccinations.filter(v => v.animal_id === animalId);
  }, [pets, vaccinations]);
  const { currentView } = useDisplayPreference('pets');
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState<'cards' | 'table'>(currentView);
  const { settings } = useSettings();
  const speciesList = settings.species.split(',').map(s => s.trim()).filter(s => s.length > 0);
  const [showPetModal, setShowPetModal] = useState(false);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState<PetUI | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDossierModal, setShowDossierModal] = useState(false);
  const { toast } = useToast();
  
  // Edit form state
  const [editForm, setEditForm] = useState<CreateAnimalData>({
    client_id: '',
    name: '',
    species: 'Chien',
    breed: '',
    color: '',
    sex: 'Inconnu',
    weight: undefined,
    height: undefined,
    birth_date: '',
    microchip_number: '',
    tattoo_number: '',
    sterilized: false,
    sterilization_date: '',
    notes: '',
    photo_url: '',
    status: 'healthy'
  });

  const filteredPets = pets.filter(pet => {
    const matchesSearch = pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (pet.breed && pet.breed.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         pet.owner.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || pet.type.toLowerCase() === filterType.toLowerCase();
    const matchesStatus = filterStatus === "all" || pet.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleView = (pet: PetUI) => {
    setSelectedPet(pet);
    setShowViewModal(true);
  };

  const handleEdit = (pet: PetUI) => {
    setSelectedPet(pet);
    // Populate edit form with pet data
    setEditForm({
      client_id: pet.dbClientId,
      name: pet.name,
      species: pet.type as 'Chien' | 'Chat' | 'Oiseau' | 'Lapin' | 'Furet' | 'Autre',
      breed: pet.breed || '',
      color: pet.color || '',
      sex: pet.gender === 'male' ? 'Mâle' : (pet.gender === 'female' ? 'Femelle' : 'Inconnu'),
      weight: pet.weight ? parseFloat(pet.weight) : undefined,
      height: undefined,
      birth_date: pet.birthDate || '',
      microchip_number: pet.microchip || '',
      tattoo_number: '',
      sterilized: false,
      sterilization_date: '',
      notes: pet.medicalNotes || '',
      photo_url: pet.photo || '',
      status: pet.status
    });
    setShowEditModal(true);
  };

  const handleEditFromView = () => {
    if (selectedPet) {
      // Populate edit form with pet data
      setEditForm({
        client_id: selectedPet.dbClientId,
        name: selectedPet.name,
        species: selectedPet.type as 'Chien' | 'Chat' | 'Oiseau' | 'Lapin' | 'Furet' | 'Autre',
        breed: selectedPet.breed || '',
        color: selectedPet.color || '',
        sex: selectedPet.gender === 'male' ? 'Mâle' : (selectedPet.gender === 'female' ? 'Femelle' : 'Inconnu'),
        weight: selectedPet.weight ? parseFloat(selectedPet.weight) : undefined,
        height: undefined,
        birth_date: selectedPet.birthDate || '',
        microchip_number: selectedPet.microchip || '',
        tattoo_number: '',
        sterilized: false,
        sterilization_date: '',
        notes: selectedPet.medicalNotes || '',
        photo_url: selectedPet.photo || '',
        status: selectedPet.status
      });
    }
    setShowViewModal(false);
    setShowEditModal(true);
  };

  const handleShowDossier = (pet: PetUI) => {
    setSelectedPet(pet);
    setShowDossierModal(true);
  };

  const handleShowDossierFromView = () => {
    setShowViewModal(false);
    setShowDossierModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedPet) return;
    
    try {
      await updateAnimalMutation.mutateAsync({
        id: selectedPet.dbId,
        data: editForm
      });
      
      toast({
        title: "Animal modifié",
        description: `${editForm.name} a été modifié avec succès.`,
      });
      
      setShowEditModal(false);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la modification de l'animal.",
        variant: "destructive",
      });
    }
  };

  // Memoized consultations for selected pet to ensure reactivity
  const selectedPetConsultations = useMemo(() => {
    if (!selectedPet) return [];
    return getConsultationsByPetId(selectedPet.id);
  }, [selectedPet, getConsultationsByPetId]);

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Animaux</h1>
          <p className="text-muted-foreground mt-2">
            Suivez tous les animaux et leurs informations médicales
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant={viewMode === 'cards' ? 'default' : 'outline'} 
            onClick={() => setViewMode('cards')}
            className="gap-2"
          >
            <Grid className="h-4 w-4" />
            Cartes
          </Button>
          <Button 
            size="sm" 
            variant={viewMode === 'table' ? 'default' : 'outline'} 
            onClick={() => setViewMode('table')}
            className="gap-2"
          >
            <List className="h-4 w-4" />
            Tableau
          </Button>
          <Button className="gap-2 medical-glow" onClick={() => setShowPetModal(true)}>
            <Plus className="h-4 w-4" />
            Nouvel Animal
          </Button>
        </div>
      </div>

      {/* Statistiques médicales globales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total animaux</p>
                <p className="text-2xl font-bold">{stats?.totalAnimals || pets.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">En bonne santé</p>
                <p className="text-2xl font-bold">{stats?.animalsByStatus?.vivant || pets.filter(p => p.status === 'healthy').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">En traitement</p>
                <p className="text-2xl font-bold">{pets.filter(p => p.status === 'treatment').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Clients actifs</p>
                <p className="text-2xl font-bold">{stats?.totalClients || clients.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Rechercher et filtrer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input 
            placeholder="Rechercher par nom, race ou propriétaire..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
          
          <div className="flex gap-4">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tous types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous types</SelectItem>
                {speciesList.map((sp, idx) => (
                  <SelectItem key={idx} value={sp.toLowerCase()}>
                    {sp}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous statuts</SelectItem>
                <SelectItem value="healthy">En bonne santé</SelectItem>
                <SelectItem value="treatment">En traitement</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {viewMode === 'cards' ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPets.map((pet) => (
            <Card key={pet.id} className="card-hover">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-16 w-16">
                        {pet.photo ? (
                          <AvatarImage src={pet.photo} alt={pet.name} />
                        ) : (
                          <AvatarFallback className="bg-primary-glow text-primary-foreground">
                            <Heart className="h-8 w-8" />
                          </AvatarFallback>
                        )}
                      </Avatar>
                      
                      <div>
                        <h3 className="text-xl font-semibold">{pet.name}</h3>
                        <p className="text-muted-foreground">{pet.breed}</p>
                        <Badge 
                          variant="outline"
                          className={statusStyles[pet.status as keyof typeof statusStyles]}
                        >
                          {pet.status === 'healthy' ? 'En bonne santé' : 
                           pet.status === 'treatment' ? 'En traitement' : 'Urgent'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Type:</span> {pet.type}
                    </div>
                    <div>
                      <span className="font-medium">Âge:</span> {pet.birthDate ? calculateAge(pet.birthDate) : 'Non renseigné'}
                    </div>
                    <div>
                      <span className="font-medium">Poids:</span> {pet.weight}
                    </div>
                    <div>
                      <span className="font-medium">Couleur:</span> {pet.color}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>Propriétaire: {typeof pet.owner === 'string' ? pet.owner : 
                         (() => {
                           const client = clients.find(c => String(c.id) === String(pet.ownerId));
                           return client ? `${client.first_name} ${client.last_name}` : 'Non spécifié';
                         })()}</span>
                         
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Dernière visite: {pet.lastVisit ? new Date(pet.lastVisit).toLocaleDateString('fr-FR') : 'Aucune'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Stethoscope className="h-4 w-4 text-muted-foreground" />
                      <span>Consultations: {getConsultationsByPetId(pet.id).length}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Vaccinations:</h4>
                    <div className="flex gap-1 flex-wrap">
                      {(() => {
                        const petVaccinations = getVaccinationsByPetId(pet.id);
                        return petVaccinations.length > 0 ? (
                          petVaccinations.map((vacc) => (
                            <Badge key={vacc.id} variant="outline" className="text-xs">
                              {vacc.vaccin}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">Aucune vaccination enregistrée</span>
                        );
                      })()}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mb-2">
                    <Button size="sm" variant="outline" className="gap-2" onClick={() => handleView(pet)}>
                      <Eye className="h-4 w-4" />
                      Voir
                    </Button>
                    <Button size="sm" variant="outline" className="gap-2" onClick={() => handleEdit(pet)}>
                      <Edit className="h-4 w-4" />
                      Modifier
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => handleShowDossier(pet)}>
                      Dossier Médical
                    </Button>
                    <Button size="sm" className="flex-1" onClick={() => {
                      setSelectedPet(pet);
                      setShowConsultationModal(true);
                    }}>
                      <Stethoscope className="h-4 w-4 mr-2" />
                      Consultation
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="p-4 font-medium">Animal</th>
                    <th className="p-4 font-medium">Type</th>
                    <th className="p-4 font-medium">Âge</th>
                    <th className="p-4 font-medium">Propriétaire</th>
                    <th className="p-4 font-medium">Statut</th>
                    <th className="p-4 font-medium">Dernière visite</th>
                    <th className="p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPets.map((pet) => (
                    <tr key={pet.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            {pet.photo ? (
                              <AvatarImage src={pet.photo} alt={pet.name} />
                            ) : (
                              <AvatarFallback className="bg-primary-glow text-primary-foreground">
                                <Heart className="h-5 w-5" />
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <div className="font-medium">{pet.name}</div>
                            <div className="text-sm text-muted-foreground">{pet.breed}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">{pet.type}</td>
                      <td className="p-4">{pet.birthDate ? calculateAge(pet.birthDate) : 'Non renseigné'}</td>
                      <td className="p-4">
                        {typeof pet.owner === 'string' ? pet.owner : 
                         (() => {
                           const client = clients.find(c => String(c.id) === String(pet.ownerId));
                           return client ? `${client.first_name} ${client.last_name}` : 'Non spécifié';
                         })()}
                      </td>
                      <td className="p-4">
                        <Badge 
                          variant="outline"
                          className={statusStyles[pet.status as keyof typeof statusStyles]}
                        >
                          {pet.status === 'healthy' ? 'En bonne santé' : 
                           pet.status === 'treatment' ? 'En traitement' : 'Urgent'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        {pet.lastVisit ? new Date(pet.lastVisit).toLocaleDateString('fr-FR') : 'Aucune'}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => handleView(pet)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleEdit(pet)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleShowDossier(pet)}>
                            Dossier
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

            {/* Statistiques médicales détaillées pour l'animal sélectionné */}
      {selectedPet && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Statistiques médicales - {selectedPet.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MedicalStats 
              pet={selectedPet} 
              consultations={selectedPetConsultations} 
            />
          </CardContent>
        </Card>
      )}
      
      <NewPetModal 
        open={showPetModal} 
        onOpenChange={setShowPetModal} 
      />
      
      <NewConsultationModal 
        open={showConsultationModal} 
        onOpenChange={setShowConsultationModal} 
      />
      
      <PetViewModal
        open={showViewModal}
        onOpenChange={setShowViewModal}
        pet={selectedPet}
        onEdit={handleEditFromView}
        onShowDossier={handleShowDossierFromView}
      />
      
      {/* Custom Dynamic Pet Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier Animal</DialogTitle>
            <DialogDescription>
              Modifiez les informations de l'animal.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom *</Label>
                <Input
                  id="name"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="species">Espèce *</Label>
                <Select value={editForm.species} onValueChange={(value) => setEditForm(prev => ({ ...prev, species: value as 'Chien' | 'Chat' | 'Oiseau' | 'Lapin' | 'Furet' | 'Autre' }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner l'espèce" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Chien">Chien</SelectItem>
                    <SelectItem value="Chat">Chat</SelectItem>
                    <SelectItem value="Oiseau">Oiseau</SelectItem>
                    <SelectItem value="Lapin">Lapin</SelectItem>
                    <SelectItem value="Furet">Furet</SelectItem>
                    <SelectItem value="Autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="client_id">Propriétaire *</Label>
              <Select value={editForm.client_id} onValueChange={(value) => setEditForm(prev => ({ ...prev, client_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le propriétaire" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.first_name} {client.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
                   
          
  
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="breed">Race</Label>
                <Input
                  id="breed"
                  value={editForm.breed || ""}
                  onChange={(e) => setEditForm(prev => ({ ...prev, breed: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sex">Sexe</Label>
                <Select value={editForm.sex} onValueChange={(value) => setEditForm(prev => ({ ...prev, sex: value as 'Mâle' | 'Femelle' | 'Inconnu' }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le sexe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mâle">Mâle</SelectItem>
                    <SelectItem value="Femelle">Femelle</SelectItem>
                    <SelectItem value="Inconnu">Inconnu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birth_date">Date de naissance</Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={editForm.birth_date || ""}
                  onChange={(e) => setEditForm(prev => ({ ...prev, birth_date: e.target.value || undefined }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Poids (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={editForm.weight || ""}
                  onChange={(e) => setEditForm(prev => ({ ...prev, weight: e.target.value ? parseFloat(e.target.value) : undefined }))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="color">Couleur</Label>
                <Input
                  id="color"
                  value={editForm.color || ""}
                  onChange={(e) => setEditForm(prev => ({ ...prev, color: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="microchip_number">N° puce électronique</Label>
                <Input
                  id="microchip_number"
                  value={editForm.microchip_number || ""}
                  onChange={(e) => setEditForm(prev => ({ ...prev, microchip_number: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes médicales</Label>
              <Textarea
                id="notes"
                value={editForm.notes || ""}
                onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Notes additionnelles..."
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                Annuler
              </Button>
              <Button onClick={handleSaveEdit} disabled={updateAnimalMutation.isPending}>
                {updateAnimalMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sauvegarder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <SimplePetDossierModal
        open={showDossierModal}
        onOpenChange={setShowDossierModal}
        pet={selectedPet}
      />
    </div>
  );
};

const Pets = () => {
  return <PetsContent />;
};

export default Pets;