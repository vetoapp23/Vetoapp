import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Heart, Loader2, Building2, UserPlus } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  
  // Check URL parameter for mode
  const urlMode = searchParams.get('mode');
  const [isJoiningOrganization, setIsJoiningOrganization] = useState(urlMode === 'assistant');
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    // Admin fields
    clinicName: "",
    clinicAddress: "",
    phone: "",
    // Assistant field
    organizationCode: ""
  });

  // Update mode when URL parameter changes
  useEffect(() => {
    if (urlMode === 'assistant') {
      setIsJoiningOrganization(true);
    } else if (urlMode === 'admin') {
      setIsJoiningOrganization(false);
    }
  }, [urlMode]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validation
      if (!formData.fullName || !formData.email || !formData.password) {
        throw new Error('Veuillez remplir tous les champs obligatoires');
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error('Les mots de passe ne correspondent pas');
      }

      if (formData.password.length < 8) {
        throw new Error('Le mot de passe doit contenir au moins 8 caractères');
      }

      // If joining organization, validate code
      if (isJoiningOrganization && !formData.organizationCode) {
        throw new Error('Veuillez entrer le code d\'organisation');
      }

      // If not joining, require clinic name
      if (!isJoiningOrganization && !formData.clinicName) {
        throw new Error('Veuillez entrer le nom de votre clinique');
      }

      // Sign up with Supabase (no metadata, we'll call RPC after)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Erreur lors de la création du compte');
      }

      // Call our RPC function to create user profile
      const { data: profileData, error: profileError } = await supabase.rpc('create_user_profile', {
        p_user_id: authData.user.id,
        p_full_name: formData.fullName,
        p_email: formData.email,
        p_role: isJoiningOrganization ? 'assistant' : 'admin',
        p_organization_code: isJoiningOrganization ? formData.organizationCode : null,
        p_clinic_name: !isJoiningOrganization ? formData.clinicName : null,
        p_clinic_address: !isJoiningOrganization ? formData.clinicAddress : null,
        p_phone: !isJoiningOrganization ? formData.phone : null
      });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw new Error(`Erreur lors de la création du profil: ${profileError.message}`);
      }

      // Check if the RPC returned an error
      if (profileData && !profileData.success) {
        throw new Error(`Erreur: ${profileData.error || 'Code organisation invalide'}`);
      }

      toast({
        title: "Inscription réussie!",
        description: isJoiningOrganization 
          ? "Vérifiez votre email pour confirmer votre compte, puis connectez-vous." 
          : "Vérifiez votre email pour confirmer votre compte et créer votre clinique.",
      });

      navigate('/login');

    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Erreur d'inscription",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800 px-4 py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            {isJoiningOrganization ? (
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                <UserPlus className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
            ) : (
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                <Building2 className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
            )}
          </div>
          <CardTitle className="text-3xl font-bold">
            {isJoiningOrganization ? "Rejoindre une clinique" : "Créez votre clinique"}
          </CardTitle>
          <CardDescription className="text-base">
            {isJoiningOrganization 
              ? "Inscription en tant qu'assistant vétérinaire" 
              : "Inscription pour propriétaires de cliniques"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-6">
            {/* Toggle between admin and assistant */}
            <div className="flex items-center space-x-2 p-4 bg-muted rounded-lg">
              <Checkbox
                id="joinOrg"
                checked={isJoiningOrganization}
                onCheckedChange={(checked) => setIsJoiningOrganization(checked as boolean)}
              />
              <Label htmlFor="joinOrg" className="cursor-pointer">
                Je rejoins une clinique existante (Assistant)
              </Label>
            </div>

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase">
                Informations personnelles
              </h3>
              
              <div>
                <Label htmlFor="fullName">Nom complet *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Dr. Jean Dupont"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@exemple.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Mot de passe *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimum 8 caractères"
                  required
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Confirmez votre mot de passe"
                  required
                />
              </div>
            </div>

            {/* Organization Code (for assistants) */}
            {isJoiningOrganization && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase">
                  Code d'organisation
                </h3>
                <div>
                  <Label htmlFor="organizationCode">Code fourni par votre administrateur *</Label>
                  <Input
                    id="organizationCode"
                    value={formData.organizationCode}
                    onChange={(e) => setFormData({ ...formData, organizationCode: e.target.value })}
                    placeholder="0fbce0fa"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Demandez ce code à l'administrateur de votre clinique
                  </p>
                </div>
              </div>
            )}

            {/* Clinic Information (for admins) */}
            {!isJoiningOrganization && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase">
                  Informations de la clinique
                </h3>
                
                <div>
                  <Label htmlFor="clinicName">Nom de la clinique *</Label>
                  <Input
                    id="clinicName"
                    value={formData.clinicName}
                    onChange={(e) => setFormData({ ...formData, clinicName: e.target.value })}
                    placeholder="Clinique Vétérinaire Centrale"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="clinicAddress">Adresse</Label>
                  <Input
                    id="clinicAddress"
                    value={formData.clinicAddress}
                    onChange={(e) => setFormData({ ...formData, clinicAddress: e.target.value })}
                    placeholder="123 Rue Example, Ville"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+212 6 12 34 56 78"
                  />
                </div>
              </div>
            )}

            <Button type="submit" className="w-full h-12 text-base" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Inscription en cours...
                </>
              ) : (
                <>
                  {isJoiningOrganization ? (
                    <>
                      <UserPlus className="mr-2 h-5 w-5" />
                      Rejoindre la clinique
                    </>
                  ) : (
                    <>
                      <Building2 className="mr-2 h-5 w-5" />
                      Créer ma clinique
                    </>
                  )}
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center space-y-2 pt-6 border-t">
            <p className="text-sm text-muted-foreground">
              Vous avez déjà un compte ?{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Connectez-vous
              </Link>
            </p>
            <p className="text-xs text-muted-foreground">
              En créant un compte, vous acceptez nos conditions d'utilisation
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
