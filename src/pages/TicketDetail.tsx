import { useParams, Link } from "react-router-dom";
import BookingLayout from "@/components/BookingLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { QrCode, MapPin, Clock, Bus, User, CreditCard, ArrowLeft, Download, Mail, Phone, IdCard } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/http/supabase";

const mockTicketDetails: Record<string, {
  id: string;
  origin: string;
  destination: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  seats: string[];
  status: "upcoming" | "completed" | "cancelled";
  total: number;
  boardingPoint: string;
  dropOffPoint: string;
  busType: string;
  tripType: string;
  busPlate: string;
  routeName: string;
  paymentMethod: string;
  promoCode: string;
  discount: number;
  pricePerSeat: number;
  bookingDate: string;
  passengers: { fullName: string; thaiId: string; phone: string; seatNumber: string; passengerType: string }[];
}> = {
  NEX001: {
    id: "NEX001",
    origin: "กรุงเทพฯ",
    destination: "เชียงใหม่",
    date: "2026-03-05",
    departureTime: "20:00",
    arrivalTime: "06:00",
    seats: ["12", "13"],
    status: "upcoming",
    total: 1300,
    boardingPoint: "หมอชิต 2",
    dropOffPoint: "อาเขต",
    busType: "VIP 32 ที่นั่ง",
    tripType: "ด่วนพิเศษ",
    busPlate: "10-1234 กรุงเทพฯ",
    routeName: "สายเหนือ",
    paymentMethod: "QR PromptPay",
    promoCode: "",
    discount: 0,
    pricePerSeat: 650,
    bookingDate: "2026-03-01 14:32",
    passengers: [
      { fullName: "สมชาย ใจดี", thaiId: "1-1001-XXXXX-XX-1", phone: "081-234-5678", seatNumber: "12", passengerType: "male" },
      { fullName: "สมหญิง ใจดี", thaiId: "1-1001-XXXXX-XX-2", phone: "089-876-5432", seatNumber: "13", passengerType: "female" },
    ],
  },
  NEX002: {
    id: "NEX002",
    origin: "กรุงเทพฯ",
    destination: "หาดใหญ่",
    date: "2026-02-20",
    departureTime: "18:00",
    arrivalTime: "07:00",
    seats: ["5"],
    status: "completed",
    total: 850,
    boardingPoint: "สายใต้ใหม่",
    dropOffPoint: "สถานีขนส่งหาดใหญ่",
    busType: "VIP 24 ที่นั่ง",
    tripType: "ด่วนพิเศษ",
    busPlate: "30-5678 กรุงเทพฯ",
    routeName: "สายใต้",
    paymentMethod: "บัตรเครดิต",
    promoCode: "SOUTH50",
    discount: 50,
    pricePerSeat: 900,
    bookingDate: "2026-02-18 09:15",
    passengers: [
      { fullName: "วิชัย สุขสม", thaiId: "1-2003-XXXXX-XX-5", phone: "062-111-2222", seatNumber: "5", passengerType: "male" },
    ],
  },
  NEX003: {
    id: "NEX003",
    origin: "กรุงเทพฯ",
    destination: "อุดรธานี",
    date: "2026-02-10",
    departureTime: "19:00",
    arrivalTime: "05:00",
    seats: ["22"],
    status: "cancelled",
    total: 480,
    boardingPoint: "หมอชิต 2",
    dropOffPoint: "สถานีขนส่งอุดร",
    busType: "ป.1 (ป.อ.)",
    tripType: "ปรับอากาศ",
    busPlate: "20-9012 กรุงเทพฯ",
    routeName: "สายอีสาน",
    paymentMethod: "E-Wallet",
    promoCode: "",
    discount: 0,
    pricePerSeat: 480,
    bookingDate: "2026-02-08 20:45",
    passengers: [
      { fullName: "พระมหาสมบูรณ์", thaiId: "3-4005-XXXXX-XX-9", phone: "095-333-4444", seatNumber: "22", passengerType: "monk" },
    ],
  },
};

const statusConfig = {
  upcoming: { label: "กำลังจะถึง", variant: "default" as const, color: "text-primary" },
  completed: { label: "เสร็จสิ้น", variant: "secondary" as const, color: "text-muted-foreground" },
  cancelled: { label: "ยกเลิก", variant: "destructive" as const, color: "text-destructive" },
};

const passengerTypeLabels: Record<string, string> = {
  male: "ชาย",
  female: "หญิง",
  child: "เด็ก",
  monk: "พระสงฆ์",
};

const TicketDetail = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const [ticket, setTicket] = useState(null)
  // ticketId ? mockTicketDetails[ticketId] : null;
  useEffect(() => {
    const fetchTicket = async () => {
      const { data, error } = await supabase.from("bookings").select("*").eq("id", ticketId);
      if (error) {
        console.error("Error fetching ticket:", error);
        return;
      }
      console.log("booking id ", data)
      setTicket(data[0]);
    };
    fetchTicket();
  }, [ticketId]);

  if (!ticket) {
    return (
      <BookingLayout showSteps={false} title="รายละเอียดตั๋ว">
        <div className="px-4 py-12 text-center">
          <p className="text-muted-foreground">ไม่พบข้อมูลตั๋ว</p>
          <Link to="/my-tickets" className="text-primary font-medium mt-2 inline-block">กลับหน้าตั๋วของฉัน</Link>
        </div>
      </BookingLayout>
    );
  }

  const status = statusConfig[ticket.status];

  return (
    <BookingLayout showSteps={false} title="รายละเอียดตั๋ว">
      <div className="px-4 space-y-4 pb-6">
        {/* Route Header */}
        <Card className="overflow-hidden">
          <div className="bg-primary text-primary-foreground px-4 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs opacity-80">#{ticket.id}</span>
              <Badge variant={status.variant} className="text-xs">{status.label}</Badge>
            </div>
            <div className="flex items-center gap-2 text-lg font-bold">
              <MapPin className="h-5 w-5 shrink-0" />
              {ticket.origin} → {ticket.destination}
            </div>
            <p className="text-sm opacity-80 mt-1">{ticket.routeName} · {ticket.tripType}</p>
          </div>

          {/* QR for upcoming */}
          {ticket.status === "upcoming" && (
            <div className="flex flex-col items-center py-5 bg-card">
              <div className="border-2 border-border rounded-xl p-3 mb-2">
                <QrCode className="h-28 w-28 text-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">แสดง QR Code นี้เมื่อขึ้นรถ</p>
            </div>
          )}
        </Card>

        {/* Trip Info */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="font-bold text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              ข้อมูลเที่ยวรถ
            </h3>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <span className="text-muted-foreground">วันที่เดินทาง</span>
              <span className="text-right font-medium">{ticket.date}</span>
              <span className="text-muted-foreground">เวลาออก</span>
              <span className="text-right font-medium">{ticket.departureTime} น.</span>
              <span className="text-muted-foreground">เวลาถึง (โดยประมาณ)</span>
              <span className="text-right font-medium">{ticket.arrivalTime} น.</span>
              <span className="text-muted-foreground">จุดขึ้นรถ</span>
              <span className="text-right font-medium">{ticket.boardingPoint}</span>
              <span className="text-muted-foreground">จุดลงรถ</span>
              <span className="text-right font-medium">{ticket.dropOffPoint}</span>
            </div>
          </CardContent>
        </Card>

        {/* Bus Info */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="font-bold text-base flex items-center gap-2">
              <Bus className="h-4 w-4 text-primary" />
              ข้อมูลรถ
            </h3>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <span className="text-muted-foreground">ประเภทรถ</span>
              <span className="text-right font-medium">{ticket.busType}</span>
              <span className="text-muted-foreground">ทะเบียนรถ</span>
              <span className="text-right font-medium">{ticket.busPlate}</span>
              <span className="text-muted-foreground">ที่นั่ง</span>
              <span className="text-right font-medium">
                {/* {ticket.seats.join(", ")} */}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Passengers */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="font-bold text-base flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              ผู้โดยสาร ({ticket.passengers.length} คน)
            </h3>
            <div className="space-y-3">
              {ticket.passengers.map((p, i) => (
                <div key={i} className="rounded-lg bg-muted/50 p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{p.fullName}</span>
                    <Badge variant="outline" className="text-xs">
                      ที่นั่ง {p.seatNumber}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 gap-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <IdCard className="h-3 w-3" />
                      {p.thaiId}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-3 w-3" />
                      {p.phone}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <User className="h-3 w-3" />
                      {passengerTypeLabels[p.passengerType] || p.passengerType}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Booking & Payment Info */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="font-bold text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              ข้อมูลการจอง
            </h3>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <span className="text-muted-foreground">วันที่จอง</span>
              <span className="text-right font-medium">{ticket.bookingDate}</span>
              <span className="text-muted-foreground">ช่องทางชำระ</span>
              <span className="text-right font-medium">{ticket.paymentMethod}</span>
              <span className="text-muted-foreground">ราคา/ที่นั่ง</span>
              <span className="text-right font-medium">฿{ticket.pricePerSeat.toLocaleString()}</span>
              <span className="text-muted-foreground">จำนวนที่นั่ง</span>
              <span className="text-right font-medium">{ticket.seats.length}</span>
              {ticket.promoCode && (
                <>
                  <span className="text-muted-foreground">โค้ดส่วนลด</span>
                  <span className="text-right font-medium text-success">{ticket.promoCode}</span>
                  <span className="text-muted-foreground">ส่วนลด</span>
                  <span className="text-right font-medium text-success">-฿{ticket.discount}</span>
                </>
              )}
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>ยอดชำระ</span>
              <span className="text-primary">฿{ticket.total.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        {ticket.status === "upcoming" && (
          <div className="space-y-2">
            <Button variant="outline" className="w-full h-11">
              <Download className="mr-2 h-4 w-4" />
              ดาวน์โหลด PDF
            </Button>
            <Button variant="outline" className="w-full h-11">
              <Mail className="mr-2 h-4 w-4" />
              ส่งไปยังอีเมล
            </Button>
          </div>
        )}

        <Link to="/my-tickets">
          <Button variant="ghost" className="w-full h-11">
            <ArrowLeft className="mr-2 h-4 w-4" />
            กลับหน้าตั๋วของฉัน
          </Button>
        </Link>
      </div>
    </BookingLayout>
  );
};

export default TicketDetail;
