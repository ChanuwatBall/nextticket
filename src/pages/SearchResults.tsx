import { useNavigate } from "react-router-dom";
import PageTransition from "@/components/PageTransition";
import BookingLayout from "@/components/BookingLayout";
import { useBookingStore } from "@/store/bookingStore";
// import { mockTrips } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Users, Bus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
// import { getProvinces, Province, searchTrips, Trip } from "@/services/api";
import { supabase } from "@/http/supabase";
import moment from "moment";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const SearchResults = () => {
  const navigate = useNavigate();
  const store = useBookingStore();
  const [trips, setTrips] = useState<any[]>([]);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [isLoadingTrips, setIsLoadingTrips] = useState(false);
  const [originName, setOriginName] = useState<string>("");
  const [destName, setDestName] = useState<string>("");

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedTripToBook, setSelectedTripToBook] = useState<any>(null);
  const [busStops, setBusStops] = useState<any[]>([]);
  const [localBoardingPoint, setLocalBoardingPoint] = useState<any>(null);
  const [localDropOffPoint, setLocalDropOffPoint] = useState<any>(null);

  useEffect(() => {
    const conf = async () => {
      console.log("store.travelDate ", store.travelDate)
      console.log("store.routeId ", store.routeId)
      console.log("store.originProvinceId ", store.originProvinceId)
      console.log("store.destinationProvinceId ", store.destinationProvinceId)
      console.log("store.boardingPointId ", store.boardingPointId)
      console.log("store.dropOffPointId ", store.dropOffPointId)
      console.log("passengerCount", store.passengerCount)

      try {
        const route = await supabase.from("routes").select("*")
          .eq("origin_id", store.originProvinceId.id)
          .eq("destination_id", store.destinationProvinceId.id)
          .then(({ data }) => { return data })
        console.log("route ", route)
        const routeId = route.map((item) => item.id)

        const trips = await supabase.from("trips").select("*,bus_type_id(*)")
          .in("route_id", routeId)
          .eq("date", store.travelDate)
          .gte("available_seats", 1)

        console.log("trips ", trips.data)
        setTrips(trips.data)

        const busStopsRes = await supabase.from("bus_stops").select("*, route_id(*)");
        if (busStopsRes.data) {
          setBusStops(busStopsRes.data);
        }
      } catch (error) {
        throw error
      }
 
    }
    conf()

  }, [store])

  const originBoardingPoints = useMemo(() => {
    if (!store.originProvinceId || !busStops.length) return [];
    return busStops.filter(r => 
      store?.destinationProvinceId ? store?.destinationProvinceId?.id != r.route_id?.origin_id && r.route_id?.origin_id == store.originProvinceId?.id
      : r.route_id?.origin_id == store.originProvinceId?.id
    ).filter(r => r.type === "pickup" || r.type === "stop");
  }, [busStops, store.originProvinceId, store.destinationProvinceId]);

  const destBoardingPoints = useMemo(() => {
    if (!store.destinationProvinceId || !busStops.length) return [];
    return busStops.filter(r => 
      store?.originProvinceId ? store?.originProvinceId?.id != r.route_id?.destination_id && r.route_id?.destination_id == store.destinationProvinceId?.id
      : r.route_id?.destination_id == store.destinationProvinceId?.id
    ).filter(r => r.type === "dropoff" || r.type === "stop");
  }, [busStops, store.destinationProvinceId, store.originProvinceId]);

  const handleSelectTrip = (trip: typeof trips[0]) => {
    setSelectedTripToBook(trip);
    console.log("handleSelectTrip trip ", trip)
    store.setSelectedTrip(trip);
    if (store.boardingPointId) setLocalBoardingPoint(store.boardingPointId);
    if (store.dropOffPointId) setLocalDropOffPoint(store.dropOffPointId);
    setIsPopupOpen(true);
  };

  const handleConfirmPoints = () => {
    if (localBoardingPoint && localDropOffPoint) {
      store.setBoardingPoint(localBoardingPoint);
      store.setDropOffPoint(localDropOffPoint);
      store.setSelectedTrip(selectedTripToBook);
      setIsPopupOpen(false);
      navigate("/seats");
    }
  };

  return (
    <BookingLayout currentStep={2} title="เลือกเที่ยวรถ" navto={() => navigate(-1)}>
      <div className="px-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <MapPin className="h-3.5 w-3.5" />
          <span>{store.originProvinceId?.name} → {store.destinationProvinceId?.name}</span>
          <span className="ml-auto">{store.travelDate}</span>
        </div>

        {!trips || trips.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Bus className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">ไม่พบเที่ยวรถในเส้นทางนี้</p>
            <p className="text-sm mt-1">กรุณาเลือกเส้นทางอื่น</p>
          </div>
        ) : (
          <div className="space-y-3">
            {isLoadingTrips ? <div> Loading </div> :
              trips && trips.map((trip) => (
                <Card
                  key={trip.id}
                  className="cursor-pointer hover:ring-2 hover:ring-primary/30 active:scale-[0.98] transition-all"
                  onClick={() => handleSelectTrip(trip)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="text-lg font-bold">{trip.departure_time}</span>
                        <span className="text-muted-foreground">→</span>
                        <span className="text-lg font-bold">{trip.arrival_time}</span>
                      </div>
                      <span className="text-xl font-bold text-primary">฿{trip.price}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary">{trip.trip_type}</Badge>
                      <Badge variant="outline">{trip.bus_type_id?.name}</Badge>
                      <div className="flex items-center gap-1 ml-auto text-sm text-muted-foreground">
                        <Users className="h-3.5 w-3.5" />
                        <span>ว่าง {trip.available_seats} ที่นั่ง</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </div>

      <Drawer open={isPopupOpen} onOpenChange={setIsPopupOpen}>
        <DrawerContent className="sm:max-w-[425px] mx-auto w-full px-4 pb-4">
          <DrawerHeader>
            <DrawerTitle className="text-center">
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{store.originProvinceId?.name} - {store.destinationProvinceId?.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">{store.travelDate}</span>
                <small className="text-muted-foreground" style={{fontWeight:"400"}}>เลือกจุดขึ้นรถและจุดลงรถ</small>
              </div>
            </DrawerTitle>
          </DrawerHeader>
          {selectedTripToBook && (
            <div className="bg-muted p-3 rounded-lg mb-2"> 
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-base font-bold">{selectedTripToBook.departure_time}</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="text-base font-bold">{selectedTripToBook.arrival_time}</span>
                </div>
                <span className="text-base font-bold text-primary">฿{selectedTripToBook.price}</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs">{selectedTripToBook.trip_type}</Badge>
                <Badge variant="outline" className="text-xs">{selectedTripToBook.bus_type_id?.name}</Badge>
              </div>
            </div>
          )}
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">จุดขึ้นรถ</label>
              <Select value={localBoardingPoint?.id} onValueChange={(val) => {
                const pt = originBoardingPoints.find(p => p.id === val);
                setLocalBoardingPoint(pt);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกจุดขึ้นรถ" />
                </SelectTrigger>
                <SelectContent>
                  {originBoardingPoints.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.type === "stop" ? "จุดจอด" : "จุดขึ้นรถ"} {p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">จุดลงรถ</label>
              <Select value={localDropOffPoint?.id} onValueChange={(val) => {
                const pt = destBoardingPoints.find(p => p.id === val);
                setLocalDropOffPoint(pt);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกจุดลงรถ" />
                </SelectTrigger>
                <SelectContent>
                  {destBoardingPoints.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.type === "stop" ? "จุดจอด" : "จุดลงรถ"} {p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DrawerFooter className="px-0 pt-2">
            <Button onClick={handleConfirmPoints} disabled={!localBoardingPoint || !localDropOffPoint}>
              ยืนยัน
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </BookingLayout>
  );
};

export default SearchResults;
