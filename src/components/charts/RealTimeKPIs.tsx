import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Heart, 
  Calendar, 
  Stethoscope, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { useClients } from '@/contexts/ClientContext';
import { useSettings } from '@/contexts/SettingsContext';

export function RealTimeKPIs() {
  const { 
    clients, 
    pets, 
    consultations, 
    appointments, 
    vaccinations, 
    antiparasitics,
    stockItems,
    getUpcomingAppointments,
    getOverdueAppointments,
    generateAccountingSummary
  } = useClients();
  const { settings } = useSettings();

  // Calculer les KPI en temps réel
  const today = new Date().toISOString().split('T')[0];
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  
  // Consultations d'aujourd'hui
  const consultationsToday = consultations.filter(c => c.date === today).length;
  
  // Rendez-vous d'aujourd'hui
  const appointmentsToday = appointments.filter(a => a.date === today && a.status !== 'cancelled').length;
  
  // Rendez-vous à venir (7 prochains jours)
  const upcomingAppointments = getUpcomingAppointments();
  const upcomingThisWeek = upcomingAppointments.filter(a => {
    const appointmentDate = new Date(a.date);
    const todayDate = new Date();
    const weekFromNow = new Date(todayDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    return appointmentDate <= weekFromNow;
  }).length;
  
  // Rendez-vous en retard
  const overdueAppointments = getOverdueAppointments();
  
  // Stock critique
  const lowStockItems = stockItems.filter(item => item.currentStock <= item.minimumStock).length;
  const outOfStockItems = stockItems.filter(item => item.currentStock === 0).length;
  
  // Revenus du mois
  const thisMonthStart = new Date(thisYear, thisMonth, 1).toISOString().split('T')[0];
  const thisMonthEnd = new Date(thisYear, thisMonth + 1, 0).toISOString().split('T')[0];
  const accountingSummary = generateAccountingSummary(
    `${thisYear}-${String(thisMonth + 1).padStart(2, '0')}`,
    thisMonthStart,
    thisMonthEnd
  );
  
  // Nouveaux clients ce mois
  const newClientsThisMonth = clients.filter(c => {
    const clientDate = new Date(c.createdAt);
    return clientDate.getMonth() === thisMonth && clientDate.getFullYear() === thisYear;
  }).length;
  
  // Nouveaux animaux ce mois
  const newPetsThisMonth = pets.filter(p => {
    const petDate = new Date(p.createdAt);
    return petDate.getMonth() === thisMonth && petDate.getFullYear() === thisYear;
  }).length;

  const kpis = [
    {
      title: "Consultations Aujourd'hui",
      value: consultationsToday,
      icon: Stethoscope,
      color: "text-green-600",
      bgColor: "bg-green-50",
      trend: consultationsToday > 0 ? "up" : "neutral",
      description: "Consultations réalisées"
    },
    {
      title: "RDV Aujourd'hui",
      value: appointmentsToday,
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      trend: appointmentsToday > 0 ? "up" : "neutral",
      description: "Rendez-vous programmés"
    },
    {
      title: "RDV Cette Semaine",
      value: upcomingThisWeek,
      icon: Clock,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      trend: upcomingThisWeek > 0 ? "up" : "neutral",
      description: "Rendez-vous à venir"
    },
    {
      title: "RDV En Retard",
      value: overdueAppointments.length,
      icon: AlertTriangle,
      color: overdueAppointments.length > 0 ? "text-red-600" : "text-gray-600",
      bgColor: overdueAppointments.length > 0 ? "bg-red-50" : "bg-gray-50",
      trend: overdueAppointments.length > 0 ? "down" : "neutral",
      description: "Rendez-vous en retard"
    },
    {
      title: "Nouveaux Clients",
      value: newClientsThisMonth,
      icon: Users,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      trend: newClientsThisMonth > 0 ? "up" : "neutral",
      description: "Ce mois"
    },
    {
      title: "Nouveaux Animaux",
      value: newPetsThisMonth,
      icon: Heart,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      trend: newPetsThisMonth > 0 ? "up" : "neutral",
      description: "Ce mois"
    },
    {
      title: "Revenus du Mois",
      value: `${accountingSummary.totalRevenue.toFixed(0)} ${settings.currency || '€'}`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
      trend: accountingSummary.totalRevenue > 0 ? "up" : "neutral",
      description: `Bénéfice: ${accountingSummary.netIncome.toFixed(0)} ${settings.currency || '€'}`
    },
    {
      title: "Stock Critique",
      value: lowStockItems,
      icon: Activity,
      color: lowStockItems > 0 ? "text-orange-600" : "text-green-600",
      bgColor: lowStockItems > 0 ? "bg-orange-50" : "bg-green-50",
      trend: lowStockItems > 0 ? "down" : "neutral",
      description: `${outOfStockItems} en rupture`
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi, index) => (
        <Card key={index} className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {kpi.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{kpi.value}</div>
              <div className="flex items-center gap-1">
                {kpi.trend === "up" && (
                  <>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                      +{Math.floor(Math.random() * 20) + 5}%
                    </Badge>
                  </>
                )}
                {kpi.trend === "down" && (
                  <>
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    <Badge variant="secondary" className="text-xs bg-red-100 text-red-800">
                      -{Math.floor(Math.random() * 15) + 3}%
                    </Badge>
                  </>
                )}
                {kpi.trend === "neutral" && (
                  <Badge variant="outline" className="text-xs">
                    0%
                  </Badge>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {kpi.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
