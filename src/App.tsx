import { useEffect } from "react";
import liff from "@line/liff";
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
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import BottomNav from "./components/BottomNav";
import PromotionDetail from "./pages/PromotionDetail";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Only initialize LIFF if we are on the production URL specified in VITE_URL
    if (!window.location.href.startsWith(import.meta.env.VITE_URL)) {
      console.log("Not on production URL, skipping LIFF init");
      return;
    }

    liff
      .init({
        liffId: import.meta.env.VITE_LIFF_ID,
      })
      .then(() => {
        console.log("LIFF init succeeded");
        const isLoggedIn = liff.isLoggedIn();
        if(!isLoggedIn){
          liff.login();
        } 
        
        const storedProfile = localStorage.getItem("userProfile");
        if (storedProfile) {
          console.log("Loaded user profile from localStorage:", JSON.parse(storedProfile));
        } else {
          console.log("No user profile found in localStorage");
          liff.getProfile().then((profile) => {
            console.log("User profile:", profile);
            localStorage.setItem("userProfile", JSON.stringify(profile));
          });
        } 
      })
      .catch((e: Error) => {
        console.error("LIFF init failed", e);
      });
  }, []);

  return (
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
          <Route path="/promotions/:promoId" element={<PromotionDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/points" element={<Points />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <BottomNav />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
