import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Calendar, Stethoscope, Syringe } from 'lucide-react';
import { useClients } from '@/contexts/ClientContext';

export function ActivityChart() {
  const { consultations, appointments, vaccinations, antiparasitics } = useClients();

  // Générer les données des 7 derniers jours
  const generateActivityData = () => {
    const data = [];
    const currentDate = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      const consultationsCount = consultations.filter(c => c.date === dateString).length;
      const appointmentsCount = appointments.filter(a => a.date === dateString).length;
      const vaccinationsCount = vaccinations.filter(v => v.dateGiven === dateString).length;
      const antiparasiticsCount = antiparasitics.filter(a => a.dateGiven === dateString).length;
      
      data.push({
        day: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
        date: dateString,
        consultations: consultationsCount,
        appointments: appointmentsCount,
        vaccinations: vaccinationsCount,
        antiparasitics: antiparasiticsCount,
        total: consultationsCount + appointmentsCount + vaccinationsCount + antiparasiticsCount
      });
    }
    
    return data;
  };

  const data = generateActivityData();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Activité des 7 derniers jours</CardTitle>
        <Activity className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="day" 
                axisLine={false}
                tickLine={false}
                className="text-xs"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                className="text-xs"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
                formatter={(value: number, name: string) => [
                  value,
                  name === 'consultations' ? 'Consultations' : 
                  name === 'appointments' ? 'Rendez-vous' :
                  name === 'vaccinations' ? 'Vaccinations' :
                  name === 'antiparasitics' ? 'Antiparasitaires' : 'Total'
                ]}
              />
              <Bar dataKey="consultations" fill="#10b981" radius={[2, 2, 0, 0]} />
              <Bar dataKey="appointments" fill="#3b82f6" radius={[2, 2, 0, 0]} />
              <Bar dataKey="vaccinations" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
              <Bar dataKey="antiparasitics" fill="#f59e0b" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-muted-foreground">Consultations</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-muted-foreground">Rendez-vous</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span className="text-muted-foreground">Vaccinations</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
            <span className="text-muted-foreground">Antiparasitaires</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
