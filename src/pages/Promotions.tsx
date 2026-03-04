import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BookingLayout from "@/components/BookingLayout";
import { mockPromotions } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Tag, Clock, Copy, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const PromotionsPage = () => {
  
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
                  <Link to={`/promotions/${promo.id}`} key={promo.id}>
                  <Card
                    className="cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all mb-2"
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
                  </Link>
                ))}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </BookingLayout>
  );
};

export default PromotionsPage;
