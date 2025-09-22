import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, FileText, Stethoscope, Syringe, AlertCircle, Activity, Weight, Thermometer, Plus, Camera, Heart, User, MapPin, Award, Edit } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { calculateAge } from "@/lib/utils";

// Interface extending Pet to include database ID
interface PetUI {
  id: number;
  name: string;
  type: string;
  breed?: string;
  gender?: 'male' | 'female';
  birthDate?: string;
  weight?: string;
  color?: string;
  microchip?: string;
  medicalNotes?: string;
  photo?: string;
  ownerId: number;
  owner: string;
  status: 'healthy' | 'treatment' | 'urgent';
  lastVisit?: string;
  nextAppointment?: string;
  vaccinations?: string[];
  dbId: string; // Database UUID
  dbClientId: string; // Client's database UUID
}

interface SimplePetDossierModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pet: PetUI | null;
}

export function SimplePetDossierModal({ open, onOpenChange, pet }: SimplePetDossierModalProps) {
  const [activeTab, setActiveTab] = useState("overview");

  if (!pet) return null;

  const age = pet.birthDate ? calculateAge(pet.birthDate) : 'Non renseigné';
  const currentWeight = pet.weight ? `${pet.weight} kg` : 'Non renseigné';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Dossier Médical - {pet.name} (Propriétaire: {pet.owner})
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-1">
              <Activity className="h-4 w-4" />
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="historique" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Historique
            </TabsTrigger>
            <TabsTrigger value="prescriptions" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              Prescriptions
            </TabsTrigger>
            <TabsTrigger value="vaccinations" className="flex items-center gap-1">
              <Syringe className="h-4 w-4" />
              Vaccinations
            </TabsTrigger>
            <TabsTrigger value="antiparasites" className="flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              Antiparasites
            </TabsTrigger>
            <TabsTrigger value="pedigree" className="flex items-center gap-1">
              <Award className="h-4 w-4" />
              Pedigree
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations générales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-6">
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="h-32 w-32">
                      {pet.photo ? (
                        <AvatarImage src={pet.photo} alt={pet.name} />
                      ) : (
                        <AvatarFallback className="bg-primary-glow text-primary-foreground">
                          <Heart className="h-16 w-16" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Camera className="h-4 w-4" />
                      Ajouter photo
                    </Button>
                  </div>
                  
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-lg">{pet.name}</h3>
                      <div className="space-y-2 mt-4">
                        <div>
                          <span className="font-medium">Type:</span> {pet.type}
                        </div>
                        <div>
                          <span className="font-medium">Race:</span> {pet.breed || 'Non renseignée'}
                        </div>
                        <div>
                          <span className="font-medium">Sexe:</span> {pet.gender === 'male' ? 'Mâle' : pet.gender === 'female' ? 'Femelle' : 'Inconnu'}
                        </div>
                        <div>
                          <span className="font-medium">Âge:</span> {age}
                        </div>
                        <div>
                          <span className="font-medium">Date de naissance:</span> {pet.birthDate || 'Non renseignée'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium">Couleur:</span> {pet.color || 'Non renseignée'}
                      </div>
                      <div>
                        <span className="font-medium">Poids actuel:</span> {currentWeight}
                      </div>
                      <div>
                        <span className="font-medium">N° puce:</span> {pet.microchip || 'Non renseigné'}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Statut de santé:</span>
                        <Badge variant={pet.status === 'healthy' ? 'default' : pet.status === 'treatment' ? 'secondary' : 'destructive'}>
                          {pet.status === 'healthy' ? 'En bonne santé' : 
                           pet.status === 'treatment' ? 'En traitement' : 'Urgent'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Propriétaire:</span> {pet.owner}
                      </div>
                      <div>
                        <span className="font-medium">Dernière visite:</span> {pet.lastVisit || 'Aucune'}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Galerie photos */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Galerie photos</CardTitle>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Ajouter une photo
                </Button>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Aucune photo disponible</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Ajoutez des photos de l'animal pour enrichir son dossier
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Stats rapides */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Weight className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Poids actuel</p>
                      <p className="text-lg font-bold">{currentWeight}</p>
                      <p className="text-xs text-muted-foreground">-28.2kg</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Température</p>
                      <p className="text-lg font-bold">38.5°C</p>
                      <p className="text-xs text-muted-foreground">Moy: 38.5°C</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Consultations</p>
                      <p className="text-lg font-bold">1</p>
                      <p className="text-xs text-muted-foreground">Dernière: 15/01/2024</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Alertes</p>
                      <p className="text-lg font-bold">1</p>
                      <p className="text-xs text-muted-foreground">À traiter</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Prochains suivis recommandés */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Prochain suivi recommandé
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                  <p className="font-medium">Contrôle dans 3 an</p>
                  <Button size="sm" className="mt-2 gap-2">
                    <Plus className="h-4 w-4" />
                    Planifier
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Alertes importantes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Alertes importantes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">Contrôle de routine recommandé</p>
                    <p className="text-sm text-muted-foreground">Dernière consultation il y a 20 mois</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Planifier consultation
                  </Button>
                </div>

                <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">Vaccination en retard</p>
                    <p className="text-sm text-muted-foreground">DHPP - 247 jour(s) de retard</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Planifier vaccination
                  </Button>
                </div>

                <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">Vaccination en retard</p>
                    <p className="text-sm text-muted-foreground">Lyme - 512 jour(s) de retard</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Planifier vaccination
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historique" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Historique médical</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Pas assez de données pour afficher les tendances</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Ajoutez plus de consultations avec poids et température
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prescriptions" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Prescriptions</CardTitle>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nouvelle prescription
                </Button>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Aucune prescription disponible</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vaccinations" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Vaccinations</CardTitle>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nouvelle vaccination
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-sm font-medium">
                    <div>Rage</div>
                    <div>DHPP</div>
                    <div>Lyme</div>
                  </div>
                  
                  <div className="text-center py-8">
                    <Syringe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Aucune vaccination enregistrée</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="antiparasites" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Antiparasitaires</CardTitle>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nouveau traitement
                </Button>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Aucun traitement antiparasitaire enregistré</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pedigree" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informations de pedigree</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Aucune information de pedigree disponible</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Voir Dossier Médical
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fermer
            </Button>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          </div>
        </div>

        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm font-medium">Animal modifié</p>
          <p className="text-xs text-muted-foreground">
            Les informations de {pet.name} ont été mises à jour.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
