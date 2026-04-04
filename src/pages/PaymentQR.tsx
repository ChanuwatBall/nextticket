import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import BookingLayout from "@/components/BookingLayout";
import PageTransition from "@/components/PageTransition";
import { useBookingStore } from "@/store/bookingStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Timer, AlertCircle, CheckCircle2 } from "lucide-react";
import { createCharge, cancelCharge } from "@/services/api";
import liff from "@line/liff";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/http/supabase";

const TIMER_SECONDS = 15 * 60; // 15 minutes

const PaymentQRPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const store = useBookingStore();

  // ดึง Base URL ของ API (เช่น http://localhost:8080)
  const baseUrl = import.meta.env.VITE_SOCKET_URL;

  const { sourceType, total, bookingDetail, bookingBody } = (location.state as any) || {
    sourceType: "promptpay",
    total: 0,
  };

  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(true);
  const [qrError, setQrError] = useState<string | null>(null);
  const [chargeId, setChargeId] = useState<string | null>(null);
  const [chargeStatus, setChargeStatus] = useState<string>("pending");
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  // ใช้ Ref เพื่อเก็บ instance ของ WebSocket Client ไม่ให้หายไปเมื่อ Re-render
  const stompClientRef = useRef<Client | null>(null);

  // --- ฟังก์ชันเชื่อมต่อ WebSocket ---
  const connectWebSocket = useCallback((id: string) => {
    // 1. ตรวจสอบว่ามี connection เดิมอยู่หรือไม่ ถ้ามีให้ปิดก่อน
    if (stompClientRef.current) {
      stompClientRef.current.deactivate();
    }

    const socketUrl = baseUrl.replace("https", "wss");
    // 2. ตั้งค่า Client
    const client = new Client({
      brokerURL: `${socketUrl}/ws-payment`,

      debug: (msg) => console.log("STOMP:", msg),
      reconnectDelay: 5000, // ลองต่อใหม่ทุก 5 วินาทีถ้าหลุด
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log("Connected to WebSocket for Order:", id);

        // Subscribe ท่อที่ตรงกับ ID (ต้องตรงกับ Java: /topic/order/{id})
        client.subscribe(`/topic/order/${id}`, (message) => {
          const payload = JSON.parse(message.body);
          console.log("Payment Notification:", payload);

          const status = payload.status.toLowerCase();

          // อัปเดตสถานะเพื่อเปลี่ยน UI
          if (status === "success") {
            setChargeStatus("successful");
            store.setPaymentStatus("success");
            store.setBookingId(`NEX${Date.now().toString(36).toUpperCase()}`);

            // หน่วงเวลาให้ User เห็น CheckCircle ก่อนเปลี่ยนหน้า
            setTimeout(() => navigate("/e-ticket"), 2000);
          } else if (status === "failed") {
            setChargeStatus("failed");
            store.setPaymentStatus("failed");
          }
        });
      },
      onStompError: (frame) => {
        console.error("STOMP Error:", frame);
      }
    });

    client.activate();
    stompClientRef.current = client;
  }, [baseUrl, navigate, store]);

  // --- Countdown Timer ---
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // --- Create Charge & Start WebSocket ---
  useEffect(() => {
    if (total <= 0) return;

    const initPayment = async () => {
      setQrLoading(true);
      setQrError(null);
      try {
        const response: any = await createCharge(total, sourceType, bookingDetail);
        const id = response.data.sourceId;
        const orderId = response.data.sourceId || id; // ใช้ order_id จาก metadata

        setChargeId(response.data?.chargeId);
        setQrUrl(response.data.qrCodeUrl);

        await supabase.from("bookings").insert({
          booking_reference: id,
          user_id: liff.getProfile().then((profile) => profile.userId),
          trip_id: bookingBody?.tripId,
          phone: bookingBody?.passengers[0].phone,
          email: "",
          total_amount: total,
          discount_amount: 0,
          final_amount: total,
          promotion_id: "",
          pickup_stop: bookingBody?.boardingPointId,
          dropoff_stop: bookingBody?.dropOffPointId,
          status: "booking",
          payment_status: "pending",
          payment_method: "promptpay",
          booked_at: new Date().toISOString(),
        });
        // เปลี่ยนจากการทำ Interval มาใช้ WebSocket แทน
        connectWebSocket(orderId);
      } catch (err: any) {
        setQrError(err.message);
      } finally {
        setQrLoading(false);
      }
    };

    initPayment();

    // Cleanup: เมื่อออกจากหน้า ให้ปิด WebSocket ทันที
    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [total, sourceType, connectWebSocket]);

  const handleDownloadQR = useCallback(() => {
    if (!qrUrl) return;
    if (liff.isInClient && liff.isInClient()) {
      liff.openWindow({ url: qrUrl, external: true });
    } else {
      const link = document.createElement("a");
      link.href = qrUrl;
      link.download = `qr-code-${chargeId}.png`;
      link.click();
    }
  }, [qrUrl, chargeId]);

  const handleCancelCharge = async () => {
    if (chargeId) await cancelCharge(chargeId).catch(console.error);
    if (stompClientRef.current) stompClientRef.current.deactivate();
    navigate(-1);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // --- Render logic ---
  if (timeLeft === 0 && chargeStatus !== "successful" && chargeStatus !== "faild") {
    return (
      <BookingLayout currentStep={5} navto={() => navigate(-1)} title="หมดเวลา" showSteps={false}>
        <div className="px-4 text-center py-16">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-destructive" />
          <h3 className="text-xl font-bold mb-2">หมดเวลาชำระเงิน</h3>
          <p className="text-muted-foreground mb-6">กรุณาทำรายการใหม่อีกครั้ง</p>
          <Button onClick={() => { store.reset(); navigate("/"); }} className="h-12 px-8">กลับหน้าแรก</Button>
        </div>
      </BookingLayout>
    );
  }

  if (chargeStatus === "failed") {
    return (
      <BookingLayout currentStep={5} navto={() => navigate(-1)} title="ชำระเงินไม่สำเร็จ" showSteps={false}>
        <div className="px-4 text-center py-16">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-destructive" />
          <h3 className="text-xl font-bold mb-2">ชำระเงินไม่สำเร็จ!</h3>
          <p className="text-muted-foreground">กรุณาทำรายการใหม่อีกครั้ง</p><br />
          <Button onClick={() => { store.reset(); navigate("/"); }} className="h-12 px-8">กลับหน้าแรก</Button>
        </div>
      </BookingLayout>
    );
  }

  if (chargeStatus === "successful") {
    return (
      <BookingLayout currentStep={5} navto={() => navigate(-1)} title="ชำระเงินสำเร็จ" showSteps={false}>
        <div className="px-4 text-center py-16">
          <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-500" />
          <h3 className="text-xl font-bold mb-2">ชำระเงินสำเร็จ!</h3>
          <p className="text-muted-foreground">กำลังนำไปยังหน้า E-Ticket...</p>
        </div>
      </BookingLayout>
    );
  }

  return (
    <BookingLayout currentStep={5} navto={() => navigate(-1)} title="สแกน QR ชำระเงิน" showSteps={false}>
      <div className="px-4 space-y-4">
        <div className="bg-destructive/10 rounded-lg p-3 flex items-center gap-2 text-sm">
          <Timer className="h-4 w-4 text-destructive" />
          <span>กรุณาชำระภายใน</span>
          <span className="font-bold text-destructive ml-auto text-lg">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
        </div>

        <Card>
          <CardContent className="p-4 text-center space-y-4 border-none">
            {qrLoading ? (
              <div className="py-8">
                <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                <p className="text-sm text-muted-foreground mt-3">กำลังสร้าง QR Code...</p>
              </div>
            ) : qrError ? (
              <div className="py-4">
                <p className="text-destructive text-sm">{qrError}</p>
              </div>
            ) : (
              qrUrl && (
                <div className="flex flex-col items-center">
                  <img src={qrUrl} alt="Payment QR" className="w-72 object-contain" />
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                    <span>รอการชำระเงิน...</span>
                  </div>
                </div>
              )
            )}
            <h3 className="font-bold text-base">สแกน QR Code เพื่อชำระเงิน</h3>
            <p className="text-2xl font-bold text-primary">฿{total}</p>
          </CardContent>
        </Card>

        <Button variant="outline" onClick={handleDownloadQR} disabled={!qrUrl || qrLoading} className="w-full h-12 bg-primary text-white hover:bg-primary/90">
          บันทึก QR Code
        </Button>
        <Button variant="outline" onClick={() => setIsCancelDialogOpen(true)} className="w-full h-12">
          ยกเลิก
        </Button>
        <div className="w-full h-32"></div>
      </div>

      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยกเลิกรายการชำระเงิน?</AlertDialogTitle>
            <AlertDialogDescription>คุณต้องการยกเลิกและกลับไปยังหน้าก่อนหน้าใช่หรือไม่?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ไม่ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelCharge} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              ยืนยันการยกเลิก
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </BookingLayout>
  );
};

export default PaymentQRPage;