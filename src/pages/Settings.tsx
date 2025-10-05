import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Loader2, Settings2, Shield } from "lucide-react";
import { useClients } from "@/contexts/ClientContext";
import { useSettings, FarmManagementSettings, ClinicSettings, DisplayPreferences, ScheduleSettings } from '@/contexts/SettingsContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserProfile } from "@/components/UserProfile";
import { User } from "lucide-react";
import { SettingsManagement } from "@/components/SettingsManagement";
import { 
  useVeterinarianSettings,
  useUpdateVeterinarianSettings
} from '../hooks/useAppSettings'
import type { 
  VeterinarianSetting
} from '../lib/database'

export default function Settings() {
  const { toast } = useToast();
  const { settings, updateSettings } = useSettings();
  const { theme, setTheme } = useTheme();
  
  // Active tab state
  const [activeTab, setActiveTab] = useState<'general' | 'data'>('general');
  
  // Database hooks for veterinarians
  const { data: dbVeterinarians = [], isLoading: vetLoading } = useVeterinarianSettings();
  const updateVeterinarianMutation = useUpdateVeterinarianSettings();
  
  // State for veterinarians
  const [showVetModal, setShowVetModal] = useState(false);
  const [editVet, setEditVet] = useState<VeterinarianSetting | null>(null);
  const [vetForm, setVetForm] = useState({ 
    name: '', 
    title: '', 
    specialty: '', 
    phone: '', 
    email: '',
    is_active: true
  });

  // Farm management states
  const [showFarmTypeModal, setShowFarmTypeModal] = useState(false);
  const [newFarmType, setNewFarmType] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showBreedModal, setShowBreedModal] = useState(false);
  const [newBreed, setNewBreed] = useState('');
  const [showCertificationModal, setShowCertificationModal] = useState(false);
  const [newCertification, setNewCertification] = useState('');

  // Computed vets for display
  const vets = dbVeterinarians.length > 0 ? dbVeterinarians : settings.veterinarians;

  const DEFAULT_VETS: VeterinarianSetting[] = [
    { 
      id: 'vet_001', 
      name: 'Dr. Jean Dupont',
      title: 'Dr.',
      specialty: 'Médecine générale',
      phone: '+212 6 00 00 00 01',
      email: 'j.dupont@clinique.ma',
      is_active: true
    },
    { 
      id: 'vet_002', 
      name: 'Dr. Marie Martin',
      title: 'Dr.',
      specialty: 'Chirurgie',
      phone: '+212 6 00 00 00 02',
      email: 'm.martin@clinique.ma',
      is_active: true
    },
    { 
      id: 'vet_003', 
      name: 'Pr. Ahmed El Alaoui',
      title: 'Pr.',
      specialty: 'Cardiologie vétérinaire',
      phone: '+212 6 00 00 00 03',
      email: 'a.elalaoui@clinique.ma',
      is_active: true
    }
  ];

  // Sync species with dynamic lists
  const { pets } = useClients();
  useEffect(() => {
    const dynamic = Array.from(new Set([
      ...pets.map(p => p.type)
    ]));
    const merged = Array.from(new Set([...settings.species.split(',').map(s => s.trim()), ...dynamic]));
    updateSettings({ ...settings, species: merged.join(', ') } as ClinicSettings);
  }, [pets]);

  // Handlers for clinic settings
  const handleSettingsChange = (field: keyof ClinicSettings, value: string | boolean | number | any) => {
    updateSettings({ ...settings, [field]: value } as ClinicSettings);
  };

  const saveSettings = () => {
    toast({ title: 'Paramètres sauvegardés', description: 'Informations de la clinique mises à jour.' });
  };

  // Logo handler
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => handleSettingsChange('logo', reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Display preferences handler
  const handleDisplayPreferenceChange = (section: keyof DisplayPreferences, value: 'table' | 'cards') => {
    const updatedPreferences = {
      ...settings.displayPreferences,
      [section]: value
    };
    const updatedSettings = {
      ...settings,
      displayPreferences: updatedPreferences
    };
    updateSettings(updatedSettings);
    toast({ 
      title: 'Préférence d\'affichage mise à jour', 
      description: `${section} s'affichera maintenant en ${value === 'table' ? 'tableau' : 'cartes'}` 
    });
  };

  // Veterinarian handlers
  const openNewVet = () => {
    setEditVet(null);
    setVetForm({ 
      name: '', 
      title: '', 
      specialty: '', 
      phone: '', 
      email: '',
      is_active: true
    });
    setShowVetModal(true);
  };

  const openEditVet = (vet: VeterinarianSetting) => {
    setEditVet(vet);
    setVetForm({ 
      name: vet.name, 
      title: vet.title, 
      specialty: vet.specialty || '', 
      phone: vet.phone || '', 
      email: vet.email || '',
      is_active: vet.is_active
    });
    setShowVetModal(true);
  };

  const saveVet = () => {
    if (!vetForm.name || !vetForm.title) {
      toast({ title: 'Erreur', description: 'Nom et titre requis', variant: 'destructive' });
      return;
    }
    
    const fullName = `${vetForm.title} ${vetForm.name}`;
    let updatedVets;
    
    if (editVet) {
      updatedVets = dbVeterinarians.map(v => 
        v.id === editVet.id 
          ? { 
              ...v, 
              name: fullName,
              title: vetForm.title,
              specialty: vetForm.specialty,
              phone: vetForm.phone,
              email: vetForm.email,
              is_active: vetForm.is_active
            }
          : v
      );
    } else {
      const newVet: VeterinarianSetting = { 
        id: `vet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, 
        name: fullName,
        title: vetForm.title,
        specialty: vetForm.specialty,
        phone: vetForm.phone,
        email: vetForm.email,
        is_active: true
      };
      updatedVets = [...dbVeterinarians, newVet];
    }
    
    updateVeterinarianMutation.mutate(updatedVets);
    toast({ title: 'Vétérinaire enregistré' });
    setShowVetModal(false);
  };

  const deleteVet = (id: string) => {
    if (!confirm('Supprimer ce vétérinaire ?')) return;
    const updatedVets = dbVeterinarians.filter(v => v.id !== id);
    updateVeterinarianMutation.mutate(updatedVets);
    toast({ title: 'Vétérinaire supprimé' });
  };

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      {/* Tab Navigation */}
      <Card>
        <CardHeader>
          <CardTitle>Paramètres de l'application</CardTitle>
          <div className="flex items-center gap-4 mt-8 pt-8">
            <Button
              variant={activeTab === 'general' ? 'default' : 'outline'}
              onClick={() => setActiveTab('general')}
              className="flex items-center gap-2"
            >
              <Settings2 className="h-4 w-4" />
              Paramètres généraux
            </Button>
            <Button
              variant={activeTab === 'data' ? 'default' : 'outline'}
              onClick={() => setActiveTab('data')}
              className="flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              Configuration des données
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Tab Content */}
          {activeTab === 'data' ? (
            <SettingsManagement />
          ) : (
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-8">
                {/* Clinic Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Paramètres de la Clinique</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="logo">Logo de la clinique</Label>
                        <Input id="logo" type="file" accept="image/*" onChange={handleLogoChange} />
                        {settings.logo && <img src={settings.logo} alt="Logo" className="h-24 mt-2" />}
                      </div>
                      <div>
                        <Label htmlFor="clinicName">Nom de la clinique</Label>
                        <Input id="clinicName" value={settings.clinicName} onChange={e => handleSettingsChange('clinicName', e.target.value)} />
                      </div>
                      <div>
                        <Label htmlFor="address">Adresse</Label>
                        <Input id="address" value={settings.address} onChange={e => handleSettingsChange('address', e.target.value)} />
                      </div>
                      <div>
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input id="phone" value={settings.phone} onChange={e => handleSettingsChange('phone', e.target.value)} />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={settings.email} onChange={e => handleSettingsChange('email', e.target.value)} />
                      </div>
                      <div>
                        <Label htmlFor="website">Site web</Label>
                        <Input id="website" value={settings.website} onChange={e => handleSettingsChange('website', e.target.value)} />
                      </div>
                      <div>
                        <Label htmlFor="currency">Devise</Label>
                        <Input id="currency" value={settings.currency} onChange={e => handleSettingsChange('currency', e.target.value)} />
                      </div>
                      <div>
                        <Label htmlFor="defaultConsultationPrice">Prix de consultation par défaut ({settings.currency})</Label>
                        <Input 
                          id="defaultConsultationPrice" 
                          type="number" 
                          step="0.01" 
                          min="0" 
                          value={settings.defaultConsultationPrice} 
                          onChange={e => handleSettingsChange('defaultConsultationPrice', parseFloat(e.target.value) || 0)} 
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={saveSettings}>Enregistrer</Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Theme Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Thème de l'application</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Choisissez le thème de l'application pour votre confort visuel.
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label htmlFor="theme-select">Thème</Label>
                          <p className="text-sm text-muted-foreground">
                            {theme === 'light' ? 'Mode clair' : 'Mode sombre'}
                          </p>
                        </div>
                        <Select
                          value={theme}
                          onValueChange={(value: 'light' | 'dark') => {
                            setTheme(value);
                            toast({
                              title: 'Thème mis à jour',
                              description: `Thème changé en mode ${value === 'light' ? 'clair' : 'sombre'}`,
                            });
                          }}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Mode clair</SelectItem>
                            <SelectItem value="dark">Mode sombre</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Display Preferences */}
                <Card>
                  <CardHeader>
                    <CardTitle>Préférences d'affichage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Choisissez comment vous souhaitez afficher les différentes sections par défaut.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(settings.displayPreferences).map(([key, value]) => (
                          <div key={key} className="space-y-2">
                            <Label htmlFor={`${key}-display`}>{key.charAt(0).toUpperCase() + key.slice(1)}</Label>
                            <Select
                              value={value}
                              onValueChange={(newValue: 'table' | 'cards') => handleDisplayPreferenceChange(key as keyof DisplayPreferences, newValue)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="table">Tableau</SelectItem>
                                <SelectItem value="cards">Cartes</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Veterinarians */}
                <Card>
                  <CardHeader className="flex justify-between items-center">
                    <CardTitle>Vétérinaires</CardTitle>
                    <Button onClick={openNewVet} className="gap-2">
                      <Plus className="h-4 w-4" /> Ajouter
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {vets.length === 0 ? (
                      <p className="text-muted-foreground">Aucun vétérinaire configuré</p>
                    ) : (
                      vets.map(v => (
                        <div key={v.id} className="flex justify-between items-center p-2 border rounded">
                          <div>
                            <p className="font-medium">{v.name}</p>
                            <p className="text-sm text-muted-foreground">{v.specialty}</p>
                            <p className="text-xs">{v.phone} | {v.email}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => openEditVet(v)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => deleteVet(v.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <UserProfile />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Veterinarian Modal */}
      <Dialog open={showVetModal} onOpenChange={setShowVetModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editVet ? 'Modifier vétérinaire' : 'Nouveau vétérinaire'}</DialogTitle>
            <DialogDescription>Nom, titre, spécialité, contact</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="vetName">Nom complet *</Label>
              <Input 
                id="vetName" 
                value={vetForm.name} 
                onChange={e => setVetForm(f => ({ ...f, name: e.target.value }))} 
              />
            </div>
            <div>
              <Label htmlFor="vetTitle">Titre *</Label>
              <Input 
                id="vetTitle" 
                value={vetForm.title} 
                onChange={e => setVetForm(f => ({ ...f, title: e.target.value }))} 
              />
            </div>
            <div>
              <Label htmlFor="vetSpec">Spécialité</Label>
              <Input 
                id="vetSpec" 
                value={vetForm.specialty} 
                onChange={e => setVetForm(f => ({ ...f, specialty: e.target.value }))} 
              />
            </div>
            <div>
              <Label htmlFor="vetPhone">Téléphone</Label>
              <Input 
                id="vetPhone" 
                value={vetForm.phone} 
                onChange={e => setVetForm(f => ({ ...f, phone: e.target.value }))} 
              />
            </div>
            <div>
              <Label htmlFor="vetEmail">Email</Label>
              <Input 
                id="vetEmail" 
                type="email" 
                value={vetForm.email} 
                onChange={e => setVetForm(f => ({ ...f, email: e.target.value }))} 
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowVetModal(false)}>
                Annuler
              </Button>
              <Button onClick={saveVet}>
                {editVet ? 'Mettre à jour' : 'Créer'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}