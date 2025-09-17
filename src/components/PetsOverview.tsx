import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Plus, Calendar, Eye, Edit, Stethoscope, TrendingUp, Clock, Activity, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { NewPetModal } from "@/components/forms/NewPetModal";
import { PetViewModal } from "@/components/modals/PetViewModal";
import { PetEditModal } from "@/components/modals/PetEditModal";
import { PetDossierModal } from "@/components/modals/PetDossierModal";
import { NewConsultationModal } from "@/components/forms/NewConsultationModal";
import { useClients, Pet } from "@/contexts/ClientContext";
import { useSettings } from "@/contexts/SettingsContext";
import { calculateAge } from "@/lib/utils";

const statusStyles = {
  healthy: "bg-secondary text-secondary-foreground",
  treatment: "bg-accent text-accent-foreground", 
  urgent: "bg-destructive text-destructive-foreground"
};

export function PetsOverview() {
  const { pets, consultations, appointments, clients } = useClients();
  const { settings } = useSettings();
  const [showPetModal, setShowPetModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDossierModal, setShowDossierModal] = useState(false);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);

  // Trier les animaux par dernière visite (plus récente en premier)
  const sortedPets = [...pets].sort((a, b) => {
    if (!a.lastVisit && !b.lastVisit) return 0;
    if (!a.lastVisit) return 1;
    if (!b.lastVisit) return -1;
    return new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime();
  });

  // Prendre les 5 animaux les plus récents
  const recentPets = sortedPets.slice(0, 5);

  // Calculer les statistiques des animaux
  const totalPets = pets.length;
  const healthyPets = pets.filter(p => p.status === 'healthy').length;
  const treatmentPets = pets.filter(p => p.status === 'treatment').length;
  const urgentPets = pets.filter(p => p.status === 'urgent').length;

  const newPetsThisMonth = pets.filter(p => {
    if (!p.lastVisit) return false;
    const lastVisit = new Date(p.lastVisit);
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    return lastVisit.getMonth() === thisMonth && lastVisit.getFullYear() === thisYear;
  }).length;

  const averageConsultationsPerPet = totalPets > 0 ? (consultations.length / totalPets).toFixed(1) : "0";

  const handleView = (pet: Pet) => {
    setSelectedPet(pet);
    setShowViewModal(true);
  };

  const handleEdit = (pet: Pet) => {
    setSelectedPet(pet);
    setShowEditModal(true);
  };

  const handleShowDossier = (pet: Pet) => {
    setSelectedPet(pet);
    setShowDossierModal(true);
  };

  const handleNewConsultation = (pet: Pet) => {
    setSelectedPet(pet);
    setShowConsultationModal(true);
  };

  const getPetActivity = (pet: Pet) => {
    const petConsultations = consultations.filter(c => c.petId === pet.id);
    const petAppointments = appointments.filter(a => a.petId === pet.id);
    const petOwner = clients.find(c => c.id === pet.ownerId);
    
    return {
      consultations: petConsultations.length,
      appointments: petAppointments.length,
      owner: petOwner?.name || pet.owner,
      lastConsultation: petConsultations.length > 0 ? 
        Math.max(...petConsultations.map(c => new Date(c.date).getTime())) : 
        pet.lastVisit ? new Date(pet.lastVisit).getTime() : 0
    };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Heart className="h-3 w-3 text-green-600" />;
      case 'treatment':
        return <Stethoscope className="h-3 w-3 text-yellow-600" />;
      case 'urgent':
        return <AlertTriangle className="h-3 w-3 text-red-600" />;
      default:
        return <Heart className="h-3 w-3" />;
    }
  };
  
  return (
    <>
      <Card className="card-hover">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Animaux Récents</CardTitle>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                <span>{totalPets} total</span>
              </div>
              <div className="flex items-center gap-1">
                <Activity className="h-3 w-3" />
                <span>{healthyPets} en bonne santé</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                <span>+{newPetsThisMonth} ce mois</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Ø {averageConsultationsPerPet} consultations</span>
              </div>
            </div>
          </div>
          <Button size="sm" className="gap-2" onClick={() => setShowPetModal(true)}>
            <Plus className="h-4 w-4" />
            Nouvel Animal
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentPets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>Aucun animal enregistré</p>
              <p className="text-sm">Commencez par créer votre premier animal</p>
            </div>
          ) : (
            recentPets.map((pet) => {
              const activity = getPetActivity(pet);
              return (
                <div 
                  key={pet.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <Avatar className="h-12 w-12 flex-shrink-0">
                      {pet.photo ? (
                        <AvatarImage src={pet.photo} alt={pet.name} />
                      ) : (
                        <AvatarFallback className="bg-primary-glow text-primary-foreground">
                          <Heart className="h-6 w-6" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium truncate">{pet.name}</h4>
                        <Badge 
                          variant="outline" 
                          className={statusStyles[pet.status as keyof typeof statusStyles]}
                        >
                          {getStatusIcon(pet.status)}
                          <span className="ml-1">
                            {pet.status === 'healthy' ? 'En bonne santé' : 
                             pet.status === 'treatment' ? 'En traitement' : 'Urgent'}
                          </span>
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <span className="font-medium">{pet.type}</span>
                            {pet.breed && <span> - {pet.breed}</span>}
                            {pet.gender && <span> ({pet.gender === 'male' ? 'Mâle' : 'Femelle'})</span>}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{pet.birthDate ? calculateAge(pet.birthDate) : 'Âge inconnu'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Propriétaire: {activity.owner}</span>
                        <span>Consultations: {activity.consultations}</span>
                        <span>RDV: {activity.appointments}</span>
                        {pet.lastVisit && (
                          <span>Dernière visite: {new Date(pet.lastVisit).toLocaleDateString('fr-FR')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-1 flex-shrink-0 ml-2">
                    <Button size="sm" variant="outline" onClick={() => handleView(pet)} className="h-8 px-2">
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleEdit(pet)} className="h-8 px-2">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleShowDossier(pet)} className="h-8 px-2 text-xs">
                      Dossier
                    </Button>
                    <Button size="sm" onClick={() => handleNewConsultation(pet)} className="h-8 px-2 text-xs">
                      <Stethoscope className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <NewPetModal 
        open={showPetModal} 
        onOpenChange={setShowPetModal} 
      />
      
      <PetViewModal
        open={showViewModal}
        onOpenChange={setShowViewModal}
        pet={selectedPet}
        onEdit={() => {
          setShowViewModal(false);
          setShowEditModal(true);
        }}
        onShowDossier={() => {
          setShowViewModal(false);
          setShowDossierModal(true);
        }}
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
      
      <NewConsultationModal 
        open={showConsultationModal} 
        onOpenChange={setShowConsultationModal} 
      />
    </>
  );
}