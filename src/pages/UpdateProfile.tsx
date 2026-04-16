import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bus, User, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getUserMe, updateMyProfile } from "@/services/api";

const UpdateProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    avatarUrl: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      const res = await getUserMe();
      if (res && res.id) {
        setForm({
          fullName: res.fullName || "",
          phone: res.phone || "",
          email: res.email || "",
          avatarUrl: res.avatarUrl || "",
        });
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updateMyProfile(form);
      if (res && !res.error) {
        toast({ title: "อัปเดตสำเร็จ!", description: "ข้อมูลโปรไฟล์ของคุณถูกบันทึกแล้ว" });
        navigate("/profile");
      } else {
        toast({ 
          title: "เกิดข้อผิดพลาด", 
          description: res.message || "ไม่สามารถอัปเดตโปรไฟล์ได้", 
          variant: "destructive" 
        });
      }
    } catch (error) {
      toast({ 
        title: "เกิดข้อผิดพลาด", 
        description: "โปรดลองอีกครั้งในภายหลัง", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-primary text-primary-foreground px-4 py-3 flex items-center gap-3 shadow-md sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <Bus className="h-6 w-6" />
          <h1 className="text-lg font-bold tracking-tight">แก้ไขข้อมูลส่วนตัว</h1>
        </div>
      </header>

      <main className="flex-1 p-4 max-w-lg mx-auto w-full">
        <Card>
          <CardHeader className="text-center pb-2">
            <div className="relative mx-auto h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              {form.avatarUrl ? (
                <img src={form.avatarUrl} alt="Avatar" className="h-full w-full rounded-full object-cover" />
              ) : (
                <User className="h-12 w-12 text-primary" />
              )}
              <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-1.5 rounded-full shadow-lg">
                <Camera className="h-4 w-4" />
              </div>
            </div>
            <CardTitle className="text-xl">ข้อมูลส่วนตัว</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">อัปเดตข้อมูลของคุณให้เป็นปัจจุบัน</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="avatarUrl">URL รูปโปรไฟล์</Label>
                <Input 
                  id="avatarUrl" 
                  name="avatarUrl" 
                  placeholder="https://example.com/avatar.jpg" 
                  value={form.avatarUrl} 
                  onChange={handleChange} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">ชื่อ-นามสกุล</Label>
                <Input 
                  id="fullName" 
                  name="fullName" 
                  placeholder="กรอกชื่อ-นามสกุล" 
                  value={form.fullName} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                <Input 
                  id="phone" 
                  name="phone" 
                  type="tel" 
                  placeholder="0XX-XXX-XXXX" 
                  value={form.phone} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">อีเมล</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  placeholder="example@email.com" 
                  value={form.email} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default UpdateProfile;
