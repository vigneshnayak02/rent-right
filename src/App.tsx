import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ensureAdminUser } from "@/integrations/firebase/auth";
import Index from "./pages/Index";
import Bikes from "./pages/Bikes";
import BikeDetails from "./pages/BikeDetails";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Initialize admin user on app start
const AppInitializer = () => {
  useEffect(() => {
    // Ensure admin user exists (will only create if it doesn't exist)
    ensureAdminUser().catch(console.error);
  }, []);
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppInitializer />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/bikes" element={<Bikes />} />
          <Route path="/bike/:id" element={<BikeDetails />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
