import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Mail, Calendar, Users2, Building2, FileText, Edit, Stethoscope, X } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface DatabaseFarm {
  id: string;
  client_id: string;
  farm_name: string;
  farm_type: string | null;
  registration_number: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  herd_size: number | null;
  certifications: string[] | null;
  notes: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
  clients?: {
    first_name: string;
    last_name: string;
  };
}

interface FarmViewModalSupabaseProps {
  farm: DatabaseFarm | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onNewIntervention: () => void;
}

const FarmViewModalSupabase = ({ farm, open, onOpenChange, onEdit, onNewIntervention }: FarmViewModalSupabaseProps) => {
  if (!farm) return null;

  const ownerName = farm.clients ? `${farm.clients.first_name} ${farm.clients.last_name}` : 'Non spécifié';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Building2 className="h-6 w-6" />
                {farm.farm_name}
              </DialogTitle>
              <DialogDescription className="mt-2">
                Détails complets de l'exploitation agricole
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={onEdit} variant="outline" className="gap-2">
                <Edit className="h-4 w-4" />
                Modifier
              </Button>
              <Button onClick={onNewIntervention} className="gap-2">
                <Stethoscope className="h-4 w-4" />
                Nouvelle Intervention
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-100 text-green-800">
              {farm.active ? 'Actif' : 'Inactif'}
            </Badge>
            {farm.farm_type && (
              <Badge variant="secondary">{farm.farm_type}</Badge>
            )}
          </div>

          {/* Main Information Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Informations Générales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Propriétaire</Label>
                  <p className="text-base font-medium">{ownerName}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Numéro d'enregistrement</Label>
                  <p className="text-base">{farm.registration_number || 'Non renseigné'}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Type d'exploitation</Label>
                  <p className="text-base">{farm.farm_type || 'Non spécifié'}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Taille du cheptel</Label>
                  <div className="flex items-center gap-2">
                    <Users2 className="h-5 w-5 text-primary" />
                    <p className="text-lg font-semibold">{farm.herd_size || 0} animaux</p>
                  </div>
                </div>

                {farm.certifications && farm.certifications.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Certifications</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {farm.certifications.map((cert, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Right Column */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Contact & Localisation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Adresse</Label>
                  <p className="text-base flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
                    {farm.address || 'Adresse non renseignée'}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Téléphone</Label>
                  <p className="text-base flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {farm.phone || 'Non renseigné'}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  <p className="text-base flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {farm.email || 'Non renseigné'}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Dates</Label>
                  <div className="space-y-1 text-sm">
                    <p className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      Créé le: {formatDate(farm.created_at)}
                    </p>
                    <p className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      Modifié le: {formatDate(farm.updated_at)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notes Section */}
          {farm.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base whitespace-pre-wrap">{farm.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 mr-2" />
            Fermer
          </Button>
          <Button onClick={onEdit} variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </Button>
          <Button onClick={onNewIntervention}>
            <Stethoscope className="h-4 w-4 mr-2" />
            Nouvelle Intervention
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Helper component for label
const Label = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={className}>{children}</div>
);

export default FarmViewModalSupabase;
