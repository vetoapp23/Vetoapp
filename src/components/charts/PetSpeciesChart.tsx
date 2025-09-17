import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Heart, Dog, Cat, Fish, Bird } from 'lucide-react';
import { useClients } from '@/contexts/ClientContext';

export function PetSpeciesChart() {
  const { pets } = useClients();

  // Calculer les données par espèce
  const speciesData = React.useMemo(() => {
    const speciesCounts = pets.reduce((acc, pet) => {
      const species = pet.species || 'Autre';
      acc[species] = (acc[species] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];
    
    return Object.entries(speciesCounts).map(([species, count], index) => ({
      name: species,
      value: count,
      color: colors[index % colors.length]
    }));
  }, [pets]);

  // Calculer les statistiques
  const totalPets = pets.length;
  const mostCommonSpecies = speciesData.length > 0 ? speciesData[0] : null;
  const averageAge = pets.length > 0 ? 
    pets.reduce((sum, pet) => sum + (pet.age || 0), 0) / pets.length : 0;

  const getSpeciesIcon = (species: string) => {
    switch (species.toLowerCase()) {
      case 'chien':
      case 'dog':
        return <Dog className="h-4 w-4" />;
      case 'chat':
      case 'cat':
        return <Cat className="h-4 w-4" />;
      case 'poisson':
      case 'fish':
        return <Fish className="h-4 w-4" />;
      case 'oiseau':
      case 'bird':
        return <Bird className="h-4 w-4" />;
      default:
        return <Heart className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Répartition par Espèce</CardTitle>
        <Heart className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={speciesData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {speciesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
                formatter={(value: number) => [value, 'Animaux']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total d'animaux</span>
            <span className="font-medium">{totalPets}</span>
          </div>
          
          {mostCommonSpecies && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Espèce la plus commune</span>
              <div className="flex items-center gap-2">
                {getSpeciesIcon(mostCommonSpecies.name)}
                <span className="font-medium">{mostCommonSpecies.name}</span>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Âge moyen</span>
            <span className="font-medium">{averageAge.toFixed(1)} ans</span>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Répartition détaillée</h4>
            {speciesData.slice(0, 5).map((species, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  {getSpeciesIcon(species.name)}
                  <span>{species.name}</span>
                </div>
                <span className="text-muted-foreground">
                  {species.value} ({((species.value / totalPets) * 100).toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
