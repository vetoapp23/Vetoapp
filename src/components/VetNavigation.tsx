import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  Users,
  Heart,
  Calendar,
  FileText,
  BarChart3,
  Tractor,
  Home,
  Syringe,
  Bug,
  Package,
  Cog,
  Calculator,
  Menu,
  X
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LogoutButton } from "@/components/LogoutButton";

// Navigation principale (toujours visible)
const primaryNavItems = [
  { icon: Home, label: "Dashboard", path: "/dashboard" },
  { icon: Users, label: "Clients", path: "/clients" },
  { icon: Heart, label: "Animaux", path: "/pets" },
  { icon: Calendar, label: "RDV", path: "/appointments" },
  { icon: FileText, label: "Consultations", path: "/consultations" },
  { icon: Syringe, label: "Vaccinations", path: "/vaccinations" },
  { icon: Bug, label: "Antiparasites", path: "/antiparasites" },
  { icon: BarChart3, label: "Historiques", path: "/history" },
  { icon: Tractor, label: "Farm Mgmt", path: "/farm" }
];

// Navigation secondaire (dans le menu déroulant)
const secondaryNavItems = [
  { icon: Package, label: "Stock", path: "/stock" },
  { icon: Calculator, label: "Comptabilité", path: "/accounting" },
  { icon: Cog, label: "Paramètres", path: "/settings" }
];

// Tous les éléments pour la navigation mobile
const allNavItems = [...primaryNavItems, ...secondaryNavItems];

export function VetNavigation() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-card border-b shadow-card">
      <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between">
          {/* Logo et Toggle Thème */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <Link to="/dashboard" className="flex items-center gap-1 sm:gap-2">
              <Heart className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
              <h1 className="text-lg sm:text-xl font-bold gradient-primary bg-clip-text text-transparent hidden sm:block">
                VetPro CRM
              </h1>
              <h1 className="text-base sm:text-lg font-bold gradient-primary bg-clip-text text-transparent sm:hidden">
                VetPro
              </h1>
            </Link>
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
          </div>

          {/* Navigation principale - Desktop */}
          <div className="hidden lg:flex items-center gap-1">
            {primaryNavItems.map((item) => (
              <Button
                key={item.path}
                variant={location.pathname === item.path ? "default" : "ghost"}
                size="sm"
                className="gap-1 px-3 transition-all hover:medical-glow"
                asChild
              >
                <Link to={item.path}>
                  <item.icon className="h-4 w-4" />
                  <span className="hidden xl:inline">{item.label}</span>
                </Link>
              </Button>
            ))}
            
            {/* Menu déroulant pour les éléments secondaires */}
            <div className="relative group">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 px-3 transition-all hover:medical-glow"
              >
                <Menu className="h-4 w-4" />
                <span className="hidden xl:inline">Plus</span>
              </Button>
              
              {/* Menu déroulant */}
              <div className="absolute right-0 top-full mt-1 w-40 bg-card border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-1">
                  {secondaryNavItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors hover:bg-muted ${
                        location.pathname === item.path ? 'bg-primary text-primary-foreground' : ''
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Bouton de déconnexion - Desktop */}
          <div className="hidden lg:flex items-center gap-2">
            <LogoutButton />
          </div>

          {/* Menu mobile */}
          <div className="lg:hidden flex items-center gap-2">
            <div className="sm:hidden">
              <ThemeToggle />
            </div>
            <LogoutButton />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="gap-1 p-2"
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Menu mobile déroulant */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-2 pt-2 border-t">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {allNavItems.map((item) => (
                <Button
                  key={item.path}
                  variant={location.pathname === item.path ? "default" : "ghost"}
                  size="sm"
                  className="gap-2 justify-start text-xs sm:text-sm"
                  asChild
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Link to={item.path}>
                    <item.icon className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}