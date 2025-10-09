import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronDown, 
  ChevronRight, 
  BarChart3, 
  TrendingUp, 
  Users, 
  Heart, 
  Calendar,
  Activity,
  Package,
  Stethoscope,
  DollarSign,
  Settings,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

interface Section {
  id: string;
  title: string;
  icon: React.ElementType;
  count?: number;
  color: string;
  items: {
    id: string;
    title: string;
    description: string;
  }[];
}

interface DashboardNavigationProps {
  onSectionChange: (sectionId: string) => void;
  activeSection: string;
}

export function DashboardNavigation({ onSectionChange, activeSection }: DashboardNavigationProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));

  const sections: Section[] = [
    {
      id: 'overview',
      title: 'Vue d\'ensemble',
      icon: BarChart3,
      color: 'text-blue-600',
      items: [
        { id: 'kpis', title: 'KPI en Temps Réel', description: 'Indicateurs clés de performance' },
        { id: 'stats', title: 'Statistiques Générales', description: 'Vue d\'ensemble des données' },
        { id: 'alerts', title: 'Alertes & Notifications', description: 'Alertes importantes' }
      ]
    },
    {
      id: 'analytics',
      title: 'Analyses & Tendances',
      icon: TrendingUp,
      color: 'text-green-600',
      items: [
        { id: 'revenue', title: 'Revenus', description: 'Analyse des revenus' },
        { id: 'activity', title: 'Activité', description: 'Tendances d\'activité' },
        { id: 'consultations', title: 'Consultations', description: 'Analyse des consultations' }
      ]
    },
    {
      id: 'clients',
      title: 'Clients & Animaux',
      icon: Users,
      color: 'text-purple-600',
      items: [
        { id: 'clients-overview', title: 'Clients', description: 'Gestion des clients' },
        { id: 'pets-overview', title: 'Animaux', description: 'Gestion des animaux' },
        { id: 'client-growth', title: 'Croissance', description: 'Évolution de la clientèle' }
      ]
    },
    {
      id: 'appointments',
      title: 'Rendez-vous',
      icon: Calendar,
      color: 'text-orange-600',
      items: [
        { id: 'appointments-status', title: 'État des RDV', description: 'Statut des rendez-vous' },
        { id: 'appointments-upcoming', title: 'RDV à venir', description: 'Prochains rendez-vous' }
      ]
    },
    {
      id: 'medical',
      title: 'Activité Médicale',
      icon: Stethoscope,
      color: 'text-red-600',
      items: [
        { id: 'consultations-recent', title: 'Consultations Récentes', description: 'Dernières consultations' },
        { id: 'medical-stats', title: 'Statistiques Médicales', description: 'Analyses médicales' }
      ]
    },
    {
      id: 'inventory',
      title: 'Stock & Inventaire',
      icon: Package,
      color: 'text-indigo-600',
      items: [
        { id: 'stock-status', title: 'État du Stock', description: 'Niveau des stocks' },
        { id: 'stock-alerts', title: 'Alertes Stock', description: 'Stocks faibles' }
      ]
    }
  ];

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleItemClick = (itemId: string) => {
    onSectionChange(itemId);
  };

  return (
    <Card className="w-full md:w-80 h-fit">
      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Navigation Dashboard
          </h3>
          
          {sections.map((section) => (
            <div key={section.id} className="border rounded-lg">
              <Button
                variant="ghost"
                className="w-full justify-between p-3 h-auto"
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-center gap-3">
                  <section.icon className={`h-4 w-4 ${section.color}`} />
                  <span className="font-medium">{section.title}</span>
                  {section.count && (
                    <Badge variant="secondary" className="text-xs">
                      {section.count}
                    </Badge>
                  )}
                </div>
                {expandedSections.has(section.id) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
              
              {expandedSections.has(section.id) && (
                <div className="border-t">
                  {section.items.map((item) => (
                    <Button
                      key={item.id}
                      variant={activeSection === item.id ? "secondary" : "ghost"}
                      className="w-full justify-start p-3 h-auto text-left"
                      onClick={() => handleItemClick(item.id)}
                    >
                      <div className="ml-7">
                        <div className="font-medium text-sm">{item.title}</div>
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}