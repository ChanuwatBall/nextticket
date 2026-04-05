import { Link, useNavigate } from "react-router-dom";
import { Users, CalendarIcon, MapPin, Tag, Ticket, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
// import { mockPromotions, provinces, routes } from "@/data/mockData";
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { useBookingStore } from "@/store/bookingStore";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { th } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import "../css/Home.css";
import { mockPromotions } from "@/data/mockData";
// import { getRoutes, getProvinces, getPromotions, Province } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/http/supabase";
import { login, loginWithLine } from "@/services/api";
import liff from "@line/liff";
import moment from "moment";

const Home = () => {
  const store = useBookingStore();
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | undefined>(store.travelDate ? new Date(store.travelDate) : undefined);
  const [openOrigin, setOpenOrigin] = useState(false);
  const [startpoint, setStartpoint] = useState("");
  const [openDestination, setOpenDestination] = useState(false);
  const [destination, setDestination] = useState("");
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [provinces, setProvinces] = useState<any[]>([]);
  const [routesGroup, setRoutesGroup] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [openRoute, setOpenRoute] = useState(false);
  const [promotions, setPromotions] = useState<any[]>([]);
  // API Queries

  // const { data: promotions = [], isLoading: isLoadingPromotions } = useQuery({
  //   queryKey: ['promotions'],
  //   queryFn: () => getPromotions().then(res => res.data),
  // });



  const filteredDestProvinces = useMemo(() => {
    const list = selectedRouteId
      ? provinces.filter((p) => p.region_id == selectedRouteId)
      : provinces;
    return list.filter((v, i, a) => a.findIndex(t => t.destination === v.destination) === i);
  }, [selectedRouteId, provinces]);


  const handleBooking = () => {
    store.setTravelDate(format(date, "yyyy-MM-dd"));
    navigate("/ticket");
  };

  useEffect(() => {

    const conf = async () => {
      try {
      } catch (error) {
        console.log("error ", error)
      }
      try {
        const res = await supabase.from("routes").select("*")
        setRoutes(res.data)
      } catch (error) {
        throw error
      }

      try {
        supabase.from("routes_group").select("*").then(res => {
          console.log(res.data)
          setRoutesGroup(res.data)
        })
      } catch (error) {
        throw error
      }

      try {
        supabase.from("provinces").select("*").then(res => {
          console.log(res.data)
          setProvinces(res.data)
        })
      } catch (error) {
        throw error
      }

      try {
        supabase.from("promotions").select("*")
          .eq("is_active", true)
          .gte("valid_to", moment().format("YYYY-MM-DDTHH:mm:ssZ"))
          .then(res => {
            console.log("promotions ", res.data)
            setPromotions(res.data)
          })
      } catch (err) {

      }

    }
    conf()
  }, [store])

  const filteredRoutes = useMemo(() => {
    return routes.filter((r) => store?.routeGroupid ? r.region_id == store?.routeGroupid : true)
  }, [routes, store?.routeGroupid])

  const filteredProvinceByOrigin = useMemo(() => {
    return store?.routeGroupid ?
      provinces.filter((r) => store?.routeGroupid ? r.region_id == store?.routeGroupid : true).
        filter((r) => store?.originProvinceId ? r.id == store?.originProvinceId : true)
      : provinces
  }, [provinces, store?.originProvinceId])



  const filteredProvinceByDestination = useMemo(() => {
    const filtered = provinces.filter(r => store.originProvinceId ? r.id !== store.originProvinceId?.id : true)
    return filtered
  }, [provinces, store?.originProvinceId])


  const selectRoute = (route: any) => {
    console.log("route ", route)
    store.setRoute(`${route.origin} - ${route.destination}`);
    setOpenRoute(false);

    const pStart = provinces.find(p => p.id === route.origin_id);
    console.log("pStart ", pStart)

    if (pStart) store.setOriginProvince(pStart.id);
    const pEnd = provinces.find(p => p.id === route.destination_id);
    store.setOriginProvince(pStart.id)
    setStartpoint(pStart.name)
    console.log("pEnd ", pEnd)
    if (pEnd) store.setDestinationProvince(pEnd.name);
    store.setDestinationProvince(pEnd.id)
    setDestination(pEnd.name)
  }
  const chooseGroup = (r) => {
    store?.setRouteGroupId(r.g_route_id)
    store.setRoute(null)
    store.setOriginProvince(null)
    store.setDestinationProvince(null)
  }
  const chooseRoute = (p) => {
    selectRoute(p);
    const sp = provinces.find(pr => pr.id == p.origin)
    const ep = provinces.find(pr => pr.id == p.destination)
    store?.setOriginProvince(sp);
    store?.setDestinationProvince(ep);
  }
  return (
    <div className="min-h-screen bg-background flex flex-col pb-20">
      <header className="bg-primary text-primary-foreground px-4 py-3 flex items-start justify-between gap-3 shadow-md sticky top-0  z-50 pt-8 rounded-b-3xl " style={{ height: "10rem" }}>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold" > Booking your best trip</h1>
        </div>
        <Link to="/profile">
          <UserCircle className="h-7 w-7" />
        </Link>
      </header>

      <main className=" space-y-6 max-w-lg mx-auto w-full relative "  >

        <div className="p-4 space-y-6 max-w-lg mx-auto w-full absolute " style={{ width: "100%", minHeight: "7rem", zIndex: 51, marginTop: "-10vh" }} >
          <div className="bg-white rounded-2xl p-3 mb-4  text-lg drop-shadow-xl " >
            <div className="grid  " >
              <div className="scrollbar flex-shrink-0 flex " style={{ width: "100%", overflowX: "scroll" }}>
                {routesGroup.map((r) => (
                  <button key={r.id} onClick={() => {
                    chooseGroup(r)
                  }}>
                    <span className={cn("block text-center py-2 px-4 rounded-lg font-medium transition-colors whitespace-nowrap mr-1", store?.routeGroupid === r.g_route_id ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground hover:bg-accent/80")}>
                      {r.name}
                    </span>
                  </button>
                ))}
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
                      value={store.originProvinceId?.name || ""}
                      placeholder="เลือกต้นทาง"
                      onFocus={() => setOpenOrigin(true)}
                      onChange={(e) => setStartpoint(e.target.value)}
                      onBlur={() => setTimeout(() => setOpenOrigin(false), 150)}
                      className="w-full h-12   border-b border-input bg-card focus:outline-none focus:ring-2 focus:ring-ring font-medium text-muted-foreground cursor-pointer px-3 py-2"
                    />
                    {openOrigin && <div className="absolute inset-0 bg-white  mt-14" style={{ zIndex: "9999" }} onClick={() => setOpenOrigin(false)}>
                      <ul className="max-h-60 overflow-y-auto  bg-white border border-input rounded-lg p-2" onClick={(e) => e.stopPropagation()}>
                        {provinces.map((p) => (
                          <li
                            key={p.id}
                            className="cursor-pointer hover:bg-accent rounded-sm px-2 py-1"
                            onClick={() => {
                              setStartpoint(p.origin);
                              setOpenOrigin(false);
                              store.setOriginProvince(p);
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
                  <label className="text-sm font-medium text-muted-foreground  gap-1">
                    ปลายทาง
                  </label>
                  <div className={cn("w-full h-12 justify-start font-normal relative flex items-center gap-1")}>
                    <MapPin className="h-3.5 w-3.5  text-muted-foreground" />
                    <input
                      type="text"
                      value={store?.destinationProvinceId?.name || ""}
                      placeholder="เลือกปลายทาง"
                      onFocus={() => setOpenDestination(true)}
                      onChange={(e) => { setDestination(e.target.value) }}
                      onBlur={() => setTimeout(() => setOpenDestination(false), 150)}
                      className="w-full h-12   border-b border-input bg-card focus:outline-none focus:ring-2 focus:ring-ring font-medium text-muted-foreground cursor-pointer px-3 py-2"
                    />
                    {openDestination && <div className="absolute inset-0 bg-white  mt-14" style={{ zIndex: "9999" }} onClick={() => setOpenDestination(false)}>
                      <ul className="max-h-60 overflow-y-auto  bg-white border border-input rounded-lg p-2" onClick={(e) => e.stopPropagation()}>
                        {filteredProvinceByDestination.map((p) => (
                          <li
                            key={p.id}
                            className="cursor-pointer hover:bg-accent rounded-sm px-2 py-1"
                            onClick={() => {
                              setDestination(p);
                              setOpenDestination(false);
                              store.setDestinationProvince(p);
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
                  <label className="text-sm font-medium text-muted-foreground">วันที่เดินทาง</label><br />
                  <Popover  >
                    <PopoverTrigger asChild>
                      <Button variant="ghost" className={cn("w-full  h-12 justify-start font-normal text-muted-foreground ")}
                        style={{ borderBottom: "1px solid  #DDD", borderRadius: "0px", margin: "0px", paddingLeft: "0px" }}  >
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
                  <Select value={String(store.passengerCount)} onValueChange={(v) => store.setPassengerCount(Number(v))}>
                    <SelectTrigger className="h-12 border-none bg-transparent " style={{ borderBottom: "1px solid  #DDD", borderRadius: "0px" }} >
                      <Users className="h-3.5 w-3.5 text-muted-foreground" /> <SelectValue placeholder="เลือกจำนวนผู้โดยสาร" className="text-black" />
                    </SelectTrigger>
                    <SelectContent style={{ zIndex: "999" }} >
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <SelectItem key={n} value={String(n)}>{n} คน</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleBooking} className="w-full h-14 text-lg font-bold mt-4" size="lg">
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
            <Swiper
              slidesPerView={2.5} spaceBetween={3}
              onSlideChange={() => console.log('slide change')}
              onSwiper={(swiper) => console.log(swiper)}
            >
              {/* {mockPromotions.map((promo) => (
                <SwiperSlide className="text-left" key={promo.id}>
                  <Link to={`/promotions/${promo.id}`} key={promo.id}>
                    <img src={promo.imageUrl} alt={promo.title} className=" object-cover rounded-xl mb-2" />
                    <span className="m-3 text-sm" >{promo.title}</span>
                  </Link>
                </SwiperSlide>))} */}
              {
                promotions && promotions.map((promo) =>
                  <SwiperSlide className="text-left" key={promo.id}>
                    <div className={`w-full h-full rounded-xl overflow-hidden relative  bg-gradient-to-r ${promo.bg_color}  `}
                      style={{ width: "100%", height: "10rem" }}
                    >
                      <div className={`absolute inset-0 flex items-center justify-center text-left p-3`}
                        style={{ flexDirection: "column" }}>
                        <span className="text-white text-xl font-bold">{promo.title}</span>
                        <small>{promo?.description}</small>
                      </div>
                    </div>
                  </SwiperSlide>
                )
              }
            </Swiper>
          </section>
          <div className="w-100" style={{ height: "6rem" }} ></div>
        </div>

      </main>
    </div>
  );
};

export default Home;
