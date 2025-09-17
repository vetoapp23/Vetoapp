import { Consultation } from "@/contexts/ClientContext";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";

interface ConsultationPrintProps {
  consultation: Consultation;
}

export function ConsultationPrint({ consultation }: ConsultationPrintProps) {
  const { settings } = useSettings();
  
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Consultation - ${consultation.petName}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              line-height: 1.6;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .clinic-name {
              font-size: 24px;
              font-weight: bold;
              color: #2563eb;
            }
            .consultation-title {
              font-size: 20px;
              margin: 10px 0;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 30px;
            }
            .info-section {
              border: 1px solid #ddd;
              padding: 15px;
              border-radius: 5px;
            }
            .info-section h3 {
              margin: 0 0 10px 0;
              color: #333;
              border-bottom: 1px solid #eee;
              padding-bottom: 5px;
            }
            .info-item {
              margin: 5px 0;
            }
            .info-label {
              font-weight: bold;
              color: #666;
            }
            .medical-section {
              margin: 20px 0;
            }
            .medical-section h3 {
              color: #333;
              border-bottom: 1px solid #eee;
              padding-bottom: 5px;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="clinic-name">VetPro CRM</div>
            <div class="consultation-title">Rapport de Consultation</div>
            <div>Date: ${new Date(consultation.date).toLocaleDateString('fr-FR')}</div>
          </div>

          <div class="info-grid">
            <div class="info-section">
              <h3>Informations Client</h3>
              <div class="info-item">
                <span class="info-label">Nom:</span> ${consultation.clientName}
              </div>
            </div>
            <div class="info-section">
              <h3>Informations Animal</h3>
              <div class="info-item">
                <span class="info-label">Nom:</span> ${consultation.petName}
              </div>
              <div class="info-item">
                <span class="info-label">Poids:</span> ${consultation.weight || 'Non renseigné'}
              </div>
              <div class="info-item">
                <span class="info-label">Température:</span> ${consultation.temperature || 'Non renseigné'}
              </div>
            </div>
          </div>

          ${consultation.symptoms ? `
            <div class="medical-section">
              <h3>Symptômes Observés</h3>
              <p>${consultation.symptoms}</p>
            </div>
          ` : ''}

          ${consultation.diagnosis ? `
            <div class="medical-section">
              <h3>Diagnostic</h3>
              <p>${consultation.diagnosis}</p>
            </div>
          ` : ''}

          ${consultation.treatment ? `
            <div class="medical-section">
              <h3>Traitement Administré</h3>
              <p>${consultation.treatment}</p>
            </div>
          ` : ''}

          ${consultation.medications ? `
            <div class="medical-section">
              <h3>Médicaments Prescrits</h3>
              <p>${consultation.medications}</p>
            </div>
          ` : ''}

          ${consultation.notes ? `
            <div class="medical-section">
              <h3>Notes Additionnelles</h3>
              <p>${consultation.notes}</p>
            </div>
          ` : ''}

          <div class="info-grid">
            <div class="info-section">
              <h3>Suivi Recommandé</h3>
              <p>${consultation.followUp || 'Aucun suivi prévu'}</p>
            </div>
            <div class="info-section">
              <h3>Coût</h3>
              <p>${consultation.cost ? consultation.cost + ' ' + settings.currency : 'Non renseigné'}</p>
            </div>
          </div>

          <div class="footer">
            <p>Consultation générée le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
            <p>VetPro CRM - Gestion Vétérinaire Complète</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <Button 
      size="sm" 
      variant="outline" 
      onClick={handlePrint}
      className="gap-2"
    >
      <Printer className="h-4 w-4" />
      Imprimer
    </Button>
  );
}
