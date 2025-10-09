import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Phone, Mail, MapPin, Plus, Eye, Edit, Users, TrendingUp, Clock, Activity } from "lucide-react";
import { useState } from "react";
import { NewClientModal } from "@/components/forms/NewClientModal";
import { ClientViewModal } from "@/components/modals/ClientViewModal";
import { ClientEditModal } from "@/components/modals/ClientEditModal";
import { useClients, useAnimals, useConsultations, useAppointments, type Client } from "@/hooks/useDatabase";
import { useSettings } from "@/contexts/SettingsContext";

export function ClientsOverview() {
  const { data: clients = [] } = useClients();
  const { data: pets = [] } = useAnimals();
  const { data: consultations = [] } = useConsultations();
  const { data: appointments = [] } = useAppointments();
  const { settings } = useSettings();
  const [showClientModal, setShowClientModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Calculate last visit for each client based on consultations
  const clientsWithLastVisit = clients.map(client => {
    const clientConsultations = consultations.filter(c => c.client_id === client.id);
    const lastVisit = clientConsultations.length > 0 
      ? Math.max(...clientConsultations.map(c => new Date(c.consultation_date).getTime()))
      : 0;
    return {
      ...client,
      lastVisit: lastVisit > 0 ? new Date(lastVisit).toISOString() : client.created_at
    };
  });

  // Sort clients by last visit (most recent first)
  const sortedClients = [...clientsWithLastVisit].sort((a, b) => 
    new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime()
  );

  // Take the 5 most recent clients
  const recentClients = sortedClients.slice(0, 5);

  // Calculate client statistics
  const totalClients = clients.length;
  const activeClients = clientsWithLastVisit.filter(c => {
    const lastVisit = new Date(c.lastVisit);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return lastVisit >= thirtyDaysAgo;
  }).length;

  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const newClientsThisMonth = clients.filter(c => {
    const createdDate = new Date(c.created_at);
    return createdDate.getMonth() === thisMonth && createdDate.getFullYear() === thisYear;
  }).length;

  const averagePetsPerClient = totalClients > 0 ? (pets.length / totalClients).toFixed(1) : "0";

  const handleView = (client: any) => {
    setSelectedClient(client);
    setShowViewModal(true);
  };

  const handleEdit = (client: any) => {
    setSelectedClient(client);
    setShowEditModal(true);
  };

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Clients Récents
          </CardTitle>
          <Button 
            size="sm" 
            onClick={() => setShowClientModal(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Nouveau
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-primary">{totalClients}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-green-600">{activeClients}</div>
            <div className="text-sm text-muted-foreground">Actifs</div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span>+{newClientsThisMonth} ce mois</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-purple-600" />
            <span>{averagePetsPerClient} animaux/client</span>
          </div>
        </div>

        {/* Recent Clients List */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground">Derniers clients</h4>
          {recentClients.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Aucun client trouvé
            </p>
          ) : (
            recentClients.map((client) => {
              const clientPets = pets.filter(p => p.client_id === client.id);
              const clientConsultations = consultations.filter(c => c.client_id === client.id);
              
              const fullName = `${client.first_name} ${client.last_name}`;
              const initials = `${client.first_name[0] || ''}${client.last_name[0] || ''}`;
              
              return (
                <div
                  key={client.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="h-9 w-9 flex-shrink-0">
                      <AvatarFallback className="text-sm">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-medium truncate">{fullName}</h4>
                        <Badge variant="outline" className="text-xs flex-shrink-0">
                          {client.client_type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground flex-wrap">
                        {client.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{client.phone}</span>
                          </div>
                        )}
                        {client.city && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{client.city}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground flex-wrap">
                        <span>{clientPets.length} animaux</span>
                        <span>Dernière visite: {new Date(client.lastVisit).toLocaleDateString()}</span>
                        <span>Total consultations: {clientConsultations.length}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleView(client)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(client)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>

      {/* Modals */}
      <NewClientModal 
        open={showClientModal} 
        onOpenChange={setShowClientModal}
      />
    </Card>
  );
}