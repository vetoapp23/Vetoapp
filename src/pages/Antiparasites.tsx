import React, { useState, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useClients } from '@/contexts/ClientContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useDisplayPreference } from '@/hooks/use-display-preference';
import { 
  Bug,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Plus,
  Filter,
  Download,
  Grid3X3,
  List,
  Bell,
  TrendingUp,
  Shield,
  Heart,
  Users,
  PawPrint,
  Package,
  FileText,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { format, isWithinInterval, startOfDay, endOfDay, addDays, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import NewAntiparasiticModal from '@/components/forms/NewAntiparasiticModal';
import AntiparasiticProtocolModal from '@/components/forms/AntiparasiticProtocolModal';
import { PetDossierModal } from '@/components/modals/PetDossierModal';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useReactToPrint } from 'react-to-print';
import { UnifiedCalendar } from '@/components/UnifiedCalendar';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800 border-green-200';
    case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
    case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'missed': return 'bg-orange-100 text-orange-800 border-orange-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const AntiparasiteCalendar: React.FC = () => {
  const { antiparasitics, pets, clients } = useClients();
  
  // Convertir les antiparasites en événements pour le calendrier unifié
  const antiparasiticEvents = useMemo(() => {
    return antiparasitics.map(antiparasitic => ({
      id: antiparasitic.id,
      type: 'antiparasitic' as const,
      title: antiparasitic.productName,
      date: antiparasitic.nextDueDate,
      status: antiparasitic.status,
      clientName: clients.find(c => c.id === antiparasitic.clientId)?.name,
      petName: pets.find(p => p.id === antiparasitic.petId)?.name,
    }));
  }, [antiparasitics, clients, pets]);

  const handleEventClick = (event: any) => {
    // Gérer le clic sur un événement antiparasite
    // Antiparasitic clicked
  };

  const handleDateClick = (date: string) => {
    // Gérer le clic sur une date
    // Date clicked
  };

  return (
    <UnifiedCalendar
      events={antiparasiticEvents}
      onEventClick={handleEventClick}
      onDateClick={handleDateClick}
      title="Calendrier Antiparasitaire"
      icon={<Bug className="h-5 w-5" />}
    />
  );
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed': return <CheckCircle className="h-4 w-4" />;
    case 'overdue': return <AlertTriangle className="h-4 w-4" />;
    case 'scheduled': return <Clock className="h-4 w-4" />;
    case 'missed': return <AlertTriangle className="h-4 w-4" />;
    default: return <Clock className="h-4 w-4" />;
  }
};



export default function Antiparasites() {
  const { antiparasitics, pets, clients, antiparasiticProtocols, getOverdueAntiparasitics, getUpcomingAntiparasitics, getAntiparasiticsByStatus, getActiveAntiparasiticProtocols, getAntiparasiticProtocolsBySpecies, addAntiparasitic, updateAntiparasitic, deleteAntiparasitic } = useClients();
  const { settings } = useSettings();
  const { currentView } = useDisplayPreference('antiparasitics');
  const { toast } = useToast();
  // Inline editing state
  const [editingField, setEditingField] = useState<{ id: number; field: 'dateGiven' | 'veterinarian' | 'cost'; } | null>(null);
  const [fieldValue, setFieldValue] = useState<string>('');

  // Modal states for edit/view
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAntiparasitic, setEditingAntiparasitic] = useState<any>(null);
  const [showPetDossierModal, setShowPetDossierModal] = useState(false);
  const [selectedPetForDossier, setSelectedPetForDossier] = useState<number | null>(null);

  const handleFieldSave = () => {
    if (!editingField) return;
    const { id, field } = editingField;
    const entity = antiparasitics.find(a => a.id === id);
    if (entity) {
      const updated = { ...entity, [field]: field === 'cost' ? fieldValue : fieldValue };
      updateAntiparasitic(id, updated as any);
      toast({ title: 'Modifié', description: `${field} mis à jour`, });
    }
    setEditingField(null);
  };

  // Modals now use DialogTrigger; no external state needed
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>(currentView);
  
  // Certificat modal
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [certClientId, setCertClientId] = useState<number | null>(null);
  const [certPetId, setCertPetId] = useState<number | null>(null);
  const printRef = useRef<any>(null);

  const handlePrintCert = useReactToPrint({
    contentRef: printRef,
    onAfterPrint: () => setCertModalOpen(false)
  });

  // Statistiques
  const totalAntiparasites = antiparasitics.length;
  const completedAntiparasites = getAntiparasiticsByStatus('completed').length;
  const overdueAntiparasites = getOverdueAntiparasitics().length;
  const upcomingAntiparasites = getUpcomingAntiparasitics().length;

  // Protocoles par espèce
  const protocolsBySpecies = useMemo(() => {
    const species = [...new Set(antiparasiticProtocols.map(p => p.species))];
    return species.reduce((acc, specie) => {
      acc[specie] = getAntiparasiticProtocolsBySpecies(specie);
      return acc;
    }, {} as Record<string, any[]>);
  }, [antiparasiticProtocols]);

  // Filtrage des antiparasites
  const filteredAntiparasites = useMemo(() => {
    return antiparasitics.filter(antiparasite => {
      const pet = pets.find(p => p.id === antiparasite.petId);
      const client = clients.find(c => c.id === antiparasite.clientId);
      
      const matchesSearch = !searchTerm || 
        antiparasite.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        antiparasite.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        antiparasite.clientName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || antiparasite.status === statusFilter;
      const matchesType = typeFilter === 'all' || antiparasite.productType === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [antiparasitics, pets, clients, searchTerm, statusFilter, typeFilter]);

  // Filtrage des protocoles
  const [protocolSearchTerm, setProtocolSearchTerm] = useState('');
  const [protocolTypeFilter, setProtocolTypeFilter] = useState('all');
  const filteredProtocols = useMemo(() => {
    return antiparasiticProtocols.filter(protocol => {
      const matchesSearch = !protocolSearchTerm || 
        protocol.name.toLowerCase().includes(protocolSearchTerm.toLowerCase()) ||
        protocol.species.toLowerCase().includes(protocolSearchTerm.toLowerCase()) ||
        protocol.targetParasites.toLowerCase().includes(protocolSearchTerm.toLowerCase());
      
      const matchesType = protocolTypeFilter === 'all' || protocol.productType === protocolTypeFilter;
      
      return matchesSearch && matchesType;
    });
  }, [antiparasiticProtocols, protocolSearchTerm, protocolTypeFilter]);

  // Handlers pour view/edit
  const handleViewAntiparasitic = (a: any) => {
    setSelectedPetForDossier(a.petId);
    setShowPetDossierModal(true);
  };
  const handleEditAntiparasitic = (a: any) => {
    setEditingAntiparasitic(a);
    setShowEditModal(true);
  };

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">
            Gestion Antiparasitaire
          </h1>
          <p className="text-muted-foreground mt-2">
            Suivi des traitements antiparasitaires et protocoles de prévention
          </p>
        </div>
        <NewAntiparasiticModal>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nouveau Traitement
          </Button>
        </NewAntiparasiticModal>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Traitements</p>
                <p className="text-2xl font-bold">{totalAntiparasites}</p>
              </div>
              <Bug className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Complétés</p>
                <p className="text-2xl font-bold text-green-600">{completedAntiparasites}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">En Retard</p>
                <p className="text-2xl font-bold text-red-600">{overdueAntiparasites}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">À Venir (7j)</p>
                <p className="text-2xl font-bold text-blue-600">{upcomingAntiparasites}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="treatments" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="treatments">Traitements</TabsTrigger>
          <TabsTrigger value="calendar">Calendrier</TabsTrigger>
          <TabsTrigger value="protocols">Protocoles</TabsTrigger>
          <TabsTrigger value="certificates">Certificats</TabsTrigger>
        </TabsList>

        <TabsContent value="treatments" className="space-y-6">
          {/* Filtres */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtres et Recherche
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher par produit, animal ou client..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous statuts</SelectItem>
                    <SelectItem value="completed">Complété</SelectItem>
                    <SelectItem value="scheduled">Planifié</SelectItem>
                    <SelectItem value="overdue">En retard</SelectItem>
                    <SelectItem value="missed">Manqué</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous types</SelectItem>
                    <SelectItem value="external">Externe</SelectItem>
                    <SelectItem value="internal">Interne</SelectItem>
                    <SelectItem value="combined">Combiné</SelectItem>
                    <SelectItem value="heartworm">Ver du cœur</SelectItem>
                    <SelectItem value="flea_tick">Puces/Tiques</SelectItem>
                    <SelectItem value="worming">Vermifugation</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'cards' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('cards')}
                  >
                    <Grid3X3 className="h-4 w-4" />
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
            </CardContent>
          </Card>

          {/* Liste des traitements */}
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAntiparasites.map(antiparasite => {
                const pet = pets.find(p => p.id === antiparasite.petId);
                const client = clients.find(c => c.id === antiparasite.clientId);
                
                return (
                  <Card key={antiparasite.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{antiparasite.productName}</CardTitle>
                        <Badge className={getStatusColor(antiparasite.status)}>
                          {getStatusIcon(antiparasite.status)}
                          <span className="ml-1">
                            {antiparasite.status === 'completed' ? 'Complété' :
                             antiparasite.status === 'scheduled' ? 'Planifié' :
                             antiparasite.status === 'overdue' ? 'En retard' : 'Manqué'}
                          </span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          {pet?.photo ? (
                            <AvatarImage src={pet.photo} alt={pet.name} />
                          ) : (
                            <AvatarFallback>
                              <PawPrint className="h-5 w-5" />
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <p className="font-medium">{antiparasite.petName}</p>
                          <p className="text-sm text-muted-foreground">{antiparasite.clientName}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Type:</span>
                          <span>{antiparasite.productType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Parasites:</span>
                          <span className="text-right">{antiparasite.targetParasites}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Date donnée:</span>
                          <span>{format(new Date(antiparasite.dateGiven), 'dd/MM/yyyy')}</span>
                        </div>
                        {antiparasite.nextDueDate && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Prochain rappel:</span>
                            <span>{format(new Date(antiparasite.nextDueDate), 'dd/MM/yyyy')}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Vétérinaire:</span>
                          <span>{antiparasite.veterinarian}</span>
                        </div>
                        {antiparasite.cost && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Coût:</span>
                            <span className="font-medium">{antiparasite.cost} {settings.currency}</span>
                          </div>
                        )}

                        {/* Statut du stock */}
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Stock:</span>
                          {(() => {
                            if (antiparasite.isInStock === true) {
                              return (
                                <div className="flex items-center gap-2">
                                  <Package className="h-4 w-4 text-green-600" />
                                  <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                                    En stock
                                  </Badge>
                                  {antiparasite.stockQuantity && (
                                    <span className="text-xs text-muted-foreground">
                                      ({antiparasite.stockQuantity})
                                    </span>
                                  )}
                                </div>
                              );
                            } else if (antiparasite.isInStock === false) {
                              return (
                                <div className="flex items-center gap-2">
                                  <Package className="h-4 w-4 text-gray-400" />
                                  <Badge variant="secondary" className="text-xs">
                                    Non en stock
                                  </Badge>
                                </div>
                              );
                            } else {
                              return (
                                <div className="flex items-center gap-2">
                                  <Package className="h-4 w-4 text-gray-400" />
                                  <span className="text-xs text-muted-foreground">N/A</span>
                                </div>
                              );
                            }
                          })()}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => handleViewAntiparasitic(antiparasite)}>
                          <Eye className="h-4 w-4 mr-1" />
                          Détails
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEditAntiparasitic(antiparasite)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            if (confirm('Supprimer ce traitement antiparasitaire ?')) {
                              deleteAntiparasitic(antiparasite.id);
                              toast({ title: 'Supprimé', description: `${antiparasite.productName} supprimé.` });
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Animal</TableHead>
                      <TableHead>Produit</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date donnée</TableHead>
                      <TableHead>Prochain rappel</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Vétérinaire</TableHead>
                      <TableHead>Coût</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAntiparasites.map(antiparasite => (
                      <TableRow key={antiparasite.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                <PawPrint className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{antiparasite.petName}</p>
                              <p className="text-sm text-muted-foreground">{antiparasite.clientName}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{antiparasite.productName}</TableCell>
                        <TableCell>{antiparasite.productType}</TableCell>
                        <TableCell
                          className="cursor-pointer"
                          onClick={() => { setEditingField({ id: antiparasite.id, field: 'dateGiven' }); setFieldValue(antiparasite.dateGiven); }}
                        >
                          {editingField?.id === antiparasite.id && editingField.field === 'dateGiven' ? (
                            <Input
                              type="date"
                              value={fieldValue}
                              onChange={e => setFieldValue(e.target.value)}
                              onBlur={handleFieldSave}
                              autoFocus
                            />
                          ) : (
                            format(new Date(antiparasite.dateGiven), 'dd/MM/yyyy')
                          )}
                        </TableCell>
                        <TableCell>
                          {antiparasite.nextDueDate ? format(new Date(antiparasite.nextDueDate), 'dd/MM/yyyy') : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(antiparasite.status)}>
                            {getStatusIcon(antiparasite.status)}
                            <span className="ml-1">
                              {antiparasite.status === 'completed' ? 'Complété' :
                               antiparasite.status === 'scheduled' ? 'Planifié' :
                               antiparasite.status === 'overdue' ? 'En retard' : 'Manqué'}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {(() => {
                            if (antiparasite.isInStock === true) {
                              return (
                                <div className="flex items-center gap-2">
                                  <Package className="h-4 w-4 text-green-600" />
                                  <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                                    En stock
                                  </Badge>
                                  {antiparasite.stockQuantity && (
                                    <span className="text-xs text-muted-foreground">
                                      ({antiparasite.stockQuantity})
                                    </span>
                                  )}
                                </div>
                              );
                            } else if (antiparasite.isInStock === false) {
                              return (
                                <div className="flex items-center gap-2">
                                  <Package className="h-4 w-4 text-gray-400" />
                                  <Badge variant="secondary" className="text-xs">
                                    Non en stock
                                  </Badge>
                                </div>
                              );
                            } else {
                              return (
                                <div className="flex items-center gap-2">
                                  <Package className="h-4 w-4 text-gray-400" />
                                  <span className="text-xs text-muted-foreground">N/A</span>
                                </div>
                              );
                            }
                          })()}
                        </TableCell>
                        <TableCell
                          className="cursor-pointer"
                          onClick={() => { setEditingField({ id: antiparasite.id, field: 'veterinarian' }); setFieldValue(antiparasite.veterinarian); }}
                        >
                          {editingField?.id === antiparasite.id && editingField.field === 'veterinarian' ? (
                            <Select
                              value={fieldValue}
                              onValueChange={value => {
                                setFieldValue(value);
                                updateAntiparasitic(antiparasite.id, { veterinarian: value });
                                setEditingField(null);
                              }}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {settings.veterinarians
                                  .filter(v => v.isActive)
                                  .map(vet => (
                                    <SelectItem key={vet.id} value={vet.name}>{vet.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            antiparasite.veterinarian
                          )}
                        </TableCell>
                        <TableCell
                          className="cursor-pointer"
                          onClick={() => { setEditingField({ id: antiparasite.id, field: 'cost' }); setFieldValue(antiparasite.cost || ''); }}
                        >
                          {editingField?.id === antiparasite.id && editingField.field === 'cost' ? (
                            <Input
                              type="number"
                              value={fieldValue}
                              onChange={e => setFieldValue(e.target.value)}
                              onBlur={handleFieldSave}
                              autoFocus
                            />
                          ) : (
                            antiparasite.cost ? `${antiparasite.cost} ${settings.currency}` : '-'
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" onClick={() => handleViewAntiparasitic(antiparasite)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleEditAntiparasitic(antiparasite)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => {
                                if (confirm('Supprimer ce traitement antiparasitaire ?')) {
                                  deleteAntiparasitic(antiparasite.id);
                                  toast({ title: 'Supprimé', description: `${antiparasite.productName} supprimé.` });
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
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
        </TabsContent>

        <TabsContent value="calendar">
          <AntiparasiteCalendar />
        </TabsContent>

        <TabsContent value="protocols" className="space-y-6">
          {/* En-tête des protocoles */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Protocoles Antiparasitaires</h2>
              <p className="text-muted-foreground">Gérez les protocoles de traitement par espèce</p>
            </div>
            <AntiparasiticProtocolModal mode="create">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nouveau Protocole
              </Button>
            </AntiparasiticProtocolModal>
          </div>

          {/* Statistiques des protocoles */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Protocoles</p>
                    <p className="text-2xl font-bold">{antiparasiticProtocols.length}</p>
                  </div>
                  <FileText className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Actifs</p>
                    <p className="text-2xl font-bold text-green-600">
                      {antiparasiticProtocols.filter(p => p.isActive).length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Externes</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {antiparasiticProtocols.filter(p => p.productType === 'external' || p.productType === 'flea_tick').length}
                    </p>
                  </div>
                  <Bug className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Espèces</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {Object.keys(protocolsBySpecies).length}
                    </p>
                  </div>
                  <PawPrint className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtres des protocoles */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher un protocole..."
                      value={protocolSearchTerm}
                      onChange={(e) => setProtocolSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={protocolTypeFilter} onValueChange={setProtocolTypeFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Type de produit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous types</SelectItem>
                    <SelectItem value="external">Externe</SelectItem>
                    <SelectItem value="internal">Interne</SelectItem>
                    <SelectItem value="combined">Combiné</SelectItem>
                    <SelectItem value="heartworm">Ver du cœur</SelectItem>
                    <SelectItem value="flea_tick">Puces/Tiques</SelectItem>
                    <SelectItem value="worming">Vermifugation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Protocoles groupés par espèce */}
          <div className="space-y-6">
            {Object.keys(protocolsBySpecies).map(species => {
              const speciesProtocols = protocolsBySpecies[species].filter(protocol => {
                const matchesSearch = !protocolSearchTerm || 
                  protocol.name.toLowerCase().includes(protocolSearchTerm.toLowerCase()) ||
                  protocol.targetParasites.toLowerCase().includes(protocolSearchTerm.toLowerCase());
                
                const matchesType = protocolTypeFilter === 'all' || protocol.productType === protocolTypeFilter;
                
                return matchesSearch && matchesType;
              });

              if (speciesProtocols.length === 0) return null;

              return (
                <Card key={species}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PawPrint className="h-5 w-5" />
                      {species} ({speciesProtocols.length} protocoles)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {speciesProtocols.map(protocol => (
                        <Card key={protocol.id} className="border-l-4 border-l-primary">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">{protocol.name}</CardTitle>
                              <div className="flex gap-1">
                                <AntiparasiticProtocolModal mode="edit" protocol={protocol}>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </AntiparasiticProtocolModal>
                                <Badge variant={protocol.isActive ? 'default' : 'secondary'}>
                                  {protocol.isActive ? 'Actif' : 'Inactif'}
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <p className="text-sm text-muted-foreground">{protocol.description}</p>
                            
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Type:</span>
                                <span>{protocol.productType}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Parasites:</span>
                                <span className="text-right">{protocol.targetParasites}</span>
                              </div>
                              {protocol.weightRange && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Poids:</span>
                                  <span>{protocol.weightRange}</span>
                                </div>
                              )}
                              {protocol.ageRequirement && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Âge:</span>
                                  <span>{protocol.ageRequirement}</span>
                                </div>
                              )}
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Rappels:</span>
                                <span>{protocol.intervals.map(i => i.label).join(', ')}</span>
                              </div>
                              {protocol.manufacturer && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Fabricant:</span>
                                  <span>{protocol.manufacturer}</span>
                                </div>
                              )}
                            </div>
                            
                            {protocol.notes && (
                              <div className="mt-3 p-2 bg-muted rounded text-sm">
                                <p><strong>Notes:</strong> {protocol.notes}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="certificates">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Certificats Antiparasitaires
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Générez des certificats officiels de traitement antiparasitaire pour les voyages et compétitions.
              </p>
              <Dialog open={certModalOpen} onOpenChange={setCertModalOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4 mr-2" />
                    Générer un Certificat
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Sélectionner l'animal</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* Sélection du client */}
                    <Select value={certClientId?.toString() || ''} onValueChange={value => { setCertClientId(parseInt(value)); setCertPetId(null); }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisissez un client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map(client => (
                          <SelectItem key={client.id} value={client.id.toString()}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {/* Sélection de l'animal lié au client */}
                    <Select value={certPetId?.toString() || ''} onValueChange={value => setCertPetId(parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisissez un animal" />
                      </SelectTrigger>
                      <SelectContent>
                        {pets.filter(p => certClientId ? p.ownerId === certClientId : false).map(pet => (
                          <SelectItem key={pet.id} value={pet.id.toString()}>
                            {pet.name} ({pet.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {certPetId && (
                      <div className="hidden">
                        {/* TODO: Créer CertificateAntiparasiticPrint */}
                        <div ref={printRef}>Certificat antiparasitaire pour animal {certPetId}</div>
                      </div>
                    )}
                    <div className="flex justify-end">
                      <Button disabled={!certPetId} onClick={handlePrintCert}>
                        Générer PDF
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <NewAntiparasiticModal
        open={showEditModal}
        onOpenChange={(open) => {
          setShowEditModal(open);
          if (!open) setEditingAntiparasitic(null);
        }}
        editingAntiparasitic={editingAntiparasitic}
      />

      {selectedPetForDossier && (
        <PetDossierModal
          petId={selectedPetForDossier}
          open={showPetDossierModal}
          onOpenChange={setShowPetDossierModal}
        />
      )}
    </div>
  );
}
