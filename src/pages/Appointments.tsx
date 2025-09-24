import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, User, Heart, Plus, Search, AlertCircle, Trash2, CheckCircle, XCircle } from "lucide-react";
import { useAppointments, useUpdateAppointment, useDeleteAppointment, type Appointment } from "@/hooks/useDatabase";
import { useToast } from "@/hooks/use-toast";
import { SimpleAppointmentModal } from "@/components/forms/SimpleAppointmentModal";

const statusStyles = {
  scheduled: "bg-blue-100 text-blue-800",
  confirmed: "bg-green-100 text-green-800",
  "in-progress": "bg-yellow-100 text-yellow-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
  "no-show": "bg-orange-100 text-orange-800"
};

const statusLabels = {
  scheduled: "Planifié",
  confirmed: "Confirmé",
  "in-progress": "En cours",
  completed: "Terminé",
  cancelled: "Annulé",
  "no-show": "Absent"
};

const typeLabels = {
  consultation: "Consultation",
  vaccination: "Vaccination",
  surgery: "Chirurgie",
  "follow-up": "Suivi"
};

export default function Appointments() {
  const { data: appointments = [], isLoading, error } = useAppointments();
  const updateAppointmentMutation = useUpdateAppointment();
  const deleteAppointmentMutation = useDeleteAppointment();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showNewAppointment, setShowNewAppointment] = useState(false);

  // Helper functions
  const getAppointmentDate = (appointment: Appointment) => {
    return new Date(appointment.appointment_date).toLocaleDateString('fr-FR');
  };

  const getAppointmentTime = (appointment: Appointment) => {
    return new Date(appointment.appointment_date).toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getClientName = (appointment: Appointment) => {
    return appointment.client ? `${appointment.client.first_name} ${appointment.client.last_name}` : 'Client inconnu';
  };

  const getAnimalName = (appointment: Appointment) => {
    return appointment.animal?.name || 'Animal non spécifié';
  };

  const handleStatusChange = (appointmentId: string, newStatus: Appointment['status']) => {
    updateAppointmentMutation.mutate({ 
      id: appointmentId, 
      data: { status: newStatus } 
    }, {
      onSuccess: () => {
        toast({
          title: "Statut mis à jour",
          description: `Le rendez-vous est maintenant ${statusLabels[newStatus]?.toLowerCase()}.`,
        });
      },
      onError: () => {
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour le statut.",
          variant: "destructive"
        });
      }
    });
  };

  const handleDelete = (appointment: Appointment) => {
    const animalName = getAnimalName(appointment);
    if (confirm(`Êtes-vous sûr de vouloir supprimer le rendez-vous pour ${animalName} ?`)) {
      deleteAppointmentMutation.mutate(appointment.id, {
        onSuccess: () => {
          toast({
            title: "Rendez-vous supprimé",
            description: `Le rendez-vous pour ${animalName} a été supprimé.`,
          });
        },
        onError: () => {
          toast({
            title: "Erreur",
            description: "Impossible de supprimer le rendez-vous.",
            variant: "destructive"
          });
        }
      });
    }
  };

  // Filter appointments
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      getClientName(appointment).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getAnimalName(appointment).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (appointment.notes && appointment.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === "all" || appointment.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Chargement des rendez-vous...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          <AlertCircle className="h-8 w-8 mx-auto mb-2" />
          <p>Erreur lors du chargement des rendez-vous</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 text-blue-600 underline"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Rendez-vous</h1>
        <Button onClick={() => setShowNewAppointment(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau RDV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher par client, animal ou notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="scheduled">Planifié</SelectItem>
            <SelectItem value="confirmed">Confirmé</SelectItem>
            <SelectItem value="in-progress">En cours</SelectItem>
            <SelectItem value="completed">Terminé</SelectItem>
            <SelectItem value="cancelled">Annulé</SelectItem>
            <SelectItem value="no-show">Absent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{appointments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Planifiés</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-blue-600">
              {appointments.filter(a => a.status === 'scheduled').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Aujourd'hui</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-green-600">
              {appointments.filter(a => 
                new Date(a.appointment_date).toDateString() === new Date().toDateString()
              ).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">En retard</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-red-600">
              {appointments.filter(a => 
                new Date(a.appointment_date) < new Date() && a.status === 'scheduled'
              ).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Aucun rendez-vous trouvé</p>
            </CardContent>
          </Card>
        ) : (
          filteredAppointments
            .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())
            .map((appointment) => (
              <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{getClientName(appointment)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{getAnimalName(appointment)}</span>
                        </div>
                        <Badge className={statusStyles[appointment.status]}>
                          {statusLabels[appointment.status]}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>{getAppointmentDate(appointment)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>{getAppointmentTime(appointment)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Type:</span>
                          <span className="ml-1">{typeLabels[appointment.appointment_type]}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Durée:</span>
                          <span className="ml-1">{appointment.duration_minutes} min</span>
                        </div>
                      </div>
                      
                      {appointment.notes && (
                        <div>
                          <span className="text-sm text-gray-500">Notes:</span>
                          <p className="text-sm mt-1 text-gray-600">{appointment.notes}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      {appointment.status === 'scheduled' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                            className="gap-1"
                          >
                            <CheckCircle className="h-3 w-3" />
                            Confirmer
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                            className="gap-1"
                          >
                            <XCircle className="h-3 w-3" />
                            Annuler
                          </Button>
                        </>
                      )}
                      
                      {appointment.status === 'confirmed' && (
                        <Button 
                          size="sm"
                          onClick={() => handleStatusChange(appointment.id, 'completed')}
                          className="gap-1"
                        >
                          <CheckCircle className="h-3 w-3" />
                          Terminer
                        </Button>
                      )}
                      
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleDelete(appointment)}
                        className="gap-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
        )}
      </div>

      <SimpleAppointmentModal 
        open={showNewAppointment} 
        onOpenChange={setShowNewAppointment}
      />
    </div>
  );
}
