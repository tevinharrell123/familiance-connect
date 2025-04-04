
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Household from "./pages/Household";
import Mission from "./pages/Mission";
import Goals from "./pages/Goals";
import Tasks from "./pages/Tasks";
import NotFound from "./pages/NotFound";
import Calendar from "./pages/Calendar";
import Finances from "./pages/Finances";

const queryClient = new QueryClient();

function App() {
  return (
    <div className="app">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/household" element={<Household />} />
                <Route path="/mission" element={<Mission />} />
                <Route path="/goals" element={<Goals />} />
                <Route path="/goals/:goalId" element={<Goals />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/tasks/:goalId" element={<Navigate to="/tasks" replace />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/finances" element={<Finances />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;
