import BookingLayout from "@/components/BookingLayout";
import { useBookingStore } from "@/store/bookingStore";
import { provinces, boardingPoints } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Download, Mail, QrCode } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ETicketPage = () => {
  const store = useBookingStore();
  const navigate = useNavigate();

  const originName = provinces.find((p) => p.id === store.originProvinceId)?.name ?? "";
  const destName = provinces.find((p) => p.id === store.destinationProvinceId)?.name ?? "";
  const boardingName = boardingPoints.find((b) => b.id === store.boardingPointId)?.name ?? "";
  const dropOffName = boardingPoints.find((b) => b.id === store.dropOffPointId)?.name ?? "";
  const tripPrice = store.selectedTrip?.price ?? 0;
  const total = Math.max(0, tripPrice * store.selectedSeats.length - store.discount);

  return (
    <BookingLayout showSteps={false}>
      <div className="px-4 space-y-4 pt-4">
        {/* Success Header */}
        <div className="text-center py-4">
          <CheckCircle className="h-16 w-16 mx-auto mb-3 text-[hsl(var(--success))]" />
          <h2 className="text-2xl font-bold">การจองสำเร็จ!</h2>
          <p className="text-muted-foreground mt-1">หมายเลขการจอง: <span className="font-bold text-foreground">{store.bookingId}</span></p>
        </div>

        {/* QR Code mock */}
        <Card>
          <CardContent className="p-6 flex flex-col items-center">
            <div className="bg-card border-2 border-border rounded-xl p-4 mb-3">
              <QrCode className="h-32 w-32 text-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">แสดง QR Code นี้เมื่อขึ้นรถ</p>
          </CardContent>
        </Card>

        {/* Booking Details */}
        <Card>
          <CardContent className="p-4 space-y-2 text-sm">
            <h3 className="font-bold text-base mb-2">รายละเอียดการจอง</h3>
            <div className="flex justify-between"><span className="text-muted-foreground">เส้นทาง</span><span className="font-medium">{originName} → {destName}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">วันที่</span><span>{store.travelDate}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">เวลา</span><span>{store.selectedTrip?.departureTime} - {store.selectedTrip?.arrivalTime}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">จุดขึ้นรถ</span><span>{boardingName}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">จุดลงรถ</span><span>{dropOffName}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">ที่นั่ง</span><span>{store.selectedSeats.map((s) => s.number).join(", ")}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">ประเภทรถ</span><span>{store.selectedTrip?.busType}</span></div>
            <div className="border-t border-border pt-2 mt-2">
              <div className="flex justify-between font-bold text-lg"><span>ยอดชำระ</span><span className="text-primary">฿{total}</span></div>
            </div>
          </CardContent>
        </Card>

        {/* Passenger List */}
        {store.passengers.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-bold text-base mb-2">ผู้โดยสาร</h3>
              {store.passengers.map((p, i) => (
                <div key={i} className="flex justify-between text-sm py-1 border-b border-border last:border-0">
                  <span>{p.fullName}</span>
                  <span className="text-muted-foreground">ที่นั่ง {p.seatNumber}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button variant="outline" className="w-full h-12" onClick={() => {}}>
            <Download className="mr-2 h-4 w-4" />
            ดาวน์โหลด PDF
          </Button>
          <Button variant="outline" className="w-full h-12" onClick={() => {}}>
            <Mail className="mr-2 h-4 w-4" />
            ส่งไปยังอีเมล
          </Button>
          <Button
            className="w-full h-12 font-bold"
            onClick={() => { store.reset(); navigate("/"); }}
          >
            กลับหน้าแรก
          </Button>
        </div>
      </div>
    </BookingLayout>
  );
};

export default ETicketPage;
