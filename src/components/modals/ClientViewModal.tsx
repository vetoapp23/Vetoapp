import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, Phone, MapPin, Heart, Edit } from "lucide-react";
import { Client } from "@/contexts/ClientContext";

interface ClientViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
  onEdit: () => void;
}

export function ClientViewModal({ open, onOpenChange, client, onEdit }: ClientViewModalProps) {
  if (!client) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Profil Client</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {client.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">{client.name}</h2>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {client.email}
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {client.phone}
                </div>
              </div>
            </div>
          </div>
          
          {client.address && (
            <div className="space-y-2">
              <h3 className="font-semibold">Adresse</h3>
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5" />
                <div>
                  <p>{client.address}</p>
                  <p>{client.postalCode} {client.city}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary" />
              Animaux ({client.pets.length})
            </h3>
            {client.pets.length > 0 ? (
              <div className="space-y-2">
                {client.pets.map((pet, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{pet.name}</h4>
                      <p className="text-sm text-muted-foreground">{pet.type} • {pet.breed}</p>
                    </div>
                    <Badge variant="outline">
                      {pet.status === 'healthy' ? 'En bonne santé' : 
                       pet.status === 'treatment' ? 'En traitement' : 'Urgent'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Aucun animal enregistré</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
            <div>
              <span className="font-medium">Dernière visite:</span>
              <p>{new Date(client.lastVisit).toLocaleDateString('fr-FR')}</p>
            </div>
            <div>
              <span className="font-medium">Total visites:</span>
              <p>{client.totalVisits}</p>
            </div>
          </div>
          
          {client.notes && (
            <div className="space-y-2">
              <h3 className="font-semibold">Notes</h3>
              <p className="text-muted-foreground">{client.notes}</p>
            </div>
          )}
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fermer
            </Button>
            <Button onClick={onEdit} className="gap-2">
              <Edit className="h-4 w-4" />
              Modifier
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}