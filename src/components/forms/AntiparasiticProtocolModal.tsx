// Nouvelle version du modal de protocole antiparasitaire
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useClients, AntiparasiticProtocol } from '@/contexts/ClientContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit } from 'lucide-react';

interface AntiparasiticProtocolModalProps {
  children?: React.ReactNode;
  protocol?: AntiparasiticProtocol | null;
  mode: 'create' | 'edit';
}

export default function AntiparasiticProtocolModal({ children, protocol, mode }: AntiparasiticProtocolModalProps) {
  const { addAntiparasiticProtocol, updateAntiparasiticProtocol } = useClients();
  const { settings } = useSettings();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState<Omit<AntiparasiticProtocol, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    species: '',
    productType: 'external',
    targetParasites: '',
    description: '',
    manufacturer: '',
    intervals: [{ offsetDays: 30, label: '30 jours' }],
    weightRange: '',
    ageRequirement: '',
    seasonalTreatment: false,
    notes: '',
    isActive: true
  });
  // Unités par interval: 'days' | 'weeks' | 'months'
  const [units, setUnits] = useState<string[]>(['days']);

  // Chargement si en mode édition
  useEffect(() => {
    if (mode === 'edit' && protocol) {
      setFormData({
        name: protocol.name,
        species: protocol.species,
        productType: protocol.productType,
        targetParasites: protocol.targetParasites,
        description: protocol.description,
        manufacturer: protocol.manufacturer || '',
        intervals: protocol.intervals,
        weightRange: protocol.weightRange || '',
        ageRequirement: protocol.ageRequirement || '',
        seasonalTreatment: protocol.seasonalTreatment || false,
        notes: protocol.notes || '',
        isActive: protocol.isActive
      });
      // Initialize units based on offsetDays
      setUnits(protocol.intervals.map(i => i.offsetDays % 30 === 0 ? 'months' : (i.offsetDays % 7 === 0 ? 'weeks' : 'days')));
    }
  }, [mode, protocol]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.species || !formData.productType || !formData.description) {
      toast({ title: 'Erreur', description: 'Champs obligatoires manquants', variant: 'destructive' });
      return;
    }
    if (mode === 'create') {
      addAntiparasiticProtocol(formData);
      toast({ title: 'Protocole créé', description: `${formData.name} a été ajouté.` });
    } else if (protocol) {
      updateAntiparasiticProtocol(protocol.id, formData);
      toast({ title: 'Protocole mis à jour', description: `${formData.name} a été modifié.` });
    }
    setFormData({
      name: '', species: '', productType: 'external', targetParasites: '', description: '', manufacturer: '',
      intervals: [{ offsetDays: 30, label: '30 jours' }], weightRange: '', ageRequirement: '', seasonalTreatment: false,
      notes: '', isActive: true
    });
    setOpen(false);
  };

  const speciesList = settings.species ? settings.species.split(',').map(s => s.trim()) : ['Chien', 'Chat', 'Bovins', 'Ovins'];

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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Nouveau Protocole Antiparasitaire' : 'Modifier le Protocole'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nom du protocole *</Label>
              <Input id="name" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div>
              <Label htmlFor="species">Espèce *</Label>
              <Select value={formData.species} onValueChange={v => setFormData(f => ({ ...f, species: v }))}>
                <SelectTrigger><SelectValue placeholder="Espèce" /></SelectTrigger>
                <SelectContent>
                  {speciesList.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="productType">Type de produit</Label>
              <Select value={formData.productType} onValueChange={v => setFormData(f => ({ ...f, productType: v as any }))}>
                <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="external">Externe</SelectItem>
                  <SelectItem value="internal">Interne</SelectItem>
                  <SelectItem value="combined">Combiné</SelectItem>
                  <SelectItem value="heartworm">Ver du cœur</SelectItem>
                  <SelectItem value="flea_tick">Puces/Tiques</SelectItem>
                  <SelectItem value="worming">Vermifugation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="targetParasites">Parasites cibles</Label>
              <Input id="targetParasites" value={formData.targetParasites} onChange={e => setFormData(f => ({ ...f, targetParasites: e.target.value }))} />
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} required />
          </div>

          <div className="flex items-center gap-2">
            <Switch checked={formData.isActive} onCheckedChange={v => setFormData(f => ({ ...f, isActive: v }))} />
            <Label>Actif</Label>
          </div>

          {/* Intervals dynamic */}
          <div className="space-y-2">
            <Label>Étapes / Intervalles</Label>
            {formData.intervals.map((interval, idx) => {
              const unit = units[idx];
              // compute amount
              const amount = unit === 'months' ? interval.offsetDays / 30 : unit === 'weeks' ? interval.offsetDays / 7 : interval.offsetDays;
              return (
              <div key={idx} className="flex gap-2 items-center">
                <Input type="number" value={amount} min={0} onChange={e => {
                  const val = parseInt(e.target.value) || 0;
                  const days = unit === 'months' ? val * 30 : unit === 'weeks' ? val * 7 : val;
                  setFormData(f => {
                    const ints = [...f.intervals];
                    ints[idx].offsetDays = days;
                    return { ...f, intervals: ints };
                  });
                }} className="w-20" />
                <Select value={unit} onValueChange={v => {
                  setUnits(u => {
                    const nu = [...u]; nu[idx] = v; return nu;
                  });
                }}>
                  <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="days">jours</SelectItem>
                    <SelectItem value="weeks">semaines</SelectItem>
                    <SelectItem value="months">mois</SelectItem>
                  </SelectContent>
                </Select>
                <span className="ml-2">{interval.offsetDays} jours</span>
                <Button type="button" variant="destructive" onClick={() => {
                  setFormData(f => ({ ...f, intervals: f.intervals.filter((_,i) => i!==idx) }));
                  setUnits(u => u.filter((_,i) => i!==idx));
                }}>Suppr.</Button>
              </div>
              );
            })}
            <Button type="button" onClick={() => {
              setFormData(f => ({ ...f, intervals: [...f.intervals, { offsetDays: 0, label: '' }] }));
              setUnits(u => [...u, 'days']);
            }}>Ajouter une étape</Button>
          </div>

          <Button type="submit" className="w-full">{mode==='create'?'Créer':'Mettre à jour'}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

