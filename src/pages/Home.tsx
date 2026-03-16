import { Link, useNavigate } from "react-router-dom";
import { Users, CalendarIcon, MapPin, Tag, Ticket, UserCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
import { format } from "date-fns";
import { useMemo, useState, useEffect } from "react";
import { useBookingStore } from "@/store/bookingStore";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { th } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { getRoutes, getProvinces, getPromotions } from "@/services/api";
import "../css/Home.css";

const Home = () => {
  const store = useBookingStore();
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | undefined>(store.travelDate ? new Date(store.travelDate) : undefined);
  const [openOrigin, setOpenOrigin] = useState(false);
  const [startpoint, setStartpoint] = useState("");
  const [openDestination, setOpenDestination] = useState(false);
  const [destination, setDestination] = useState("");
  const [selectedRouteId, setSelectedRouteId] = useState(store.routeId || "");

  // API Queries
  const { data: routes = [], isLoading: isLoadingRoutes } = useQuery({
    queryKey: ['routes'],
    queryFn: () => getRoutes().then(res => res.data),
  });

  const { data: provinces = [], isLoading: isLoadingProvinces } = useQuery({
    queryKey: ['provinces', selectedRouteId],
    queryFn: () => getProvinces(selectedRouteId).then(res => res.data),
  });

  const { data: promotions = [], isLoading: isLoadingPromotions } = useQuery({
    queryKey: ['promotions'],
    queryFn: () => getPromotions().then(res => res.data),
  });

  // Sync state with store if needed on mount
  useEffect(() => {
    if (store.routeId && !selectedRouteId) {
      setSelectedRouteId(store.routeId);
    }
  }, [store.routeId]);

  const filteredOriginProvinces = useMemo(() => {
    if (!selectedRouteId) return provinces;
    return provinces.filter((p) => p.routeIds.includes(selectedRouteId));
  }, [selectedRouteId, provinces]);

  const filteredDestProvinces = useMemo(() => {
    if (!selectedRouteId) return provinces;
    const originProvince = provinces.find(p => p.name === startpoint);
    return provinces.filter((p) => 
      p.routeIds.includes(selectedRouteId) && 
      (!originProvince || p.id !== originProvince.id)
    );
  }, [selectedRouteId, startpoint, provinces]);

  const handleBooking = () => {
    // Set route
    if (selectedRouteId) store.setRoute(selectedRouteId);
    // Set origin province
    const originP = provinces.find(p => p.name === startpoint);
    if (originP) store.setOriginProvince(originP.id);
    // Set destination province
    const destP = provinces.find(p => p.name === destination);
    if (destP) store.setDestinationProvince(destP.id);
    // Set date
    if (date) store.setTravelDate(format(date, "yyyy-MM-dd"));
    
    navigate("/ticket");
  };
    
  return (
    <div className="min-h-screen bg-background flex flex-col pb-20"> 
      <header className="bg-primary text-primary-foreground px-4 py-3 flex items-start justify-between gap-3 shadow-md sticky top-0  z-50 pt-8 rounded-b-3xl " style={{height:"10rem"}}>
        <div className="flex items-center gap-2">
         <h1 className="text-xl font-bold" > Booking your best trip</h1> 
        </div>
        <Link to="/profile">
          <UserCircle className="h-7 w-7" />
        </Link>
      </header>

      <main className=" space-y-6 max-w-lg mx-auto w-full relative "  >

        <div className="p-4 space-y-6 max-w-lg mx-auto w-full absolute " style={{width:"100%",   minHeight:"7rem", zIndex:51,marginTop:"-10vh" }} > 
        <div className="bg-white rounded-2xl p-3 mb-4  text-lg drop-shadow-xl " > 
           <div className="grid  " >
              <div className="scrollbar flex-shrink-0 flex items-center min-h-[48px]" style={{width:"100%", overflowX:"scroll"}}>
                {isLoadingRoutes ? (
                  <div className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> กำลังโหลดเส้นทาง...
                  </div>
                ) : (
                  routes.map((r) => (
                    <button key={r.id} onClick={() => setSelectedRouteId(r.id)} type="button">
                      <span className={cn("block text-center py-2 px-4 rounded-lg font-medium transition-colors whitespace-nowrap mr-1", selectedRouteId === r.id ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground hover:bg-accent/80")}>
                        {r.name}
                      </span>
                    </button>
                  ))
                )}
              </div>
              <div>
             
              <div className="space-y-1.5 mt-3">
                <label className="text-sm font-medium text-muted-foreground ">
                 ต้นทาง
                </label>
                <div className={cn("w-full h-12 justify-start font-normal relative flex items-center gap-1")}>
                   <MapPin className="h-3.5 w-3.5  text-muted-foreground" /> 
                     <input 
                       type="text"   
                       value={startpoint} 
                       placeholder={isLoadingProvinces ? "กำลังโหลดข้อมูล..." : "เลือกต้นทาง"} 
                       onFocus={() => setOpenOrigin(true)}
                       onChange={(e) => setStartpoint(e.target.value)}
                       onBlur={() => setTimeout(() => setOpenOrigin(false), 150)}
                       disabled={isLoadingProvinces}
                       className="w-full h-12   border-b border-input bg-card focus:outline-none focus:ring-2 focus:ring-ring font-medium text-muted-foreground cursor-pointer px-3 py-2" 
                     /> 
                 {openOrigin && (
                  <div className="absolute inset-x-0 top-full bg-white shadow-lg rounded-lg border border-input mt-1 z-[9999]">
                    <ul className="max-h-60 overflow-y-auto p-2">
                     {filteredOriginProvinces.filter(p => p.name.includes(startpoint)).length > 0 ? (
                       filteredOriginProvinces.filter(p => p.name.includes(startpoint)).map((p) => (
                        <li 
                          key={p.id} 
                          className="cursor-pointer hover:bg-accent rounded-sm px-2 py-2 text-sm"
                          onClick={() => {
                            setStartpoint(p.name);
                            setOpenOrigin(false);
                          }}
                        >
                          {p.name}
                        </li>
                       ))
                     ) : (
                       <li className="p-2 text-xs text-muted-foreground text-center">ไม่พบข้อมูล</li>
                     )}
                    </ul>
                  </div>
                 )}
                 </div> 
              </div>

              <div className="space-y-1.5 mt-3">
                <label className="text-sm font-medium text-muted-foreground  gap-1">
                  ปลายทาง
                </label>
                <div className={cn("w-full h-12 justify-start font-normal relative flex items-center gap-1")}>
                  <MapPin className="h-3.5 w-3.5  text-muted-foreground" /> 
                     <input 
                       type="text"   
                       value={destination} 
                       placeholder={isLoadingProvinces ? "กำลังโหลดข้อมูล..." : "เลือกปลายทาง"} 
                       onFocus={() => setOpenDestination(true)}
                       onChange={(e) => setDestination(e.target.value)}
                       onBlur={() => setTimeout(() => setOpenDestination(false), 150)}
                       disabled={isLoadingProvinces}
                       className="w-full h-12   border-b border-input bg-card focus:outline-none focus:ring-2 focus:ring-ring font-medium text-muted-foreground cursor-pointer px-3 py-2" 
                     /> 
                 {openDestination && (
                  <div className="absolute inset-x-0 top-full bg-white shadow-lg rounded-lg border border-input mt-1 z-[9999]">
                    <ul className="max-h-60 overflow-y-auto p-2">
                     {filteredDestProvinces.filter(p => p.name.includes(destination)).length > 0 ? (
                       filteredDestProvinces.filter(p => p.name.includes(destination)).map((p) => (
                        <li 
                          key={p.id} 
                          className="cursor-pointer hover:bg-accent rounded-sm px-2 py-2 text-sm"
                          onClick={() => {
                            setDestination(p.name);
                            setOpenDestination(false);
                          }}
                        >
                          {p.name}
                        </li>
                       ))
                     ) : (
                       <li className="p-2 text-xs text-muted-foreground text-center">ไม่พบข้อมูล</li>
                     )}
                    </ul>
                  </div>
                 )}
                 </div> 
              </div>

              </div>

              <div className="grid grid-cols-2 gap-2 mt-2" > 
                <div className="space-y-1.5 ">
                <label className="text-sm font-medium text-muted-foreground">วันที่เดินทาง</label><br/>
                <Popover  >
                  <PopoverTrigger asChild>
                    <Button variant="ghost" className={cn("w-full  h-12 justify-start font-normal text-muted-foreground ")} 
                    style={{borderBottom:"1px solid  #DDD", borderRadius:"0px", margin:"0px" , paddingLeft:"0px"}}  >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP", { locale: th }) : "เลือกวันที่"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={date} onSelect={setDate} disabled={(d) => d < new Date()} />
                  </PopoverContent>
                </Popover>
              </div>  
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  จำนวนผู้โดยสาร
                </label>
                <Select  value={String(store.passengerCount)} onValueChange={(v) => store.setPassengerCount(Number(v))}>
                  <SelectTrigger className="h-12 [&>span]:hidden border-none bg-transparent " style={{borderBottom:"1px solid  #DDD", borderRadius:"0px"}} >
                    <Users className="h-3.5 w-3.5 text-muted-foreground" /> <SelectValue placeholder="เลือกจำนวนผู้โดยสาร" className="text-black" />
                  </SelectTrigger>
                  <SelectContent style={{zIndex:"999"}} >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <SelectItem key={n} value={String(n)}>{n} คน</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div> 
              </div> 
 
                <Button 
                  onClick={handleBooking} 
                  className="w-full h-14 text-lg font-bold mt-4" 
                  size="lg"
                  disabled={!selectedRouteId || !startpoint || !destination || !date}
                >
                  <Ticket className="mr-2 h-5 w-5" />
                  จองตั๋วเลย
                </Button>
              
           </div>
        </div> 
 
        <section>
          <h2 className="text-xl font-bold mb-3">ปลายทางยอดนิยม</h2>
          <div className="grid grid-cols-2 gap-3">
            {["กรุงเทพฯ", "เชียงใหม่", "ภูเก็ต", "ขอนแก่น"].map((city) => (
              <Link
                key={city}
                to="/ticket"
                className="block text-center bg-accent text-accent-foreground py-4 rounded-lg font-medium hover:bg-accent/80 transition-colors"
              >
                {city}
              </Link>
            ))}
          </div>
        </section>

        {/* Promotions */}
        <section>
          <h2 className="text-xl font-bold mb-3">โปรโมชั่นล่าสุด</h2>
          <Link to="/promotions">
            <Button variant="outline" className="w-full h-12 font-bold">
              <Tag className="mr-2 h-4 w-4" />
              ดูโปรโมชั่นทั้งหมด
            </Button>
          </Link> <br /> <br />
          {isLoadingPromotions ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Swiper
              slidesPerView={2.5} spaceBetween={12}
              onSlideChange={() => console.log('slide change')}
              onSwiper={(swiper) => console.log(swiper)}
            >
              {promotions.map((promo) => (
                <SwiperSlide className="text-left" key={promo.id}>
                  <Link to={`/promotions/${promo.id}`} key={promo.id}>
                    <img src={promo.imageUrl} alt={promo.title} className="w-full aspect-[4/3] object-cover rounded-xl mb-2 shadow-sm" />
                    <span className="block px-1 text-xs font-semibold line-clamp-2" >{promo.title}</span>
                  </Link>
                </SwiperSlide>))}
            </Swiper>
          )}
        </section>
        <div className="w-100" style={{height:"6rem"}} ></div>
        </div>

      </main>
    </div>
  );
};

export default Home;
