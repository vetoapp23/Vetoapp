import ClientsPage from "./ClientsNew";
import type { Client } from "@/lib/database";

const ClientsContent = () => {
  const { clients } = useClients();
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
                          <strong>Dernière visite:</strong> {new Date(client.lastVisit).toLocaleDateString('fr-FR')}
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
                        {new Date(client.lastVisit).toLocaleDateString('fr-FR')}
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

    </div>
  );
};

const Clients = () => {
  return (
    <ClientProvider>
      <ClientsContent />
    </ClientProvider>
  );
};

export default Clients;