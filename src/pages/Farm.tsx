import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Tractor, Users2, AlertTriangle, Calendar, MapPin, Phone, Eye, Edit, Trash2, Stethoscope, Grid, List } from "lucide-react";
import { useClients } from "@/contexts/ClientContext";
import { Farm, FarmIntervention } from "@/contexts/ClientContext";
import { useDisplayPreference } from "@/hooks/use-display-preference";
import { formatDate } from "@/lib/utils";
import NewFarmModal from "@/components/forms/NewFarmModal";
import NewFarmInterventionModal from "@/components/forms/NewFarmInterventionModal";
import FarmViewModal from "@/components/modals/FarmViewModal";
import FarmEditModal from "@/components/modals/FarmEditModal";
import FarmInterventionEditModal from "@/components/modals/FarmInterventionEditModal";
import { useToast } from "@/hooks/use-toast";

const Farm = () => {
  const { 
    farms, 
    farmInterventions, 
    deleteFarm, 
    deleteFarmIntervention,
    getFarmsByStatus,
    getUpcomingFarmInterventions
  } = useClients();
  
  const { toast } = useToast();
  
  const { currentView } = useDisplayPreference('farms');
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [viewMode, setViewMode] = useState<'cards' | 'table'>(currentView);
  const [showNewFarmModal, setShowNewFarmModal] = useState(false);
  const [showNewInterventionModal, setShowNewInterventionModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditFarmModal, setShowEditFarmModal] = useState(false);
  const [showEditInterventionModal, setShowEditInterventionModal] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [selectedIntervention, setSelectedIntervention] = useState<FarmIntervention | null>(null);

  const filteredFarms = farms.filter(farm => {
    const matchesSearch = farm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         farm.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         farm.types?.some(type => type.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         false;
    const matchesType = filterType === "all" || farm.types?.includes(filterType) || false;
    
    return matchesSearch && matchesType;
  });

  const statusStyles = {
    active: "bg-green-100 text-green-800",
    attention: "bg-yellow-100 text-yellow-800",
    urgent: "bg-red-100 text-red-800"
  };

  const healthStyles = {
    good: "bg-green-100 text-green-800",
    attention: "bg-yellow-100 text-yellow-800",
    poor: "bg-red-100 text-red-800"
  };

  const typeLabels = {
    "Bovin laitier": "Élevage bovin laitier",
    "Bovin viande": "Élevage bovin viande",
    "Porcin": "Élevage porcin",
    "Avicole": "Élevage avicole",
    "Ovin": "Élevage ovin",
    "Caprin": "Élevage caprin",
    "Équin": "Élevage équin",
    "Apiculture": "Apiculture",
    "Aquaculture": "Aquaculture",
    "Cuniculture": "Cuniculture",
    "Mixte": "Élevage mixte"
  };

  const interventionTypeLabels = {
    vaccination: "Vaccination",
    controle: "Contrôle sanitaire",
    urgence: "Urgence",
    chirurgie: "Chirurgie",
    prevention: "Prévention",
    consultation: "Consultation"
  };

  const handleViewFarm = (farm: Farm) => {
    setSelectedFarm(farm);
    setShowViewModal(true);
  };

  const handleEditFarm = (farm: Farm) => {
    setSelectedFarm(farm);
    setShowEditFarmModal(true);
  };

  const handleDeleteFarm = (farmId: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette exploitation ?")) {
      deleteFarm(farmId);
      toast({
        title: "Succès",
        description: "Exploitation supprimée"
      });
    }
  };

  const handleNewIntervention = (farm?: Farm) => {
    setShowNewInterventionModal(true);
  };

  const handleDeleteIntervention = (interventionId: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette intervention ?")) {
      deleteFarmIntervention(interventionId);
      toast({
        title: "Succès",
        description: "Intervention supprimée"
      });
    }
  };

  const handleEditIntervention = (intervention: FarmIntervention) => {
    setSelectedIntervention(intervention);
    setShowEditInterventionModal(true);
  };


  const alertFarms = getFarmsByStatus('attention').length + getFarmsByStatus('urgent').length;
  const upcomingInterventions = getUpcomingFarmInterventions();

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Exploitations</h1>
          <p className="text-muted-foreground mt-2">
            Gérez les fermes, élevages et interventions vétérinaires
          </p>
        </div>
        
        <Button className="gap-2 medical-glow" onClick={() => setShowNewFarmModal(true)}>
          <Plus className="h-4 w-4" />
          Nouvelle Exploitation
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Tractor className="h-12 w-12 text-primary mx-auto mb-4" />
            <div className="text-2xl font-bold">{farms.length}</div>
            <div className="text-sm text-muted-foreground">Exploitations</div>
          </CardContent>
        </Card>
        

        
        <Card>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-accent mx-auto mb-4" />
            <div className="text-2xl font-bold">{alertFarms}</div>
            <div className="text-sm text-muted-foreground">Alertes actives</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <div className="text-2xl font-bold">{upcomingInterventions.length}</div>
            <div className="text-sm text-muted-foreground">Interventions à venir</div>
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
          <div className="flex gap-4">
            <Input 
              placeholder="Rechercher par nom, propriétaire ou type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Type d'élevage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous types</SelectItem>
                <SelectItem value="Bovin laitier">Élevage bovin laitier</SelectItem>
                <SelectItem value="Bovin viande">Élevage bovin viande</SelectItem>
                <SelectItem value="Porcin">Élevage porcin</SelectItem>
                <SelectItem value="Avicole">Élevage avicole</SelectItem>
                <SelectItem value="Ovin">Élevage ovin</SelectItem>
                <SelectItem value="Caprin">Élevage caprin</SelectItem>
                <SelectItem value="Équin">Élevage équin</SelectItem>
                <SelectItem value="Apiculture">Apiculture</SelectItem>
                <SelectItem value="Aquaculture">Aquaculture</SelectItem>
                <SelectItem value="Cuniculture">Cuniculture</SelectItem>
                <SelectItem value="Mixte">Élevage mixte</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="farms" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="farms" className="gap-2">
            <Tractor className="h-4 w-4" />
            Exploitations
          </TabsTrigger>
          <TabsTrigger value="interventions" className="gap-2">
            <Calendar className="h-4 w-4" />
            Interventions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="farms" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Exploitations ({filteredFarms.length})
            </h3>
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
              <Button onClick={() => setShowNewInterventionModal(true)} className="gap-2">
                <Stethoscope className="h-4 w-4" />
                Nouvelle Intervention
              </Button>
            </div>
          </div>
          
          {filteredFarms.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                Aucune exploitation trouvée
              </CardContent>
            </Card>
          ) : viewMode === 'cards' ? (
            filteredFarms.map((farm) => (
              <Card key={farm.id} className="card-hover">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-4">
                        <h4 className="text-xl font-semibold">{farm.name}</h4>
                        <Badge 
                          variant="outline"
                          className={statusStyles[farm.status]}
                        >
                          {farm.status === 'active' ? 'Actif' : 
                           farm.status === 'attention' ? 'Attention' : 'Urgent'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <p><strong>Propriétaire:</strong> {farm.owner}</p>
                          <p className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {farm.address}
                          </p>
                          <p className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {farm.phone}
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <p><strong>Types:</strong> 
                            <div className="flex flex-wrap gap-1 mt-1">
                              {farm.types?.map((type) => (
                                <Badge key={type} variant="secondary" className="text-xs">
                                  {typeLabels[type] || type}
                                </Badge>
                              ))}
                            </div>
                          </p>
                          <p><strong>Animaux:</strong> {farm.totalAnimals}</p>
                          <p><strong>Vétérinaire:</strong> {farm.veterinarian}</p>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        Dernière visite: {formatDate(farm.lastVisit)}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewFarm(farm)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEditFarm(farm)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleNewIntervention(farm)}
                      >
                        <Stethoscope className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDeleteFarm(farm.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr className="text-left">
                        <th className="p-4 font-medium">Exploitation</th>
                        <th className="p-4 font-medium">Propriétaire</th>
                        <th className="p-4 font-medium">Type</th>
                        <th className="p-4 font-medium">Statut</th>
                        <th className="p-4 font-medium">Animaux</th>
                        <th className="p-4 font-medium">Contact</th>
                        <th className="p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFarms.map((farm) => (
                        <tr key={farm.id} className="border-b hover:bg-muted/50">
                          <td className="p-4">
                            <div>
                              <div className="font-medium">{farm.name}</div>
                              <div className="text-sm text-muted-foreground">{farm.address}</div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div>
                              <div className="font-medium">{farm.owner}</div>
                              <div className="text-sm text-muted-foreground">Vét: {farm.veterinarian}</div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1">
                              {farm.types?.map((type) => (
                                <Badge key={type} variant="secondary" className="text-xs">
                                  {typeLabels[type] || type}
                                </Badge>
                              ))}
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge 
                              variant="outline"
                              className={statusStyles[farm.status]}
                            >
                              {farm.status === 'active' ? 'Actif' : 
                               farm.status === 'attention' ? 'Attention' : 'Urgent'}
                            </Badge>
                          </td>
                          <td className="p-4">{farm.totalAnimals}</td>
                          <td className="p-4">
                            <div className="text-sm">
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {farm.phone}
                              </div>
                              <div className="text-muted-foreground">
                                Dernière visite: {formatDate(farm.lastVisit)}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleViewFarm(farm)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleEditFarm(farm)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm"
                                onClick={() => handleNewIntervention(farm)}
                              >
                                <Stethoscope className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleDeleteFarm(farm.id)}
                              >
                                <Trash2 className="h-4 w-4" />
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
        </TabsContent>



        <TabsContent value="interventions" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Interventions récentes ({farmInterventions.length})
            </h3>
            <Button onClick={() => setShowNewInterventionModal(true)} className="gap-2">
              <Stethoscope className="h-4 w-4" />
              Nouvelle Intervention
            </Button>
          </div>
          
          {farmInterventions.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                Aucune intervention enregistrée
              </CardContent>
            </Card>
          ) : (
            farmInterventions.map((intervention) => (
              <Card key={intervention.id} className="card-hover">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-4">
                          <h4 className="text-lg font-semibold">
                            {interventionTypeLabels[intervention.type]}
                          </h4>
                          <Badge 
                            variant="outline"
                            className={intervention.status === 'completed' ? 
                              'bg-green-100 text-green-800' : 
                              intervention.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'}
                          >
                            {intervention.status === 'completed' ? 'Terminé' : 
                             intervention.status === 'ongoing' ? 'En cours' :
                             intervention.status === 'scheduled' ? 'Programmé' : 'Annulé'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(intervention.date)}
                          </span>
                          <span>{intervention.farmName}</span>
                          <span>{intervention.veterinarian}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Animaux concernés:</span> {intervention.animals}
                      </div>
                      <div>
                        <span className="font-medium">Suivi:</span> {intervention.followUp || 'Aucun'}
                      </div>
                    </div>
                    
                    <p className="text-sm">{intervention.description}</p>
                    
                    <div className="flex gap-2 pt-2 border-t">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEditIntervention(intervention)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {intervention.status === 'ongoing' && (
                        <Button size="sm">
                          <Stethoscope className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDeleteIntervention(intervention.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Modales */}
      <NewFarmModal 
        open={showNewFarmModal} 
        onOpenChange={setShowNewFarmModal} 
      />
      
      <NewFarmInterventionModal 
        open={showNewInterventionModal} 
        onOpenChange={setShowNewInterventionModal}
        farmId={selectedFarm?.id}
        farmName={selectedFarm?.name}
      />
      
      <FarmViewModal 
        farm={selectedFarm}
        open={showViewModal}
        onOpenChange={setShowViewModal}
        onEdit={() => handleEditFarm(selectedFarm!)}
        onNewIntervention={() => {
          setShowViewModal(false);
          setShowNewInterventionModal(true);
        }}
      />

      <FarmEditModal
        farm={selectedFarm}
        open={showEditFarmModal}
        onOpenChange={setShowEditFarmModal}
      />

      <FarmInterventionEditModal
        intervention={selectedIntervention}
        open={showEditInterventionModal}
        onOpenChange={setShowEditInterventionModal}
      />
    </div>
  );
};

export default Farm;