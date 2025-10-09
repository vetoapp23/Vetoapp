import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Plus, Calendar, Eye, Edit, Stethoscope, TrendingUp, Clock, Activity, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { NewPetModal } from "@/components/forms/NewPetModal";
import { useClients, useAnimals, useConsultations, useAppointments, type Animal } from "@/hooks/useDatabase";
import { useSettings } from "@/contexts/SettingsContext";
import { calculateAge } from "@/lib/utils";

const statusStyles = {
  healthy: "bg-secondary text-secondary-foreground",
  treatment: "bg-accent text-accent-foreground", 
  urgent: "bg-destructive text-destructive-foreground"
};

export function PetsOverview() {
  const { data: clients = [] } = useClients();
  const { data: pets = [] } = useAnimals();
  const { data: consultations = [] } = useConsultations();
  const { data: appointments = [] } = useAppointments();
  const { settings } = useSettings();
  const [showPetModal, setShowPetModal] = useState(false);

  // Calculate pet statistics with real data
  const totalPets = pets.length;
  
  // Calculate pets by status
  const healthyPets = pets.filter(p => p.status === 'vivant').length;
  const sickPets = pets.filter(p => {
    // Check if pet has recent consultations indicating treatment
    const recentConsultations = consultations.filter(c => 
      c.animal_id === p.id && 
      new Date(c.consultation_date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );
    return recentConsultations.length > 0;
  }).length;
  
  // Sort pets by last consultation (most recent first)
  const petsWithActivity = pets.map(pet => {
    const petConsultations = consultations.filter(c => c.animal_id === pet.id);
    const lastConsultation = petConsultations.length > 0 
      ? Math.max(...petConsultations.map(c => new Date(c.consultation_date).getTime()))
      : 0;
    return {
      ...pet,
      lastActivity: lastConsultation > 0 ? new Date(lastConsultation).toISOString() : pet.created_at,
      consultationsCount: petConsultations.length
    };
  });

  const sortedPets = [...petsWithActivity].sort((a, b) => 
    new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
  );

  // Take the 5 most recent pets
  const recentPets = sortedPets.slice(0, 5);

  // Calculate stats for this month
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const newPetsThisMonth = pets.filter(p => {
    const createdDate = new Date(p.created_at);
    return createdDate.getMonth() === thisMonth && createdDate.getFullYear() === thisYear;
  }).length;

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Animaux Récents
          </CardTitle>
          <Button 
            size="sm" 
            onClick={() => setShowPetModal(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Nouveau
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-primary">{totalPets}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{healthyPets}</div>
            <div className="text-sm text-muted-foreground">En bonne santé</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{sickPets}</div>
            <div className="text-sm text-muted-foreground">En traitement</div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span>+{newPetsThisMonth} ce mois</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-purple-600" />
            <span>{totalPets} suivis actifs</span>
          </div>
        </div>

        {/* Recent Pets List */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground">Derniers animaux</h4>
          {recentPets.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Aucun animal trouvé
            </p>
          ) : (
            recentPets.map((pet) => {
              const owner = clients.find(c => c.id === pet.client_id);
              const ownerName = owner ? `${owner.first_name} ${owner.last_name}` : 'Propriétaire inconnu';
              
              const getStatusColor = (status: string) => {
                switch (status) {
                  case 'vivant': return 'bg-green-100 text-green-800';
                  case 'décédé': return 'bg-red-100 text-red-800';
                  case 'perdu': return 'bg-orange-100 text-orange-800';
                  default: return 'bg-gray-100 text-gray-800';
                }
              };

              const getSpeciesIcon = (species: string) => {
                // You can add more specific logic here
                return '🐾';
              };

              return (
                <div
                  key={pet.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="h-9 w-9 flex-shrink-0">
                      {pet.photo_url ? (
                        <AvatarImage src={pet.photo_url} alt={pet.name} />
                      ) : (
                        <AvatarFallback className="text-sm">
                          {getSpeciesIcon(pet.species)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-medium truncate">{pet.name}</h4>
                        <Badge variant="outline" className="text-xs flex-shrink-0">
                          {pet.species}
                        </Badge>
                        <Badge className={`text-xs flex-shrink-0 ${getStatusColor(pet.status)}`}>
                          {pet.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground flex-wrap">
                        <span>Propriétaire: {ownerName}</span>
                        {pet.breed && <span>Race: {pet.breed}</span>}
                        {pet.birth_date && (
                          <span>Âge: {calculateAge(pet.birth_date)}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground flex-wrap">
                        <span>Consultations: {pet.consultationsCount}</span>
                        <span>Dernière activité: {new Date(pet.lastActivity).toLocaleDateString()}</span>
                        {pet.weight && <span>Poids: {pet.weight}kg</span>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>

      {/* Modals */}
      <NewPetModal 
        open={showPetModal} 
        onOpenChange={setShowPetModal}
      />
    </Card>
  );
}