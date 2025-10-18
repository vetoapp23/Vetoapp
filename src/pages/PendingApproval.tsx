import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Clock, UserCheck, Mail, LogOut } from 'lucide-react';

const PendingApproval = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl dark:bg-gray-800/50 dark:border-gray-700">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-4">
            <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            En attente d'approbation
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-400">
              <Mail className="w-5 h-5" />
              <span className="text-sm">{user?.email}</span>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800/30">
              <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-400 mb-2">
                <UserCheck className="w-5 h-5" />
                <span className="font-medium">Compte en cours de validation</span>
              </div>
              <p className="text-sm text-blue-600 dark:text-blue-300">
                Votre demande d'inscription a été reçue avec succès. Un administrateur doit approuver votre compte avant que vous puissiez accéder à l'application.
              </p>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>
                <strong className="dark:text-gray-200">Que se passe-t-il maintenant ?</strong>
              </p>
              <ul className="text-left space-y-1 ml-4">
                <li>• Un administrateur examinera votre demande</li>
                <li>• Vous recevrez un email de confirmation</li>
                <li>• L'accès sera activé dans les 24-48h</li>
              </ul>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                En cas de questions, contactez votre administrateur
              </p>
            </div>
            
            <Button 
              onClick={handleLogout}
              variant="outline" 
              className="w-full dark:border-gray-600 dark:hover:bg-gray-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Se déconnecter
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PendingApproval;