import { ReactNode } from "react";
import StepIndicator from "./StepIndicator";
import { ArrowLeft, Bus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface BookingLayoutProps {
  children: ReactNode;
  currentStep?: number;
  showSteps?: boolean;
  title?: string;
}

const BookingLayout = ({ children, currentStep = 1, showSteps = true, title }: BookingLayoutProps) => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-primary text-primary-foreground px-4 py-3 flex items-center gap-3 shadow-md sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2">
          <Bus className="h-6 w-6" />
          <h1 className="text-lg font-bold tracking-tight">Nex Express</h1>
        </Link>
      </header>

      {/* Step Indicator */}
      {showSteps && currentStep && (
        <div className="bg-card border-b border-border">
          <div className="max-w-lg mx-auto">
            <StepIndicator currentStep={currentStep} />
          </div>
        </div>
      )}

      {/* Content */}
      <main className="flex-1 max-w-lg mx-auto w-full pb-8">
        {title && (<div className="px-4 pt-4 pb-2 flex items-center gap-4">
          <button  onClick={()=>{navigate(-1)}} className="p-1">  
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-bold">{title}</h2>
        </div>)}
        {children}
      </main>
    </div>
  );
};

export default BookingLayout;
