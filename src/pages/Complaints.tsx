import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BookingLayout from "@/components/BookingLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Clock, ChevronRight, CheckCircle2, MessageSquare, AlertCircle, Bus } from "lucide-react";
import { bookingList } from "@/services/api";
import { toast } from "sonner";
import moment from "moment";
import { cn } from "@/lib/utils";

type Ticket = {
  id: string;
  bookingReference: string;
  origin: string;
  destination: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  seats: string[];
  status: string;
  paymentStatus: string;
  expiresAt: string;
  total: number;
};

const Complaints = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [complaintText, setComplaintText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [busPlate, setBusPlate] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [step, setStep] = useState(1); // 1: Select Ticket, 2: Write Complaint, 3: Success

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const res = await bookingList(1);
        if (res && res.data) {
          // Filter for paid/confirmed tickets
          const successful = res.data.filter((t: any) => t.paymentStatus === "paid" || t.status === "confirmed");
          setTickets(successful);
        }
      } catch (error) {
        console.error("Error fetching tickets for complaints:", error);
        toast.error("ไม่สามารถดึงข้อมูลการจองได้");
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  const handleSubmit = async () => {
    if (!complaintText.trim()) {
      toast.error("กรุณากรอกรายละเอียดเรื่องที่ต้องการร้องเรียน");
      return;
    }

    if (!phoneNumber.trim()) {
      toast.error("กรุณากรอกเบอร์โทรศัพท์ติดต่อ");
      return;
    }

    setSubmitting(true);
    try {
      // Logic for submitting complaint would go here
      // For now, we simulate success
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStep(3);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการส่งข้อมูล");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BookingLayout showSteps={false} title="แจ้งเรื่องร้องเรียน" navto={() => navigate(-1)}>
      <div className="px-4 space-y-6">
        {step === 1 && (
          <div className="space-y-4">
            <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-primary" />
                ขั้นตอนที่ 1: เลือกรายการจอง
              </h2>
              <p className="text-xs text-muted-foreground mt-1">กรุณาเลือกรายการจองที่ท่านต้องการแจ้งปัญหาหรือข้อร้องเรียน</p>
            </div>

            {loading ? (
              <div className="py-20 text-center text-muted-foreground animate-pulse">กำลังโหลดข้อมูลการจอง...</div>
            ) : tickets.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <div className="bg-muted h-16 w-16 rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                  <MessageSquare className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="font-bold">ไม่พบรายการจอง</h3>
                  <p className="text-sm text-muted-foreground">ท่านต้องมีรายการจองที่สำเร็จแล้วจึงจะสามารถแจ้งร้องเรียนได้</p>
                </div>
                <Button onClick={() => navigate("/")} variant="outline" className="mt-4">กลับหน้าหลัก</Button>
              </div>
            ) : (
              <div className="space-y-3">
                {tickets.map((ticket) => (
                  <Card
                    key={ticket.id}
                    className={cn(
                      "cursor-pointer transition-all border-2",
                      selectedTicket?.id === ticket.id ? "border-primary bg-primary/5 shadow-md" : "border-transparent hover:border-slate-200"
                    )}
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400">#{ticket.bookingReference}</p>
                          <div className="flex items-center gap-1.5 mt-1 font-bold text-sm">
                            <MapPin className="h-3.5 w-3.5 text-primary" />
                            {ticket.origin} → {ticket.destination}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[10px] uppercase font-bold">
                          {ticket.date}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {ticket.departureTime}
                        </span>
                        <span>ที่นั่ง {ticket.seats.join(", ")}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <Button
              className="w-full h-12 font-bold shadow-lg"
              disabled={!selectedTicket}
              onClick={() => setStep(2)}
            >
              ถัดไป
            </Button>
          </div>
        )}

        {step === 2 && selectedTicket && (
          <div className="space-y-6">
            <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-primary" />
                ขั้นตอนที่ 2: รายละเอียดข้อร้องเรียน
              </h2>
              <p className="text-xs text-muted-foreground mt-1">กรุณาระบุรายละเอียดให้ชัดเจนเพื่อให้เจ้าหน้าที่ดำเนินการแก้ไข</p>
            </div>

            <Card className="bg-slate-50 border-primary/10 overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-primary/10 px-3 py-2 flex justify-between items-center">
                  <span className="text-[10px] font-black text-primary uppercase tracking-wider">Ticket Info</span>
                  <span className="text-[10px] font-bold text-primary/60">#{selectedTicket.bookingReference}</span>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase">Route</p>
                      <p className="text-sm font-black">{selectedTicket.origin} → {selectedTicket.destination}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground font-bold uppercase">Date</p>
                      <p className="text-sm font-black">{moment(selectedTicket.date).format('D MMM YYYY')}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-3 border-y border-dashed">
                    <div>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase">Time</p>
                      <p className="text-xs font-bold">{selectedTicket.departureTime} - {selectedTicket.arrivalTime}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground font-bold uppercase">Seats</p>
                      <p className="text-xs font-bold text-primary">{selectedTicket.seats.join(", ")}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    <span className="text-xs font-bold text-muted-foreground">ยอดชำระ</span>
                    <span className="text-sm font-black text-primary">฿{selectedTicket.total}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="busPlate" className="text-xs font-bold flex items-center gap-1.5">
                    <Bus className="h-3 w-3" /> ทะเบียนรถ
                  </Label>
                  <Input
                    id="busPlate"
                    placeholder="เลขทะเบียน"
                    value={busPlate}
                    onChange={(e) => setBusPlate(e.target.value)}
                    className="h-10 text-sm focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-xs font-bold flex items-center gap-1.5">
                    <Clock className="h-3 w-3" /> เบอร์โทรศัพท์
                  </Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="เบอร์โทรติดต่อ"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="h-10 text-sm focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="complaint" className="font-bold text-sm">รายละเอียดเรื่องร้องเรียน</Label>
                <Textarea
                  id="complaint"
                  placeholder="เช่น บริการพนักงานขับรถ, สภาพรถ, ความล่าช้า ฯลฯ"
                  className="min-h-[150px] resize-none focus:ring-primary shadow-sm"
                  value={complaintText}
                  onChange={(e) => setComplaintText(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="font-bold">แนบรูปภาพ (ถ้ามี)</Label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer bg-slate-50/50">
                  <div className="bg-white h-10 w-10 rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm border">
                    <AlertCircle className="h-5 w-5 text-slate-400" />
                  </div>
                  <p className="text-xs text-slate-500 font-medium">กดเพื่อเพิ่มรูปภาพ</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 h-12" onClick={() => setStep(1)}>ย้อนกลับ</Button>
              <Button
                className="flex-1 h-12 shadow-lg"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? "กำลังส่ง..." : "ส่งข้อร้องเรียน"}
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="py-12 text-center space-y-6">
            <div className="relative">
              <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto animate-in zoom-in">
                <CheckCircle2 className="h-12 w-12 text-primary" />
              </div>
              <div className="absolute top-0 right-1/2 translate-x-12 translate-y-2">
                <div className="h-4 w-4 bg-[hsl(var(--success))] rounded-full animate-ping" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold">ส่งเรื่องเรียบร้อยแล้ว</h2>
              <p className="text-sm text-muted-foreground px-8">
                เราได้รับข้อร้องเรียนของท่านแล้ว เจ้าหน้าที่จะดำเนินการตรวจสอบและติดต่อกลับภายใน 24-48 ชั่วโมง
              </p>
            </div>

            <Card className="max-w-xs mx-auto bg-slate-50 border-none shadow-sm">
              <CardContent className="p-4 text-xs">
                <p className="font-bold text-slate-400 mb-2 uppercase tracking-widest text-[9px]">หมายเลขรับเรื่อง</p>
                <p className="text-lg font-black text-primary">CASE-{Math.floor(Math.random() * 900000) + 100000}</p>
              </CardContent>
            </Card>

            <div className="pt-6 space-y-3">
              <Button
                className="w-full h-12 font-bold shadow-md"
                onClick={() => navigate("/profile")}
              >
                กลับไปที่หน้าโปรไฟล์
              </Button>
            </div>
          </div>
        )}
      </div>
      <div className="h-20"></div>
    </BookingLayout>
  );
};

export default Complaints;
