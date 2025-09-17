import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Stethoscope, Plus, Eye, Edit, FileText, Calendar, User, Heart, TrendingUp, Clock, Activity, DollarSign } from "lucide-react";
import { useState } from "react";
import { NewConsultationModal } from "@/components/forms/NewConsultationModal";
import { ConsultationEditModal } from "@/components/modals/ConsultationEditModal";
import { ConsultationPrint } from "@/components/ConsultationPrint";
import { useClients, Consultation } from "@/contexts/ClientContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useToast } from "@/hooks/use-toast";

export function ConsultationsOverview() {
  const { consultations, deleteConsultation, pets, clients } = useClients();
  const { settings } = useSettings();
  const { toast } = useToast();
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);

  // Trier les consultations par date (plus récente en premier)
  const sortedConsultations = [...consultations].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Prendre les 5 consultations les plus récentes
  const recentConsultations = sortedConsultations.slice(0, 5);

  // Calculer les statistiques des consultations
  const totalConsultations = consultations.length;
  const consultationsToday = consultations.filter(c => c.date === new Date().toISOString().split('T')[0]).length;
  
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const consultationsThisMonth = consultations.filter(c => {
    const consultationDate = new Date(c.date);
    return consultationDate.getMonth() === thisMonth && consultationDate.getFullYear() === thisYear;
  }).length;

  const consultationsLastMonth = consultations.filter(c => {
    const consultationDate = new Date(c.date);
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;
    return consultationDate.getMonth() === lastMonth && consultationDate.getFullYear() === lastMonthYear;
  }).length;

  const changePercentage = consultationsLastMonth > 0 ? 
    Math.round(((consultationsThisMonth - consultationsLastMonth) / consultationsLastMonth) * 100) : 
    consultationsThisMonth > 0 ? 100 : 0;

  // Calculer les revenus estimés
  const estimatedRevenue = consultationsThisMonth * 50; // Estimation de 50€ par consultation
  const previousRevenue = consultationsLastMonth * 50;
  const revenueChange = previousRevenue > 0 ? 
    Math.round(((estimatedRevenue - previousRevenue) / previousRevenue) * 100) : 
    estimatedRevenue > 0 ? 100 : 0;

  const handleEdit = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setShowEditModal(true);
  };

  const handleDelete = (consultation: Consultation) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la consultation pour ${consultation.petName} ?`)) {
      deleteConsultation(consultation.id);
      toast({
        title: "Consultation supprimée",
        description: `La consultation pour ${consultation.petName} a été supprimée.`,
      });
    }
  };

  const getStatusColor = (consultation: Consultation) => {
    const today = new Date().toISOString().split('T')[0];
    if (consultation.date === today) return "bg-accent text-accent-foreground";
    if (consultation.date < today) return "bg-secondary text-secondary-foreground";
    return "bg-primary text-primary-foreground";
  };

  const getStatusText = (consultation: Consultation) => {
    const today = new Date().toISOString().split('T')[0];
    if (consultation.date === today) return "Aujourd'hui";
    if (consultation.date < today) return "Terminée";
    return "À venir";
  };

  const getConsultationDetails = (consultation: Consultation) => {
    const pet = pets.find(p => p.id === consultation.petId);
    const client = clients.find(c => c.id === consultation.clientId);
    
    return {
      petType: pet?.type || 'Inconnu',
      petBreed: pet?.breed || 'Non spécifiée',
      clientPhone: client?.phone || 'Non spécifié',
      clientCity: client?.city || 'Non spécifiée'
    };
  };

  return (
    <>
      <Card className="card-hover">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Consultations Récentes</CardTitle>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Stethoscope className="h-3 w-3" />
                <span>{totalConsultations} total</span>
              </div>
              <div className="flex items-center gap-1">
                <Activity className="h-3 w-3" />
                <span>{consultationsToday} aujourd'hui</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                <span>{consultationsThisMonth} ce mois</span>
                {changePercentage !== 0 && (
                  <Badge variant={changePercentage > 0 ? "default" : "destructive"} className="text-xs">
                    {changePercentage > 0 ? '+' : ''}{changePercentage}%
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                <span>~{estimatedRevenue}€ ce mois</span>
                {revenueChange !== 0 && (
                  <Badge variant={revenueChange > 0 ? "default" : "destructive"} className="text-xs">
                    {revenueChange > 0 ? '+' : ''}{revenueChange}%
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Button size="sm" className="gap-2" onClick={() => setShowConsultationModal(true)}>
            <Plus className="h-4 w-4" />
            Nouvelle Consultation
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentConsultations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Stethoscope className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>Aucune consultation enregistrée</p>
              <p className="text-sm">Commencez par créer votre première consultation</p>
            </div>
          ) : (
            recentConsultations.map((consultation) => {
              const details = getConsultationDetails(consultation);
              return (
                <div 
                  key={consultation.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary-glow text-primary-foreground">
                        <Stethoscope className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">Consultation #{consultation.id}</h4>
                        <Badge variant="outline" className={getStatusColor(consultation)}>
                          {getStatusText(consultation)}
                        </Badge>
                        {consultation.cost && (
                          <Badge variant="secondary" className="text-xs">
                            {consultation.cost} {settings.currency || '€'}
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            <span>{consultation.petName} ({details.petType})</span>
                            {details.petBreed !== 'Non spécifiée' && <span> - {details.petBreed}</span>}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{consultation.clientName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(consultation.date).toLocaleDateString('fr-FR')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <div className="flex items-center gap-4">
                          {consultation.diagnosis && (
                            <span>Diagnostic: {consultation.diagnosis}</span>
                          )}
                          {consultation.weight && (
                            <span>Poids: {consultation.weight}</span>
                          )}
                          {consultation.temperature && (
                            <span>Température: {consultation.temperature}°C</span>
                          )}
                          {consultation.photos && consultation.photos.length > 0 && (
                            <span>📷 {consultation.photos.length} photo{consultation.photos.length > 1 ? 's' : ''}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(consultation)} className="gap-2">
                      <Edit className="h-4 w-4" />
                      Modifier
                    </Button>
                    <ConsultationPrint consultation={consultation} />
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => handleDelete(consultation)}
                      className="gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <NewConsultationModal 
        open={showConsultationModal} 
        onOpenChange={setShowConsultationModal} 
      />
      
      <ConsultationEditModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        consultation={selectedConsultation}
      />
    </>
  );
}
