import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"; // Added AvatarImage
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Heart, User, Calendar, Stethoscope, Eye, Edit, Activity, Grid, List } from "lucide-react";
import { NewPetModal } from "@/components/forms/NewPetModal";
import { NewConsultationModal } from "@/components/forms/NewConsultationModal";
import { PetViewModal } from "@/components/modals/PetViewModal";
import { PetEditModal } from "@/components/modals/PetEditModal";
import { PetDossierModal } from "@/components/modals/PetDossierModal";
import { MedicalStats } from "@/components/MedicalStats";
import { ClientProvider, useClients, Pet } from "@/contexts/ClientContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useDisplayPreference } from "@/hooks/use-display-preference";
import { calculateAge } from "@/lib/utils";

const statusStyles = {
  healthy: "bg-secondary text-secondary-foreground",
  treatment: "bg-accent text-accent-foreground", 
  urgent: "bg-destructive text-destructive-foreground"
};

const PetsContent = () => {
  const { pets, clients, consultations, getConsultationsByPetId } = useClients();
  const { currentView } = useDisplayPreference('pets');
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState<'cards' | 'table'>(currentView);
  const { settings } = useSettings();
  const speciesList = settings.species.split(',').map(s => s.trim()).filter(s => s.length > 0);
  const [showPetModal, setShowPetModal] = useState(false);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDossierModal, setShowDossierModal] = useState(false);

  const filteredPets = pets.filter(pet => {
    const matchesSearch = pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (pet.breed && pet.breed.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         pet.owner.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || pet.type.toLowerCase() === filterType.toLowerCase();
    const matchesStatus = filterStatus === "all" || pet.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleView = (pet: Pet) => {
    setSelectedPet(pet);
    setShowViewModal(true);
  };

  const handleEdit = (pet: Pet) => {
    setSelectedPet(pet);
    setShowEditModal(true);
  };

  const handleEditFromView = () => {
    setShowViewModal(false);
    setShowEditModal(true);
  };

  const handleShowDossier = (pet: Pet) => {
    setSelectedPet(pet);
    setShowDossierModal(true);
  };

  const handleShowDossierFromView = () => {
    setShowViewModal(false);
    setShowDossierModal(true);
  };

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
                <p className="text-2xl font-bold">{pets.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Consultations</p>
                <p className="text-2xl font-bold">{consultations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Ce mois</p>
                <p className="text-2xl font-bold">
                  {consultations.filter(c => {
                    const consultationDate = new Date(c.date);
                    const now = new Date();
                    return consultationDate.getMonth() === now.getMonth() && 
                           consultationDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
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
                <p className="text-2xl font-bold">{clients.length}</p>
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
                      <span>Propriétaire: {pet.owner}</span>
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
                      {pet.vaccinations && pet.vaccinations.length > 0 ? (
                        pet.vaccinations.map((vacc, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {vacc}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">Aucune vaccination enregistrée</span>
                      )}
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
                      <td className="p-4">{pet.owner}</td>
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
              consultations={getConsultationsByPetId(selectedPet.id)} 
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
      
      <PetEditModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        pet={selectedPet}
      />
      
      <PetDossierModal
        open={showDossierModal}
        onOpenChange={setShowDossierModal}
        pet={selectedPet}
      />
    </div>
  );
};

const Pets = () => {
  return (
    <ClientProvider>
      <PetsContent />
    </ClientProvider>
  );
};

export default Pets;