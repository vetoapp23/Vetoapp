import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useClients } from "@/contexts/ClientContext";
import { useSettings } from "@/contexts/SettingsContext";
import { Download, Upload, RotateCcw, Database, AlertTriangle, CheckCircle, Clock, TrendingUp } from "lucide-react";

export function DataManager() {
  const { 
    clients, 
    pets, 
    consultations, 
    appointments, 
    prescriptions, 
    farms, 

    farmInterventions,
    resetData, 
    exportData, 
    importData 
  } = useClients();
  const { settings } = useSettings();
  const { toast } = useToast();
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);

  // Calculer les statistiques de données
  const totalRecords = clients.length + pets.length + consultations.length + appointments.length + prescriptions.length + farms.length + farmInterventions.length;
  
  // Calculer la taille estimée des données (approximative)
  const estimatedDataSize = Math.round(totalRecords * 0.5); // KB
  
  // Calculer la dernière modification
  const allDates = [
    ...clients.map(c => c.lastVisit),
    ...pets.map(p => p.lastVisit).filter(Boolean),
    ...consultations.map(c => c.date),
    ...appointments.map(a => a.date),
    ...prescriptions.map(p => p.date),
    ...farms.map(f => f.lastVisit),

  ].filter(Boolean);
  
  const lastModification = allDates.length > 0 ? new Date(Math.max(...allDates.map(d => new Date(d).getTime()))) : new Date();
  
  // Calculer les tendances
  const today = new Date().toISOString().split('T')[0];
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  
  const newRecordsToday = [
    ...clients.filter(c => c.lastVisit === today),
    ...pets.filter(p => p.lastVisit === today),
    ...consultations.filter(c => c.date === today),
    ...appointments.filter(a => a.date === today)
  ].length;
  
  const newRecordsThisMonth = [
    ...clients.filter(c => {
      const date = new Date(c.lastVisit);
      return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
    }),
    ...pets.filter(p => {
      if (!p.lastVisit) return false;
      const date = new Date(p.lastVisit);
      return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
    }),
    ...consultations.filter(c => {
      const date = new Date(c.date);
      return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
    }),
    ...appointments.filter(a => {
      const date = new Date(a.date);
      return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
    })
  ].length;

  const handleExport = () => {
    try {
      exportData();
      toast({
        title: "Données exportées",
        description: `Export de ${totalRecords} enregistrements réussi.`,
      });
    } catch (error) {
      toast({
        title: "Erreur d'export",
        description: "Impossible d'exporter les données.",
        variant: "destructive",
      });
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.clients && data.pets) {
          importData(data);
          toast({
            title: "Données importées",
            description: `${data.clients.length} clients, ${data.pets.length} animaux et ${data.consultations?.length || 0} consultations importés avec succès.`,
          });
        } else {
          throw new Error("Format de fichier invalide");
        }
      } catch (error) {
        toast({
          title: "Erreur d'import",
          description: "Le fichier sélectionné n'est pas valide.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
    setShowImportDialog(false);
  };

  const handleReset = () => {
    try {
      resetData();
      toast({
        title: "Données réinitialisées",
        description: "Toutes les données ont été remises aux valeurs par défaut.",
      });
      setShowResetDialog(false);
    } catch (error) {
      toast({
        title: "Erreur de réinitialisation",
        description: "Impossible de réinitialiser les données.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Gestion des Données
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">Total:</span>
                <span className="text-muted-foreground">{totalRecords} enregistrements</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Taille:</span>
                <span className="text-muted-foreground">~{estimatedDataSize} KB</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Dernière modif:</span>
                <span className="text-muted-foreground">{lastModification.toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="font-medium">Aujourd'hui:</span>
                <span className="text-muted-foreground">{newRecordsToday}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Ce mois:</span>
                <span className="text-muted-foreground">{newRecordsThisMonth}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium">Clinique:</span>
                <span className="text-muted-foreground">{settings.clinicName || 'Non configurée'}</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className="text-center p-2 bg-blue-50 rounded">
              <div className="font-medium text-blue-700">{clients.length}</div>
              <div className="text-blue-600">Clients</div>
            </div>
            <div className="text-center p-2 bg-red-50 rounded">
              <div className="font-medium text-red-700">{pets.length}</div>
              <div className="text-red-600">Animaux</div>
            </div>
            <div className="text-center p-2 bg-green-50 rounded">
              <div className="font-medium text-green-700">{consultations.length}</div>
              <div className="text-green-600">Consultations</div>
            </div>
            <div className="text-center p-2 bg-purple-50 rounded">
              <div className="font-medium text-purple-700">{appointments.length}</div>
              <div className="text-purple-600">RDV</div>
            </div>
            <div className="text-center p-2 bg-orange-50 rounded">
              <div className="font-medium text-orange-700">{prescriptions.length}</div>
              <div className="text-orange-600">Prescriptions</div>
            </div>
            <div className="text-center p-2 bg-indigo-50 rounded">
              <div className="font-medium text-indigo-700">{farms.length}</div>
              <div className="text-indigo-600">Fermes</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleExport} className="gap-2">
              <Download className="h-4 w-4" />
              Exporter
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowImportDialog(true)} className="gap-2">
              <Upload className="h-4 w-4" />
              Importer
            </Button>
            <Button size="sm" variant="destructive" onClick={() => setShowResetDialog(true)} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de réinitialisation */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Réinitialiser toutes les données
            </DialogTitle>
            <DialogDescription>
              Cette action supprimera définitivement toutes les données (clients, animaux, consultations, etc.) et les remettra aux valeurs par défaut. Cette action ne peut pas être annulée.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowResetDialog(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleReset}>
              Réinitialiser
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog d'import */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Importer des données
            </DialogTitle>
            <DialogDescription>
              Sélectionnez un fichier JSON exporté précédemment pour restaurer vos données.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="w-full"
            />
            <div className="text-sm text-muted-foreground">
              <strong>Note:</strong> L'import remplacera toutes les données existantes.
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>
              Annuler
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
