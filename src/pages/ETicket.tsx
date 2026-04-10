import BookingLayout from "@/components/BookingLayout";
import { useBookingStore } from "@/store/bookingStore";
import { provinces, boardingPoints } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ClockAlert, Download, Mail } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { bookingDetail } from "@/services/api";
import QRCode from "qrcode";

const ETicketPage = () => {
  const { bookingref } = useParams<{ bookingref: string }>();
  const store = useBookingStore();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);

  const originName = store.originProvinceId?.name
  const destName = store.destinationProvinceId?.name
  const boardingName = store.boardingPointId?.name
  const dropOffName = store.dropOffPointId?.name
  const tripPrice = store.selectedTrip?.price ?? 0;
  const total = Math.max(0, tripPrice * store.selectedSeats.length - store.discount);

  const continueBooking = () => {
    navigate("/ticket");
  }

  const conf = async () => {
    const userstr = localStorage.getItem("user")
    const user = JSON.parse(userstr)
    const res = await bookingDetail({ id: bookingref, token: user.token })
    console.log("res ", res)
    if (res?.error !== undefined) {
      console.log("error booking detail")
    }
    // const qrBookingPayload = JSON.stringify({
    //   booking_id: res.bookingReference
    // });
    const qrBookingCode = await QRCode.toDataURL("nex-ticket.com#" + res.bookingReference);
    setQrCode(qrBookingCode)
    setBooking(res)
    // store.setBookingQrcode(qrBookingCode);


  }
  useEffect(() => {
    console.log("bookingref ", bookingref)
    if (bookingref) {
      conf()
    }
  }, [])
  return (
    <BookingLayout showSteps={false} navto={() => navigate(-1)}>
      <div className="px-4 space-y-4 pt-4">
        {/* Success Header */}
        <div className="text-center py-4">
          {booking?.paymentStatus === "paid" ?
            <CheckCircle className="h-16 w-16 mx-auto mb-3 text-[hsl(var(--success))]" /> :
            <ClockAlert className="h-16 w-16 mx-auto mb-3 text-[hsl(var(--destructive))]" />
          }
          <h2 className="text-2xl font-bold"> {booking?.paymentStatus === "paid" ? "การจองสำเร็จ!" : "การจองไม่สำเร็จ"}</h2>
          {booking?.paymentStatus === "paid" && <p className="text-muted-foreground mt-1">หมายเลขการจอง: <span className="font-bold text-foreground">{booking.bookingReference}</span></p>}
        </div>

        {booking?.paymentStatus === "paid" && <Card>
          <CardContent className="p-6 flex flex-col items-center">
            <div className="bg-card border-2 border-border rounded-xl p-4 mb-3">
              <img src={qrCode} alt="QR Code" />
            </div>
            <p className="text-sm text-muted-foreground">แสดง QR Code นี้เมื่อขึ้นรถ</p>
          </CardContent>
        </Card>}

        {/* Booking Details */}

        <Card>
          <CardContent className="p-4 space-y-2 text-sm">
            <h3 className="font-bold text-base mb-2">รายละเอียดการจอง</h3>
            <div className="flex justify-between"><span className="text-muted-foreground">เส้นทาง</span><span className="font-medium">{booking?.routeName}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">วันที่</span><span>{booking?.date}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">เวลา</span><span>{booking?.departureTime} - {booking?.arrivalTime}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">จุดขึ้นรถ</span><span>{booking?.boardingPoint}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">จุดลงรถ</span><span>{booking?.dropOffPoint}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">ที่นั่ง</span><span>{booking?.passengers.map((s: any) => s.seatNumber).join(", ")}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">ประเภทรถ</span><span>{booking?.busType}</span></div>
            {store?.paymentStatus === "success" && <div className="border-t border-border pt-2 mt-2">
              <div className="flex justify-between font-bold text-lg"><span>ยอดชำระ</span><span className="text-primary">฿{booking?.total}</span></div>
            </div>}
          </CardContent>
        </Card>


        {/* Passenger List */}
        {booking?.paymentStatus === "paid" && booking?.passengers.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-bold text-base mb-2">ผู้โดยสาร</h3>
              {booking?.passengers.map((p, i) => (
                <div key={i} className="flex justify-between text-sm py-1 border-b border-border last:border-0">
                  <span>{p.fullName}</span>
                  <span className="text-muted-foreground">ที่นั่ง {p.seatNumber}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        {booking?.paymentStatus === "paid" && (
          <div className="space-y-2">
            <Button variant="outline" className="w-full h-12" onClick={() => { }}>
              <Download className="mr-2 h-4 w-4" />
              ดาวน์โหลด PDF
            </Button>
            <Button variant="outline" className="w-full h-12" onClick={() => { }}>
              <Mail className="mr-2 h-4 w-4" />
              ส่งไปยังอีเมล
            </Button>

          </div>)}
        <div className="space-y-2 pt-4">
          {booking?.paymentStatus !== "paid" &&
            <Button className="w-full h-12 font-bold" onClick={() => { continueBooking(); }}>
              ทำรายการใหม่
            </Button>
          }
          <Button
            className="w-full h-12 font-bold" variant="outline"
            onClick={() => { store.reset(); navigate("/"); }}
          >
            กลับหน้าแรก
          </Button>
        </div>
        <div style={{ width: "100%", height: "5rem" }}></div>
      </div>
    </BookingLayout>
  );
};

export default ETicketPage;
