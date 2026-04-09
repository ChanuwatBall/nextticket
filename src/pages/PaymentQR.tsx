import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import BookingLayout from "@/components/BookingLayout";
import PageTransition from "@/components/PageTransition";
import { useBookingStore } from "@/store/bookingStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Timer, AlertCircle, CheckCircle2, Store } from "lucide-react";
import { createCharge, cancelCharge, createBooking, NewBooking, chargeQrPayment, paymentStatus, chargeWechatPayment } from "@/services/api";
import QRCode from "qrcode";
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
import moment from "moment";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";

const TIMER_SECONDS = 10 * 60; // 15 minutes

const PaymentQRPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const setPaymentStatus = useBookingStore((s) => s.setPaymentStatus);
  // const setBookingId = useBookingStore((s) => s.setBookingId);
  const resetStore = useBookingStore((s) => s.reset);
  const store = useBookingStore();
  const [bookingId, setBookingId] = useState<string | null>(null);
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

  const handlePaymentSuccess = useCallback(async (id: string) => {
    if (chargeStatus === "successful") return;

    // const user = JSON.parse(localStorage.getItem("user") || "{}");
    const qrBookingPayload = JSON.stringify({
      booking_reference: id
    });
    const qrBookingCode = await QRCode.toDataURL("nex-ticket.com#" + qrBookingPayload);
    store.setBookingQrcode(qrBookingCode);
    const passengers = bookingBody.passengers;
    for (const passenger of passengers) {
      const { data: ticketData, error: ticketError } = await supabase.from("tickets").select("*")
        .eq("booking_id", bookingId)
        .eq("seat_number", passenger.seatNumber)
        .eq("passenger_name", passenger.fullName)
        .eq("passenger_id_card", passenger.thaiId)
        .eq("passenger_phone", passenger.phone)
        .eq("passenger_type", passenger.passengerType)
        .select().single()
      if (ticketError) console.error("Supabase ticket error:", ticketError);
      console.log("ticketData ", ticketData)
      const { data: seatData, error: seatError } = await supabase.from("seats").select("*")
        .eq("trip_id", store.selectedTrip?.id)
        .eq("seat_number", passenger.seatNumber)
        .single()
      if (seatError) console.error("Supabase seat error:", seatError);
      console.log("seatData ", seatData)
      const { data: updateSeatData, error: updateSeatError } = await supabase.from("seats").update({
        ticket_id: ticketData.id
      }).eq("id", seatData.id).select()
      if (updateSeatError) console.error("Supabase update seat error:", updateSeatError);
      console.log("updateSeatData ", updateSeatData)

      // const ticketBody = {
      //   booking_id: bookingId,
      //   ticket_number: (store.selectedTrip?.id + passenger.seatNumber + moment().format("YYYYMMDDHHmmss")).toUpperCase(),
      //   passenger_name: passenger.fullName,
      //   passenger_phone: passenger.phone,
      //   passenger_id_card: passenger.thaiId,
      //   seat_number: passenger.seatNumber,
      //   passenger_type: passenger.passengerType,
      //   price: store.selectedTrip?.price,
      //   status: "active",
      //   checked_in_at: null,
      // };
      // const qrTicketPayload = JSON.stringify(ticketBody);
      // const qrCodeTicket = await QRCode.toDataURL(qrTicketPayload);
      // const {
      //   error: ticketError,
      //   data: ticketData
      // } = await supabase.from("tickets")
      //   .insert({
      //     ...ticketBody,
      //     qr_code: qrCodeTicket,
      //     booking_id: bookingId
      //   })
      //   .select();

      // if (ticketError) {
      //   console.error("Supabase ticket error:", ticketError);
      //   continue;
      // }
      // console.log("ticketData ", ticketData)

      // if (ticketData && ticketData.length > 0) {
      //   const seatPayload = {
      //     trip_id: store.selectedTrip?.id,
      //     seat_number: passenger.seatNumber,
      //     seat_type: passenger.seatType,
      //     ticket_id: ticketData[0].id,
      //     // is_available: true,
      //     // booking_id: bookingId,
      //     price: store?.selectedTrip?.price,
      //   };
      //   const { data: seateData, error: seatError } = await supabase.from("seats")
      //     .update(seatPayload)
      //     .eq("trip_id", store.selectedTrip?.id)
      //     .eq("seat_number", passenger.seatNumber)
      //     .select()
      //   if (seatError) console.error("Supabase seat error:", seatError);
      //   console.log("seateData ", seateData)
      // }
      setQrLoading(false);
    }

    setChargeStatus("successful");
    setPaymentStatus("success");
    // setBookingId(`NEX${Date.now().toString(36).toUpperCase()}`);
    setTimeout(() => navigate("/e-ticket"), 2000);
  }, [chargeStatus, store, bookingBody, setPaymentStatus, navigate]);

  const handlePaymentFailed = useCallback(async (id: string) => {
    if (chargeStatus === "failed") return;

    // const user = JSON.parse(localStorage.getItem("user") || "{}");
    const { error: updateError, data: updateData } = await supabase.from("bookings")
      .update({
        status: "cancelled",
        payment_status: "failed",
      })
      // .eq("user_id", user.user.id)
      .eq("booking_reference", id)
      .select();
    for (const passenger of store.passengers) {
      const seatPayload = {
        trip_id: store.selectedTrip?.id,
        seat_number: passenger.seatNumber,
        ticket_id: null,
        price: store?.selectedTrip?.price,
        // is_available: true,
      };
      const { data: seateData, error: seatError } = await supabase.from("seats")
        .update(seatPayload)
        .eq("trip_id", store.selectedTrip?.id)
        .eq("seat_number", passenger.seatNumber)
        .select()
      if (seatError) console.error("Supabase seat error:", seatError);
      console.log("seateData ", seateData)
    }

    if (updateError) console.error("Supabase update error (failed):", updateError);

    setChargeStatus("failed");
    setPaymentStatus("failed");
  }, [chargeStatus, setPaymentStatus]);

  // --- ฟังก์ชันเชื่อมต่อ WebSocket ---
  // const connectWebSocket = useCallback((id: string) => {
  //   if (stompClientRef.current) {
  //     stompClientRef.current.deactivate();
  //   }

  //   const socketUrl = baseUrl.replace("https", "wss");
  //   const client = new Client({
  //     brokerURL: `${socketUrl}/ws-payment`,
  //     debug: (msg) => console.log("STOMP:", msg),
  //     reconnectDelay: 5000,
  //     heartbeatIncoming: 4000,
  //     heartbeatOutgoing: 4000,
  //     onConnect: () => {
  //       console.log("Connected to WebSocket for Order:", id);

  //       client.subscribe(`/topic/order/${id}`, async (message) => {
  //         const payload = JSON.parse(message.body);
  //         console.log("WebSocket Notification:", payload);

  //         const status = payload.status.toLowerCase();
  //         if (status === "success" || status === "successful") {
  //           handlePaymentSuccess(id);
  //         } else if (status === "failed") {
  //           handlePaymentFailed(id);
  //         }
  //       });
  //     },
  //     onStompError: (frame) => {
  //       console.error("STOMP Error:", frame);
  //     }
  //   });

  //   client.activate();
  //   stompClientRef.current = client;
  // }, [baseUrl, handlePaymentSuccess, handlePaymentFailed]);

  // --- Countdown Timer ---
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // --- Polling for Payment Status ---
  useEffect(() => {
    if (!chargeId || chargeStatus !== "pending") return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await paymentStatus(chargeId);
        console.log("Polling Payment Status:", response);
        const status = response.status.toLowerCase();

        if (status === "success" || status === "successful") {
          handlePaymentSuccess(chargeId);
          clearInterval(pollInterval);
        } else if (status === "failed") {
          handlePaymentFailed(chargeId);
          clearInterval(pollInterval);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
  }, [chargeId, chargeStatus, handlePaymentSuccess, handlePaymentFailed]);

  // --- Handle Timeout ---
  useEffect(() => {
    if (timeLeft === 0 && chargeStatus === "pending" && chargeId) {
      console.log("Payment timed out, running cleanup...");
      handlePaymentFailed(chargeId);
    }
  }, [timeLeft, chargeStatus, chargeId, handlePaymentFailed]);

  const hasInitialized = useRef(false);

  // --- Create Charge & Start WebSocket ---
  useEffect(() => {
    if (total <= 0 || hasInitialized.current) return;
    hasInitialized.current = true;

    const initPayment = async () => {
      setQrLoading(true);
      setQrError(null);
      try {
        var payqr: {
          "chargeId": string
          "qrCodeUrl": string
          "status": string
          "expiresAt": string
        } = null
        if (sourceType === "promptpay") {
          payqr = await chargeQrPayment(total)
        } else if (sourceType === "wechat_pay_mpm") {
          payqr = await chargeWechatPayment(total)
        }
        console.log("payqr ", payqr)
        setQrUrl(payqr.qrCodeUrl);
        setChargeId(payqr.chargeId);

        const bookingPayload: NewBooking = {
          "tripId": bookingBody?.tripId,
          "travelDate": bookingBody?.travelDate,
          "originProvinceId": bookingBody?.originProvinceId,
          "destinationProvinceId": bookingBody?.destinationProvinceId,
          "boardingPointId": bookingBody?.boardingPointId,
          "dropOffPointId": bookingBody?.dropOffPointId,
          "passengers": store.passengers.map(e => {
            return {
              ...e,
              price: store?.selectedTrip?.price,
              trip_id: store?.selectedTrip?.id
            }
          }),
          "promoCode": store.promoCode
        }
        console.log("bookingPayload ", bookingPayload)
        const bookingres = await createBooking(bookingPayload)
        console.log("bookingres ", bookingres)
        if (bookingres.error) {
          toast({
            title: "ไม่สามารถจองตั๋วได้",
            description: bookingres.error,
            variant: "destructive",
            duration: Infinity,
            action: (
              <ToastAction altText="ตกลง">
                ตกลง
              </ToastAction>
            ),
          });
          await cancelCharge(payqr.chargeId)
          setTimeout(() => {
            navigate(-1)
          }, 1000)
          return
        } else {
          setBookingId(bookingres.bookingId)
          // console.log("bookingbody ", bookingbody)
          const qrBookingPayload = JSON.stringify({
            booking_id: bookingres.bookingId
          });
          const qrBookingCode = await QRCode.toDataURL("nex-ticket.com#" + qrBookingPayload);
          const { data, error } = await supabase.from("bookings").update({
            "qr_code": qrBookingCode
          }).eq("booking_id", bookingres.bookingId)
          console.log("data ", data)
          if (error) {
            throw error
          } else {
            console.log("update qr code success ", qrBookingCode)
          }

        }
        // console.log("inserted booking data ", data)
        // เปลี่ยนจากการทำ Interval มาใช้ WebSocket แทน
        // connectWebSocket(orderId);
      } catch (err: any) {
        // setQrError(err.message);
      } finally {
        setQrLoading(false);
      }
    };
    setTimeout(() => {
      initPayment();
    }, 2500)


    // Cleanup: เมื่อออกจากหน้า ให้ปิด WebSocket ทันที
    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [total, sourceType]);

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
  if (timeLeft === 0 && chargeStatus !== "successful" && chargeStatus !== "failed") {
    return (
      <BookingLayout currentStep={5} navto={() => navigate(-1)} title="หมดเวลา" showSteps={false}>
        <div className="px-4 text-center py-16">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-destructive" />
          <h3 className="text-xl font-bold mb-2">หมดเวลาชำระเงิน</h3>
          <p className="text-muted-foreground mb-6">กรุณาทำรายการใหม่อีกครั้ง</p>
          <Button onClick={() => { resetStore(); navigate("/"); }} className="h-12 px-8">กลับหน้าแรก</Button>
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
          <Button onClick={() => { resetStore(); navigate("/"); }} className="h-12 px-8">กลับหน้าแรก</Button>
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