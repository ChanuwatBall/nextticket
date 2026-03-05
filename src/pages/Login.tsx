import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Bus, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "เข้าสู่ระบบสำเร็จ!", description: "ยินดีต้อนรับกลับ" });
    navigate("/profile");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-primary text-primary-foreground px-4 py-3 flex items-center gap-3 shadow-md sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <Bus className="h-6 w-6" />
          <h1 className="text-lg font-bold tracking-tight">เข้าสู่ระบบ</h1>
        </div>
      </header>

      <main className="flex-1 p-4 flex items-center justify-center max-w-lg mx-auto w-full">
        <Card className="w-full">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Bus className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl">เข้าสู่ระบบ</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">เข้าสู่ระบบเพื่อจัดการบัญชีของคุณ</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">อีเมลหรือเบอร์โทรศัพท์</Label>
                <Input id="email" name="email" placeholder="example@email.com" value={form.email} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">รหัสผ่าน</Label>
                <div className="relative">
                  <Input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="กรอกรหัสผ่าน" value={form.password} onChange={handleChange} required />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full" size="lg">
                เข้าสู่ระบบ
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                ยังไม่มีบัญชี?{" "}
                <Link to="/register" className="text-primary font-medium hover:underline">
                  ลงทะเบียน
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Login;
