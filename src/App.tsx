
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { HouseholdProvider } from "@/hooks/useHousehold";
import { AuthGuard } from "@/components/layout/AuthGuard";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Mission from "./pages/Mission";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <HouseholdProvider>
            <Routes>
              <Route path="/auth" element={
                <AuthGuard requiresAuth={false} requiresHousehold={false}>
                  <Auth />
                </AuthGuard>
              } />
              <Route path="/onboarding" element={
                <AuthGuard requiresHousehold={false}>
                  <Onboarding />
                </AuthGuard>
              } />
              <Route path="/" element={
                <AuthGuard>
                  <Index />
                </AuthGuard>
              } />
              <Route path="/family" element={
                <AuthGuard>
                  <Index />
                </AuthGuard>
              } />
              <Route path="/mission" element={
                <AuthGuard>
                  <Mission />
                </AuthGuard>
              } />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </HouseholdProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
