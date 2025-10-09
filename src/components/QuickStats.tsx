import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Heart, 
  Calendar, 
  Stethoscope, 
  TrendingUp,
  Activity
} from 'lucide-react';
import { useClients, useAnimals, useConsultations, useAppointments } from "@/hooks/useDatabase";

export function QuickStats() {
  const { data: clients = [] } = useClients();
  const { data: pets = [] } = useAnimals();
  const { data: consultations = [] } = useConsultations();
  const { data: appointments = [] } = useAppointments();

  const today = new Date().toISOString().split('T')[0];
  
  const appointmentsToday = appointments.filter(a => {
    const appointmentDate = a.appointment_date.split('T')[0];
    return appointmentDate === today && a.status !== 'cancelled';
  }).length;

  const consultationsToday = consultations.filter(c => {
    const consultationDate = c.consultation_date.split('T')[0];
    return consultationDate === today;
  }).length;

  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  
  const newClientsThisMonth = clients.filter(c => {
    const clientDate = new Date(c.created_at);
    return clientDate.getMonth() === thisMonth && clientDate.getFullYear() === thisYear;
  }).length;

  const stats = [
    {
      title: "Clients Total",
      value: clients.length,
      icon: Users,
      color: "bg-blue-500",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Animaux",
      value: pets.length,
      icon: Heart,
      color: "bg-red-500",
      textColor: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      title: "RDV Aujourd'hui",
      value: appointmentsToday,
      icon: Calendar,
      color: "bg-purple-500",
      textColor: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Consultations Aujourd'hui",
      value: consultationsToday,
      icon: Stethoscope,
      color: "bg-green-500",
      textColor: "text-green-600",
      bgColor: "bg-green-50"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <Card key={index} className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.textColor}`} />
              </div>
            </div>
            {stat.title === "Clients Total" && newClientsThisMonth > 0 && (
              <Badge variant="secondary" className="mt-2 text-xs">
                +{newClientsThisMonth} ce mois
              </Badge>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}