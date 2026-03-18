import { useState } from "react";
// import PageTransition from "@/components/PageTransition";
import { useNavigate } from "react-router-dom";
import BookingLayout from "@/components/BookingLayout";
import { useBookingStore, type PassengerInfo } from "@/store/bookingStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockPromotions } from "@/data/mockData";
import { Check, CheckIcon, Tag } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const passengerTypes = [
  { value: "male", label: "ชาย" },
  { value: "female", label: "หญิง" },
  { value: "child", label: "เด็ก" },
  { value: "monk", label: "พระสงฆ์" },
] as const;

const PassengerInfoPage = () => {
  const navigate = useNavigate();
  const store = useBookingStore();

  const [passengers, setPassengers] = useState<PassengerInfo[]>(
    store.selectedSeats.map((seat) => ({
      seatId: seat.id,
      seatNumber: seat.number,
      fullName: "",
      thaiId: "",
      phone: "",
      passengerType: "male",
    }))
  );

  const [promoInput, setPromoInput] = useState(store.promoCode);
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [applyAllPhone, setApplyAllPhone] = useState(false);

  const updatePassenger = (index: number, field: keyof PassengerInfo, value: string) => {
    setPassengers((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  };

  const updatePhoneForAll = (phone: string) => {
    setPassengers([...passengers.map(p => ({ ...p, phone }))]);
  }

  const validateThaiId = (id: string) => /^\d{13}$/.test(id);

  const applyPromo = () => {
    const promo = mockPromotions.find((p) => p.promoCode === promoInput.toUpperCase());
    if (!promo) {
      setPromoError("ไม่พบรหัสโปรโมชั่น");
      setPromoApplied(false);
      return;
    }
    setPromoError("");
    setPromoApplied(true);
    store.setPromoCode(promo.promoCode);
    const tripPrice = store.selectedTrip?.price ?? 0;
    const total = tripPrice * store.selectedSeats.length;
    const discount = promo.discountPercent > 0
      ? Math.round(total * promo.discountPercent / 100)
      : promo.discountAmount;
    store.setDiscount(discount);
  };

  const allValid = passengers.every(
    (p) => p.fullName.trim() && validateThaiId(p.thaiId) && p.phone.trim().length >= 9
  );

  const handleContinue = () => {
    store.setPassengers(passengers);
    navigate("/payment");
  };

  const tripPrice = store.selectedTrip?.price ?? 0;
  const subtotal = tripPrice * store.selectedSeats.length;
  const total = Math.max(0, subtotal - store.discount);

  return (
    <BookingLayout currentStep={4} title="ข้อมูลผู้โดยสาร" navto={() => navigate(-1)} >
      <div className="px-4 space-y-4">
        {passengers.map((p, i) => (
          <Card key={p.seatId}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                ผู้โดยสารคนที่ {i + 1}
                <Badge variant="outline">ที่นั่ง {p.seatNumber}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="ชื่อ-นามสกุล"
                value={p.fullName}
                onChange={(e) => updatePassenger(i, "fullName", e.target.value)}
                className="h-12"
              />
              <Input
                placeholder="เลขบัตรประชาชน (13 หลัก)"
                value={p.thaiId}
                onChange={(e) => updatePassenger(i, "thaiId", e.target.value.replace(/\D/g, "").slice(0, 13))}
                className="h-12"
                inputMode="numeric"
              />
              {p.thaiId && !validateThaiId(p.thaiId) && (
                <p className="text-xs text-destructive">กรุณากรอกเลขบัตรประชาชน 13 หลัก</p>
              )}
              <Input
                placeholder="เบอร์โทรศัพท์"
                value={p.phone}
                onChange={(e) => updatePassenger(i, "phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                className="h-12"
                inputMode="tel"
              />
              {i === 0 && (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Checkbox
                    checked={applyAllPhone}
                    onCheckedChange={(checked) => {
                      console.log("Apply all phone:", checked, p.phone);
                      setApplyAllPhone(checked as boolean);
                      if (checked) {
                        updatePhoneForAll(p.phone);
                      }
                    }}
                  >
                  </Checkbox>
                  <label className="Label pl-2" htmlFor="c1">
                    ใช้หมายเลขนี้กับผู้โดยสารทั้งหมด
                  </label>
                </div>
              )}
              <Select value={p.passengerType} onValueChange={(v) => updatePassenger(i, "passengerType", v)}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {passengerTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        ))}

        {/* Promo Code */}
        <Card>
          <CardContent className="p-4">
            <label className="text-sm font-medium flex items-center gap-1.5 mb-2">
              <Tag className="h-3.5 w-3.5" /> รหัสโปรโมชั่น
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="กรอกรหัส"
                value={promoInput}
                onChange={(e) => { setPromoInput(e.target.value); setPromoApplied(false); setPromoError(""); }}
                className="h-12 flex-1"
              />
              <Button onClick={applyPromo} variant="outline" className="h-12 px-6">
                ใช้โค้ด
              </Button>
            </div>
            {promoError && <p className="text-xs text-destructive mt-1">{promoError}</p>}
            {promoApplied && <p className="text-xs text-primary mt-1">✓ ใช้โค้ดสำเร็จ ลด ฿{store.discount}</p>}
          </CardContent>
        </Card>

        {/* Summary */}
        <div className="bg-accent/50 rounded-lg p-4 space-y-1 text-sm">
          <div className="flex justify-between">
            <span>ราคาตั๋ว ({store.selectedSeats.length} ที่นั่ง)</span>
            <span>฿{subtotal}</span>
          </div>
          {store.discount > 0 && (
            <div className="flex justify-between text-primary">
              <span>ส่วนลด</span>
              <span>-฿{store.discount}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-base pt-1 border-t border-border">
            <span>ยอดรวม</span>
            <span className="text-primary">฿{total}</span>
          </div>
        </div>

        <Button onClick={handleContinue} disabled={!allValid} className="w-full h-14 text-lg font-bold" size="lg">
          ดำเนินการชำระเงิน
        </Button>
      </div>
    </BookingLayout>
  );
};

export default PassengerInfoPage;
