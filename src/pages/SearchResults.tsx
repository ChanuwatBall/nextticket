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

const SearchResults = () => {
  const navigate = useNavigate();
  const store = useBookingStore();
  const [trips, setTrips] = useState<any[]>([]);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [isLoadingTrips, setIsLoadingTrips] = useState(false);
  const [originName, setOriginName] = useState<string>("");
  const [destName, setDestName] = useState<string>("");

  // const { data: provinces = [], isLoading: isLoadingProvinces } = useQuery({
  //   queryKey: ['provinces', store.routeId],
  //   queryFn: () => getProvinces(store.routeId),
  // });

  // const originName = useMemo(() =>
  //   provinces.find((p) => p.id === store.originProvinceId)?.name ?? "",
  //   [provinces, store.originProvinceId]
  // );

  // const destName = useMemo(() =>
  //   provinces.find((p) => p.id === store.destinationProvinceId)?.name ?? "",
  //   [provinces, store.destinationProvinceId]
  // );

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

      } catch (error) {
        throw error
      }

      // const trips = await supabase.from("trips").select("*,bus_type_id(*)")
      //   .eq("origin_province_id", store.originProvinceId.id)
      //   .eq("destination_province_id", store.destinationProvinceId.id)
      //   .eq("date", store.travelDate)
      //   .gte("available_seats", 1)
      // const res = await supabase.from("trips")
      //   .select("*")  
      //   .eq("route_id", store.originProvinceId)
      //   .gte("date", moment().add(2, "hour").format())


    }
    conf()

  }, [])

  const handleSelectTrip = (trip: typeof trips[0]) => {
    store.setSelectedTrip(trip);
    navigate("/seats");
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
    </BookingLayout>
  );
};

export default SearchResults;
