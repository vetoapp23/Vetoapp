import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, FileText, Heart, User, Calendar, Pill, Thermometer, Edit, Trash2, Grid, List } from "lucide-react";
import { NewConsultationModal } from "@/components/forms/NewConsultationModal";
import { ConsultationEditModal } from "@/components/modals/ConsultationEditModal";
import { ConsultationPrint } from "@/components/ConsultationPrint";
import NewPrescriptionModal from "@/components/forms/NewPrescriptionModal";
import { useClients, Consultation } from "@/contexts/ClientContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useToast } from "@/hooks/use-toast";
import { useDisplayPreference } from "@/hooks/use-display-preference";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const Consultations = () => {
  const { consultations, deleteConsultation } = useClients();
  const { settings } = useSettings();
  const { toast } = useToast();
  const { currentView } = useDisplayPreference('consultations');
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [viewMode, setViewMode] = useState<'cards' | 'table'>(currentView);
  const [showNewConsultation, setShowNewConsultation] = useState(false);
  const [showEditConsultation, setShowEditConsultation] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [showNewPrescription, setShowNewPrescription] = useState(false);
  const [prescriptionPetId, setPrescriptionPetId] = useState<number | null>(null);
  const [prescriptionConsultationId, setPrescriptionConsultationId] = useState<number | null>(null);

  const filteredConsultations = consultations.filter(consultation => {
    const matchesSearch = consultation.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         consultation.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (consultation.symptoms && consultation.symptoms.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (consultation.diagnosis && consultation.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filterPeriod === "all") return matchesSearch;
    
    const consultationDate = new Date(consultation.date);
    const today = new Date();
    const daysAgo = (today.getTime() - consultationDate.getTime()) / (1000 * 3600 * 24);
    
    switch (filterPeriod) {
      case "week":
        return matchesSearch && daysAgo <= 7;
      case "month":
        return matchesSearch && daysAgo <= 30;
      case "quarter":
        return matchesSearch && daysAgo <= 90;
      default:
        return matchesSearch;
    }
  });

  const handleEditConsultation = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setShowEditConsultation(true);
  };

  const handleNewPrescription = (consultation: Consultation) => {
    setPrescriptionPetId(consultation.petId);
    setPrescriptionConsultationId(consultation.id);
    setShowNewPrescription(true);
  };

  const handleDeleteConsultation = (consultation: Consultation) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la consultation pour ${consultation.petName} ?`)) {
      deleteConsultation(consultation.id);
      toast({
        title: "Consultation supprimée",
        description: `La consultation pour ${consultation.petName} a été supprimée.`,
      });
    }
  };

  const handleNewFollowUp = (consultation: Consultation) => {
    // Pré-remplir le formulaire avec les informations du client et de l'animal
    setSelectedConsultation({
      ...consultation,
      id: 0, // Nouveau ID sera généré
      date: new Date().toISOString().split('T')[0], // Date d'aujourd'hui
      symptoms: "",
      diagnosis: "",
      treatment: "",
      medications: "",
      followUp: "",
      cost: "",
      notes: ""
    });
    setShowNewConsultation(true);
  };

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Consultations</h1>
          <p className="text-muted-foreground mt-2">
            Gérez et consultez tous les dossiers médicaux
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex border rounded-lg p-1">
            <Button
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('cards')}
              className="px-3"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="px-3"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button 
            className="gap-2 medical-glow"
            onClick={() => setShowNewConsultation(true)}
          >
            <Plus className="h-4 w-4" />
            Nouvelle Consultation
          </Button>
        </div>
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
              placeholder="Rechercher par client, animal, symptômes ou diagnostic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
            
            <Select value={filterPeriod} onValueChange={setFilterPeriod}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les périodes</SelectItem>
                <SelectItem value="week">Cette semaine</SelectItem>
                <SelectItem value="month">Ce mois</SelectItem>
                <SelectItem value="quarter">Ce trimestre</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          Consultations récentes ({filteredConsultations.length})
        </h3>
        
        {filteredConsultations.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>Aucune consultation trouvée</p>
              <p className="text-sm">Commencez par créer votre première consultation</p>
            </CardContent>
          </Card>
        ) : viewMode === 'cards' ? (
          filteredConsultations.map((consultation) => (
            <Card key={consultation.id} className="card-hover">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        <h4 className="text-lg font-semibold">{consultation.petName}</h4>
                        <Badge variant="secondary">Consultation</Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(consultation.date).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {consultation.clientName}
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          Consultation #{consultation.id}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm">
                      {consultation.temperature && (
                        <div className="flex items-center gap-1">
                          <Thermometer className="h-4 w-4 text-primary" />
                          {consultation.temperature}°C
                        </div>
                      )}
                      {consultation.weight && (
                        <span>{consultation.weight} kg</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      {consultation.symptoms && (
                        <>
                          <h5 className="font-medium">Symptômes:</h5>
                          <p className="text-sm">{consultation.symptoms}</p>
                        </>
                      )}
                      
                      {consultation.diagnosis && (
                        <>
                          <h5 className="font-medium">Diagnostic:</h5>
                          <p className="text-sm">{consultation.diagnosis}</p>
                        </>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      {consultation.treatment && (
                        <>
                          <h5 className="font-medium">Traitement:</h5>
                          <p className="text-sm">{consultation.treatment}</p>
                        </>
                      )}
                      
                      {consultation.medications && (
                        <>
                          <h5 className="font-medium flex items-center gap-1">
                            <Pill className="h-4 w-4" />
                            Médicaments:
                          </h5>
                          <p className="text-sm">{consultation.medications}</p>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {consultation.notes && (
                    <div className="space-y-2">
                      <h5 className="font-medium">Notes:</h5>
                      <p className="text-sm bg-muted p-3 rounded">{consultation.notes}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      {consultation.followUp ? `Suivi: ${consultation.followUp}` : 'Aucun suivi prévu'}
                    </span>
                    
                    <div className="flex gap-2">
                      <ConsultationPrint consultation={consultation} />
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEditConsultation(consultation)}
                        className="gap-1"
                      >
                        <Edit className="h-3 w-3" />
                        Modifier
                      </Button>
                      <Button 
                        size="sm" 
                        variant="default"
                        onClick={() => handleNewPrescription(consultation)}
                        className="gap-1"
                      >
                        <Pill className="h-3 w-3" />
                        Prescription
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDeleteConsultation(consultation)}
                        className="gap-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                        Supprimer
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleNewFollowUp(consultation)}
                      >
                        Nouveau suivi
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Animal / Client</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Symptômes</TableHead>
                    <TableHead>Diagnostic</TableHead>
                    <TableHead>Température</TableHead>
                    <TableHead>Coût</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredConsultations.map((consultation) => (
                    <TableRow key={consultation.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{consultation.petName}</div>
                          <div className="text-sm text-muted-foreground">{consultation.clientName}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(consultation.date).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">
                          {consultation.symptoms || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">
                          {consultation.diagnosis || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {consultation.temperature ? `${consultation.temperature}°C` : '-'}
                      </TableCell>
                      <TableCell>
                        {consultation.cost ? `${consultation.cost} ${settings.currency}` : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <ConsultationPrint consultation={consultation} />
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditConsultation(consultation)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => handleNewPrescription(consultation)}
                          >
                            <Pill className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDeleteConsultation(consultation)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
      
      <NewConsultationModal 
        open={showNewConsultation} 
        onOpenChange={setShowNewConsultation} 
      />
      
      <ConsultationEditModal
        open={showEditConsultation}
        onOpenChange={setShowEditConsultation}
        consultation={selectedConsultation}
      />
      
      {prescriptionPetId && (
        <NewPrescriptionModal
          open={showNewPrescription}
          onOpenChange={setShowNewPrescription}
          petId={prescriptionPetId}
          consultationId={prescriptionConsultationId || undefined}
        />
      )}
    </div>
  );
};

export default Consultations;