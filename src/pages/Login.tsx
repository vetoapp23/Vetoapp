import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Nettoyer les entrées pour éviter les problèmes d'espaces
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    
    // Temporary login logic - replace with Supabase authentication
    if (cleanEmail === "test@gmail.com" && cleanPassword === "testtest") {
      toast({
        title: "Connexion réussie",
        description: "Bienvenue dans VetPro CRM",
      });
      navigate("/dashboard");
    } else {
      toast({
        title: "Erreur de connexion",
        description: `Email ou mot de passe incorrect. Utilisez test@gmail.com / testtest (Email saisi: "${cleanEmail}")`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Heart className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl gradient-primary bg-clip-text text-transparent">
            VetPro CRM
          </CardTitle>
          <CardDescription>
            Connectez-vous à votre compte vétérinaire
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="test@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="testtest"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Se connecter
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full"
              onClick={() => {
                setEmail("test@gmail.com");
                setPassword("testtest");
              }}
            >
              Remplir avec les identifiants de test
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Pas encore de compte ?{" "}
              <Link to="/register" className="text-primary hover:underline">
                S'inscrire
              </Link>
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              <Link to="/" className="hover:underline">
                Retour à l'accueil
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;