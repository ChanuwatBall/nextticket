import { Icon } from "@iconify/react";
import { Link, Bus } from "lucide-react";



const Home: React.FC = () => {
  return ( 
     <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between gap-3 shadow-md sticky top-0 z-50">
       <label htmlFor="home" className="flex items-center gap-2 cursor-pointer">
          <Bus className="h-6 w-6" />  
          <h1 className="text-lg font-bold tracking-tight">Nex Express</h1>
        </label>
 
          <Icon 
              icon="lucide:user-star"
              width="32"
              height="32"
              className="stroke-current stroke-5"/>
        
      </header> 
      <body className="p-8" >
        {/* <h2 className="text-2xl font-bold mb-4">ยินดีต้อนรับสู่ Nex Express</h2>
        <p className="text-lg text-muted-foreground mb-6">จองตั๋วรถบัสออนไลน์ง่ายๆ กับเรา</p>
        <div className="space-y-4">
          <Link to="/search" className="block w-full text-center bg-primary text-primary-foreground py-3 rounded-lg font-bold">
            เริ่มจองตั๋ว
          </Link>
          <Link to="/promotions" className="block w-full text-center bg-secondary text-secondary-foreground py-3 rounded-lg font-bold">
            ดูโปรโมชั่น
          </Link>
          <Link to="/my-tickets" className="block w-full text-center bg-accent text-accent-foreground py-3 rounded-lg font-bold">
            ตั๋วของฉัน
          </Link>
        </div> */}
        <div>
            <input type="text" placeholder="ค้นหาปลายทางหรือสถานี" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div className="mt-6">
            <h2 className="text-xl font-bold mb-3">ปลายทางยอดนิยม</h2>
            <div className="grid grid-cols-2 gap-4">
                <Link to="/search?destination=Bangkok" className="block w-full text-center bg-primary text-primary-foreground py-3 rounded-lg font-bold">
                    กรุงเทพฯ
                </Link>
                <Link to="/search?destination=ChiangMai" className="block w-full text-center bg-primary text-primary-foreground py-3 rounded-lg font-bold">
                    เชียงใหม่
                </Link>
                <Link to="/search?destination=Phuket" className="block w-full text-center bg-primary text-primary-foreground py-3 rounded-lg font-bold">
                    ภูเก็ต
                </Link>
                <Link to="/search?destination=KhonKaen" className="block w-full text-center bg-primary text-primary-foreground py-3 rounded-lg font-bold">
                    ขอนแก่น
                </Link>
            </div>
        </div>
        <div className="mt-6">
            <h2 className="text-xl font-bold mb-3">โปรโมชั่นล่าสุด</h2>
            <div className="grid grid-cols-1 gap-4">
                <Link to="/promotions" className="block w-full text-center bg-secondary text-secondary-foreground py-3 rounded-lg font-bold">
                    ดูโปรโมชั่นทั้งหมด
                </Link>
            </div>
        </div>
      </body> 
    </div>
  );
};

export default Home;