import { useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import BookingLayout from "@/components/BookingLayout";
import { useBookingStore } from "@/store/bookingStore";
import { generateSeats, type Seat, type SeatStatus } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const statusColors: Record<SeatStatus, string> = {
  available: "bg-card border-2 border-primary/30 text-foreground hover:bg-primary/10 cursor-pointer",
  booked: "bg-muted text-muted-foreground cursor-not-allowed opacity-50",
  unavailable: "bg-muted/50 text-muted-foreground/30 cursor-not-allowed",
  selected: "bg-primary text-primary-foreground ring-2 ring-primary/40 cursor-pointer",
};

const SeatSelection = () => {
  const navigate = useNavigate();
  const store = useBookingStore();
  const totalSeats = store.selectedTrip?.totalSeats ?? 40;

  const initialSeats = useMemo(() => generateSeats(totalSeats), [totalSeats]);
  const [seats, setSeats] = useState<Seat[]>(initialSeats);

  const selectedSeats = useMemo(() => seats.filter((s) => s.status === "selected"), [seats]);

  const toggleSeat = useCallback((seatId: string) => {
    setSeats((prev) =>
      prev.map((s) => {
        if (s.id !== seatId) return s;
        if (s.status === "booked" || s.status === "unavailable") return s;
        if (s.status === "selected") return { ...s, status: "available" as SeatStatus };
        if (selectedSeats.length >= store.passengerCount && s.status === "available") return s;
        return { ...s, status: "selected" as SeatStatus };
      })
    );
  }, [selectedSeats.length, store.passengerCount]);

  const handleContinue = () => {
    store.setSelectedSeats(selectedSeats);
    navigate("/passengers");
  };

  const cols = 4;
  const rows = Math.ceil(totalSeats / cols);

  return (
    <BookingLayout currentStep={3} title="เลือกที่นั่ง">
      <div className="px-4">
        {/* Legend */}
        <div className="flex items-center gap-4 text-xs mb-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="h-4 w-4 rounded border-2 border-primary/30 bg-card" /> ว่าง
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-4 w-4 rounded bg-primary" /> เลือก
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-4 w-4 rounded bg-muted opacity-50" /> จองแล้ว
          </div>
        </div>

        {/* Bus layout */}
        <div className="bg-card rounded-xl border border-border p-4 mb-4">
          {/* Driver area */}
          <div className="flex justify-end mb-4 text-xs text-muted-foreground">
            <div className="bg-muted rounded px-3 py-1">คนขับ</div>
          </div>

          {/* Seats grid */}
          <div className="space-y-2">
            {Array.from({ length: rows }, (_, r) => (
              <div key={r} className="flex items-center justify-center gap-1.5">
                {Array.from({ length: cols }, (_, c) => {
                  const seat = seats.find((s) => s.row === r && s.col === c);
                  if (!seat) return <div key={c} className="w-11 h-11" />;
                  return (
                    <button
                      key={seat.id}
                      onClick={() => toggleSeat(seat.id)}
                      disabled={seat.status === "booked" || seat.status === "unavailable"}
                      className={cn(
                        "w-11 h-11 rounded-lg text-xs font-bold transition-all",
                        statusColors[seat.status],
                        c === 1 && "mr-4" // aisle gap
                      )}
                    >
                      {seat.number}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-accent/50 rounded-lg p-3 mb-4">
          <p className="text-sm">
            เลือกแล้ว <span className="font-bold text-primary">{selectedSeats.length}</span> / {store.passengerCount} ที่นั่ง
            {selectedSeats.length > 0 && (
              <span className="ml-2 text-muted-foreground">
                (ที่นั่ง {selectedSeats.map((s) => s.number).join(", ")})
              </span>
            )}
          </p>
        </div>

        <Button
          onClick={handleContinue}
          disabled={selectedSeats.length !== store.passengerCount}
          className="w-full h-14 text-lg font-bold"
          size="lg"
        >
          ดำเนินการต่อ
        </Button>
      </div>
    </BookingLayout>
  );
};

export default SeatSelection;
