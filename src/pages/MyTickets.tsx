import { Link, useNavigate } from "react-router-dom";
import BookingLayout from "@/components/BookingLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QrCode, MapPin, Clock, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/http/supabase";
import moment from "moment";

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
  "id": string,
  "booking_reference": string,
  "user_id": string,
  "trip_id": string,
  "phone": string,
  "email": string,
  "total_amount": number,
  "discount_amount": number,
  "final_amount": number,
  "promotion_id": null,
  "pickup_stop": string,
  "dropoff_stop": string,
  "status": string,
  "payment_status": string,
  "payment_method": string,
  "booked_at": string,
  "created_at": string,
  "qr_code": string | null,
  "seat_number": string,
  "seats": { seat_number: string }[],
  trips: {
    "id": string,
    "date": string,
    "price": number,
    "status": string,
    "route_id": string,
    "trip_type": string,
    "bus_number": string,
    "created_at": string,
    "profile_id": string,
    "bus_type_id": string,
    "driver_name": string,
    "total_seats": number,
    "arrival_time": string,
    "departure_time": string,
    "available_seats": number,
    "origin_province_id": string,
    "destination_province_id": string
  }
}

const statusConfig = {
  // upcoming: { label: "กำลังจะถึง", variant: "default" as const },
  // completed: { label: "เสร็จสิ้น", variant: "secondary" as const },
  // cancelled: { label: "ยกเลิก", variant: "destructive" as const },
  pending: { label: "รอชำระเงิน", variant: "default" as const },
  confirmed: { label: "เสร็จสิ้น", variant: "success" as const },
  cancelled: { label: "ยกเลิก", variant: "destructive" as const },
  completed: { label: "เสร็จสิ้น", variant: "success" as const },
};

const MyTicketsPage = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([])

  const getTickets = async () => {
    try {
      const userstr = localStorage.getItem("user")
      const user = JSON.parse(userstr || "{}")
      console.log("user ", user)
      const { data, error } = await supabase.from("bookings")
        .select("* , trips(*) ")
        .eq("user_id", user?.user?.id)
      if (error) {
        throw error
      }
      console.log("data ", data)
      for (const booking of data) {
        const { data: seatData, error: seatError } = await supabase.from("seats_booking")
          .select("seat_number")
          .eq("booking_id", booking.id)
        if (seatError) {
          throw seatError
        }
        booking.seats = seatData
      }
      console.log("ticket data ", data)
      setTickets(data)
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
            <TabsTrigger value="upcoming" className="flex-1">กำลังจะถึง</TabsTrigger>
            <TabsTrigger value="completed" className="flex-1">เสร็จสิ้น</TabsTrigger>
          </TabsList>

          {["all", "upcoming", "completed"].map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-3">
              {tickets
                .filter((t) => tab === "all" || t.status === tab)
                .map((ticket) => (
                  <Link key={ticket.id} to={`/my-tickets/${ticket.id}`}>
                    <Card className="cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all mb-4">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-xs text-muted-foreground">#BOOK-{(ticket.trip_id + moment().format("YYYYMMDD")).toUpperCase().replace("-", "")}</p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <MapPin className="h-3.5 w-3.5 text-primary" />
                              <span className="font-bold">{ticket.trips?.origin_province_id} → {ticket.trips?.destination_province_id}</span>
                            </div>
                          </div>
                          <Badge variant={statusConfig[ticket.status].variant}>
                            {statusConfig[ticket.status].label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{ticket.trips?.date}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {ticket.trips?.departure_time}
                          </span>
                          <span>ที่นั่ง {ticket.seats.map((seat) => seat.seat_number).join(", ")}</span>
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                          <span className="font-bold text-primary">฿{ticket?.final_amount}</span>
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
