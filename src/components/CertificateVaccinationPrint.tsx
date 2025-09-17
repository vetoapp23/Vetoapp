import React, { forwardRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useClients } from '@/contexts/ClientContext';
import { format } from 'date-fns';
import { QRCodeCanvas } from 'qrcode.react';
import { isNaN } from 'lodash';
import { useSettings } from '@/contexts/SettingsContext';

interface CertificateProps {
  petId: number;
}

const CertificateVaccinationPrint = forwardRef<HTMLDivElement, CertificateProps>(({ petId }, ref) => {
  const { settings } = useSettings();

  const { getPetById, getClientById, getVaccinationsByPetId } = useClients();
  // Charger la liste des vétérinaires depuis localStorage
  const vets = JSON.parse(localStorage.getItem('vetpro-veterinarians') || '[]');

  const pet = getPetById(petId);
  const client = pet ? getClientById(pet.ownerId) : null;
  const vaccinations = pet ? getVaccinationsByPetId(pet.id) : [];

  // Fonction pour calculer l'âge détaillé
  const getDetailedAge = (birthDate: string): string => {
    const birth = new Date(birthDate);
    const now = new Date();
    if (isNaN(birth.getTime())) return 'N/A';
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    let days = now.getDate() - birth.getDate();
    if (days < 0) {
      months--;
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }
    const weeks = Math.floor(days / 7);
    const parts: string[] = [];
    if (years > 0) parts.push(`${years} an${years > 1 ? 's' : ''}`);
    if (months > 0) parts.push(`${months} mois`);
    if (weeks > 0) parts.push(`${weeks} semain${weeks > 1 ? 'es' : ''}`);
    return parts.join(', ') || '0 jour';
  };

  if (!pet || !client) return null;

  return (
    <div ref={ref} className="p-8 bg-white text-gray-900 font-sans">
      {/* Infos de la clinique */}
      {settings.showClinicInfo && (
        <section className="mb-4 text-sm">
          <img src={settings.logo} alt="Logo" className="h-12 mb-2" />
          <p>{settings.clinicName}</p>
          <p>{settings.address}</p>
          <p>{settings.phone} | {settings.email}</p>
          {settings.website && <p>{settings.website}</p>}
        </section>
      )}

      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <h1 className="text-4xl font-bold text-primary">Certificat de Vaccination</h1>
        <QRCodeCanvas value={`pet:${pet.id}`} size={100} />
      </div>

      {/* Liste des vétérinaires */}
      {settings.showVetsInfo && (
        <section className="mb-6 text-sm">
          <h2 className="font-medium mb-2">Vétérinaires</h2>
          {vets.map(v => (
            <p key={v.id}>{v.title} {v.name} - {v.specialty}</p>
          ))}
        </section>
      )}

      {/* Affichage de la photo si disponible */}
      {pet.photo && (
        <div className="mb-6 text-center">
          <img src={pet.photo} alt={pet.name} className="w-32 h-32 object-cover rounded-full mx-auto" />
        </div>
      )}

      <section className="mb-6">
        <h2 className="text-2xl font-semibold border-b pb-2">Informations de l'animal</h2>
        <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
          <div><span className="font-medium">Nom:</span> {pet.name}</div>
          <div><span className="font-medium">Type:</span> {pet.type}</div>
          <div><span className="font-medium">Race:</span> {pet.breed || 'N/A'}</div>
          <div><span className="font-medium">Âge:</span> {pet.birthDate ? getDetailedAge(pet.birthDate) : 'N/A'}</div>
          <div><span className="font-medium">Propriétaire:</span> {client.name}</div>
          <div><span className="font-medium">Contact:</span> {client.phone}</div>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold border-b pb-2">Historique des Vaccinations</h2>
        <div className="mt-4 space-y-4">
          {vaccinations.map(v => (
            <Card key={v.id} className="border-primary/50">
              <CardHeader>
                <CardTitle className="text-lg">{v.vaccineName}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 text-sm flex justify-between">
                <div>
                  <p>
                    <span className="font-medium">Date donnée:</span>{' '}
                    {v.dateGiven && !isNaN(Date.parse(v.dateGiven))
                      ? format(new Date(v.dateGiven), 'dd/MM/yyyy')
                      : 'N/A'}
                  </p>
                  <p>
                    <span className="font-medium">Rappel prévu:</span>{' '}
                    {v.nextDueDate && !isNaN(Date.parse(v.nextDueDate))
                      ? format(new Date(v.nextDueDate), 'dd/MM/yyyy')
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p><span className="font-medium">Vétérinaire:</span> {v.veterinarian}</p>
                  <p><span className="font-medium">Statut:</span> {v.status}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <footer className="mt-8 text-center text-xs text-gray-500">
        Généré le {format(new Date(), 'dd/MM/yyyy')} - VetPro CRM
      </footer>
    </div>
  );
});

export default CertificateVaccinationPrint;
