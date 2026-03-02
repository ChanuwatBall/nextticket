import { useNavigate } from "react-router-dom";
import BookingLayout from "@/components/BookingLayout";
import { useBookingStore } from "@/store/bookingStore";
import { mockTrips, provinces } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Users, Bus } from "lucide-react";
import { useMemo } from "react";

const SearchResults = () => {
  const navigate = useNavigate();
  const store = useBookingStore();

  const trips = useMemo(() => {
    return mockTrips.filter(
      (t) =>
        t.originProvinceId === store.originProvinceId &&
        t.destinationProvinceId === store.destinationProvinceId
    );
  }, [store.originProvinceId, store.destinationProvinceId]);

  const originName = provinces.find((p) => p.id === store.originProvinceId)?.name ?? "";
  const destName = provinces.find((p) => p.id === store.destinationProvinceId)?.name ?? "";

  const handleSelectTrip = (trip: typeof mockTrips[0]) => {
    store.setSelectedTrip(trip);
    navigate("/seats");
  };

  return (
    <BookingLayout currentStep={2} title="เลือกเที่ยวรถ">
      <div className="px-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <MapPin className="h-3.5 w-3.5" />
          <span>{originName} → {destName}</span>
          <span className="ml-auto">{store.travelDate}</span>
        </div>

        {trips.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Bus className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">ไม่พบเที่ยวรถในเส้นทางนี้</p>
            <p className="text-sm mt-1">กรุณาเลือกเส้นทางอื่น</p>
          </div>
        ) : (
          <div className="space-y-3">
            {trips.map((trip) => (
              <Card
                key={trip.id}
                className="cursor-pointer hover:ring-2 hover:ring-primary/30 active:scale-[0.98] transition-all"
                onClick={() => handleSelectTrip(trip)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-lg font-bold">{trip.departureTime}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="text-lg font-bold">{trip.arrivalTime}</span>
                    </div>
                    <span className="text-xl font-bold text-primary">฿{trip.price}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary">{trip.tripType}</Badge>
                    <Badge variant="outline">{trip.busType}</Badge>
                    <div className="flex items-center gap-1 ml-auto text-sm text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      <span>ว่าง {trip.availableSeats} ที่นั่ง</span>
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
