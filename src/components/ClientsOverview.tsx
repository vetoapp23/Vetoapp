import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Phone, Mail, MapPin, Plus, Eye, Edit, Users, TrendingUp, Clock, Activity } from "lucide-react";
import { useState } from "react";
import { NewClientModal } from "@/components/forms/NewClientModal";
import { ClientViewModal } from "@/components/modals/ClientViewModal";
import { ClientEditModal } from "@/components/modals/ClientEditModal";
import { useClients, Client } from "@/contexts/ClientContext";
import { useSettings } from "@/contexts/SettingsContext";

export function ClientsOverview() {
  const { clients, pets, consultations, appointments } = useClients();
  const { settings } = useSettings();
  const [showClientModal, setShowClientModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Trier les clients par dernière visite (plus récente en premier)
  const sortedClients = [...clients].sort((a, b) => 
    new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime()
  );

  // Prendre les 5 clients les plus récents
  const recentClients = sortedClients.slice(0, 5);

  // Calculer les statistiques des clients
  const totalClients = clients.length;
  const activeClients = clients.filter(c => {
    const lastVisit = new Date(c.lastVisit);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return lastVisit >= thirtyDaysAgo;
  }).length;

  const newClientsThisMonth = clients.filter(c => {
    const lastVisit = new Date(c.lastVisit);
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    return lastVisit.getMonth() === thisMonth && lastVisit.getFullYear() === thisYear;
  }).length;

  const averagePetsPerClient = totalClients > 0 ? (pets.length / totalClients).toFixed(1) : "0";

  const handleView = (client: Client) => {
    setSelectedClient(client);
    setShowViewModal(true);
  };

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setShowEditModal(true);
  };

  const handleEditFromView = () => {
    setShowViewModal(false);
    setShowEditModal(true);
  };

  const formatLastVisit = (dateString: string) => {
    const lastVisit = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastVisit.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaine${Math.floor(diffDays / 7) > 1 ? 's' : ''}`;
    return `Il y a ${Math.floor(diffDays / 30)} mois`;
  };

  const getClientActivity = (client: Client) => {
    const clientPets = pets.filter(p => p.ownerId === client.id);
    const clientConsultations = consultations.filter(c => c.clientId === client.id);
    const clientAppointments = appointments.filter(a => a.clientId === client.id);
    
    return {
      pets: clientPets.length,
      consultations: clientConsultations.length,
      appointments: clientAppointments.length,
      lastActivity: clientConsultations.length > 0 ? 
        Math.max(...clientConsultations.map(c => new Date(c.date).getTime())) : 
        new Date(client.lastVisit).getTime()
    };
  };
  
  return (
    <>
      <Card className="card-hover">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Clients Récents</CardTitle>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{totalClients} total</span>
              </div>
              <div className="flex items-center gap-1">
                <Activity className="h-3 w-3" />
                <span>{activeClients} actifs</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                <span>+{newClientsThisMonth} ce mois</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Ø {averagePetsPerClient} animaux</span>
              </div>
            </div>
          </div>
          <Button size="sm" className="gap-2" onClick={() => setShowClientModal(true)}>
            <Plus className="h-4 w-4" />
            Nouveau Client
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentClients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>Aucun client enregistré</p>
              <p className="text-sm">Commencez par créer votre premier client</p>
            </div>
          ) : (
            recentClients.map((client) => {
              const activity = getClientActivity(client);
              return (
                <div 
                  key={client.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {client.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{client.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {activity.pets} animal{activity.pets > 1 ? 's' : ''}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {client.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {client.phone}
                        </div>
                        {client.city && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {client.city}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Dernière visite: {formatLastVisit(client.lastVisit)}</span>
                        <span>Total visites: {client.totalVisits}</span>
                        <span>Consultations: {activity.consultations}</span>
                        <span>RDV: {activity.appointments}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="gap-2" onClick={() => handleView(client)}>
                      <Eye className="h-4 w-4" />
                      Voir
                    </Button>
                    <Button size="sm" variant="outline" className="gap-2" onClick={() => handleEdit(client)}>
                      <Edit className="h-4 w-4" />
                      Modifier
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <NewClientModal 
        open={showClientModal} 
        onOpenChange={setShowClientModal} 
      />
      
      <ClientViewModal
        open={showViewModal}
        onOpenChange={setShowViewModal}
        client={selectedClient}
        onEdit={handleEditFromView}
      />
      
      <ClientEditModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        client={selectedClient}
      />
    </>
  );
}