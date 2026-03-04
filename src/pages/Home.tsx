import { Link } from "react-router-dom";
import { Users, CalendarIcon, MapPin, Tag, Ticket, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { mockPromotions, provinces, routes } from "@/data/mockData";  
import { format } from "date-fns";
import { useMemo, useState } from "react";
import { useBookingStore } from "@/store/bookingStore";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { th } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@radix-ui/react-select"; 

const Home = () => {
  const store = useBookingStore();
    const [date, setDate] = useState<Date | undefined>(store.travelDate ? new Date(store.travelDate) : undefined);
    const [openOrigin, setOpenOrigin] = useState(false);
    const [startpoint, setStartpoint] = useState("");
    const [openDestination, setOpenDestination] = useState(false);
    const [destination, setDestination] = useState("");
    
    const filteredOriginProvinces = useMemo(() => {
      if (!store.routeId) return provinces;
      return provinces.filter((p) => p.routeIds.includes(store.routeId));
    }, [store.routeId]);
    
  return (
    <div className="min-h-screen bg-background flex flex-col pb-20">
      {/* Header */}
      <header className="bg-primary text-primary-foreground px-4 py-3 flex items-start justify-between gap-3 shadow-md sticky top-0  z-50 pt-8" style={{height:"10rem"}}>
        <div className="flex items-center gap-2">
         <h1 className="text-xl font-bold" > Booking your best trip</h1>
          {/* <Bus className="h-6 w-6" />
          <h1 className="text-lg font-bold tracking-tight">Nex Express</h1> */}
        </div>
        <Link to="/profile">
          <UserCircle className="h-7 w-7" />
        </Link>
      </header>

      <main className=" space-y-6 max-w-lg mx-auto w-full relative "  >

        <div className="p-4 space-y-6 max-w-lg mx-auto w-full absolute " style={{width:"95%", left:"2.5%" , top:"-8vh", minHeight:"7rem", zIndex:51,}} > 
        <div className="bg-white rounded-lg p-3   mb-4  text-lg" >
           
           <div className="grid  " >
              <div className=" flex-shrink-0 flex " style={{width:"100%", overflowX:"scroll"}}>
                 {routes.map((r) => (
                  <button key={r.id}  >
                    <Link to="/ticket"  className="block text-center bg-accent text-accent-foreground py-2 px-4 rounded-lg font-medium hover:bg-accent/80 transition-colors whitespace-nowrap mr-1">
                      {r.name}
                    </Link>
                  </button>
              ))}
              </div>
              <div>
             
              <div className="space-y-1.5 mt-3">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> ต้นทาง
                </label>
                <div className={cn("w-full h-12 justify-start font-normal relative ")}>
                     <input 
                       type="text"   
                       value={startpoint} 
                       placeholder="เลือกต้นทาง" 
                       onFocus={() => setOpenOrigin(true)}
                       onChange={(e) => setStartpoint(e.target.value)}
                       onBlur={() => setOpenOrigin(false)}
                       className="w-full h-12   border-b border-input bg-card focus:outline-none focus:ring-2 focus:ring-ring font-medium text-muted-foreground cursor-pointer px-3 py-2" 
                     /> 
                 {openOrigin && <div className="absolute inset-0 bg-white  mt-14" style={{zIndex:"9999"}} onClick={() => setOpenOrigin(false)}>
                   <ul className="max-h-60 overflow-y-auto  bg-white border border-input rounded-lg p-2" onClick={(e) => e.stopPropagation()}>
                     {filteredOriginProvinces.filter(p => p.name.includes(startpoint)).map((p) => (
                      <li 
                        key={p.id} 
                        className="cursor-pointer hover:bg-accent rounded-sm px-2 py-1"
                        onClick={() => {
                          setStartpoint(p.name);
                          setOpenOrigin(false);
                        }}
                      >
                        {p.name}
                      </li>
                     ))}
                    </ul>
                  </div>}
                 </div> 
              </div>

              <div className="space-y-1.5 mt-3">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> ปลายทาง
                </label>
                <div className={cn("w-full h-12 justify-start font-normal relative ")}>
                     <input 
                       type="text"   
                       value={destination} 
                       placeholder="เลือกปลายทาง" 
                       onFocus={() => setOpenDestination(true)}
                       onChange={(e) => setDestination(e.target.value)}
                       onBlur={() => setOpenDestination(false)}
                       className="w-full h-12   border-b border-input bg-card focus:outline-none focus:ring-2 focus:ring-ring font-medium text-muted-foreground cursor-pointer px-3 py-2" 
                     /> 
                 {openDestination && <div className="absolute inset-0 bg-white  mt-14" style={{zIndex:"9999"}} onClick={() => setOpenOrigin(false)}>
                   <ul className="max-h-60 overflow-y-auto  bg-white border border-input rounded-lg p-2" onClick={(e) => e.stopPropagation()}>
                     {filteredOriginProvinces.filter(p => p.name.includes(startpoint)).map((p) => (
                      <li 
                        key={p.id} 
                        className="cursor-pointer hover:bg-accent rounded-sm px-2 py-1"
                        onClick={() => {
                          setStartpoint(p.name);
                          setOpenOrigin(false);
                        }}
                      >
                        {p.name}
                      </li>
                     ))}
                    </ul>
                  </div>}
                 </div> 
              </div>

              </div>

              <div className="grid grid-cols-2 gap-2 mt-2" > 
                <div className="space-y-1.5 ">
                <label className="text-sm font-medium text-muted-foreground">วันที่เดินทาง</label><br/>
                <Popover  >
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full  h-12 justify-start font-normal", !date && "text-muted-foreground")}>
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
            <Users className="h-3.5 w-3.5" /> จำนวนผู้โดยสาร
          </label>
          <Select value={String(store.passengerCount)} onValueChange={(v) => store.setPassengerCount(Number(v))}>
            <SelectTrigger className="h-12 [&>span]:hidden">
              <SelectValue placeholder="เลือกจำนวนผู้โดยสาร" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <SelectItem key={n} value={String(n)}>{n} คน</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div> 
              </div> 
 
                <Button className="w-full h-14 text-lg font-bold mt-4" size="lg">
                  <Ticket className="mr-2 h-5 w-5" />
                  จองตั๋วเลย
                </Button>
              
           </div>
        </div> 

        {/* Search */}
        {/* <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="ค้นหาปลายทางหรือสถานี"
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-card focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div> */}

        {/* Quick Booking CTA */}
       

        {/* Popular Destinations */}
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
          <Swiper
            slidesPerView={2.5} spaceBetween={3}
            onSlideChange={() => console.log('slide change')}
            onSwiper={(swiper) => console.log(swiper)}
          >
            {mockPromotions.map((promo) => (
              <SwiperSlide className="text-left" key={promo.id}>
                <Link to={`/promotions/${promo.id}`} key={promo.id}>
                  <img src={promo.imageUrl} alt={promo.title} className=" object-cover rounded-xl mb-2" />
                  <span className="m-3 text-sm" >{promo.title}</span>
                </Link>
              </SwiperSlide>))}
          </Swiper>
        </section>
        <div className="w-100" style={{height:"6rem"}} ></div>
        </div>

      </main>
    </div>
  );
};

export default Home;
