import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Users, Calendar, Stethoscope, Plus } from "lucide-react";
import heroImage from "@/assets/vet-hero.jpg";
import { useState } from "react";
import { NewClientModal } from "@/components/forms/NewClientModal";
import { NewAppointmentModal } from "@/components/forms/NewAppointmentModal";
import { NewPetModal } from "@/components/forms/NewPetModal";
import { NewConsultationModal } from "@/components/forms/NewConsultationModal";
import { useClients, useAnimals, useConsultations, useVaccinations, useAntiparasitics } from "@/hooks/useDatabase";
import { useSettings } from "@/contexts/SettingsContext";
import { AdminOnly } from "./RoleGuard";

export function HeroSection() {
  const { data: clients = [] } = useClients();
  const { data: pets = [] } = useAnimals();
  const { data: consultations = [] } = useConsultations();
  const { data: vaccinations = [] } = useVaccinations();
  const { data: antiparasitics = [] } = useAntiparasitics();
  const { settings } = useSettings();
  const vets: any[] = JSON.parse(localStorage.getItem('vetpro-veterinarians') || '[]');
  const greeting = vets.length === 1
    ? `Bienvenue ${vets[0].title} ${vets[0].name}`
    : `Bienvenue à ${settings.clinicName}`;
  const [showClientModal, setShowClientModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showPetModal, setShowPetModal] = useState(false);
  const [showConsultationModal, setShowConsultationModal] = useState(false);

  // Calculer les statistiques en temps réel
  const totalClients = clients.length;
  const totalPets = pets.length;
  const totalVaccinations = vaccinations.length;
  const totalAntiparasitics = antiparasitics.length;
  const today = new Date().toISOString().split('T')[0];
  const consultationsToday = consultations.filter(c => {
    const consultationDate = c.consultation_date.split('T')[0]; // Extract date part only
    return consultationDate === today;
  }).length;
  
  // TODO: Implement proper accounting summary with database data
  const accountingSummary = {
    totalRevenue: 0,
    totalExpenses: 0,
    netIncome: 0,
    revenueBreakdown: { consultations: 0, vaccinations: 0, antiparasitics: 0, prescriptions: 0, manualEntries: 0 },
    expenseBreakdown: { stockPurchases: 0, salaries: 0, rent: 0, taxes: 0, other: 0 }
  };
  
  return (
    <>
      <div className="relative overflow-hidden gradient-hero rounded-2xl p-4 md:p-8 mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 md:gap-8">
        {/* Logo */}
        {settings.logo && <img src={settings.logo} alt="Logo clinique" className="h-16 w-16 md:h-20 md:w-20 object-contain rounded" />}
        {/* Texte de bienvenue */}
        <div className="flex-1 space-y-4 md:space-y-6">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            <span className="text-xs md:text-sm font-medium text-primary">Gestion Vétérinaire Complète</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold leading-tight max-w-3xl">{greeting}, <span className="gradient-primary bg-clip-text text-transparent block">Dashboard VetPro</span></h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl">Gérez efficacement vos clients, leurs animaux, les rendez-vous et consultations. Votre pratique vétérinaire optimisée en un seul endroit.</p>
          {/* Boutons d'actions */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-4">
            <Button size="lg" className="gap-2 medical-glow w-full sm:w-auto" onClick={() => setShowClientModal(true)}><Users className="h-5 w-5" />Nouveau Client<ArrowRight className="h-4 w-4" /></Button>
            <Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto" onClick={() => setShowPetModal(true)}><Heart className="h-5 w-5" />Nouvel Animal</Button>
            <Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto" onClick={() => setShowAppointmentModal(true)}><Calendar className="h-5 w-5" />Planifier RDV</Button>
            <Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto" onClick={() => setShowConsultationModal(true)}><Stethoscope className="h-5 w-5" />Nouvelle Consultation</Button>
          </div>
          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 pt-6 md:pt-8">
            <div className="text-center"><div className="text-xl md:text-2xl font-bold text-primary">{totalClients}</div><div className="text-xs md:text-sm text-muted-foreground">Clients actifs</div></div>
            <div className="text-center"><div className="text-xl md:text-2xl font-bold text-secondary">{totalPets}</div><div className="text-xs md:text-sm text-muted-foreground">Animaux suivis</div></div>
            <div className="text-center"><div className="text-xl md:text-2xl font-bold text-accent">{consultationsToday}</div><div className="text-xs md:text-sm text-muted-foreground">Consultations aujourd'hui</div></div>
            <div className="text-center"><div className="text-xl md:text-2xl font-bold text-blue-600">{totalVaccinations}</div><div className="text-xs md:text-sm text-muted-foreground">Vaccinations</div></div>
            <div className="text-center"><div className="text-xl md:text-2xl font-bold text-purple-600">{totalAntiparasitics}</div><div className="text-xs md:text-sm text-muted-foreground">Antiparasitaires</div></div>
            <AdminOnly>
          <div className="text-center"><div className="text-xl md:text-2xl font-bold text-emerald-600">{accountingSummary.totalRevenue.toFixed(2)} {settings.currency || '€'}</div><div className="text-xs md:text-sm text-muted-foreground">Revenus ce mois</div></div>
            </AdminOnly>
          </div>
        </div>
        {/* Illustration */}
        <div className="hidden lg:block"><img src={heroImage} alt="Vétérinaire professionnel examinant un chien" className="w-96 h-64 object-cover rounded-xl shadow-medical" /></div>
          </div>
      </div>
      
      <NewClientModal 
        open={showClientModal} 
        onOpenChange={setShowClientModal} 
      />
      <NewAppointmentModal 
        open={showAppointmentModal} 
        onOpenChange={setShowAppointmentModal} 
      />
      <NewPetModal 
        open={showPetModal} 
        onOpenChange={setShowPetModal} 
      />
      <NewConsultationModal 
        open={showConsultationModal} 
        onOpenChange={setShowConsultationModal} 
      />
    </>
  );
}