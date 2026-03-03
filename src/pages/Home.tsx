import { Link } from "react-router-dom";
import { Bus, Search, Tag, Ticket, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const Home = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col pb-20">
      {/* Header */}
      <header className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between gap-3 shadow-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Bus className="h-6 w-6" />
          <h1 className="text-lg font-bold tracking-tight">Nex Express</h1>
        </div>
        <Link to="/profile">
          <UserCircle className="h-7 w-7" />
        </Link>
      </header>

      <main className="p-4 space-y-6 max-w-lg mx-auto w-full">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="ค้นหาปลายทางหรือสถานี"
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-card focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Quick Booking CTA */}
        <Link to="/ticket">
          <Button className="w-full h-14 text-lg font-bold" size="lg">
            <Ticket className="mr-2 h-5 w-5" />
            จองตั๋วเลย
          </Button>
        </Link>

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
          </Link>
        </section>
      </main>
    </div>
  );
};

export default Home;
