import React from 'react';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/contexts/SettingsContext';
import { Prescription } from '@/contexts/ClientContext';

interface InvoicePrescriptionPrintProps {
  prescription: Prescription;
}

export function InvoicePrescriptionPrint({ prescription }: InvoicePrescriptionPrintProps) {
  const { settings } = useSettings();
  const { logo, clinicName, address, phone, email, website, currency } = settings;

  // Calcul des totaux
  const lineTotals = prescription.medications.map(med => med.cost * (med.quantity || 1));
  const totalAmount = lineTotals.reduce((sum, val) => sum + val, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-8 max-w-screen-lg mx-auto bg-white text-gray-800">
      {/* Entête */}
      <header className="flex items-center justify-between mb-8">
        {logo && <img src={logo} alt="Logo clinique" className="h-16 w-16 object-contain" />}
        <div className="text-center flex-1">
          <h1 className="text-2xl font-bold">{clinicName}</h1>
          <p className="text-sm">{address}</p>
          <p className="text-sm">{phone} | {email}</p>
          {website && <p className="text-sm">{website}</p>}
        </div>
        <div>
          <Button variant="outline" onClick={handlePrint} className="uppercase text-sm">
            Imprimer
          </Button>
        </div>
      </header>

      {/* Ordonnance */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Ordonnance</h2>
        <div className="grid grid-cols-2 gap-8 mb-4">
          <div>
            <p><strong>Date :</strong> {prescription.date}</p>
            <p><strong>Patient :</strong> {prescription.petName} ({prescription.clientName})</p>
          </div>
          <div>
            <p><strong>Prescrit par :</strong> {prescription.prescribedBy}</p>
            <p><strong>Diagnostic :</strong> {prescription.diagnosis}</p>
          </div>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border-b py-2 text-left">Médicament</th>
              <th className="border-b py-2 text-left">Dosage</th>
              <th className="border-b py-2 text-left">Fréquence</th>
              <th className="border-b py-2 text-left">Durée</th>
            </tr>
          </thead>
          <tbody>
            {prescription.medications.map(med => (
              <tr key={med.id} className="border-b">
                <td className="py-2">{med.name}</td>
                <td className="py-2">{med.dosage}</td>
                <td className="py-2">{med.frequency}</td>
                <td className="py-2">{med.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Facture */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Facture</h2>
        <table className="w-full border-collapse mb-4">
          <thead>
            <tr>
              <th className="border-b py-2 text-left">Produit / Service</th>
              <th className="border-b py-2 text-right">Quantité</th>
              <th className="border-b py-2 text-right">Prix Unitaire ({currency})</th>
              <th className="border-b py-2 text-right">Total ({currency})</th>
            </tr>
          </thead>
          <tbody>
            {prescription.medications.map(med => {
              const qty = med.quantity || 1;
              const lineTotal = (med.cost || 0) * qty;
              return (
                <tr key={med.id} className="border-b">
                  <td className="py-2">{med.name}</td>
                  <td className="py-2 text-right">{qty}</td>
                  <td className="py-2 text-right">{med.cost.toFixed(2)}</td>
                  <td className="py-2 text-right">{lineTotal.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="py-2 text-right font-semibold">Montant total :</td>
              <td className="py-2 text-right font-semibold">{totalAmount.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </section>
    </div>
  );
}
