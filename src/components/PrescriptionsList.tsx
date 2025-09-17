import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Pill, Clock, AlertCircle, CheckCircle, XCircle, Plus, Edit, Trash2, Printer } from "lucide-react";
import { useState } from "react";
import { Prescription, useClients } from "@/contexts/ClientContext";
import { useToast } from "@/hooks/use-toast";
import NewPrescriptionModal from "@/components/forms/NewPrescriptionModal";
import { PrescriptionEditModal } from "@/components/modals/PrescriptionEditModal";
import { PrescriptionPrint } from "@/components/PrescriptionPrint";

interface PrescriptionsListProps {
  petId: number;
  consultationId?: number;
}

const statusStyles = {
  active: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800",
  discontinued: "bg-red-100 text-red-800"
};

const statusLabels = {
  active: "Active",
  completed: "Terminée",
  discontinued: "Arrêtée"
};

export function PrescriptionsList({ petId, consultationId }: PrescriptionsListProps) {
  const { 
    prescriptions, 
    getPrescriptionsByPetId, 
    getPrescriptionsByConsultationId,
    deletePrescription 
  } = useClients();
  const { toast } = useToast();
  
  const [showNewPrescription, setShowNewPrescription] = useState(false);
  const [showEditPrescription, setShowEditPrescription] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);

  // Filtrer les prescriptions selon le contexte
  const filteredPrescriptions = consultationId 
    ? getPrescriptionsByConsultationId(consultationId)
    : getPrescriptionsByPetId(petId);

  const handleEdit = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setShowEditPrescription(true);
  };

  const handleDelete = (prescription: Prescription) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la prescription pour ${prescription.medications.map(m => m.name).join(', ')} ?`)) {
      deletePrescription(prescription.id);
      toast({
        title: "Prescription supprimée",
        description: "La prescription a été supprimée avec succès.",
      });
    }
  };

  const handleStatusChange = (prescriptionId: number, newStatus: Prescription['status']) => {
    // Cette fonction sera implémentée dans le modal d'édition
    console.log(`Changer le statut de la prescription ${prescriptionId} à ${newStatus}`);
  };

  const getStatusIcon = (status: Prescription['status']) => {
    switch (status) {
      case 'active':
        return <AlertCircle className="h-4 w-4 text-green-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-gray-600" />;
      case 'discontinued':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const calculateTotalCost = (medications: Prescription['medications']) => {
    return medications.reduce((total, med) => total + (med.cost || 0), 0);
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Prescriptions ({filteredPrescriptions.length})
          </h3>
          <Button 
            size="sm" 
            onClick={() => setShowNewPrescription(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Nouvelle Prescription
          </Button>
        </div>

        {filteredPrescriptions.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <Pill className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>Aucune prescription trouvée</p>
              <p className="text-sm">Commencez par créer une nouvelle prescription</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredPrescriptions
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((prescription) => (
                <Card key={prescription.id} className="card-hover">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(prescription.status)}
                          <Badge className={statusStyles[prescription.status]}>
                            {statusLabels[prescription.status]}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 inline mr-1" />
                          {new Date(prescription.date).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <PrescriptionPrint prescription={prescription} />
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEdit(prescription)}
                          className="h-8 w-8 p-0"
                          title="Modifier"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDelete(prescription)}
                          className="h-8 w-8 p-0 text-red-600"
                          title="Supprimer"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Informations générales */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Prescrit par:</span>
                        <p className="text-muted-foreground">{prescription.prescribedBy}</p>
                      </div>
                      <div>
                        <span className="font-medium">Diagnostic:</span>
                        <p className="text-muted-foreground">{prescription.diagnosis}</p>
                      </div>
                      <div>
                        <span className="font-medium">Durée:</span>
                        <p className="text-muted-foreground">{prescription.duration}</p>
                      </div>
                      <div>
                        <span className="font-medium">Coût total:</span>
                        <p className="text-muted-foreground">{calculateTotalCost(prescription.medications).toFixed(2)}€</p>
                      </div>
                    </div>

                    {/* Médicaments */}
                    <div>
                      <h4 className="font-medium mb-3">Médicaments prescrits:</h4>
                      <div className="space-y-3">
                        {prescription.medications.map((medication) => (
                          <div key={medication.id} className="p-3 border rounded-lg bg-muted/30">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <div className="font-medium">{medication.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  <span className="font-medium">Posologie:</span> {medication.dosage} - {medication.frequency}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  <span className="font-medium">Durée:</span> {medication.duration}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  <span className="font-medium">Quantité:</span> {medication.quantity} {medication.unit}
                                </div>
                                {medication.refills && medication.refills > 0 && (
                                  <div className="text-sm text-muted-foreground">
                                    <span className="font-medium">Renouvellements:</span> {medication.refills}
                                  </div>
                                )}
                                {medication.instructions && (
                                  <div className="text-sm text-muted-foreground">
                                    <span className="font-medium">Instructions:</span> {medication.instructions}
                                  </div>
                                )}
                              </div>
                              {medication.cost && (
                                <div className="text-right">
                                  <div className="font-medium">{medication.cost.toFixed(2)}€</div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Instructions générales */}
                    {prescription.instructions && (
                      <div>
                        <span className="font-medium">Instructions générales:</span>
                        <p className="text-sm text-muted-foreground mt-1">{prescription.instructions}</p>
                      </div>
                    )}

                    {/* Date de suivi */}
                    {prescription.followUpDate && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Suivi prévu:</span>
                        <span className="text-muted-foreground">
                          {new Date(prescription.followUpDate).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    )}

                    {/* Notes */}
                    {prescription.notes && (
                      <div>
                        <span className="font-medium">Notes:</span>
                        <p className="text-sm text-muted-foreground mt-1">{prescription.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </div>

      <NewPrescriptionModal 
        open={showNewPrescription} 
        onOpenChange={setShowNewPrescription}
        petId={petId}
        consultationId={consultationId}
      />
      <PrescriptionEditModal
        open={showEditPrescription}
        onOpenChange={setShowEditPrescription}
        prescription={selectedPrescription}
      />
    </>
  );
}
