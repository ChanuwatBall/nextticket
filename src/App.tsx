import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Ticket from "./pages/Ticket";
import SearchResults from "./pages/SearchResults";
import SeatSelection from "./pages/SeatSelection";
import PassengerInfo from "./pages/PassengerInfo";
import Payment from "./pages/Payment";
import ETicket from "./pages/ETicket";
import MyTickets from "./pages/MyTickets";
import Promotions from "./pages/Promotions";
import NotFound from "./pages/NotFound";
import BottomNav from "./components/BottomNav";
import Home from "./pages/Home";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ticket" element={<Ticket />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/seats" element={<SeatSelection />} />
          <Route path="/passengers" element={<PassengerInfo />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/ticket" element={<ETicket />} />
          <Route path="/my-tickets" element={<MyTickets />} />
          <Route path="/promotions" element={<Promotions />} />
          <Route path="*" element={<NotFound />} />

        </Routes>
        <BottomNav />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
