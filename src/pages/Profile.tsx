import { User, Ticket, Star, Wallet, ChevronRight, Bus } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

const menuItems = [
  { label: "ตั๋วของฉัน", icon: Ticket, to: "/my-tickets" },
  { label: "สะสมแต้ม", icon: Star, to: "#" },
  { label: "กระเป๋าเงิน", icon: Wallet, to: "#" },
];

const Profile = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col pb-20">
      <header className="bg-primary text-primary-foreground px-4 py-3 flex items-center gap-3 shadow-md sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2">
          <Bus className="h-6 w-6" />
          <h1 className="text-lg font-bold tracking-tight">Nex Express</h1>
        </Link>
      </header>

      <main className="p-4 space-y-4 max-w-lg mx-auto w-full">
        {/* Avatar */}
        <div className="flex flex-col items-center py-6">
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-3">
            <User className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-bold">ผู้ใช้ทั่วไป</h2>
          <p className="text-sm text-muted-foreground">ยังไม่ได้เข้าสู่ระบบ</p>
        </div>

        {/* Menu */}
        <Card>
          <CardContent className="p-0 divide-y divide-border">
            {menuItems.map(({ label, icon: Icon, to }) => (
              <Link
                key={label}
                to={to}
                className="flex items-center justify-between px-4 py-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{label}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Profile;
