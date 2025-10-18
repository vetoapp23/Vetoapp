import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Building2, Users, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { useFarmManagementSettings } from '@/hooks/useAppSettings';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

interface Farm {
  id: string;
  farm_name: string;
  farm_type: string;
  registration_number: string;
  address: string;
  phone: string;
  email: string;
  herd_size: number;
  certifications: string[];
  notes: string;
  active: boolean;
  client_id: string;
  client?: {
    first_name: string;
    last_name: string;
  };
  created_at: string;
  updated_at: string;
}

interface Client {
  id: string;
  first_name: string;
  last_name: string;
}

const FarmManagement: React.FC = () => {
  const { user } = useAuth();
  const { data: farmSettings, isLoading: settingsLoading } = useFarmManagementSettings();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    farm_name: '',
    farm_type: '',
    registration_number: '',
    address: '',
    phone: '',
    email: '',
    herd_size: 0,
    certifications: '',
    notes: '',
    client_id: '',
    active: true
  });

  // Get dynamic farm types from settings (fallback to default if not loaded)
  const farmTypes = farmSettings?.farm_types || [
    'Élevage bovin',
    'Élevage ovin',
    'Élevage caprin',
    'Élevage équin',
    'Élevage avicole',
    'Élevage porcin',
    'Élevage mixte',
    'Autre'
  ];

  useEffect(() => {
    if (user) {
      fetchFarms();
      fetchClients();
    }
  }, [user]);

  const fetchFarms = async () => {
    try {
      const { data, error } = await supabase
        .from('farms')
        .select(`
          *,
          client:clients(first_name, last_name)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFarms(data || []);
    } catch (error) {
      console.error('Error fetching farms:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les fermes.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, first_name, last_name')
        .eq('user_id', user?.id)
        .eq('status', 'actif')
        .order('last_name');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const farmData = {
        ...formData,
        herd_size: parseInt(formData.herd_size.toString()) || 0,
        certifications: selectedCertifications, // Use selected certifications array directly
        user_id: user?.id
      };

      if (editingFarm) {
        const { error } = await supabase
          .from('farms')
          .update(farmData)
          .eq('id', editingFarm.id);

        if (error) throw error;
        
        toast({
          title: 'Succès',
          description: 'Ferme mise à jour avec succès.',
        });
      } else {
        const { error } = await supabase
          .from('farms')
          .insert([farmData]);

        if (error) throw error;
        
        toast({
          title: 'Succès',
          description: 'Ferme créée avec succès.',
        });
      }

      setShowForm(false);
      setEditingFarm(null);
      resetForm();
      fetchFarms();
    } catch (error) {
      console.error('Error saving farm:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer la ferme.',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (farm: Farm) => {
    setEditingFarm(farm);
    setSelectedCertifications(farm.certifications || []); // Set certifications as array
    setFormData({
      farm_name: farm.farm_name,
      farm_type: farm.farm_type || '',
      registration_number: farm.registration_number || '',
      address: farm.address || '',
      phone: farm.phone || '',
      email: farm.email || '',
      herd_size: farm.herd_size || 0,
      certifications: farm.certifications ? farm.certifications.join(', ') : '',
      notes: farm.notes || '',
      client_id: farm.client_id,
      active: farm.active
    });
    setShowForm(true);
  };

  const handleDelete = async (farmId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette ferme ?')) return;

    try {
      const { error } = await supabase
        .from('farms')
        .delete()
        .eq('id', farmId);

      if (error) throw error;
      
      toast({
        title: 'Succès',
        description: 'Ferme supprimée avec succès.',
      });
      
      fetchFarms();
    } catch (error) {
      console.error('Error deleting farm:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la ferme.',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      farm_name: '',
      farm_type: '',
      registration_number: '',
      address: '',
      phone: '',
      email: '',
      herd_size: 0,
      certifications: '',
      notes: '',
      client_id: '',
      active: true
    });
    setSelectedCertifications([]); // Reset certifications
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingFarm(null);
    resetForm();
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Chargement...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Fermes</h1>
        <Button onClick={() => setShowForm(true)} disabled={showForm}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Ferme
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingFarm ? 'Modifier la Ferme' : 'Nouvelle Ferme'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="farm_name">Nom de la ferme *</Label>
                  <Input
                    id="farm_name"
                    value={formData.farm_name}
                    onChange={(e) => setFormData({ ...formData, farm_name: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="client_id">Client propriétaire *</Label>
                  <Select value={formData.client_id} onValueChange={(value) => setFormData({ ...formData, client_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.first_name} {client.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="farm_type">Type de ferme</Label>
                  <Select value={formData.farm_type} onValueChange={(value) => setFormData({ ...formData, farm_type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le type" />
                    </SelectTrigger>
                    <SelectContent>
                      {farmTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="registration_number">Numéro d'enregistrement</Label>
                  <Input
                    id="registration_number"
                    value={formData.registration_number}
                    onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="herd_size">Taille du cheptel</Label>
                  <Input
                    id="herd_size"
                    type="number"
                    min="0"
                    value={formData.herd_size}
                    onChange={(e) => setFormData({ ...formData, herd_size: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <Label>Certifications</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {(farmSettings?.certification_types || ['Bio', 'Label Rouge', 'Standard']).map((cert) => (
                      <div key={cert} className="flex items-center space-x-2">
                        <Checkbox
                          id={`cert-${cert}`}
                          checked={selectedCertifications.includes(cert)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedCertifications([...selectedCertifications, cert]);
                            } else {
                              setSelectedCertifications(selectedCertifications.filter(c => c !== cert));
                            }
                          }}
                        />
                        <label
                          htmlFor={`cert-${cert}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {cert}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="address">Adresse</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Annuler
                </Button>
                <Button type="submit">
                  {editingFarm ? 'Mettre à jour' : 'Créer'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {farms.map((farm) => (
          <Card key={farm.id} className={`${!farm.active ? 'opacity-60' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    {farm.farm_name}
                  </CardTitle>
                  {farm.farm_type && (
                    <p className="text-sm text-muted-foreground mt-1">{farm.farm_type}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(farm)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(farm.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {farm.client && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4" />
                    <span>{farm.client.first_name} {farm.client.last_name}</span>
                  </div>
                )}
                
                {farm.address && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4" />
                    <span>{farm.address}</span>
                  </div>
                )}
                
                {farm.herd_size > 0 && (
                  <p className="text-sm">
                    <strong>Cheptel:</strong> {farm.herd_size} animaux
                  </p>
                )}
                
                {farm.registration_number && (
                  <p className="text-sm">
                    <strong>N° enregistrement:</strong> {farm.registration_number}
                  </p>
                )}
                
                {farm.certifications && farm.certifications.length > 0 && (
                  <div className="text-sm">
                    <strong>Certifications:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {farm.certifications.map((cert, index) => (
                        <span key={index} className="bg-secondary px-2 py-1 rounded-sm text-xs">
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {farm.notes && (
                  <p className="text-sm text-muted-foreground mt-2">{farm.notes}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {farms.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Aucune ferme enregistrée</p>
            <p className="text-muted-foreground mb-4">
              Commencez par créer votre première ferme.
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Créer une ferme
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FarmManagement;