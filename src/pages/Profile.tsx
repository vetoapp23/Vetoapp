import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Mail, 
  Shield, 
  Phone, 
  MapPin, 
  Calendar,
  Save,
  Edit,
  Camera,
  Key,
  Bell,
  Globe
} from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';

export default function Profile() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // État local pour les modifications
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+212 5 37 00 00 00',
    address: '123 Avenue Hassan II, Rabat, Maroc',
    specialty: 'Médecine générale',
    experience: '15 ans',
    languages: ['Français', 'Arabe', 'Anglais'],
    bio: 'Vétérinaire passionné avec plus de 15 ans d\'expérience dans le soin des animaux de compagnie et d\'élevage.'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [preferences, setPreferences] = useState({
    notifications: {
      email: true,
      sms: false,
      push: true
    },
    privacy: {
      showEmail: false,
      showPhone: true,
      showAddress: false
    },
    language: 'fr',
    timezone: 'Africa/Casablanca'
  });

  const handleSaveProfile = () => {
    // Simulation de sauvegarde
    toast({
      title: "Profil mis à jour",
      description: "Vos informations ont été sauvegardées avec succès.",
    });
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Mot de passe modifié",
      description: "Votre mot de passe a été mis à jour avec succès.",
    });
    setIsChangingPassword(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleSavePreferences = () => {
    toast({
      title: "Préférences sauvegardées",
      description: "Vos préférences ont été mises à jour.",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrateur';
      case 'veterinarian':
        return 'Vétérinaire';
      case 'assistant':
        return 'Assistant';
      default:
        return 'Utilisateur';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'veterinarian':
        return 'bg-blue-100 text-blue-800';
      case 'assistant':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Mon Profil</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Gérez vos informations personnelles et préférences
          </p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Annuler
              </Button>
              <Button onClick={handleSaveProfile} className="gap-2">
                <Save className="h-4 w-4" />
                Sauvegarder
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="gap-2">
              <Edit className="h-4 w-4" />
              Modifier
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profil Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations Personnelles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations Personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar et Informations de base */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button
                      size="sm"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                      variant="secondary"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{user.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <Badge className={getRoleColor(user.role)}>
                      {getRoleLabel(user.role)}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Formulaire d'édition */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    value={profileData.address}
                    onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="specialty">Spécialité</Label>
                  <Input
                    id="specialty"
                    value={profileData.specialty}
                    onChange={(e) => setProfileData(prev => ({ ...prev, specialty: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="experience">Expérience</Label>
                  <Input
                    id="experience"
                    value={profileData.experience}
                    onChange={(e) => setProfileData(prev => ({ ...prev, experience: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Biographie</Label>
                <textarea
                  id="bio"
                  className="w-full min-h-[100px] px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>
            </CardContent>
          </Card>

          {/* Changement de mot de passe */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Sécurité
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isChangingPassword ? (
                <Button 
                  variant="outline" 
                  onClick={() => setIsChangingPassword(true)}
                  className="gap-2"
                >
                  <Key className="h-4 w-4" />
                  Changer le mot de passe
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsChangingPassword(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleChangePassword}>
                      Changer le mot de passe
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Préférences */}
        <div className="space-y-6">
          {/* Préférences de notification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-notifications">Notifications par email</Label>
                  <input
                    type="checkbox"
                    id="email-notifications"
                    checked={preferences.notifications.email}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, email: e.target.checked }
                    }))}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="sms-notifications">Notifications SMS</Label>
                  <input
                    type="checkbox"
                    id="sms-notifications"
                    checked={preferences.notifications.sms}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, sms: e.target.checked }
                    }))}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="push-notifications">Notifications push</Label>
                  <input
                    type="checkbox"
                    id="push-notifications"
                    checked={preferences.notifications.push}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, push: e.target.checked }
                    }))}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </div>
              </div>
              
              <Button onClick={handleSavePreferences} className="w-full">
                Sauvegarder les préférences
              </Button>
            </CardContent>
          </Card>

          {/* Informations de compte */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Informations du Compte
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">ID Utilisateur:</span>
                <span className="font-mono text-xs">{user.id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Rôle:</span>
                <span>{getRoleLabel(user.role)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Membre depuis:</span>
                <span>Janvier 2024</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Dernière connexion:</span>
                <span>Aujourd'hui</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
