import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { MealItem, PassengerMeal } from "@/store/bookingStore";
import { UtensilsCrossed, Coffee, Cake, Check } from "lucide-react";

const MENU: MealItem[] = [
  // Main
  { id: "m1", name: "ข้าวผัดหมู", price: 80, category: "main" },
  { id: "m2", name: "ข้าวมันไก่", price: 90, category: "main" },
  { id: "m3", name: "ข้าวหมูแดง", price: 85, category: "main" },
  { id: "m4", name: "ก๋วยเตี๋ยวเนื้อ", price: 95, category: "main" },
  // Drink
  { id: "d1", name: "น้ำเปล่า", price: 15, category: "drink" },
  { id: "d2", name: "น้ำส้ม", price: 30, category: "drink" },
  { id: "d3", name: "ชาเขียว", price: 35, category: "drink" },
  { id: "d4", name: "กาแฟเย็น", price: 45, category: "drink" },
  // Dessert
  { id: "sw1", name: "บัวลอย", price: 40, category: "dessert" },
  { id: "sw2", name: "ขนมปังปิ้ง", price: 35, category: "dessert" },
  { id: "sw3", name: "เค้กช็อกโกแลต", price: 55, category: "dessert" },
  { id: "sw4", name: "ไอศกรีม", price: 45, category: "dessert" },
];

interface Props {
  open: boolean;
  onClose: () => void;
  seatNumber: string;
  passengerName: string;
  initial: PassengerMeal | null;
  onConfirm: (meal: PassengerMeal, seatId: string) => void;
  seatId: string;
}

const categories = [
  { key: "main" as const, label: "จานหลัก", icon: UtensilsCrossed, color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-200", activeBorder: "border-orange-500" },
  { key: "drink" as const, label: "เครื่องดื่ม", icon: Coffee, color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-200", activeBorder: "border-blue-500" },
  { key: "dessert" as const, label: "ของหวาน", icon: Cake, color: "text-pink-500", bg: "bg-pink-50", border: "border-pink-200", activeBorder: "border-pink-500" },
];

export default function MealModal({ open, onClose, seatNumber, passengerName, initial, onConfirm, seatId }: Props) {
  const [activeTab, setActiveTab] = useState<"main" | "drink" | "dessert">("main");
  const [selected, setSelected] = useState<{ main: MealItem | null; drink: MealItem | null; dessert: MealItem | null }>(
    initial ? { main: initial.main, drink: initial.drink, dessert: initial.dessert }
      : { main: null, drink: null, dessert: null }
  );

  const total = (selected.main?.price ?? 0) + (selected.drink?.price ?? 0) + (selected.dessert?.price ?? 0);
  const items = MENU.filter(m => m.category === activeTab);
  const cat = categories.find(c => c.key === activeTab)!;

  const toggle = (item: MealItem) => {
    setSelected(prev => ({ ...prev, [activeTab]: prev[activeTab]?.id === item.id ? null : item }));
  };

  const handleConfirm = () => {
    onConfirm({ seatId, main: selected.main, drink: selected.drink, dessert: selected.dessert }, seatId);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[95vw] rounded-2xl p-0 border-none shadow-2xl max-h-[88vh] flex flex-col overflow-hidden">
        <DialogHeader className="p-5 pb-4 bg-primary rounded-t-2xl shrink-0">
          <DialogTitle className="text-white font-bold text-lg">🍱 เลือกอาหาร</DialogTitle>
          <p className="text-white/80 text-xs mt-1">ผู้โดยสาร: {passengerName || `ที่นั่ง ${seatNumber}`}</p>
        </DialogHeader>

        {/* Tab bar */}
        <div className="flex border-b shrink-0 bg-white">
          {categories.map(c => {
            const Icon = c.icon;
            const isActive = activeTab === c.key;
            const picked = selected[c.key];
            return (
              <button
                key={c.key}
                onClick={() => setActiveTab(c.key)}
                className={`flex-1 py-3 flex flex-col items-center gap-0.5 text-[11px] font-bold transition-colors border-b-2 ${isActive ? `border-primary text-primary` : "border-transparent text-muted-foreground"}`}
              >
                <div className="relative">
                  <Icon className="h-4 w-4" />
                  {picked && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-green-500" />}
                </div>
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50">
          <p className="text-[10px] uppercase font-bold text-muted-foreground mb-3">{cat.label} — เลือก 1 รายการ (ไม่บังคับ)</p>
          {items.map(item => {
            const isSelected = selected[activeTab]?.id === item.id;
            return (
              <button
                key={item.id}
                onClick={() => toggle(item)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all text-left ${isSelected ? `border-primary bg-primary/5` : "border-border bg-white hover:border-muted-foreground/30"}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isSelected ? "bg-primary/10" : "bg-slate-100"}`}>
                    {isSelected ? <Check className={`h-4 w-4 text-primary`} /> : <cat.icon className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <span className="font-medium text-sm">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`font-bold text-xs ${isSelected ? `text-primary border-primary` : ""}`}>
                    ฿{item.price}
                  </Badge>
                </div>
              </button>
            );
          })}
        </div>

        {/* Summary + Confirm */}
        <div className="p-4 border-t bg-white shrink-0 space-y-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            {categories.map(c => {
              const Icon = c.icon;
              const pick = selected[c.key];
              return (
                <div key={c.key} className={`rounded-xl p-2 border ${pick ? `bg-primary/5 border-primary/20` : "bg-slate-50 border-dashed"}`}>
                  <Icon className={`h-3.5 w-3.5 mx-auto mb-1 ${pick ? "text-primary" : "text-muted-foreground"}`} />
                  <p className="text-[9px] font-bold text-muted-foreground uppercase">{c.label}</p>
                  {pick
                    ? <p className={`text-[10px] font-bold truncate text-primary`}>{pick.name}</p>
                    : <p className="text-[10px] text-muted-foreground/60">ยังไม่เลือก</p>}
                  {pick && <p className="text-[10px] font-bold">฿{pick.price}</p>}
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-muted-foreground">ราคาอาหารรวม</p>
              <p className="text-xl font-extrabold text-primary">฿{total.toLocaleString()}</p>
            </div>
            <Button onClick={handleConfirm} className="h-11 px-8 font-bold bg-primary hover:opacity-90 border-none text-white">
              ตกลง
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
