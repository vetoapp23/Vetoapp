import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'veterinarian' | 'assistant';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Utilisateur par défaut pour la démo
const DEFAULT_USER: User = {
  id: '1',
  name: 'Dr. Vétérinaire',
  email: 'vet@vetpro.com',
  role: 'admin'
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté au chargement
    const savedUser = localStorage.getItem('vetpro-user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Erreur lors du parsing de l\'utilisateur sauvegardé:', error);
        localStorage.removeItem('vetpro-user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulation d'une authentification
    // En production, ceci serait remplacé par un appel API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (email === 'vet@vetpro.com' && password === 'vetpro123') {
      setUser(DEFAULT_USER);
      localStorage.setItem('vetpro-user', JSON.stringify(DEFAULT_USER));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('vetpro-user');
    // Optionnel: nettoyer d'autres données sensibles
    localStorage.removeItem('vetpro-clients');
    localStorage.removeItem('vetpro-pets');
    localStorage.removeItem('vetpro-consultations');
    localStorage.removeItem('vetpro-appointments');
    localStorage.removeItem('vetpro-prescriptions');
    localStorage.removeItem('vetpro-farms');
    localStorage.removeItem('vetpro-vaccinations');
    localStorage.removeItem('vetpro-antiparasitics');
    localStorage.removeItem('vetpro-stockItems');
    localStorage.removeItem('vetpro-stockMovements');
    localStorage.removeItem('vetpro-accountingEntries');
    localStorage.removeItem('vetpro-settings');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
