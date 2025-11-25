import { useState } from "react";
import QuickLinks from "@/components/app/QuickLinks";
import EmergencyContact from "@/components/app/EmergencyContact";
import FloodAlerts from "@/components/app/FloodAlerts";
import SafeShelters from "@/components/app/SafeShelters";
import UploadReport from "@/components/app/UploadReport";
import FeedbackForm from "@/components/app/FeedbackForm";
import CurrentLocationMap from "@/components/app/CurrentLocationMap";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGeolocation } from "@/hooks/useGeolocation";

const AppPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { location, loading: locationLoading } = useGeolocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-40 bg-card border-b border-border shadow-soft">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-foreground">FloodGuard</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle menu"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row max-w-7xl mx-auto">
        {/* Sidebar */}
        <aside
          className={`
            lg:sticky lg:top-0 lg:h-screen lg:w-64 xl:w-80
            ${sidebarOpen ? "block" : "hidden lg:block"}
            bg-card border-b lg:border-r border-border p-4 space-y-4
            animate-slide-in
          `}
        >
          <div className="hidden lg:block mb-6">
            <h1 className="text-2xl font-bold text-foreground">FloodGuard</h1>
          </div>
          
          <QuickLinks onNavigate={() => setSidebarOpen(false)} />
          <EmergencyContact />
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 space-y-6">
          <div id="alerts-section">
            <FloodAlerts />
          </div>
          
          <div id="shelters-section">
            <SafeShelters />
          </div>
          
          <div id="location-section">
            {!locationLoading && location && !location.error && (
              <CurrentLocationMap 
                latitude={location.latitude} 
                longitude={location.longitude} 
              />
            )}
            {location?.error && (
              <div className="text-center py-8 text-muted-foreground bg-card rounded-lg border border-border">
                Location unavailable. Please enable location permissions.
              </div>
            )}
          </div>
          
          <div id="report-section">
            <UploadReport />
          </div>
          
          <div id="feedback-section">
            <FeedbackForm />
          </div>

          {/* Footer */}
          <footer className="text-center text-sm text-muted-foreground py-6 border-t border-border mt-12">
            <p>© 2025 FloodGuard. All rights reserved.</p>
            <p className="mt-1">Version 1.0.0</p>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default AppPage;
