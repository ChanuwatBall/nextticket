import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import liff from "@line/liff";
import BookingLayout from "@/components/BookingLayout";
import PageTransition from "@/components/PageTransition";
import { useBookingStore } from "@/store/bookingStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Timer, AlertCircle, CheckCircle2 } from "lucide-react";

const TIMER_SECONDS = 15 * 60; // 15 minutes
const POLL_INTERVAL = 3000; // 3 seconds

const PaymentQRPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const store = useBookingStore();


  const baseUrl = import.meta.env.VITE_API_URL;

  const { sourceType, total } = (location.state as { sourceType: string; total: number }) || {
    sourceType: "promptpay",
    total: 0,
  };
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPollingRef = useRef(false);

  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(true);
  const [qrError, setQrError] = useState<string | null>(null);
  const [chargeId, setChargeId] = useState<string | null>(null);
  const [chargeStatus, setChargeStatus] = useState<string>("pending");

  // Countdown timer
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

  const handleDownloadQR = useCallback(() => {
    if (!qrUrl) return;

    // Check if in LIFF environment
    if (liff.isInClient && liff.isInClient()) {
      // Open in external browser
      liff.openWindow({
        url: qrUrl,
        external: true,
      });
    } else {
      // Download image normally
      const link = document.createElement("a");
      link.href = qrUrl;
      link.download = `qr-code-${chargeId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [qrUrl, chargeId]);

  // Create charge & get QR
  useEffect(() => {
    if (total <= 0) return;
    setQrLoading(true);
    setQrError(null);

    // pick endpoint based on payment channel
    let apiUrl = baseUrl+"/api/payment/qr";
    if (sourceType === "alipay") apiUrl = baseUrl+"/api/payment/alipay-qr";
    else if (sourceType === "wechat") apiUrl = baseUrl+"/api/payment/wechat-pay";

    axios
      .post(apiUrl, {}, { params: { amount: total } })
      .then(async (response) => {
        console.log("Charge created:", response.data);
        const id = response.data.chargeId;
        setChargeId(id);
         setQrUrl(response.data.qrCodeUrl);
         checkStatsInterval(id);
        // await fetchCharge(id);
      })
      .catch((err) => {
        setQrError(err.message);
      })
      .finally(() => {
        setQrLoading(false);
      });
  }, [total, sourceType]);

  const fetchCharge = async (id: string) => {
    try {
      const response = await axios.get(`https://nextoa-api.andamantracking.dev/api/payment/transaction/${id}`);
      console.log("Charge details:", response.data);
      const charge = response.data.charge;
      const downloadUri = charge?.source?.scannable_code?.image?.download_uri;
      if (downloadUri) {
        setQrUrl(downloadUri);
      }
      setChargeStatus(charge?.status ?? "pending");
    } catch (err: any) {
      setQrError(err.message);
    }
  };

  // Poll charge status every 3 seconds
 const checkStatsInterval = useCallback((chargeId: string) => { 
  if (!chargeId) return;

  // กันการสร้าง interval ซ้ำ
  if (intervalRef.current) {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }

 intervalRef.current = setInterval(async () => {
      try {
        // const response = await axios.post(`https://nextoa-api.andamantracking.dev/api/payment/transaction/${chargeId}`
        const response = await axios.get(`https://nextoa-api.andamantracking.dev/api/payment/transaction/${chargeId}`);
        let  status =  "pending"; 
        console.log(chargeId + " Polled charge status:", response.data );
        if(response.data === null){
          setChargeStatus("pending"); 
        }else{
            status = response.data.status;
          setChargeStatus(status ?? "pending");
        }
        
        status = status.toLowerCase();
        if (status === "success") {
          clearInterval(  intervalRef.current!);
          store.setPaymentStatus("success");
          store.setBookingId(`NEX${Date.now().toString(36).toUpperCase()}`);
          setTimeout(() => navigate("/e-ticket"), 1500);
        } else if (status ===  "failed" || status === "expired") {
          clearInterval(intervalRef.current!);
          store.setPaymentStatus("failed");
          setTimeout(() => navigate("/e-ticket"), 1500);
        }
      } catch {
        console.error("Error polling charge status");
        // ignore polling errors
      }
    }, 3000);
 

    return () => clearInterval( intervalRef.current!);
  }, [chargeId, navigate, store]);

  // Time expired
  if (timeLeft === 0 && chargeStatus !== "successful") {
    return (
      <PageTransition direction="left">
      <BookingLayout currentStep={5} navto={() => navigate(-1)} title="หมดเวลา" showSteps={false}>
        <div className="px-4 text-center py-16">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-destructive" />
          <h3 className="text-xl font-bold mb-2">หมดเวลาชำระเงิน</h3>
          <p className="text-muted-foreground mb-6">กรุณาทำรายการใหม่อีกครั้ง</p>
          <Button
            onClick={() => {
              store.reset();
              navigate("/");
            }}
            className="h-12 px-8"
          >
            กลับหน้าแรก
          </Button>
        </div>
      </BookingLayout>
      </PageTransition>
    );
  }

  // Payment successful
  if (chargeStatus === "successful") {
    return (
      <PageTransition direction="left">
      <BookingLayout currentStep={5} navto={() => navigate(-1)} title="ชำระเงินสำเร็จ" showSteps={false}>
        <div className="px-4 text-center py-16">
          <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-500" />
          <h3 className="text-xl font-bold mb-2">ชำระเงินสำเร็จ!</h3>
          <p className="text-muted-foreground">กำลังนำไปยังหน้า E-Ticket...</p>
        </div>
      </BookingLayout>
      </PageTransition>
    );
  }

  return (
    <PageTransition direction="left">
    <BookingLayout currentStep={5} navto={() => navigate(-1)} title="สแกน QR ชำระเงิน" showSteps={false}>
      <div className="px-4 space-y-4">
        {/* Timer */}
        <div className="bg-destructive/10 rounded-lg p-3 flex items-center gap-2 text-sm">
          <Timer className="h-4 w-4 text-destructive" />
          <span>กรุณาชำระภายใน</span>
          <span className="font-bold text-destructive ml-auto text-lg">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
        </div>

        {/* QR Code */}
        <Card>
          <CardContent className="p-4 text-center space-y-4 " style={{border:"none"}}>
           
            {qrLoading && (
              <div className="py-8">
                <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                <p className="text-sm text-muted-foreground mt-3">กำลังสร้าง QR Code...</p>
              </div>
            )}

            {qrError && (
              <div className="py-4">
                <p className="text-destructive text-sm">เกิดข้อผิดพลาด: {qrError}</p>
                <Button
                  variant="outline"
                  className="mt-3"
                  onClick={() => {
                    setQrError(null);
                    setQrLoading(true);

                    let retryUrl = "/api/payment/qr";
                    if (sourceType === "alipay") retryUrl = "/api/payment/alipay-qr";
                    else if (sourceType === "wechat") retryUrl = "/api/payment/wechat-pay";

                    axios
                      .post(retryUrl, {}, { params: { amount: total } })
                      .then(async (res) => {
                        const id = res.data.chargeId;
                        setChargeId(id);
                        await fetchCharge(id);
                      })
                      .catch((e) => setQrError(e.message))
                      .finally(() => setQrLoading(false));
                  }}
                >
                  ลองใหม่
                </Button>
              </div>
            )}

            {qrUrl && !qrLoading && (
              <div className="flex flex-col items-center  ">
                {/* <div className="bg-white p-4 rounded-xl border border-border shadow-sm"> */}
                  <img src={qrUrl} alt="QR Code for Payment" className="w-72 object-contain" />
                {/* </div> */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>รอการชำระเงิน...</span>
                </div>
              </div>
            )}
             <h3 className="font-bold text-base">สแกน QR Code เพื่อชำระเงิน</h3>
            <p className="text-2xl font-bold text-primary">฿{total}</p>

          </CardContent>
        </Card>

        <Button
          variant="outline"
          onClick={handleDownloadQR}
          disabled={!qrUrl || qrLoading}
          className="w-full h-12  bg-primary text-white hover:bg-primary/90"
        >
          บันทึก QR Code
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="w-full h-12"
        >
          ยกเลิก
        </Button>
        <div className="w-full h-32"></div>
      </div>
    </BookingLayout>
    </PageTransition>
  );
};

export default PaymentQRPage;
