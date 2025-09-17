import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useClients, VaccinationProtocol } from '@/contexts/ClientContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useToast } from "@/hooks/use-toast";
import { Plus, Shield, Edit } from 'lucide-react';

interface VaccinationProtocolModalProps {
  children?: React.ReactNode;
  protocol?: VaccinationProtocol | null;
  mode: 'create' | 'edit';
}

export default function VaccinationProtocolModal({ 
  children, 
  protocol,
  mode 
}: VaccinationProtocolModalProps) {
  const { addVaccinationProtocol, updateVaccinationProtocol } = useClients();
  const { settings } = useSettings();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    vaccineType: '',
    description: '',
    manufacturer: '',
    intervals: [{ offsetDays: 365, label: '1 an (intervalle par défaut)' }],
    ageRequirement: '',
    notes: '',
    isActive: true
  } as any);

  // Load data when editing
  useEffect(() => {
    if (mode === 'edit' && protocol) {
      setFormData({
        name: protocol.name,
        species: protocol.species,
        vaccineType: protocol.vaccineType,
        description: protocol.description,
        manufacturer: protocol.manufacturer || '',
        intervals: protocol.intervals || [],
        ageRequirement: protocol.ageRequirement || '',
        notes: protocol.notes || '',
        isActive: protocol.isActive
      });
    }
  }, [mode, protocol]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.species || !formData.vaccineType || !formData.description) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    if (mode === 'create') {
      addVaccinationProtocol({
        name: formData.name,
        species: formData.species,
        vaccineType: formData.vaccineType as 'core' | 'non-core' | 'rabies' | 'custom',
        description: formData.description,
        manufacturer: formData.manufacturer,
        intervals: formData.intervals,
        ageRequirement: formData.ageRequirement,
        notes: formData.notes,
        isActive: formData.isActive
      });

      toast({
        title: "Protocole créé",
        description: `Le protocole ${formData.name} a été créé avec succès`,
      });
    } else if (protocol) {
      updateVaccinationProtocol(protocol.id, {
        name: formData.name,
        species: formData.species,
        vaccineType: formData.vaccineType as 'core' | 'non-core' | 'rabies' | 'custom',
        description: formData.description,
        manufacturer: formData.manufacturer,
        intervals: formData.intervals,
        ageRequirement: formData.ageRequirement,
        notes: formData.notes,
        isActive: formData.isActive
      });

      toast({
        title: "Protocole modifié",
        description: `Le protocole ${formData.name} a été modifié avec succès`,
      });
    }

    // Reset form
    setFormData({
      name: '',
      species: '',
      vaccineType: '',
      description: '',
      manufacturer: '',
      intervals: [{ offsetDays: 365, label: '1 an (intervalle par défaut)' }],
      ageRequirement: '',
      notes: '',
      isActive: true
    });
    setOpen(false);
  };

  // Species list from settings or fallback
  const speciesList = settings.species 
    ? settings.species.split(',').map(s => s.trim())
    : ['Chien', 'Chat', 'Furet', 'Lapin', 'Oiseau', 'Rongeur'];

  const getIntervalDisplayValue = (days: number) => {
    if (days >= 365) {
      const years = Math.floor(days / 365);
      const remainingDays = days % 365;
      if (remainingDays === 0) {
        return `${years} an${years > 1 ? 's' : ''}`;
      }
      return `${years} an${years > 1 ? 's' : ''} et ${remainingDays} jours`;
    }
    if (days >= 30) {
      const months = Math.floor(days / 30);
      const remainingDays = days % 30;
      if (remainingDays === 0) {
        return `${months} mois`;
      }
      return `${months} mois et ${remainingDays} jours`;
    }
    return `${days} jours`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="gap-2">
            {mode === 'create' ? <Plus className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
            {mode === 'create' ? 'Nouveau Protocole' : 'Modifier'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {mode === 'create' ? 'Nouveau Protocole Vaccinal' : 'Modifier le Protocole'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Informations générales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nom du vaccin *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: DHPP, FVRCP, Rage..."
                required
              />
            </div>

            <div>
              <Label htmlFor="species">Espèce *</Label>
              <Select 
                value={formData.species} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, species: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une espèce" />
                </SelectTrigger>
                <SelectContent>
                  {speciesList.map(species => (
                    <SelectItem key={species} value={species}>
                      {species}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vaccineType">Type de vaccin *</Label>
              <Select 
                value={formData.vaccineType} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, vaccineType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Type de vaccin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="core">Essentiel (Core)</SelectItem>
                  <SelectItem value="non-core">Optionnel (Non-core)</SelectItem>
                  <SelectItem value="rabies">Rage</SelectItem>
                  <SelectItem value="custom">Personnalisé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="manufacturer">Fabricant</Label>
              <Input
                id="manufacturer"
                value={formData.manufacturer}
                onChange={(e) => setFormData(prev => ({ ...prev, manufacturer: e.target.value }))}
                placeholder="Ex: Zoetis, Merial, Virbac..."
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description du vaccin et des maladies qu'il prévient..."
              rows={3}
              required
            />
          </div>

          {/* Étapes du protocole : définir nombre et unité, label généré automatiquement */}
          <div className="space-y-4">
            <Label>Étapes du protocole</Label>
            {(formData.intervals || []).map((it: any, idx: number) => {
              // Déduire count et unit
              let count = it.offsetDays;
              let unit: 'days' | 'weeks' | 'months' = 'days';
              if (it.offsetDays % 30 === 0 && it.offsetDays !== 0) { count = it.offsetDays / 30; unit = 'months'; }
              else if (it.offsetDays % 7 === 0 && it.offsetDays !== 0) { count = it.offsetDays / 7; unit = 'weeks'; }
              const label = `${count} ${unit === 'weeks' ? 'semaine(s)' : unit === 'months' ? 'mois' : 'jour(s)'}`;
              return (
                <div key={idx} className="grid grid-cols-4 gap-2 items-center">
                  <Input
                    type="number"
                    min={0}
                    value={count}
                    onChange={e => {
                      const val = parseInt(e.target.value) || 0;
                      const offset = unit === 'weeks' ? val * 7 : unit === 'months' ? val * 30 : val;
                      setFormData((prev: any) => {
                        const intervals = [...prev.intervals];
                        intervals[idx].offsetDays = offset;
                        return { ...prev, intervals };
                      });
                    }}
                  />
                  <Select value={unit} onValueChange={value => {
                    const valUnit = value as 'days' | 'weeks' | 'months';
                    const offset = valUnit === 'weeks' ? count * 7 : valUnit === 'months' ? count * 30 : count;
                    setFormData((prev: any) => {
                      const intervals = [...prev.intervals];
                      intervals[idx].offsetDays = offset;
                      return { ...prev, intervals };
                    });
                  }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="days">Jours</SelectItem>
                      <SelectItem value="weeks">Semaines</SelectItem>
                      <SelectItem value="months">Mois</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="p-2">{label}</div>
                  <Button type="button" variant="outline" size="icon" onClick={() => {
                    setFormData((prev: any) => {
                      const intervals = prev.intervals.filter((_: any, i: number) => i !== idx);
                      return { ...prev, intervals };
                    });
                  }}>❌</Button>
                </div>
              );
            })}
            <Button type="button" variant="outline" size="sm" onClick={() => setFormData((prev: any) => ({
              ...prev,
              intervals: [...(prev.intervals || []), { offsetDays: 0 }]
            }))}>
              <Plus className="h-4 w-4" /> Ajouter une étape
            </Button>
          </div>

          <div>
            <Label htmlFor="ageRequirement">Âge requis</Label>
            <Input
              id="ageRequirement"
              value={formData.ageRequirement}
              onChange={(e) => setFormData(prev => ({ ...prev, ageRequirement: e.target.value }))}
              placeholder="Ex: À partir de 6 semaines"
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes supplémentaires</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Informations complémentaires, contre-indications, etc..."
              rows={2}
            />
          </div>

          {/* Status actif */}
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
            />
            <Label htmlFor="isActive">Protocole actif</Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit">
              <Shield className="h-4 w-4 mr-2" />
              {mode === 'create' ? 'Créer le protocole' : 'Modifier le protocole'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
