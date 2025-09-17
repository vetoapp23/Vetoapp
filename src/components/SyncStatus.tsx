import { useClients } from "@/contexts/ClientContext";
import { useSettings } from "@/contexts/SettingsContext";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Heart, FileText, CheckCircle, AlertCircle, Calendar, Clock, TrendingUp } from "lucide-react";

export function SyncStatus() {
  const { clients, pets, consultations, appointments, prescriptions, farms, farmInterventions } = useClients();
  const { settings } = useSettings();
  
  // Vérifier la synchronisation des données
  const totalPetsInClients = clients.reduce((total, client) => total + client.pets.length, 0);
  const isPetsSynchronized = totalPetsInClients === pets.length;
  
  // Calculer les statistiques de synchronisation
  const totalData = clients.length + pets.length + consultations.length + appointments.length + prescriptions.length + farms.length + farmInterventions.length;
  const dataIntegrity = isPetsSynchronized ? 100 : Math.round((totalData - Math.abs(totalPetsInClients - pets.length)) / totalData * 100);
  
  // Calculer les tendances
  const today = new Date().toISOString().split('T')[0];
  const consultationsToday = consultations.filter(c => c.date === today).length;
  const appointmentsToday = appointments.filter(a => a.date === today && a.status !== 'cancelled' && a.status !== 'completed').length;
  
  // Calculer les consultations de ce mois
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const consultationsThisMonth = consultations.filter(c => {
    const consultationDate = new Date(c.date);
    return consultationDate.getMonth() === thisMonth && consultationDate.getFullYear() === thisYear;
  }).length;
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isPetsSynchronized ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <AlertCircle className="h-5 w-5 text-yellow-600" />
          )}
          Statut de Synchronisation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm">Clients: {clients.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-600" />
              <span className="text-sm">Animaux: {pets.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-green-600" />
              <span className="text-sm">Consultations: {consultations.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-600" />
              <span className="text-sm">RDV: {appointments.length}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-sm">Aujourd'hui: {consultationsToday + appointmentsToday}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-600" />
              <span className="text-sm">Ce mois: {consultationsThisMonth}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-orange-600" />
              <span className="text-sm">Prescriptions: {prescriptions.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-600" />
              <span className="text-sm">Fermes: {farms.length}</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Intégrité des données:</span>
            <Badge variant={dataIntegrity >= 95 ? "default" : dataIntegrity >= 80 ? "secondary" : "destructive"}>
              {dataIntegrity}%
            </Badge>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                dataIntegrity >= 95 ? 'bg-green-600' : 
                dataIntegrity >= 80 ? 'bg-yellow-600' : 'bg-red-600'
              }`}
              style={{ width: `${dataIntegrity}%` }}
            ></div>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            {isPetsSynchronized ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-700">Synchronisation OK</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="text-yellow-700">Désynchronisation détectée</span>
              </>
            )}
          </div>
          
          {!isPetsSynchronized && (
            <div className="text-xs text-muted-foreground bg-yellow-50 p-2 rounded">
              <strong>Attention:</strong> {Math.abs(totalPetsInClients - pets.length)} animal(s) non synchronisé(s) entre clients et animaux
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
