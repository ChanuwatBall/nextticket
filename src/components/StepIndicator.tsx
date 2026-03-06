import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps?: number;
  labels?: string[];
}

const defaultLabels = ["เลือกเส้นทาง", "เลือกเที่ยว", "เลือกที่นั่ง", "ข้อมูลผู้โดยสาร", "ชำระเงิน"];

const StepIndicator = ({ currentStep, totalSteps = 5, labels = defaultLabels }: StepIndicatorProps) => {
  return (
    <div className="w-full px-2 pt-4 pb-1">
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, i) => {
          const step = i + 1;
          const isCompleted = step < currentStep;
          const isActive = step === currentStep;

          return (
            <div key={step} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all",
                    isCompleted && "bg-primary text-primary-foreground",
                    isActive && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                    !isCompleted && !isActive && "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : step}
                </div>
                <span
                  className={cn(
                    "text-[10px] text-center leading-tight max-w-[60px]",
                    isActive ? "font-bold text-primary" : "text-muted-foreground"
                  )}
                >
                  {labels[i]}
                </span>
              </div>
              {step < totalSteps && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-1 mt-[-16px]",
                    isCompleted ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;
