import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, DollarSign } from 'lucide-react';
import { useClients } from '@/contexts/ClientContext';
import { useSettings } from '@/contexts/SettingsContext';

export function RevenueChart() {
  const { accountingEntries } = useClients();
  const { settings } = useSettings();

  // Générer les données des 6 derniers mois
  const generateRevenueData = () => {
    const data = [];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
      
      // Calculer les revenus et dépenses pour ce mois
      const monthEntries = accountingEntries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= new Date(monthStart) && entryDate <= new Date(monthEnd);
      });
      
      const revenue = monthEntries
        .filter(entry => entry.type === 'revenue')
        .reduce((sum, entry) => sum + entry.amount, 0);
      
      const expenses = monthEntries
        .filter(entry => entry.type === 'expense')
        .reduce((sum, entry) => sum + entry.amount, 0);
      
      data.push({
        month: date.toLocaleDateString('fr-FR', { month: 'short' }),
        revenue: Math.round(revenue),
        expenses: Math.round(expenses),
        profit: Math.round(revenue - expenses)
      });
    }
    
    return data;
  };

  const data = generateRevenueData();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Évolution des Revenus</CardTitle>
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <TrendingUp className="h-4 w-4 text-green-600" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                className="text-xs"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                className="text-xs"
                tickFormatter={(value) => `${value}${settings.currency || '€'}`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
                formatter={(value: number, name: string) => [
                  `${value} ${settings.currency || '€'}`,
                  name === 'revenue' ? 'Revenus' : name === 'expenses' ? 'Dépenses' : 'Bénéfice'
                ]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stackId="1"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.6}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stackId="2"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.6}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-between mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-muted-foreground">Revenus</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-muted-foreground">Dépenses</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
