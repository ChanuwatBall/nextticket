import { useState, useEffect } from "react";
import { useBookingStore, type PassengerInfo } from "@/store/bookingStore";
import { supabase } from "@/http/supabase";
import { validatePromo } from "@/services/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tag, Ticket as TicketIcon, Check, User } from "lucide-react";
import { toast } from "sonner";
import moment from "moment";

interface PassengerInfoSectionProps {
  onContinue: () => void;
}

const passengerTypes = [
  { value: "male", label: "ชาย" },
  { value: "female", label: "หญิง" },
  { value: "child", label: "เด็ก" },
  { value: "monk", label: "พระสงฆ์" },
] as const;

const PassengerInfoSection = ({ onContinue }: PassengerInfoSectionProps) => {
  const store = useBookingStore();
  const tripPrice = store.selectedTrip?.price ?? 0;

  const [passengers, setPassengers] = useState<PassengerInfo[]>(() => {
    return store.selectedSeats.map((seat) => {
      const existing = store.passengers.find(p => p.seatId === seat.id);
      return existing || {
        seatId: seat.id,
        seatNumber: seat.number,
        fullName: "",
        thaiId: "",
        phone: "",
        passengerType: "male",
      };
    });
  });

  const [promoInput, setPromoInput] = useState(store.promoCode);
  const [promoApplied, setPromoApplied] = useState(store.discount > 0);
  const [promoError, setPromoError] = useState("");
  const [applyAllPhone, setApplyAllPhone] = useState(false);
  const [promotions, setPromotions] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("promotions").select("*")
      .eq("is_active", true)
      .gte("valid_to", moment().format("YYYY-MM-DDTHH:mm:ssZ"))
      .then(res => {
        if (res.data) setPromotions(res.data);
      });
  }, []);

  // Sync passengers when selectedSeats changes
  useEffect(() => {
    setPassengers((prev) => {
      const existingMap = new Map(prev.map(p => [p.seatId, p]));
      return store.selectedSeats.map((seat) => {
        if (existingMap.has(seat.id)) return existingMap.get(seat.id)!;
        const inStore = store.passengers.find(p => p.seatId === seat.id);
        return inStore || {
          seatId: seat.id,
          seatNumber: seat.number,
          fullName: "",
          thaiId: "",
          phone: "",
          passengerType: "male",
        };
      });
    });
  }, [store.selectedSeats]);

  const updatePassenger = (index: number, field: keyof PassengerInfo, value: string) => {
    setPassengers((prev) => {
      const newPassengers = prev.map((p, i) => (i === index ? { ...p, [field]: value } : p));
      if (index === 0 && field === "phone" && applyAllPhone) {
        return newPassengers.map(p => ({ ...p, phone: value }));
      }
      return newPassengers;
    });
  };

  const calculateSubtotal = () => {
    return passengers.length * tripPrice;
  };

  const applyPromo = async () => {
    const promo: any = await validatePromo(promoInput.toUpperCase(), store.selectedTrip?.id ?? "");
    if (!promo.valid) {
      setPromoError(promo.message);
      setPromoApplied(false);
      toast.error(promo.message);
    } else {
      setPromoError("");
      setPromoApplied(true);
      store.setPromoCode(promoInput);
      const subtotal = calculateSubtotal();
      const discount = promo.discountPercent > 0
        ? Math.round(subtotal * promo.discountPercent / 100)
        : promo.discountAmount;
      store.setDiscount(discount);
      toast.success("ใช้โค้ดลดสำเร็จ!");
    }
  };

  const allValid = passengers.every(
    (p) => p.fullName.trim() && p.phone.trim().length >= 9
  );

  const handleContinue = () => {
    store.setPassengers(passengers);
    onContinue();
  };

  const subtotal = calculateSubtotal();

  return (
    <div className="px-4 space-y-4">
      <h3 className="text-lg font-bold">ข้อมูลผู้โดยสาร</h3>

      <Accordion type="multiple" defaultValue={passengers.map(p => p.seatId)} className="space-y-3">
        {passengers.map((p, i) => (
          <AccordionItem key={p.seatId} value={p.seatId} className="border rounded-xl bg-card px-4">
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center justify-between w-full pr-4 text-left">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-bold flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-primary" />
                    ผู้โดยสาร #{i + 1} {p.fullName && `- ${p.fullName}`}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium">ที่นั่ง {p.seatNumber}</span>
                </div>
                <Badge variant="outline" className="ml-auto bg-primary/5 text-primary border-primary/20">
                  {passengerTypes.find(t => t.value === p.passengerType)?.label}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 space-y-4 pt-2 border-t border-dashed">
              <div className="space-y-3">
                <div className="grid gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">ชื่อ-นามสกุล</label>
                    <Input
                      placeholder="กรอกชื่อ-นามสกุล"
                      value={p.fullName}
                      onChange={(e) => updatePassenger(i, "fullName", e.target.value)}
                      className="h-11 shadow-sm"
                    />
                  </div>
                  
                  {(i === 0 || !applyAllPhone) && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">เบอร์โทรศัพท์</label>
                      <Input
                        placeholder="08X-XXX-XXXX"
                        value={p.phone}
                        onChange={(e) => updatePassenger(i, "phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                        className="h-11 shadow-sm"
                        inputMode="tel"
                      />
                    </div>
                  )}

                  {i === 0 && (
                    <div className="flex items-center gap-2 text-xs py-1">
                      <Checkbox
                        id="apply-all"
                        checked={applyAllPhone}
                        onCheckedChange={(c) => {
                          setApplyAllPhone(c as boolean);
                          if (c) setPassengers(prev => prev.map(p => ({ ...p, phone: passengers[0].phone })));
                        }}
                      />
                      <label htmlFor="apply-all" className="cursor-pointer font-medium text-muted-foreground">ใช้เบอร์นี้กับทุกคน</label>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">ประเภทผู้โดยสาร</label>
                    <Select value={p.passengerType} onValueChange={(v) => updatePassenger(i, "passengerType", v)}>
                      <SelectTrigger className="h-11 shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {passengerTypes.map((t) => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="bg-primary/5 rounded-lg p-2.5 flex justify-between items-center mt-2">
                  <span className="text-[10px] font-bold text-primary uppercase">ราคาที่นั่งนี้</span>
                  <div className="text-right">
                    <span className="text-sm font-bold text-primary">฿{tripPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <Card>
        <CardContent className="p-4">
          <label className="text-sm font-bold flex items-center gap-1.5 mb-2">
            <Tag className="h-3.5 w-3.5" /> รายการโปรโมชั่นที่ใช้ได้
          </label>

          <div className="flex gap-3 overflow-x-auto pb-4 mb-4 -mx-1 px-1 scrollbar-hide">
            {promotions.map((promo) => (
              <div
                key={promo.id}
                onClick={() => {
                  setPromoInput(promo.code);
                  setPromoError("");
                  setPromoApplied(false);
                }}
                className={`flex-shrink-0 w-48 p-2.5 rounded-xl border-2 transition-all cursor-pointer ${promoInput === promo.code
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border hover:border-muted-foreground/30 bg-card"
                  }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="bg-primary/10 p-1 rounded-lg">
                    <TicketIcon className="h-3 w-3 text-primary" />
                  </div>
                  {promoInput === promo.code && (
                    <Badge className="h-4 px-1 bg-primary text-white border-0">
                      <Check className="h-2 w-2" />
                    </Badge>
                  )}
                </div>
                <h4 className="font-bold text-xs truncate">{promo.title}</h4>
                <p className="text-[10px] text-muted-foreground line-clamp-1">{promo.subtitle}</p>
                <div className="mt-1.5 text-[10px] font-mono font-bold text-primary bg-primary/5 px-1.5 py-0.5 rounded inline-block">
                  {promo.code}
                </div>
              </div>
            ))}
            {promotions.length === 0 && (
              <p className="text-xs text-muted-foreground py-2 text-center w-full">ไม่มีโปรโมชั่นที่เลือกได้ในขณะนี้</p>
            )}
          </div>

          <label className="text-sm font-bold flex items-center gap-1.5 mb-2">
            หรือระบุรหัสโปรโมชั่น
          </label>
          <div className="flex gap-2">
            <Input
              placeholder="กรอกรหัส"
              value={promoInput}
              onChange={(e) => { setPromoInput(e.target.value); setPromoApplied(false); setPromoError(""); }}
              className="h-12 flex-1 border-dashed"
            />
            <Button onClick={applyPromo} variant="outline" className="h-12 px-6">
              ใช้โค้ด
            </Button>
          </div>
          {promoError && <p className="text-xs text-destructive mt-1">{promoError}</p>}
          {promoApplied && <p className="text-xs text-primary mt-1 font-medium italic">✓ ใช้โค้ดสำเร็จ ลดเพิ่ม ฿{store.discount}</p>}
        </CardContent>
      </Card>

      {/* Summary for clarity in step 3 */}
      <div className="bg-slate-50 border rounded-xl p-4 space-y-1 text-sm shadow-inner">
        <div className="flex justify-between">
          <span>ราคาสุทธิ (รายที่นั่ง)</span>
          <span>฿{subtotal}</span>
        </div>
        {store.discount > 0 && (
          <div className="flex justify-between text-primary font-bold">
            <span>ส่วนลดโปรโมชั่น</span>
            <span>-฿{store.discount}</span>
          </div>
        )}
        <div className="flex justify-between font-extrabold text-base pt-2 border-t mt-1">
          <span>รวมยอดที่ต้องชำระ</span>
          <span className="text-primary text-lg">฿{Math.max(0, subtotal - store.discount)}</span>
        </div>
      </div>

      <Button onClick={handleContinue} disabled={!allValid} className="w-full h-12 text-base font-bold">
        ยืนยันข้อมูลผู้โดยสาร
      </Button>
    </div>
  );
};

export default PassengerInfoSection;
