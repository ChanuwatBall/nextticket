import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Ticket from "./pages/Ticket";
import SearchResults from "./pages/SearchResults";
import SeatSelection from "./pages/SeatSelection";
import PassengerInfo from "./pages/PassengerInfo";
import Payment from "./pages/Payment";
import ETicket from "./pages/ETicket";
import MyTickets from "./pages/MyTickets";
import TicketDetail from "./pages/TicketDetail";
import Promotions from "./pages/Promotions";
import Profile from "./pages/Profile";
import Points from "./pages/Points";
import Wallet from "./pages/Wallet";
import NotFound from "./pages/NotFound";
import BottomNav from "./components/BottomNav";

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
          <Route path="/e-ticket" element={<ETicket />} />
          <Route path="/my-tickets" element={<MyTickets />} />
          <Route path="/my-tickets/:ticketId" element={<TicketDetail />} />
          <Route path="/promotions" element={<Promotions />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/points" element={<Points />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <BottomNav />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
