import { ReactNode } from "react";
import StepIndicator from "./StepIndicator";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BookingLayoutProps {
  children: ReactNode;
  currentStep?: number;
  showSteps?: boolean;
  title?: string;
  navto?: () => void;
}

const BookingLayout = ({ children, currentStep = 1, showSteps = true, title, navto }: BookingLayoutProps) => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">

      <header className="text-primary-foreground px-4 py-3 gap-3 sticky top-0 z-50 bg-white border-b shadow-sm">
        {title && (
          <div className="px-4 pt-4 pb-2 flex items-center gap-4 text-black">
            <button onClick={() => { navto ? navto() : navigate(-1) }} className="p-1">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-bold">{title}</h2>
          </div>
        )}

        {showSteps && currentStep && (
          <div className="bg-white pb-2 w-full" >
            <StepIndicator currentStep={currentStep} />
          </div>
        )}
      </header>

      {/* Content */}
      <main className="flex-1 w-full pb-32 bg-white flex flex-col pt-2">
        <div className="max-w-lg mx-auto w-full px-0">
          {children}
        </div>
      </main>
    </div>
  );
};

export default BookingLayout;
