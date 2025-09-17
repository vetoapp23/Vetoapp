import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { VetNavigation } from "@/components/VetNavigation";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ClientProvider } from "@/contexts/ClientContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LoginForm } from "@/components/LoginForm";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthRedirect } from "@/components/AuthRedirect";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Pets from "./pages/Pets";
import Appointments from "./pages/Appointments";
import Consultations from "./pages/Consultations";
import History from "./pages/History";
import Farm from "./pages/Farm";
import Vaccinations from "./pages/Vaccinations";
import Antiparasites from "./pages/Antiparasites";
import Stock from "./pages/Stock";
import Accounting from "./pages/Accounting";
import TestStats from "./pages/TestStats";
import SimpleTest from "./pages/SimpleTest";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import AuthSettings from "./pages/AuthSettings";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <ClientProvider>
            <SettingsProvider>
              <ThemeProvider>
                <BrowserRouter>
                <div className="min-h-screen bg-background">
                  <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={
                      <AuthRedirect>
                        <LoginForm />
                      </AuthRedirect>
                    } />
                    <Route path="/register" element={<Register />} />
                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <VetNavigation />
                        <Dashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/clients" element={
                      <ProtectedRoute>
                        <VetNavigation />
                        <Clients />
                      </ProtectedRoute>
                    } />
                    <Route path="/pets" element={
                      <ProtectedRoute>
                        <VetNavigation />
                        <Pets />
                      </ProtectedRoute>
                    } />
                    <Route path="/appointments" element={
                      <ProtectedRoute>
                        <VetNavigation />
                        <Appointments />
                      </ProtectedRoute>
                    } />
                    <Route path="/consultations" element={
                      <ProtectedRoute>
                        <VetNavigation />
                        <Consultations />
                      </ProtectedRoute>
                    } />
                    <Route path="/history" element={
                      <ProtectedRoute>
                        <VetNavigation />
                        <History />
                      </ProtectedRoute>
                    } />
                    <Route path="/farm" element={
                      <ProtectedRoute>
                        <VetNavigation />
                        <Farm />
                      </ProtectedRoute>
                    } />
                    <Route path="/vaccinations" element={
                      <ProtectedRoute>
                        <VetNavigation />
                        <Vaccinations />
                      </ProtectedRoute>
                    } />
                    <Route path="/antiparasites" element={
                      <ProtectedRoute>
                        <VetNavigation />
                        <Antiparasites />
                      </ProtectedRoute>
                    } />
                    <Route path="/stock" element={
                      <ProtectedRoute>
                        <VetNavigation />
                        <Stock />
                      </ProtectedRoute>
                    } />
                    <Route path="/accounting" element={
                      <ProtectedRoute>
                        <VetNavigation />
                        <Accounting />
                      </ProtectedRoute>
                    } />
                    <Route path="/test-stats" element={
                      <ProtectedRoute>
                        <VetNavigation />
                        <TestStats />
                      </ProtectedRoute>
                    } />
                    <Route path="/simple-test" element={
                      <ProtectedRoute>
                        <VetNavigation />
                        <SimpleTest />
                      </ProtectedRoute>
                    } />
                    <Route path="/settings" element={
                      <ProtectedRoute>
                        <VetNavigation />
                        <Settings />
                      </ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <VetNavigation />
                        <Profile />
                      </ProtectedRoute>
                    } />
                    <Route path="/auth-settings" element={
                      <ProtectedRoute>
                        <VetNavigation />
                        <AuthSettings />
                      </ProtectedRoute>
                    } />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
                </BrowserRouter>
              </ThemeProvider>
            </SettingsProvider>
          </ClientProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;

