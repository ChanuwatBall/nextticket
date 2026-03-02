import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BookingLayout from "@/components/BookingLayout";
import { mockPromotions } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Tag, Clock, Copy, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const PromotionsPage = () => {
  const navigate = useNavigate();
  const [selectedPromo, setSelectedPromo] = useState<string | null>(null);

  const promo = mockPromotions.find((p) => p.id === selectedPromo);

  if (promo) {
    return (
      <BookingLayout showSteps={false} title="รายละเอียดโปรโมชั่น">
        <div className="px-4 space-y-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-bold">{promo.title}</h3>
              </div>
              {promo.memberOnly && <Badge variant="secondary">สมาชิกเท่านั้น</Badge>}
              <p className="text-sm text-muted-foreground">{promo.description}</p>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">โควต้าคงเหลือ</span>
                  <span className="font-bold">{promo.remainingQuota} สิทธิ์</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">หมดอายุ</span>
                  <span>{promo.expiryDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ระยะเวลาใช้งาน</span>
                  <span>{promo.validityDays} วันหลังรับสิทธิ์</span>
                </div>
              </div>

              {/* Promo Code */}
              <div className="bg-accent/50 rounded-lg p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">รหัสโปรโมชั่น</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl font-bold tracking-widest text-primary">{promo.promoCode}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      navigator.clipboard.writeText(promo.promoCode);
                      toast.success("คัดลอกรหัสแล้ว");
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button
                className="w-full h-12 font-bold"
                onClick={() => navigate("/")}
              >
                ใช้โค้ดนี้จองตั๋ว
              </Button>
              <Button variant="outline" className="w-full h-12" onClick={() => setSelectedPromo(null)}>
                กลับ
              </Button>
            </CardContent>
          </Card>
        </div>
      </BookingLayout>
    );
  }

  return (
    <BookingLayout showSteps={false} title="โปรโมชั่น">
      <div className="px-4">
        <Tabs defaultValue="all">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="all" className="flex-1">ทั้งหมด</TabsTrigger>
            <TabsTrigger value="member" className="flex-1">สมาชิก</TabsTrigger>
          </TabsList>

          {["all", "member"].map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-3">
              {mockPromotions
                .filter((p) => tab === "all" || p.memberOnly)
                .map((promo) => (
                  <Card
                    key={promo.id}
                    className="cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all"
                    onClick={() => setSelectedPromo(promo.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-primary" />
                          <span className="font-bold">{promo.title}</span>
                        </div>
                        {promo.memberOnly && <Badge variant="secondary">สมาชิก</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{promo.description}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> หมดอายุ {promo.expiryDate}
                        </span>
                        <span>เหลือ {promo.remainingQuota} สิทธิ์</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </BookingLayout>
  );
};

export default PromotionsPage;
