import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface NewAppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefillClientId?: string;
  prefillPetId?: string;
  prefillType?: string;
  prefillReason?: string;
  originalVaccinationId?: string;
}

export function NewAppointmentModal({ 
  open, 
  onOpenChange
}: NewAppointmentModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouveau Rendez-vous</DialogTitle>
          <DialogDescription>
            Fonctionnalité en cours de développement.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
