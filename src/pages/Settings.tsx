import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useClients } from "@/contexts/ClientContext";
import { useSettings, FarmManagementSettings, ClinicSettings, DisplayPreferences, ScheduleSettings } from '@/contexts/SettingsContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserProfile } from "@/components/UserProfile";
import { User, Shield } from "lucide-react";

interface Veterinarian {
  id: number;
  name: string;
  title: string;
  specialty?: string;
  phone?: string;
  email?: string;
}

const SETTINGS_KEY = 'vetpro-clinicSettings';
// Valeurs par défaut pour Rabat, Maroc
const DEFAULT_SETTINGS: ClinicSettings = {
  clinicName: 'Clinique du Soleil',
  address: '123 Avenue Hassan II, Rabat, Maroc',
  phone: '+212 5 37 00 00 00',
  email: 'contact@cliniquedusoleil.ma',
  website: 'https://www.cliniquedusoleil.ma',
  footerText: 'Clinique du Soleil - Soins vétérinaires à Rabat',
  logo: '/placeholder.svg',
  currency: 'MAD',
  species: 'Chien, Chat, Bovins, Porcins, Volailles',
  showClinicInfo: true,
  showVetsInfo: true,
  veterinarians: [], // Sera rempli dynamiquement avec DEFAULT_VETS
  displayPreferences: {
    clients: 'table',
    pets: 'cards',
    consultations: 'table',
    appointments: 'table',
    prescriptions: 'table',
    farms: 'cards',
    vaccinations: 'table',
    antiparasitics: 'table'
  },
  farmManagement: {
    farmTypes: [
      'Bovin laitier', 'Bovin viande', 'Porcin', 'Avicole', 'Ovin', 'Caprin', 
      'Équin', 'Apiculture', 'Aquaculture', 'Cuniculture', 'Mixte'
    ],
    animalCategories: [
      'Bovins laitiers', 'Bovins à viande', 'Porcs', 'Poules pondeuses', 
      'Poulets de chair', 'Ovins', 'Caprins', 'Chevaux', 'Lapins', 'Abeilles', 'Poissons'
    ],
    breedsByCategory: {
      'Bovins laitiers': ['Holstein', 'Prim\'Holstein', 'Montbéliarde', 'Normande', 'Simmental'],
      'Bovins à viande': ['Charolaise', 'Limousine', 'Blonde d\'Aquitaine', 'Angus', 'Salers'],
      'Porcs': ['Large White', 'Landrace', 'Piétrain', 'Duroc', 'Hampshire'],
      'Poules pondeuses': ['ISA Brown', 'Lohmann Brown', 'Hy-Line', 'Novogen', 'Dekalb'],
      'Poulets de chair': ['Cobb 500', 'Ross 308', 'Hubbard', 'Arbor Acres'],
      'Ovins': ['Lacaune', 'Brebis laitière', 'Ile-de-France', 'Texel', 'Suffolk'],
      'Caprins': ['Saanen', 'Alpine', 'Poitevine', 'Boer', 'Angora'],
      'Chevaux': ['Pur-sang', 'Trotteur', 'Selle français', 'Arabe', 'Quarter Horse'],
      'Lapins': ['Néo-Zélandais', 'Californien', 'Fauve de Bourgogne', 'Géant des Flandres'],
      'Abeilles': ['Abeille noire', 'Buckfast', 'Carnica', 'Caucasienne'],
      'Poissons': ['Truite arc-en-ciel', 'Saumon', 'Carpe', 'Bar', 'Daurade']
    },
    certificationTypes: [
      'Agriculture Biologique', 'Label Rouge', 'AOC/AOP', 'IGP', 
      'Haute Valeur Environnementale', 'Bien-être animal', 'Global GAP',
      'IFS Food', 'BRC Food', 'Œufs de France'
    ],
    equipmentTypes: [
      'Tracteur', 'Moissonneuse', 'Épandeur', 'Charrue', 'Système de traite',
      'Tank à lait', 'Système d\'alimentation automatique', 'Ventilation',
      'Générateur', 'Système d\'irrigation', 'Matériel de récolte'
    ],
    defaultSurfaceUnit: 'hectares',
    defaultCoordinateFormat: 'decimal'
  },
  defaultConsultationPrice: 150,
  scheduleSettings: {
    openingTime: '08:00',
    closingTime: '18:00',
    slotDuration: 30,
    lunchBreakStart: '12:00',
    lunchBreakEnd: '13:00',
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  }
};

export default function Settings() {
  const { toast } = useToast();
  const { settings, updateSettings } = useSettings();
  const { theme, setTheme } = useTheme();
  // Veterinarians state initialisé avec defaults
  const DEFAULT_VETS: Veterinarian[] = [
    { id: 1, name: 'Dr. Jean Dupont', title: 'Dr.', specialty: 'Médecine générale', phone: '+212 5 37 00 00 01', email: 'j.dupont@cliniquedusoleil.ma' },
    { id: 2, name: 'Dr. Marie Martin', title: 'Dr.', specialty: 'Chirurgie', phone: '+212 5 37 00 00 02', email: 'm.martin@cliniquedusoleil.ma' },
    { id: 3, name: 'Pr. Ahmed El Alaoui', title: 'Pr.', specialty: 'Dermatologie', phone: '+212 5 37 00 00 03', email: 'a.alaoui@cliniquedusoleil.ma' }
  ];
  
  // Convertir les vétérinaires des paramètres en format Veterinarian
  const vets = settings.veterinarians.map(vet => ({
    id: vet.id,
    name: vet.name,
    title: vet.name.startsWith('Dr.') ? 'Dr.' : vet.name.startsWith('Pr.') ? 'Pr.' : 'Dr.',
    specialty: 'Médecine générale', // Par défaut
    phone: '',
    email: ''
  }));
  const [showVetModal, setShowVetModal] = useState(false);
  const [editVet, setEditVet] = useState<Veterinarian | null>(null);
  const [vetForm, setVetForm] = useState<Omit<Veterinarian, 'id'>>({ name: '', title: '', specialty: '', phone: '', email: '' });
  
  // États pour la gestion des paramètres de ferme
  const [showFarmTypeModal, setShowFarmTypeModal] = useState(false);
  const [newFarmType, setNewFarmType] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showBreedModal, setShowBreedModal] = useState(false);
  const [newBreed, setNewBreed] = useState('');
  const [showCertificationModal, setShowCertificationModal] = useState(false);
  const [newCertification, setNewCertification] = useState('');
  
  // Initialiser les vétérinaires dans les paramètres si pas encore fait
  useEffect(() => {
    if (settings.veterinarians.length === 0) {
      const defaultVetsForSettings = DEFAULT_VETS.map(vet => ({
        id: vet.id,
        name: vet.name,
        isActive: true
      }));
      updateSettings({ ...settings, veterinarians: defaultVetsForSettings });
    }
  }, [settings.veterinarians.length]);

  // Sync species avec listes dynamiques de pets
  const { pets } = useClients();
  useEffect(() => {
    const dynamic = Array.from(new Set([
      ...pets.map(p => p.type)
    ]));
    const merged = Array.from(new Set([...settings.species.split(',').map(s => s.trim()), ...dynamic]));
    updateSettings({ ...settings, species: merged.join(', ') } as ClinicSettings);
  }, [pets]);

  // Handlers for clinic settings via context
  const handleSettingsChange = (field: keyof ClinicSettings, value: string | boolean | number | any) => {
    updateSettings({ ...settings, [field]: value } as ClinicSettings);
  };
  const saveSettings = () => {
    // updateSettings already saved to localStorage via context
    toast({ title: 'Paramètres sauvegardés', description: 'Informations de la clinique mises à jour.' });
  };

  // Gestion du logo
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => handleSettingsChange('logo', reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Gestion des préférences d'affichage
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

  // Handlers for veterinarians
  const openNewVet = () => {
    setEditVet(null);
    setVetForm({ name: '', title: '', specialty: '', phone: '', email: '' });
    setShowVetModal(true);
  };
  const openEditVet = (vet: Veterinarian) => {
    setEditVet(vet);
    setVetForm({ name: vet.name, title: vet.title, specialty: vet.specialty || '', phone: vet.phone || '', email: vet.email || '' });
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
      updatedVets = settings.veterinarians.map(v => 
        v.id === editVet.id 
          ? { ...v, name: fullName, isActive: true }
          : v
      );
    } else {
      const newVet = { 
        id: Math.max(0, ...settings.veterinarians.map(v => v.id)) + 1, 
        name: fullName, 
        isActive: true 
      };
      updatedVets = [...settings.veterinarians, newVet];
    }
    
    updateSettings({ ...settings, veterinarians: updatedVets });
    toast({ title: 'Vétérinaire enregistré' });
    setShowVetModal(false);
  };
  const deleteVet = (id: number) => {
    if (!confirm('Supprimer ce vétérinaire ?')) return;
    const updatedVets = settings.veterinarians.filter(v => v.id !== id);
    updateSettings({ ...settings, veterinarians: updatedVets });
    toast({ title: 'Vétérinaire supprimé' });
  };

  // Fonctions de gestion des paramètres de ferme
  const addFarmType = () => {
    if (!newFarmType.trim()) return;
    const updated = { 
      ...settings, 
      farmManagement: { 
        ...settings.farmManagement, 
        farmTypes: [...settings.farmManagement.farmTypes, newFarmType.trim()]
      }
    };
    updateSettings(updated);
    setNewFarmType('');
    setShowFarmTypeModal(false);
    toast({ title: 'Type d\'élevage ajouté' });
  };

  const removeFarmType = (type: string) => {
    if (!confirm(`Supprimer le type "${type}" ?`)) return;
    const updated = { 
      ...settings, 
      farmManagement: { 
        ...settings.farmManagement, 
        farmTypes: settings.farmManagement.farmTypes.filter(t => t !== type)
      }
    };
    updateSettings(updated);
    toast({ title: 'Type d\'élevage supprimé' });
  };

  const addAnimalCategory = () => {
    if (!newCategory.trim()) return;
    const updated = { 
      ...settings, 
      farmManagement: { 
        ...settings.farmManagement, 
        animalCategories: [...settings.farmManagement.animalCategories, newCategory.trim()],
        breedsByCategory: { ...settings.farmManagement.breedsByCategory, [newCategory.trim()]: [] }
      }
    };
    updateSettings(updated);
    setNewCategory('');
    setShowCategoryModal(false);
    toast({ title: 'Catégorie d\'animal ajoutée' });
  };

  const removeAnimalCategory = (category: string) => {
    if (!confirm(`Supprimer la catégorie "${category}" ?`)) return;
    const newBreedsByCategory = { ...settings.farmManagement.breedsByCategory };
    delete newBreedsByCategory[category];
    const updated = { 
      ...settings, 
      farmManagement: { 
        ...settings.farmManagement, 
        animalCategories: settings.farmManagement.animalCategories.filter(c => c !== category),
        breedsByCategory: newBreedsByCategory
      }
    };
    updateSettings(updated);
    toast({ title: 'Catégorie d\'animal supprimée' });
  };

  const addBreed = () => {
    if (!newBreed.trim() || !selectedCategory) return;
    const currentBreeds = settings.farmManagement.breedsByCategory[selectedCategory] || [];
    const updated = { 
      ...settings, 
      farmManagement: { 
        ...settings.farmManagement, 
        breedsByCategory: {
          ...settings.farmManagement.breedsByCategory,
          [selectedCategory]: [...currentBreeds, newBreed.trim()]
        }
      }
    };
    updateSettings(updated);
    setNewBreed('');
    setShowBreedModal(false);
    toast({ title: 'Race ajoutée' });
  };

  const removeBreed = (category: string, breed: string) => {
    if (!confirm(`Supprimer la race "${breed}" ?`)) return;
    const currentBreeds = settings.farmManagement.breedsByCategory[category] || [];
    const updated = { 
      ...settings, 
      farmManagement: { 
        ...settings.farmManagement, 
        breedsByCategory: {
          ...settings.farmManagement.breedsByCategory,
          [category]: currentBreeds.filter(b => b !== breed)
        }
      }
    };
    updateSettings(updated);
    toast({ title: 'Race supprimée' });
  };

  const addCertification = () => {
    if (!newCertification.trim()) return;
    const updated = { 
      ...settings, 
      farmManagement: { 
        ...settings.farmManagement, 
        certificationTypes: [...settings.farmManagement.certificationTypes, newCertification.trim()]
      }
    };
    updateSettings(updated);
    setNewCertification('');
    setShowCertificationModal(false);
    toast({ title: 'Certification ajoutée' });
  };

  const removeCertification = (certification: string) => {
    if (!confirm(`Supprimer la certification "${certification}" ?`)) return;
    const updated = { 
      ...settings, 
      farmManagement: { 
        ...settings.farmManagement, 
        certificationTypes: settings.farmManagement.certificationTypes.filter(c => c !== certification)
      }
    };
    updateSettings(updated);
    toast({ title: 'Certification supprimée' });
  };

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
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
            <div><Label htmlFor="clinicName">Nom de la clinique</Label><Input id="clinicName" value={settings.clinicName} onChange={e => handleSettingsChange('clinicName', e.target.value)} /></div>
            <div><Label htmlFor="address">Adresse</Label><Input id="address" value={settings.address} onChange={e => handleSettingsChange('address', e.target.value)} /></div>
            <div><Label htmlFor="phone">Téléphone</Label><Input id="phone" value={settings.phone} onChange={e => handleSettingsChange('phone', e.target.value)} /></div>
            <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={settings.email} onChange={e => handleSettingsChange('email', e.target.value)} /></div>
            <div><Label htmlFor="website">Site web</Label><Input id="website" value={settings.website} onChange={e => handleSettingsChange('website', e.target.value)} /></div>
            <div><Label htmlFor="currency">Devise</Label><Input id="currency" value={settings.currency} onChange={e => handleSettingsChange('currency', e.target.value)} /></div>
            <div><Label htmlFor="defaultConsultationPrice">Prix de consultation par défaut ({settings.currency})</Label><Input id="defaultConsultationPrice" type="number" step="0.01" min="0" value={settings.defaultConsultationPrice} onChange={e => handleSettingsChange('defaultConsultationPrice', parseFloat(e.target.value) || 0)} /></div>
            <div><Label htmlFor="species">Liste des espèces (virgule séparées)</Label><Input id="species" value={settings.species} onChange={e => handleSettingsChange('species', e.target.value)} /></div>
            <div><Label htmlFor="footerText">Texte de pied de page</Label><Input id="footerText" value={settings.footerText} onChange={e => handleSettingsChange('footerText', e.target.value)} /></div>
            {/* Options d'affichage sur le certificat */}
            <div className="flex items-center gap-2">
              <Switch
                id="showClinicInfo"
                checked={settings.showClinicInfo}
                onCheckedChange={checked => handleSettingsChange('showClinicInfo', checked)}
              />
              <Label htmlFor="showClinicInfo">Afficher coordonnées de la clinique sur le certificat</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="showVetsInfo"
                checked={settings.showVetsInfo}
                onCheckedChange={checked => handleSettingsChange('showVetsInfo', checked)}
              />
              <Label htmlFor="showVetsInfo">Afficher liste des vétérinaires sur le certificat</Label>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={saveSettings}>Enregistrer</Button>
            <Button variant="outline" onClick={() => {
              // Créer les paramètres par défaut avec les vétérinaires
              const defaultVetsForSettings = DEFAULT_VETS.map(vet => ({
                id: vet.id,
                name: vet.name,
                isActive: true
              }));
              
              const resetSettings = {
                ...DEFAULT_SETTINGS,
                veterinarians: defaultVetsForSettings
              };
              
              updateSettings(resetSettings);
              toast({ title: 'Paramètres réinitialisés', description: 'Valeurs par défaut restaurées.' });
            }}>
              Restaurer valeurs par défaut
            </Button>
            <Button variant="outline" onClick={() => {
              const currentSettings = settings;
              const resetFarmSettings = {
                ...currentSettings,
                farmManagement: {
                  farmTypes: [
                    'Bovin laitier', 'Bovin viande', 'Porcin', 'Avicole', 'Ovin', 'Caprin', 
                    'Équin', 'Apiculture', 'Aquaculture', 'Cuniculture', 'Mixte'
                  ],
                  animalCategories: [
                    'Bovins laitiers', 'Bovins à viande', 'Porcs', 'Poules pondeuses', 
                    'Poulets de chair', 'Ovins', 'Caprins', 'Chevaux', 'Lapins', 'Abeilles', 'Poissons'
                  ],
                  breedsByCategory: {
                    'Bovins laitiers': ['Holstein', 'Prim\'Holstein', 'Montbéliarde', 'Normande', 'Simmental'],
                    'Bovins à viande': ['Charolaise', 'Limousine', 'Blonde d\'Aquitaine', 'Angus', 'Salers'],
                    'Porcs': ['Large White', 'Landrace', 'Piétrain', 'Duroc', 'Hampshire'],
                    'Poules pondeuses': ['ISA Brown', 'Lohmann Brown', 'Hy-Line', 'Novogen', 'Dekalb'],
                    'Poulets de chair': ['Cobb 500', 'Ross 308', 'Hubbard', 'Arbor Acres'],
                    'Ovins': ['Lacaune', 'Brebis laitière', 'Ile-de-France', 'Texel', 'Suffolk'],
                    'Caprins': ['Saanen', 'Alpine', 'Poitevine', 'Boer', 'Angora'],
                    'Chevaux': ['Pur-sang', 'Trotteur', 'Selle français', 'Arabe', 'Quarter Horse'],
                    'Lapins': ['Néo-Zélandais', 'Californien', 'Fauve de Bourgogne', 'Géant des Flandres'],
                    'Abeilles': ['Abeille noire', 'Buckfast', 'Carnica', 'Caucasienne'],
                    'Poissons': ['Truite arc-en-ciel', 'Saumon', 'Carpe', 'Bar', 'Daurade']
                  },
                  certificationTypes: [
                    'Agriculture Biologique', 'Label Rouge', 'AOC/AOP', 'IGP', 
                    'Haute Valeur Environnementale', 'Bien-être animal', 'Global GAP',
                    'IFS Food', 'BRC Food', 'Œufs de France'
                  ],
                  equipmentTypes: [
                    'Tracteur', 'Moissonneuse', 'Épandeur', 'Charrue', 'Système de traite',
                    'Tank à lait', 'Système d\'alimentation automatique', 'Ventilation',
                    'Générateur', 'Système d\'irrigation', 'Matériel de récolte'
                  ],
                  defaultSurfaceUnit: 'hectares',
                  defaultCoordinateFormat: 'decimal'
                }
              };
              updateSettings(resetFarmSettings);
              toast({ title: 'Paramètres ferme réinitialisés', description: 'Configuration des fermes restaurée aux valeurs par défaut.' });
            }}>
              Restaurer paramètres ferme
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Section du thème */}
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

      {/* Section des préférences d'affichage */}
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
              {/* Clients */}
              <div className="space-y-2">
                <Label htmlFor="clients-display">Clients</Label>
                <Select
                  value={settings.displayPreferences.clients}
                  onValueChange={(value: 'table' | 'cards') => handleDisplayPreferenceChange('clients', value)}
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

              {/* Animaux */}
              <div className="space-y-2">
                <Label htmlFor="pets-display">Animaux</Label>
                <Select
                  value={settings.displayPreferences.pets}
                  onValueChange={(value: 'table' | 'cards') => handleDisplayPreferenceChange('pets', value)}
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

              {/* Consultations */}
              <div className="space-y-2">
                <Label htmlFor="consultations-display">Consultations</Label>
                <Select
                  value={settings.displayPreferences.consultations}
                  onValueChange={(value: 'table' | 'cards') => handleDisplayPreferenceChange('consultations', value)}
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

              {/* Rendez-vous */}
              <div className="space-y-2">
                <Label htmlFor="appointments-display">Rendez-vous</Label>
                <Select
                  value={settings.displayPreferences.appointments}
                  onValueChange={(value: 'table' | 'cards') => handleDisplayPreferenceChange('appointments', value)}
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

              {/* Prescriptions */}
              <div className="space-y-2">
                <Label htmlFor="prescriptions-display">Prescriptions</Label>
                <Select
                  value={settings.displayPreferences.prescriptions}
                  onValueChange={(value: 'table' | 'cards') => handleDisplayPreferenceChange('prescriptions', value)}
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

              {/* Fermes */}
              <div className="space-y-2">
                <Label htmlFor="farms-display">Fermes</Label>
                <Select
                  value={settings.displayPreferences.farms}
                  onValueChange={(value: 'table' | 'cards') => handleDisplayPreferenceChange('farms', value)}
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

              {/* Vaccinations */}
              <div className="space-y-2">
                <Label htmlFor="vaccinations-display">Vaccinations</Label>
                <Select
                  value={settings.displayPreferences.vaccinations}
                  onValueChange={(value: 'table' | 'cards') => handleDisplayPreferenceChange('vaccinations', value)}
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

              {/* Antiparasitaires */}
              <div className="space-y-2">
                <Label htmlFor="antiparasitics-display">Antiparasitaires</Label>
                <Select
                  value={settings.displayPreferences.antiparasitics}
                  onValueChange={(value: 'table' | 'cards') => handleDisplayPreferenceChange('antiparasitics', value)}
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
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Vétérinaires</CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                console.log('Vétérinaires dans settings:', settings.veterinarians);
                console.log('Vétérinaires affichés:', vets);
              }}
            >
              Debug
            </Button>
            <Button onClick={openNewVet} className="gap-2"><Plus className="h-4 w-4" /> Ajouter</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {vets.length === 0 ? <p className="text-muted-foreground">Aucun vétérinaire configuré</p> : vets.map(v => (
            <div key={v.id} className="flex justify-between items-center p-2 border rounded">
              <div>
                <p className="font-medium">{v.title} {v.name}</p>
                <p className="text-sm text-muted-foreground">{v.specialty}</p>
                <p className="text-xs">{v.phone} | {v.email}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openEditVet(v)}><Edit className="h-4 w-4" /></Button>
                <Button size="sm" variant="destructive" onClick={() => deleteVet(v.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Section Configuration des Horaires */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration des Horaires</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Heures d'ouverture et fermeture */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="openingTime">Heure d'ouverture</Label>
                <Input
                  id="openingTime"
                  type="time"
                  value={settings.scheduleSettings.openingTime}
                  onChange={(e) => handleSettingsChange('scheduleSettings', {
                    ...settings.scheduleSettings,
                    openingTime: e.target.value
                  })}
                />
              </div>
              
              <div>
                <Label htmlFor="closingTime">Heure de fermeture</Label>
                <Input
                  id="closingTime"
                  type="time"
                  value={settings.scheduleSettings.closingTime}
                  onChange={(e) => handleSettingsChange('scheduleSettings', {
                    ...settings.scheduleSettings,
                    closingTime: e.target.value
                  })}
                />
              </div>
            </div>

            {/* Durée des créneaux */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="slotDuration">Durée des créneaux (minutes)</Label>
                <Select
                  value={settings.scheduleSettings.slotDuration.toString()}
                  onValueChange={(value) => handleSettingsChange('scheduleSettings', {
                    ...settings.scheduleSettings,
                    slotDuration: parseInt(value)
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 heure</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Pause déjeuner */}
          <div className="space-y-4">
            <h4 className="font-medium">Pause déjeuner</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lunchBreakStart">Début de pause</Label>
                <Input
                  id="lunchBreakStart"
                  type="time"
                  value={settings.scheduleSettings.lunchBreakStart || ''}
                  onChange={(e) => handleSettingsChange('scheduleSettings', {
                    ...settings.scheduleSettings,
                    lunchBreakStart: e.target.value
                  })}
                />
              </div>
              
              <div>
                <Label htmlFor="lunchBreakEnd">Fin de pause</Label>
                <Input
                  id="lunchBreakEnd"
                  type="time"
                  value={settings.scheduleSettings.lunchBreakEnd || ''}
                  onChange={(e) => handleSettingsChange('scheduleSettings', {
                    ...settings.scheduleSettings,
                    lunchBreakEnd: e.target.value
                  })}
                />
              </div>
            </div>
          </div>

          {/* Jours de travail */}
          <div className="space-y-4">
            <h4 className="font-medium">Jours de travail</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { key: 'monday', label: 'Lundi' },
                { key: 'tuesday', label: 'Mardi' },
                { key: 'wednesday', label: 'Mercredi' },
                { key: 'thursday', label: 'Jeudi' },
                { key: 'friday', label: 'Vendredi' },
                { key: 'saturday', label: 'Samedi' },
                { key: 'sunday', label: 'Dimanche' }
              ].map(day => (
                <div key={day.key} className="flex items-center space-x-2">
                  <Switch
                    id={day.key}
                    checked={settings.scheduleSettings.workingDays.includes(day.key)}
                    onCheckedChange={(checked) => {
                      const newWorkingDays = checked
                        ? [...settings.scheduleSettings.workingDays, day.key]
                        : settings.scheduleSettings.workingDays.filter(d => d !== day.key);
                      
                      handleSettingsChange('scheduleSettings', {
                        ...settings.scheduleSettings,
                        workingDays: newWorkingDays
                      });
                    }}
                  />
                  <Label htmlFor={day.key} className="text-sm">{day.label}</Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section Farm Management */}
      <Card>
        <CardHeader>
          <CardTitle>Gestion des Exploitations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Types d'élevage */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium">Types d'élevage</h4>
              <Button size="sm" onClick={() => setShowFarmTypeModal(true)} className="gap-2">
                <Plus className="h-4 w-4" /> Ajouter
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {settings.farmManagement.farmTypes.map(type => (
                <Badge key={type} variant="secondary" className="gap-2">
                  {type}
                  <button onClick={() => removeFarmType(type)} className="hover:text-red-500">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Catégories d'animaux */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium">Catégories d'animaux</h4>
              <Button size="sm" onClick={() => setShowCategoryModal(true)} className="gap-2">
                <Plus className="h-4 w-4" /> Ajouter
              </Button>
            </div>
            <div className="space-y-3">
              {settings.farmManagement.animalCategories.map(category => (
                <div key={category} className="border rounded p-3">
                  <div className="flex justify-between items-center mb-2">
                    <h5 className="font-medium">{category}</h5>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => {
                        setSelectedCategory(category);
                        setShowBreedModal(true);
                      }}>
                        <Plus className="h-3 w-3" /> Race
                      </Button>
                      <button onClick={() => removeAnimalCategory(category)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(settings.farmManagement.breedsByCategory[category] || []).map(breed => (
                      <Badge key={breed} variant="outline" className="text-xs gap-1">
                        {breed}
                        <button onClick={() => removeBreed(category, breed)} className="hover:text-red-500">
                          <Trash2 className="h-2 w-2" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium">Types de certifications</h4>
              <Button size="sm" onClick={() => setShowCertificationModal(true)} className="gap-2">
                <Plus className="h-4 w-4" /> Ajouter
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {settings.farmManagement.certificationTypes.map(cert => (
                <Badge key={cert} variant="outline" className="gap-2">
                  {cert}
                  <button onClick={() => removeCertification(cert)} className="hover:text-red-500">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal vétérinaire */}
      <Dialog open={showVetModal} onOpenChange={setShowVetModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editVet ? 'Modifier vétérinaire' : 'Nouveau vétérinaire'}</DialogTitle>
            <DialogDescription>Nom, titre, spécialité, contact</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label htmlFor="vetName">Nom complet *</Label><Input id="vetName" value={vetForm.name} onChange={e => setVetForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><Label htmlFor="vetTitle">Titre *</Label><Input id="vetTitle" value={vetForm.title} onChange={e => setVetForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div><Label htmlFor="vetSpec">Spécialité</Label><Input id="vetSpec" value={vetForm.specialty} onChange={e => setVetForm(f => ({ ...f, specialty: e.target.value }))} /></div>
            <div><Label htmlFor="vetPhone">Téléphone</Label><Input id="vetPhone" value={vetForm.phone} onChange={e => setVetForm(f => ({ ...f, phone: e.target.value }))} /></div>
            <div><Label htmlFor="vetEmail">Email</Label><Input id="vetEmail" type="email" value={vetForm.email} onChange={e => setVetForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowVetModal(false)}>Annuler</Button>
              <Button onClick={saveVet}>{editVet ? 'Mettre à jour' : 'Créer'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modales Farm Management */}
      <Dialog open={showFarmTypeModal} onOpenChange={setShowFarmTypeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau type d'élevage</DialogTitle>
            <DialogDescription>Ajouter un nouveau type d'exploitation agricole</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input 
              placeholder="Ex: Apiculture, Aquaculture..." 
              value={newFarmType}
              onChange={(e) => setNewFarmType(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addFarmType()}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowFarmTypeModal(false)}>Annuler</Button>
              <Button onClick={addFarmType}>Ajouter</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCategoryModal} onOpenChange={setShowCategoryModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle catégorie d'animal</DialogTitle>
            <DialogDescription>Ajouter une nouvelle catégorie d'animaux d'élevage</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input 
              placeholder="Ex: Cochons d'Inde, Autruches..." 
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addAnimalCategory()}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCategoryModal(false)}>Annuler</Button>
              <Button onClick={addAnimalCategory}>Ajouter</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showBreedModal} onOpenChange={setShowBreedModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle race - {selectedCategory}</DialogTitle>
            <DialogDescription>Ajouter une nouvelle race pour la catégorie {selectedCategory}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input 
              placeholder="Nom de la race..." 
              value={newBreed}
              onChange={(e) => setNewBreed(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addBreed()}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowBreedModal(false)}>Annuler</Button>
              <Button onClick={addBreed}>Ajouter</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCertificationModal} onOpenChange={setShowCertificationModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle certification</DialogTitle>
            <DialogDescription>Ajouter un nouveau type de certification</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input 
              placeholder="Ex: Commerce équitable, Demeter..." 
              value={newCertification}
              onChange={(e) => setNewCertification(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCertification()}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCertificationModal(false)}>Annuler</Button>
              <Button onClick={addCertification}>Ajouter</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
        </div>
        
        {/* Profil utilisateur */}
        <div className="lg:col-span-1 space-y-6">
          <UserProfile />
          
          {/* Liens rapides */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Liens Rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2"
                onClick={() => window.location.href = '/profile'}
              >
                <User className="h-4 w-4" />
                Mon Profil
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2"
                onClick={() => window.location.href = '/auth-settings'}
              >
                <Shield className="h-4 w-4" />
                Paramètres de Connexion
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
