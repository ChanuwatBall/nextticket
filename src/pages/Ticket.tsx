import { useState, useMemo, useEffect, useCallback } from "react";
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
// import { boardingPoints } from "@/data/mockData";
import { getRoutes, getProvinces, Province, Route, getBoardingPoints, BoardingPoint } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/http/supabase";

const Ticket = () => {
  const navigate = useNavigate();
  const store = useBookingStore();
  const [date, setDate] = useState<Date | undefined>(store.travelDate ? new Date(store.travelDate) : store.travelDate === '' ? undefined : undefined);

  const [provinces, setProvinces] = useState<any[]>([]);
  const [routes, setRoute] = useState<any[]>([]);
  const [boardingPoints, setBoardingPoints] = useState<BoardingPoint[]>([]);
  const [selectOrigin, setSelectOrigin] = useState<any>(null);
  const [selectDest, setSelectDest] = useState<any>(null);
  const [originBoardingPoints, setOriginBoardingPoints] = useState<any[]>([]);
  const [destBoardingPoints, setDestBoardingPoints] = useState<any[]>([]);
  // const { data: routes = [], isLoading: isLoadingRoutes } = useQuery({
  //   queryKey: ['routes'],
  //   queryFn: () => getRoutes().then(res => res.data),
  // });

  // const { data: originBoardingPoints = [], isLoading: isLoadingOriginBoardingPoints } = useQuery({
  //   queryKey: ['originBoardingPoints', store.originProvinceId],
  //   queryFn: () => {
  //     const selectOrigin = provinces.find((p) => p.id === store.originProvinceId)
  //     console.log("selectOrigin ", selectOrigin)
  //     const ress = supabase.from("route_boarding_points")
  //       .select("* , boarding_points(id,name,name_en,province_id)")
  //       .eq("route_id", store.originProvinceId)
  //       .then(res => res.data)
  //   }
  // });

  // const { data: destBoardingPoints = [], isLoading: isLoadingDestBoardingPoints } = useQuery({
  //   queryKey: ['destBoardingPoints', store.destinationProvinceId],
  //   queryFn: () => {
  //     const selectDest = provinces.find((p) => p.id === store.destinationProvinceId)
  //     console.log("selectDest ", selectDest)

  //     const ress = supabase.from("route_boarding_points")
  //       .select("* , boarding_points(id,name,name_en,province_id)")
  //       .eq("route_id", store.originProvinceId)
  //       .then(res => res.data)
  //   }
  // }, [store.originProvinceId]);

  useEffect(() => {
    const conf = async () => {
      try {
        const res = await supabase.from("routes").select("*")
        setProvinces(res.data)
        try {
          const boardingpoint = await supabase.from("boarding_points").select("*")
          console.log("boardingpoint", boardingpoint.data)
          setBoardingPoints(boardingpoint.data)
          console.log("store.originProvinceId", store.originProvinceId)
          const selectOrigin = res.data.find((p) => p.id === store.originProvinceId)
          console.log("selectOrigin ", selectOrigin)
          setSelectOrigin(selectOrigin)


          // const selectDest = res.data.find((p) => p.id === store.destinationProvinceId)
          // console.log("selectDest ", selectDest)
          // setSelectDest(selectDest)

          const ress = await supabase.from("route_boarding_points")
            .select("* , boarding_points(id,name,name_en,province_id)")
            .eq("route_id", store.originProvinceId)
          console.log("ress", ress.data)

          let origin = boardingpoint.data.filter((item: any) => {
            return item.province_id === selectOrigin.origin_id
          })
          setOriginBoardingPoints(origin)
          console.log("origin boarding points ", origin)
          let desty = boardingpoint.data.filter((item: any) => {
            return item.province_id === selectDest.destination_id
          })
          console.log("dest boarding points ", desty)
          setDestBoardingPoints(desty)
          // .eq("route_id", store.destinationProvinceId)

        } catch (err) {
          throw err
        }
      } catch (error) {
        throw error
      }

      try {
        supabase.from("routes_group").select("*").then(res => {
          setRoute(res.data)
        })
      } catch (error) {
        throw error
      }
    }
    conf()
  }, [store.originProvinceId, store.destinationProvinceId, store.originProvinceId])


  // const filteredOriginProvinces = useMemo(() => {
  //   console.log("store.routeId", store.routeId)
  //   if (!store.routeId) return provinces;
  //   return provinces.filter((p) => p.region_id == store.routeId);
  // }, [store.routeId, provinces]);

  const filteredOriginProvinces = useMemo(() => {
    const list = store.routeId
      ? provinces.filter((p) => p.region_id == store.routeId)
      : provinces;
    return list.filter((v, i, a) => a.findIndex(t => t.origin === v.origin) === i);
  }, [store.routeId, provinces]);


  const filteredDestProvinces = useMemo(() => {
    const list = store.routeId
      ? provinces.filter((p) => p.region_id == store.routeId)
      : provinces;
    return list.filter((v, i, a) => a.findIndex(t => t.destination === v.destination) === i);
  }, [store.routeId, provinces]);

  // const originBoardingPoints = useMemo(
  //   () => boardingPoints.filter((bp) => bp.provinceId === store.originProvinceId),
  //   [store.originProvinceId, provinces, boardingPoints]
  // );

  // const destBoardingPoints = useMemo(
  //   () => boardingPoints.filter((bp) => bp.provinceId === store.destinationProvinceId),
  //   [store.destinationProvinceId, provinces, boardingPoints]
  // );

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
                <SelectItem key={r.g_route_id} value={r.g_route_id}>{r.name}</SelectItem>
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
                <SelectItem key={p.id} value={p.id}>{p.origin}</SelectItem>
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
                  <SelectItem key={bp.id} value={bp.id}>{bp?.name}</SelectItem>
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
                <SelectItem key={p.id} value={p.id}>{p.destination}</SelectItem>
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
                  <SelectItem key={bp.id} value={bp.id}>{bp?.name}</SelectItem>
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
