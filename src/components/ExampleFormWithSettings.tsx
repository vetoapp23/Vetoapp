import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  useAnimalSpecies, 
  useAnimalBreeds, 
  useAnimalColors,
  useClientTypes,
  useConsultationTypes,
  useAppointmentTypes,
  useMedicationCategories,
  useVaccinationTypes,
  useParasiteTypes,
  useFarmTypes,
  usePaymentMethods
} from '@/hooks/useAppSettings';
import { Loader2, Settings } from 'lucide-react';

// Example component showing how to use settings in forms
export const ExampleFormWithSettings = () => {
  const [selectedSpecies, setSelectedSpecies] = React.useState('');
  const [selectedClientType, setSelectedClientType] = React.useState('');
  const [selectedConsultationType, setSelectedConsultationType] = React.useState('');

  // Use the settings hooks
  const { data: animalSpecies = [], isLoading: speciesLoading } = useAnimalSpecies();
  const { data: animalBreeds = {}, isLoading: breedsLoading } = useAnimalBreeds(selectedSpecies);
  const { data: animalColors = [], isLoading: colorsLoading } = useAnimalColors();
  const { data: clientTypes = [], isLoading: clientTypesLoading } = useClientTypes();
  const { data: consultationTypes = [], isLoading: consultationTypesLoading } = useConsultationTypes();
  const { data: appointmentTypes = [], isLoading: appointmentTypesLoading } = useAppointmentTypes();
  const { data: medicationCategories = [], isLoading: medicationCategoriesLoading } = useMedicationCategories();
  const { data: vaccinationTypes = [], isLoading: vaccinationTypesLoading } = useVaccinationTypes();
  const { data: parasiteTypes = [], isLoading: parasiteTypesLoading } = useParasiteTypes();
  const { data: farmTypes = [], isLoading: farmTypesLoading } = useFarmTypes();
  const { data: paymentMethods = [], isLoading: paymentMethodsLoading } = usePaymentMethods();

  // Get breeds for selected species
  const availableBreeds = selectedSpecies ? animalBreeds[selectedSpecies] || [] : [];

  if (speciesLoading || clientTypesLoading || consultationTypesLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Chargement des paramètres...
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Exemple d'utilisation des paramètres</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Animal Form Example */}
        <Card>
          <CardHeader>
            <CardTitle>Formulaire Animal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Espèce</Label>
              <Select value={selectedSpecies} onValueChange={setSelectedSpecies}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une espèce" />
                </SelectTrigger>
                <SelectContent>
                  {animalSpecies.map(species => (
                    <SelectItem key={species} value={species}>
                      {species}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedSpecies && (
              <div>
                <Label>Race</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une race" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableBreeds.map(breed => (
                      <SelectItem key={breed} value={breed}>
                        {breed}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label>Couleur</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une couleur" />
                </SelectTrigger>
                <SelectContent>
                  {animalColors.map(color => (
                    <SelectItem key={color} value={color}>
                      {color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Client Form Example */}
        <Card>
          <CardHeader>
            <CardTitle>Formulaire Client</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Type de client</Label>
              <Select value={selectedClientType} onValueChange={setSelectedClientType}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  {clientTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Méthodes de paiement acceptées</Label>
              <div className="flex flex-wrap gap-1 mt-2">
                {paymentMethods.map(method => (
                  <Badge key={method} variant="outline">
                    {method}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Consultation Form Example */}
        <Card>
          <CardHeader>
            <CardTitle>Formulaire Consultation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Type de consultation</Label>
              <Select value={selectedConsultationType} onValueChange={setSelectedConsultationType}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  {consultationTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Catégories de médicaments</Label>
              <div className="flex flex-wrap gap-1 mt-2">
                {medicationCategories.slice(0, 4).map(category => (
                  <Badge key={category} variant="secondary" className="text-xs">
                    {category}
                  </Badge>
                ))}
                {medicationCategories.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{medicationCategories.length - 4} autres
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointment Form Example */}
        <Card>
          <CardHeader>
            <CardTitle>Formulaire Rendez-vous</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Type de rendez-vous</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  {appointmentTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Vaccination Form Example */}
        <Card>
          <CardHeader>
            <CardTitle>Formulaire Vaccination</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Types de vaccins disponibles</Label>
              <div className="flex flex-wrap gap-1 mt-2">
                {vaccinationTypes.slice(0, 3).map(type => (
                  <Badge key={type} variant="outline" className="text-xs">
                    {type}
                  </Badge>
                ))}
                {vaccinationTypes.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{vaccinationTypes.length - 3} autres
                  </Badge>
                )}
              </div>
            </div>

            <div>
              <Label>Types de parasites</Label>
              <div className="flex flex-wrap gap-1 mt-2">
                {parasiteTypes.slice(0, 4).map(type => (
                  <Badge key={type} variant="destructive" className="text-xs">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Farm Form Example */}
        <Card>
          <CardHeader>
            <CardTitle>Formulaire Ferme</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Type de ferme</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  {farmTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Instructions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Comment utiliser les paramètres dans vos composants</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">1. Importer les hooks</h4>
            <code className="text-sm">
              {`import { useAnimalSpecies, useAnimalBreeds } from '@/hooks/useAppSettings';`}
            </code>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">2. Utiliser dans votre composant</h4>
            <code className="text-sm">
              {`const { data: species = [] } = useAnimalSpecies();
const { data: breeds = {} } = useAnimalBreeds(selectedSpecies);`}
            </code>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">3. Utiliser dans vos formulaires</h4>
            <code className="text-sm">
              {`{species.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}`}
            </code>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">✅ Avantages</h4>
            <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
              <li>• Configuration centralisée dans les paramètres</li>
              <li>• Mise à jour en temps réel dans toute l'application</li>
              <li>• Valeurs par défaut intelligentes</li>
              <li>• Interface d'administration simple</li>
              <li>• Persistance en base de données</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};