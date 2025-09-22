import { HeroSection } from "@/components/HeroSection";
import { DashboardStats } from "@/components/DashboardStats";
import { ClientsOverview } from "@/components/ClientsOverview";
import { PetsOverview } from "@/components/PetsOverview";
import { ConsultationsOverview } from "@/components/ConsultationsOverview";
import { DashboardAlerts } from "@/components/DashboardAlerts";
import { SyncStatus } from "@/components/SyncStatus";
import { DataManager } from "@/components/DataManager";
import { RealTimeKPIs } from "@/components/charts/RealTimeKPIs";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { ActivityChart } from "@/components/charts/ActivityChart";
import { StockChart } from "@/components/charts/StockChart";
import { ClientGrowthChart } from "@/components/charts/ClientGrowthChart";
import { AppointmentStatusChart } from "@/components/charts/AppointmentStatusChart";
import { ConsultationTrendsChart } from "@/components/charts/ConsultationTrendsChart";
import { PetSpeciesChart } from "@/components/charts/PetSpeciesChart";
import { AdminOnly } from "@/components/RoleGuard";

const Dashboard = () => {
  return (
    <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8">
      <HeroSection />
      
      {/* KPI en temps réel */}
      <section>
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">KPI en Temps Réel</h2>
        <RealTimeKPIs />
      </section>
      
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        <SyncStatus />
        <DataManager />
        <DashboardAlerts />
      </div>
      
      <section>
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Vue d'ensemble</h2>
        <DashboardStats />
      </section>
      
      {/* Graphiques de performance */}
      <section>
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Analyses et Tendances</h2>
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          <AdminOnly>
            <RevenueChart />
          </AdminOnly>
          <ActivityChart />
        </div>
      </section>
      
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        <StockChart />
        <ClientGrowthChart />
        <AppointmentStatusChart />
      </div>
      
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <ConsultationTrendsChart />
        <PetSpeciesChart />
      </div>
      
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <ClientsOverview />
        <PetsOverview />
      </div>
      
      <section>
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Activité Récente</h2>
        <ConsultationsOverview />
      </section>

      {/* Admin Only Section */}
      <AdminOnly>
        <section>
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Admin Dashboard</h2>
          {/* Admin specific components or charts can be added here */}
        </section>
      </AdminOnly>
    </div>
  );
};

export default Dashboard;