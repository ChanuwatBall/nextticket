import { Link, useNavigate } from "react-router-dom";
import BookingLayout from "@/components/BookingLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QrCode, MapPin, Clock, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/http/supabase";
import moment from "moment";
import { bookingList } from "@/services/api";
import { toast } from "sonner";

const mockTickets = [
  {
    id: "NEX001",
    origin: "กรุงเทพฯ",
    destination: "เชียงใหม่",
    date: "2026-03-05",
    departureTime: "20:00",
    arrivalTime: "06:00",
    seats: ["12", "13"],
    status: "upcoming" as const,
    total: 1300,
  },
  {
    id: "NEX002",
    origin: "กรุงเทพฯ",
    destination: "หาดใหญ่",
    date: "2026-02-20",
    departureTime: "18:00",
    arrivalTime: "07:00",
    seats: ["5"],
    status: "completed" as const,
    total: 850,
  },
  {
    id: "NEX003",
    origin: "กรุงเทพฯ",
    destination: "อุดรธานี",
    date: "2026-02-10",
    departureTime: "19:00",
    arrivalTime: "05:00",
    seats: ["22"],
    status: "cancelled" as const,
    total: 480,
  },
];

type Ticket = {
  "id": "932a4e43-7b01-4ff2-abdc-4cf1e26f60a5",
  "origin": "กรุงเทพฯ",
  "destination": "ขอนแก่น",
  "date": "2026-04-05",
  "departureTime": "21:30",
  "arrivalTime": "03:30",
  "seats": [],
  "status": "completed",
  "total": 480
}

const statusConfig = {
  pending: { label: "กำลังจะถึง", variant: "default" as const },
  confirmed: { label: "เสร็จสิ้น", variant: "success" as const },
  cancelled: { label: "ยกเลิก", variant: "destructive" as const },
  expired: { label: "หมดเวลาชำระเงิน", variant: "outline" as const },
};

const MyTicketsPage = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([])

  const getTickets = async () => {
    try {
      const bookings = await bookingList()
      if (bookings.error) {
        toast.error("ไม่สามารถดึงข้อมูลตั๋วได้ " + bookings.error)
        return
      }
      console.log("bookings ", bookings)

      setTickets(bookings)

    } catch (error) {
      console.log("error ", error)
    }
  }

  useEffect(() => {
    getTickets()
  }, [])
  return (
    <BookingLayout showSteps={false} title="ตั๋วของฉัน" navto={() => navigate(-1)}  >
      <div className="px-4">
        <Tabs defaultValue="all">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="all" className="flex-1">ทั้งหมด</TabsTrigger>
            <TabsTrigger value="pending" className="flex-1">กำลังจะถึง</TabsTrigger>
            <TabsTrigger value="confirmed" className="flex-1">เสร็จสิ้น</TabsTrigger>
          </TabsList>

          {["all", "pending", "confirmed"].map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-3">
              {tickets
                .filter((t) => tab === "all" || t.status === tab)
                .map((ticket) => (
                  <Link key={ticket.id} to={`/my-tickets/${ticket.id}`}>
                    <Card className={`cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all mb-4 ${ticket.status}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-xs text-muted-foreground">#{(ticket.id).substring(0, 8).toUpperCase()}</p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <MapPin className="h-3.5 w-3.5 text-primary" />
                              <span className="font-bold">{ticket.origin} → {ticket.destination}</span>
                            </div>
                          </div>
                          <Badge variant={statusConfig[ticket.status].variant}>
                            {statusConfig[ticket.status].label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{ticket.date}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {ticket.departureTime}
                          </span>
                          <span>ที่นั่ง {ticket.seats.map((seat) => seat).join(", ")}</span>
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                          <span className="font-bold text-primary">฿{ticket?.total}</span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </BookingLayout>
  );
};

export default MyTicketsPage;
