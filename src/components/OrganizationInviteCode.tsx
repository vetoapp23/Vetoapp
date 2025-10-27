import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, UserPlus } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export const OrganizationInviteCode = () => {
  const { toast } = useToast();
  const [invitationCode, setInvitationCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvitationCode();
  }, []);

  const loadInvitationCode = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) return;

      const { data: org } = await supabase
        .from('organizations')
        .select('invitation_code')
        .eq('id', profile.organization_id)
        .single();

      setInvitationCode(org?.invitation_code || null);
    } catch (error) {
      console.error('Error loading invitation code:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (!invitationCode) return;
    
    navigator.clipboard.writeText(invitationCode);
    setCopied(true);
    toast({
      title: "Code copié!",
      description: "Le code d'invitation a été copié dans le presse-papier",
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!invitationCode) {
    return null;
  }

  return (
    <Card className="border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-green-600 dark:text-green-400" />
          <CardTitle>Code d'invitation de votre organisation</CardTitle>
        </div>
        <CardDescription>
          Partagez ce code avec vos assistants vétérinaires pour qu'ils puissent rejoindre votre clinique
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-white dark:bg-gray-900 rounded-lg p-4 border-2 border-green-300 dark:border-green-700">
            <div className="text-xs font-medium text-muted-foreground mb-1">
              Code d'invitation
            </div>
            <div className="text-3xl font-bold tracking-wider text-green-600 dark:text-green-400 font-mono">
              {invitationCode}
            </div>
          </div>
          <Button
            onClick={copyCode}
            variant="outline"
            size="lg"
            className="h-[88px] border-green-300 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-900/30"
          >
            {copied ? (
              <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
            ) : (
              <Copy className="h-5 w-5" />
            )}
          </Button>
        </div>

        <div className="bg-white/50 dark:bg-gray-900/50 rounded-lg p-4 space-y-2">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <span className="text-green-600 dark:text-green-400">📋</span>
            Instructions pour les assistants
          </h4>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Aller sur la page d'inscription</li>
            <li>Cocher "Je rejoins une clinique existante"</li>
            <li>Entrer ce code d'invitation: <span className="font-mono font-bold text-green-600 dark:text-green-400">{invitationCode}</span></li>
            <li>Compléter le formulaire et s'inscrire</li>
            <li>Confirmer l'email pour activer le compte</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};
