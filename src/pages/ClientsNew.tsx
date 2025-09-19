import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Phone, Mail, MapPin, Eye, Edit, Heart, Grid, List, Loader2, Trash2, User } from "lucide-react";
import { useClients, useSearchClients, useCreateClient, useUpdateClient, useDeleteClient } from "@/hooks/useDatabase";
import { useDisplayPreference } from "@/hooks/use-display-preference";
import { useToast } from "@/hooks/use-toast";
import type { Client, CreateClientData } from "@/lib/database";

const ClientsPage = () => {
  const { data: clients, isLoading, error } = useClients();
  const { currentView } = useDisplayPreference('clients');
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'cards' | 'table'>(currentView);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const createClientMutation = useCreateClient();
  const updateClientMutation = useUpdateClient();
  const deleteClientMutation = useDeleteClient();
  const { toast } = useToast();

  // Client form data
  const [clientForm, setClientForm] = useState<CreateClientData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    mobile_phone: '',
    address: '',
    city: 'Rabat',
    postal_code: '',
    country: 'Maroc',
    notes: '',
    client_type: 'particulier'
  });

  const filteredClients = clients?.filter(client =>
    `${client.first_name} ${client.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone?.includes(searchTerm) ||
    client.city.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clientForm.first_name || !clientForm.last_name) {
      toast({
        title: "Erreur",
        description: "Le prénom et le nom sont obligatoires",
        variant: "destructive"
      });
      return;
    }

    try {
      await createClientMutation.mutateAsync(clientForm);
      
      toast({
        title: "Client créé",
        description: `${clientForm.first_name} ${clientForm.last_name} a été ajouté avec succès`,
      });
      
      setShowCreateModal(false);
      setClientForm({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        mobile_phone: '',
        address: '',
        city: 'Rabat',
        postal_code: '',
        country: 'Maroc',
        notes: '',
        client_type: 'particulier'
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClient) return;

    try {
      await updateClientMutation.mutateAsync({
        id: selectedClient.id,
        data: clientForm
      });
      
      toast({
        title: "Client mis à jour",
        description: `${clientForm.first_name} ${clientForm.last_name} a été modifié avec succès`,
      });
      
      setShowEditModal(false);
      setSelectedClient(null);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteClient = async (client: Client) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${client.first_name} ${client.last_name} ?`)) {
      return;
    }

    try {
      await deleteClientMutation.mutateAsync(client.id);
      
      toast({
        title: "Client supprimé",
        description: `${client.first_name} ${client.last_name} a été supprimé`,
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleView = (client: Client) => {
    setSelectedClient(client);
    setShowViewModal(true);
  };

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setClientForm({
      first_name: client.first_name,
      last_name: client.last_name,
      email: client.email || '',
      phone: client.phone || '',
      mobile_phone: client.mobile_phone || '',
      address: client.address || '',
      city: client.city || 'Rabat',
      postal_code: client.postal_code || '',
      country: client.country || 'Maroc',
      notes: client.notes || '',
      client_type: client.client_type
    });
    setShowEditModal(true);
  };

  const getClientTypeLabel = (type: string) => {
    switch (type) {
      case 'particulier': return 'Particulier';
      case 'eleveur': return 'Éleveur';
      case 'ferme': return 'Ferme';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'actif': return 'bg-green-100 text-green-800';
      case 'inactif': return 'bg-gray-100 text-gray-800';
      case 'suspendu': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center min-h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Chargement des clients...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-600">Erreur lors du chargement des clients</p>
              <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Clients</h1>
          <p className="text-muted-foreground mt-2">
            Gérez vos clients et leurs informations de contact
          </p>
        </div>
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nouveau Client
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      {/* Search and filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'cards' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('cards')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Client count */}
      <div className="flex items-center gap-4">
        <Badge variant="secondary">
          {filteredClients.length} client{filteredClients.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Clients display */}
      {viewMode === 'cards' ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map((client) => (
            <Card key={client.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(client.first_name, client.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">
                      {client.first_name} {client.last_name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getStatusColor(client.status)}>
                        {client.status}
                      </Badge>
                      <Badge variant="outline">
                        {getClientTypeLabel(client.client_type)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {client.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{client.email}</span>
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{client.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{client.city}</span>
                </div>
                
                <div className="flex items-center gap-2 pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleView(client)}
                    className="gap-1"
                  >
                    <Eye className="h-4 w-4" />
                    Voir
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(client)}
                    className="gap-1"
                  >
                    <Edit className="h-4 w-4" />
                    Modifier
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteClient(client)}
                    className="gap-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Ville</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {getInitials(client.first_name, client.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {client.first_name} {client.last_name}
                        </div>
                        {client.email && (
                          <div className="text-sm text-muted-foreground">
                            {client.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {client.phone && (
                      <div className="text-sm">{client.phone}</div>
                    )}
                    {client.mobile_phone && (
                      <div className="text-sm text-muted-foreground">
                        {client.mobile_phone}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{client.city}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getClientTypeLabel(client.client_type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(client.status)}>
                      {client.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(client)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(client)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClient(client)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {filteredClients.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun client trouvé</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'Aucun client ne correspond à votre recherche.' : 'Commencez par ajouter votre premier client.'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowCreateModal(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nouveau Client
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Client Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nouveau Client</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateClient} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">Prénom *</Label>
                <Input
                  id="first_name"
                  value={clientForm.first_name}
                  onChange={(e) => setClientForm(prev => ({ ...prev, first_name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Nom *</Label>
                <Input
                  id="last_name"
                  value={clientForm.last_name}
                  onChange={(e) => setClientForm(prev => ({ ...prev, last_name: e.target.value }))}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={clientForm.email}
                  onChange={(e) => setClientForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  value={clientForm.phone}
                  onChange={(e) => setClientForm(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mobile_phone">Mobile</Label>
                <Input
                  id="mobile_phone"
                  value={clientForm.mobile_phone}
                  onChange={(e) => setClientForm(prev => ({ ...prev, mobile_phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client_type">Type de client</Label>
                <Select value={clientForm.client_type} onValueChange={(value: any) => setClientForm(prev => ({ ...prev, client_type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="particulier">Particulier</SelectItem>
                    <SelectItem value="eleveur">Éleveur</SelectItem>
                    <SelectItem value="ferme">Ferme</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                value={clientForm.address}
                onChange={(e) => setClientForm(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Ville</Label>
                <Input
                  id="city"
                  value={clientForm.city}
                  onChange={(e) => setClientForm(prev => ({ ...prev, city: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postal_code">Code postal</Label>
                <Input
                  id="postal_code"
                  value={clientForm.postal_code}
                  onChange={(e) => setClientForm(prev => ({ ...prev, postal_code: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={clientForm.notes}
                onChange={(e) => setClientForm(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={createClientMutation.isPending}>
                {createClientMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Création...
                  </>
                ) : (
                  'Créer le client'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Client Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier le Client</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateClient} className="space-y-4">
            {/* Same form fields as create */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_first_name">Prénom *</Label>
                <Input
                  id="edit_first_name"
                  value={clientForm.first_name}
                  onChange={(e) => setClientForm(prev => ({ ...prev, first_name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_last_name">Nom *</Label>
                <Input
                  id="edit_last_name"
                  value={clientForm.last_name}
                  onChange={(e) => setClientForm(prev => ({ ...prev, last_name: e.target.value }))}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_email">Email</Label>
                <Input
                  id="edit_email"
                  type="email"
                  value={clientForm.email}
                  onChange={(e) => setClientForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_phone">Téléphone</Label>
                <Input
                  id="edit_phone"
                  value={clientForm.phone}
                  onChange={(e) => setClientForm(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </div>

            {/* Add remaining fields similarly */}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={updateClientMutation.isPending}>
                {updateClientMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Mise à jour...
                  </>
                ) : (
                  'Mettre à jour'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Client Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails du Client</DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {getInitials(selectedClient.first_name, selectedClient.last_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedClient.first_name} {selectedClient.last_name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getStatusColor(selectedClient.status)}>
                      {selectedClient.status}
                    </Badge>
                    <Badge variant="outline">
                      {getClientTypeLabel(selectedClient.client_type)}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {selectedClient.email && (
                  <div>
                    <Label>Email</Label>
                    <p className="text-sm">{selectedClient.email}</p>
                  </div>
                )}
                {selectedClient.phone && (
                  <div>
                    <Label>Téléphone</Label>
                    <p className="text-sm">{selectedClient.phone}</p>
                  </div>
                )}
                {selectedClient.mobile_phone && (
                  <div>
                    <Label>Mobile</Label>
                    <p className="text-sm">{selectedClient.mobile_phone}</p>
                  </div>
                )}
                <div>
                  <Label>Ville</Label>
                  <p className="text-sm">{selectedClient.city}</p>
                </div>
              </div>

              {selectedClient.address && (
                <div>
                  <Label>Adresse</Label>
                  <p className="text-sm">{selectedClient.address}</p>
                </div>
              )}

              {selectedClient.notes && (
                <div>
                  <Label>Notes</Label>
                  <p className="text-sm">{selectedClient.notes}</p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowViewModal(false)}>
                  Fermer
                </Button>
                <Button onClick={() => { setShowViewModal(false); handleEdit(selectedClient); }}>
                  Modifier
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientsPage;
