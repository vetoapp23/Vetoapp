import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Search, Phone, Mail, MapPin, Eye, Edit, Heart, Grid, List } from "lucide-react";
import { NewClientModal } from "@/components/forms/NewClientModal";
import { ClientViewModal } from "@/components/modals/ClientViewModal";
import { ClientEditModal } from "@/components/modals/ClientEditModal";
import { useClients, useAnimals } from "@/hooks/useDatabase";
import { useDisplayPreference } from "@/hooks/use-display-preference";
import type { Client as DBClient, Animal } from "@/lib/database";
import { Client, Pet } from "@/contexts/ClientContext";

const convertDatabaseClient = (dbClient: DBClient, animals: Animal[]): Client => {
  const clientAnimals = animals.filter(animal => animal.client_id === dbClient.id);
  
  // Convert UUID to number for compatibility (using hash)
  const clientId = Math.abs(dbClient.id.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0));
  
  const pets: Pet[] = clientAnimals.map(animal => {
    const petId = Math.abs(animal.id.split('').reduce((a, b) => {
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
      owner: `${dbClient.first_name} ${dbClient.last_name}`,
      status: animal.status === 'vivant' ? 'healthy' : (animal.status === 'décédé' ? 'urgent' : 'treatment'),
      lastVisit: animal.updated_at ? new Date(animal.updated_at).toLocaleDateString('fr-FR') : undefined,
      vaccinations: []
    };
  });

  return {
    id: clientId,
    name: `${dbClient.first_name} ${dbClient.last_name}`,
    firstName: dbClient.first_name,
    lastName: dbClient.last_name,
    email: dbClient.email || '',
    phone: dbClient.phone || dbClient.mobile_phone || '',
    address: dbClient.address || '',
    city: dbClient.city,
    pets,
    lastVisit: new Date(dbClient.updated_at).toLocaleDateString('fr-FR'),
    totalVisits: 0 // Placeholder - would need consultation data
  };
};

const ClientsContent = () => {
  const { data: dbClients = [], isLoading: clientsLoading } = useClients();
  const { data: animals = [], isLoading: animalsLoading } = useAnimals();
  
  // Convert to old format for compatibility
  const clients = dbClients.map(dbClient => convertDatabaseClient(dbClient, animals));
  
  const { currentView } = useDisplayPreference('clients');
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'cards' | 'table'>(currentView);
  const [showClientModal, setShowClientModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.city && client.city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleView = (client: Client) => {
    // TODO: Implement view modal with database client
    setSelectedClient(client);
    // setShowViewModal(true);
  };

  const handleEdit = (client: Client) => {
    // TODO: Implement edit modal with database client
    setSelectedClient(client);
    // setShowEditModal(true);
  };

  const handleEditFromView = () => {
    setShowViewModal(false);
    setShowEditModal(true);
  };

  if (clientsLoading || animalsLoading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement des clients...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Clients</h1>
          <p className="text-muted-foreground mt-2">
            Gérez tous vos clients et leurs informations
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
          <Button className="gap-2 medical-glow" onClick={() => setShowClientModal(true)}>
            <Plus className="h-4 w-4" />
            Nouveau Client
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Rechercher un client
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input 
            placeholder="Rechercher par nom, email ou ville..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      {viewMode === 'cards' ? (
        <div className="grid gap-6">
          {filteredClients.map((client) => (
            <Card key={client.id} className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                        {client.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="space-y-3 flex-1">
                      <div>
                        <h3 className="text-xl font-semibold">{client.name}</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {client.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {client.phone}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {client.address}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium flex items-center gap-2">
                          <Heart className="h-4 w-4 text-primary" />
                          Animaux ({client.pets.length})
                        </h4>
                        <div className="flex gap-2 flex-wrap">
                          {client.pets.length > 0 ? (
                            client.pets.map((pet, index) => (
                              <Badge key={pet.id || index} variant="secondary" className="gap-1">
                                {pet.name} - {pet.type} {pet.breed && `(${pet.breed})`}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">Aucun animal enregistré</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-6 text-sm">
                        <span>
                          <strong>Dernière visite:</strong> {client.lastVisit}
                        </span>
                        <span>
                          <strong>Total visites:</strong> {client.totalVisits}
                        </span>
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
                    <th className="p-4 font-medium">Client</th>
                    <th className="p-4 font-medium">Contact</th>
                    <th className="p-4 font-medium">Animaux</th>
                    <th className="p-4 font-medium">Dernière visite</th>
                    <th className="p-4 font-medium">Total visites</th>
                    <th className="p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((client) => (
                    <tr key={client.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                              {client.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{client.name}</div>
                            <div className="text-sm text-muted-foreground">{client.address}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="text-sm">{client.email}</div>
                          <div className="text-sm text-muted-foreground">{client.phone}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1 flex-wrap">
                          {client.pets.length > 0 ? (
                            client.pets.map((pet, index) => (
                              <Badge key={pet.id || index} variant="secondary" className="text-xs">
                                {pet.name}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">Aucun</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        {client.lastVisit}
                      </td>
                      <td className="p-4">
                        {client.totalVisits}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => handleView(client)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleEdit(client)}>
                            <Edit className="h-4 w-4" />
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
      
      <NewClientModal 
        open={showClientModal} 
        onOpenChange={setShowClientModal} 
      />
      
      {/* TODO: Implement modals with database client
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
      */}

    </div>
  );
};

const Clients = () => {
  return <ClientsContent />;
};

export default Clients;
