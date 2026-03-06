import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BookingLayout from "@/components/BookingLayout";
import { useBookingStore } from "@/store/bookingStore";
import { provinces, boardingPoints } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Timer, QrCode, Wallet, AlertCircle } from "lucide-react";

const TIMER_SECONDS = 15 * 60; // 15 minutes

const PaymentPage = () => {
  const navigate = useNavigate();
  const store = useBookingStore();
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [processing, setProcessing] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const tripPrice = store.selectedTrip?.price ?? 0;
  const subtotal = tripPrice * store.selectedSeats.length;
  const total = Math.max(0, subtotal - store.discount);

  useEffect(() => {
    if (total > 0) {
      setQrLoading(true);
      setQrError(null);
      axios.post('http://localhost:8081/api/payment/qr', { },{
        params:{ amount: total}
      })
        .then(async (response) => {
          console.log("QR Data:", response);
          await getCharge(response.data.chargeId);
          // setQrData(response.data);
        })
        .catch((err) => {
          setQrError(err.message);
        })
        .finally(() => {
          setQrLoading(false);
        });
    }
  }, [total]);

  const getCharge=(chargeId) => {
    axios.get('http://localhost:8081/api/payment/transaction/'+chargeId )
      .then((response) => {
        console.log("Charge Status:", response);
        let qrurl = response.data.charge.source.scannable_code.image.download_uri;
        setQrData(qrurl);
      })
      .catch((err) => {
        setQrError(err.message);
      });
  };

  const originName = provinces.find((p) => p.id === store.originProvinceId)?.name ?? "";
  const destName = provinces.find((p) => p.id === store.destinationProvinceId)?.name ?? "";
  const boardingName = boardingPoints.find((b) => b.id === store.boardingPointId)?.name ?? "";
  const dropOffName = boardingPoints.find((b) => b.id === store.dropOffPointId)?.name ?? "";

  const handlePay = useCallback(() => {
    setProcessing(true);
    store.setPaymentStatus("pending");
    store.setBookingId(`NEX${Date.now().toString(36).toUpperCase()}`);

    // Simulate payment processing
    setTimeout(() => {
      store.setPaymentStatus("success");
      navigate("/e-ticket");
    }, 3000);
  }, [navigate, store]);

  if (timeLeft === 0) {
    return (
      <BookingLayout currentStep={5} title="หมดเวลา">
        <div className="px-4 text-center py-16">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-destructive" />
          <h3 className="text-xl font-bold mb-2">หมดเวลาชำระเงิน</h3>
          <p className="text-muted-foreground mb-6">กรุณาทำรายการใหม่อีกครั้ง</p>
          <Button onClick={() => { store.reset(); navigate("/"); }} className="h-12 px-8">
            กลับหน้าแรก
          </Button>
        </div>
      </BookingLayout>
    );
  }

  if (processing) {
    return (
      <BookingLayout currentStep={5} showSteps={false}>
        <div className="px-4 text-center py-16">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">กำลังดำเนินการชำระเงิน...</h3>
          <p className="text-muted-foreground">กรุณารอสักครู่</p>
        </div>
      </BookingLayout>
    );
  }

  return (
    <BookingLayout currentStep={5} title="ชำระเงิน">
      <div className="px-4 space-y-4">
        {/* Timer */}
        <div className="bg-destructive/10 rounded-lg p-3 flex items-center gap-2 text-sm">
          <Timer className="h-4 w-4 text-destructive" />
          <span>กรุณาชำระภายใน</span>
          <span className="font-bold text-destructive ml-auto text-lg">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
        </div>

        {/* Booking Summary */}
        <Card>
          <CardContent className="p-4 space-y-2 text-sm">
            <h3 className="font-bold text-base mb-2">สรุปการจอง</h3>
            <div className="flex justify-between"><span className="text-muted-foreground">เส้นทาง</span><span>{originName} → {destName}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">วันที่</span><span>{store.travelDate}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">เวลา</span><span>{store.selectedTrip?.departureTime} - {store.selectedTrip?.arrivalTime}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">จุดขึ้นรถ</span><span>{boardingName}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">จุดลงรถ</span><span>{dropOffName}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">ที่นั่ง</span><span>{store.selectedSeats.map((s) => s.number).join(", ")}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">ประเภทรถ</span><span>{store.selectedTrip?.busType}</span></div>
            <div className="border-t border-border pt-2 mt-2">
              <div className="flex justify-between"><span>ราคาตั๋ว × {store.selectedSeats.length}</span><span>฿{subtotal}</span></div>
              {store.discount > 0 && <div className="flex justify-between text-primary"><span>ส่วนลด</span><span>-฿{store.discount}</span></div>}
              <div className="flex justify-between font-bold text-lg mt-1"><span>ยอดชำระ</span><span className="text-primary">฿{total}</span></div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-bold text-base mb-3">เลือกวิธีชำระเงิน</h3>
            <RadioGroup value={store.paymentMethod} onValueChange={store.setPaymentMethod} className="space-y-3">
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                <RadioGroupItem value="qr" id="qr" />
                <Label htmlFor="qr" className="flex items-center gap-2 cursor-pointer flex-1">
                  <QrCode className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">QR Payment</div>
                    <div className="text-xs text-muted-foreground">สแกนจ่ายผ่าน Mobile Banking</div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                <RadioGroupItem value="wallet" id="wallet" />
                <Label htmlFor="wallet" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Wallet className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">E-Wallet</div>
                    <div className="text-xs text-muted-foreground">ชำระด้วยกระเป๋าเงิน</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* QR Code Display */}
        {store.paymentMethod === 'qr' && (
          <Card>
            <CardContent className="p-4 text-center">
              <h3 className="font-bold text-base mb-3">สแกน QR Code เพื่อชำระเงิน</h3>
              {qrLoading && <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />}
              {qrError && <p className="text-destructive">Error loading QR code: {qrError}</p>}
              {qrData && qrData && (
                <img src={qrData} alt="QR Code for Payment" className="mx-auto max-w-xs" />
              )}
              {qrData && (
                <div className="mt-3 text-sm text-muted-foreground">
                  <p>Amount: ฿{qrData.amount}</p>
                  <p>Status: {qrData.chargeStatus}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Button
          onClick={handlePay}
          disabled={!store.paymentMethod}
          className="w-full h-14 text-lg font-bold"
          size="lg"
        >
          ชำระเงิน ฿{total}
        </Button>
      </div>
    </BookingLayout>
  );
};

export default PaymentPage;
