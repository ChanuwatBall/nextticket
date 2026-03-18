import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import BookingLayout from "@/components/BookingLayout";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { routes, provinces, boardingPoints } from "@/data/mockData";
import { useBookingStore } from "@/store/bookingStore";
import { CalendarIcon, MapPin, Users, Search } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { boardingPoints } from "@/data/mockData";
import { getRoutes, getProvinces } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

const Ticket = () => {
  const navigate = useNavigate();
  const store = useBookingStore();
  const [date, setDate] = useState<Date | undefined>(store.travelDate ? new Date(store.travelDate) : store.travelDate === '' ? undefined : undefined);


  const { data: routes = [], isLoading: isLoadingRoutes } = useQuery({
    queryKey: ['routes'],
    queryFn: () => getRoutes().then(res => res.data),
  });

  const { data: provinces = [], isLoading: isLoadingProvinces } = useQuery({
    queryKey: ['provinces', store.routeId],
    queryFn: () => getProvinces(store.routeId).then(res => res.data),
  });


  const filteredOriginProvinces = useMemo(() => {
    if (!store.routeId) return provinces;
    return provinces.filter((p) => p.routeIds.includes(store.routeId));
  }, [store.routeId]);

  const filteredDestProvinces = useMemo(() => {
    if (!store.routeId) return provinces;
    return provinces.filter((p) => p.routeIds.includes(store.routeId) && p.id !== store.originProvinceId);
  }, [store.routeId, store.originProvinceId]);

  const originBoardingPoints = useMemo(
    () => boardingPoints.filter((bp) => bp.provinceId === store.originProvinceId),
    [store.originProvinceId]
  );

  const destBoardingPoints = useMemo(
    () => boardingPoints.filter((bp) => bp.provinceId === store.destinationProvinceId),
    [store.destinationProvinceId]
  );

  const canSearch =
    store.routeId &&
    date &&
    store.originProvinceId &&
    store.destinationProvinceId &&
    store.boardingPointId &&
    store.dropOffPointId;

  const handleSearch = () => {
    if (!canSearch || !date) return;
    store.setTravelDate(format(date, "yyyy-MM-dd"));
    navigate("/search");
  };

  return (
    <BookingLayout currentStep={1} navto={() => navigate("/")} title="จองตั๋วรถโดยสาร">
      <div className="px-4 space-y-4">
        {/* Route */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-muted-foreground">เส้นทาง</label>
          <Select value={store.routeId} onValueChange={store.setRoute}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="เลือกเส้นทาง" />
            </SelectTrigger>
            <SelectContent>
              {routes.map((r) => (
                <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-muted-foreground">วันที่เดินทาง</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-full h-12 justify-start font-normal", !date && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP", { locale: th }) : "เลือกวันที่"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={date} onSelect={setDate} disabled={(d) => d < new Date()} />
            </PopoverContent>
          </Popover>
        </div>

        {/* Origin */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> ต้นทาง
          </label>
          <Select value={store.originProvinceId} onValueChange={store.setOriginProvince}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="เลือกจังหวัดต้นทาง" />
            </SelectTrigger>
            <SelectContent>
              {filteredOriginProvinces.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Boarding Point */}
        {store.originProvinceId && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">จุดขึ้นรถ</label>
            <Select value={store.boardingPointId} onValueChange={store.setBoardingPoint}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="เลือกจุดขึ้นรถ" />
              </SelectTrigger>
              <SelectContent>
                {originBoardingPoints.map((bp) => (
                  <SelectItem key={bp.id} value={bp.id}>{bp.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Destination */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> ปลายทาง
          </label>
          <Select value={store.destinationProvinceId} onValueChange={store.setDestinationProvince}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="เลือกจังหวัดปลายทาง" />
            </SelectTrigger>
            <SelectContent>
              {filteredDestProvinces.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Drop-off Point */}
        {store.destinationProvinceId && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">จุดลงรถ</label>
            <Select value={store.dropOffPointId} onValueChange={store.setDropOffPoint}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="เลือกจุดลงรถ" />
              </SelectTrigger>
              <SelectContent>
                {destBoardingPoints.map((bp) => (
                  <SelectItem key={bp.id} value={bp.id}>{bp.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Passengers */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
            <Users className="h-3.5 w-3.5" /> จำนวนผู้โดยสาร
          </label>
          <Select value={String(store.passengerCount)} onValueChange={(v) => store.setPassengerCount(Number(v))}>
            <SelectTrigger className="h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <SelectItem key={n} value={String(n)}>{n} คน</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* CTA */}
        <Button onClick={handleSearch} disabled={!canSearch} className="w-full h-14 text-lg font-bold mt-4" size="lg">
          <Search className="mr-2 h-5 w-5" />
          ค้นหาเที่ยวรถ
        </Button>
      </div>
    </BookingLayout>
  );
};

export default Ticket;
