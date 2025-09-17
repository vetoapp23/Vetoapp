import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Package, Calendar, Clock, TrendingUp } from "lucide-react";
import { useClients } from "@/contexts/ClientContext";
import { useSettings } from "@/contexts/SettingsContext";

export function DashboardAlerts() {
  const { 
    appointments, 
    stockItems, 
    getUpcomingAppointments,
    getOverdueAppointments 
  } = useClients();
  const { settings } = useSettings();

  // Calculer les alertes
  const today = new Date().toISOString().split('T')[0];
  const upcomingAppointments = getUpcomingAppointments();
  const overdueAppointments = getOverdueAppointments();
  const appointmentsToday = appointments.filter(a => a.date === today && a.status !== 'cancelled' && a.status !== 'completed');
  
  const lowStockItems = stockItems.filter(item => item.currentStock <= item.minimumStock);
  const outOfStockItems = stockItems.filter(item => item.currentStock === 0);
  
  const alerts = [];

  // Alertes de stock
  if (outOfStockItems.length > 0) {
    alerts.push({
      type: 'critical',
      icon: AlertTriangle,
      title: 'Stock épuisé',
      message: `${outOfStockItems.length} produit(s) en rupture de stock`,
      count: outOfStockItems.length,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    });
  }

  if (lowStockItems.length > 0) {
    alerts.push({
      type: 'warning',
      icon: Package,
      title: 'Stock faible',
      message: `${lowStockItems.length} produit(s) en stock faible`,
      count: lowStockItems.length,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    });
  }

  // Alertes de rendez-vous
  if (overdueAppointments.length > 0) {
    alerts.push({
      type: 'warning',
      icon: Clock,
      title: 'Rendez-vous en retard',
      message: `${overdueAppointments.length} rendez-vous en retard`,
      count: overdueAppointments.length,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    });
  }

  if (appointmentsToday.length > 0) {
    alerts.push({
      type: 'info',
      icon: Calendar,
      title: 'Rendez-vous aujourd\'hui',
      message: `${appointmentsToday.length} rendez-vous prévus aujourd'hui`,
      count: appointmentsToday.length,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    });
  }

  if (alerts.length === 0) {
    return (
      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Aucune alerte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="text-green-600 text-4xl mb-2">✅</div>
            <p className="text-muted-foreground">Tout va bien ! Aucune alerte à signaler.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          Alertes & Notifications
          <Badge variant="destructive" className="ml-2">
            {alerts.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert, index) => (
          <div 
            key={index}
            className={`flex items-center justify-between p-3 rounded-lg border ${alert.borderColor} ${alert.bgColor}`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${alert.bgColor}`}>
                <alert.icon className={`h-4 w-4 ${alert.color}`} />
              </div>
              <div>
                <h4 className="font-medium text-sm">{alert.title}</h4>
                <p className="text-xs text-muted-foreground">{alert.message}</p>
              </div>
            </div>
            <Badge 
              variant={alert.type === 'critical' ? 'destructive' : alert.type === 'warning' ? 'secondary' : 'default'}
              className="text-xs"
            >
              {alert.count}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
