import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Calendar, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { useAppointments } from '@/hooks/useDatabase';

export function AppointmentStatusChart() {
  const { data: appointments = [] } = useAppointments();

  // Calculer les données des statuts de rendez-vous
  const statusData = React.useMemo(() => {
    const statusCounts = appointments.reduce((acc, appointment) => {
      acc[appointment.status] = (acc[appointment.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusLabels = {
      scheduled: 'Planifié',
      confirmed: 'Confirmé',
      completed: 'Terminé',
      cancelled: 'Annulé',
      'no-show': 'Absent'
    };

    const statusColors = {
      scheduled: '#3b82f6',
      confirmed: '#10b981',
      completed: '#6b7280',
      cancelled: '#ef4444',
      'no-show': '#f59e0b'
    };

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: statusLabels[status as keyof typeof statusLabels] || status,
      value: count,
      color: statusColors[status as keyof typeof statusColors] || '#6b7280'
    }));
  }, [appointments]);

  // Calculer les statistiques
  const totalAppointments = appointments.length;
  const completedAppointments = appointments.filter(a => a.status === 'completed').length;
  const upcomingAppointments = appointments.filter(a => a.status === 'scheduled' || a.status === 'confirmed').length;
  const cancelledAppointments = appointments.filter(a => a.status === 'cancelled').length;

  const completionRate = totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0;
  const cancellationRate = totalAppointments > 0 ? (cancelledAppointments / totalAppointments) * 100 : 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Statuts des Rendez-vous</CardTitle>
        <Calendar className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
                formatter={(value: number) => [value, 'Rendez-vous']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{completionRate.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">Taux de réussite</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{cancellationRate.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">Taux d'annulation</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Terminés</span>
              </div>
              <span className="font-medium">{completedAppointments}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span>À venir</span>
              </div>
              <span className="font-medium">{upcomingAppointments}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <span>Annulés</span>
              </div>
              <span className="font-medium">{cancelledAppointments}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
