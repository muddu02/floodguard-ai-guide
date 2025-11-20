import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const Landing = () => {
  const navigate = useNavigate();
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      {/* Hero Content */}
      <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
        {/* Logo/Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
            <div className="relative bg-gradient-hero rounded-full p-6 shadow-glow">
              <Shield className="w-16 h-16 text-white" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground">
          FloodGuard
          <span className="block mt-2 text-3xl md:text-5xl lg:text-6xl bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            AI-Based Real-Time Shelter & Alert System
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Find shelters, get live alerts, and report flooding — instantly.
        </p>

        {/* Feature highlights */}
        <div className="flex flex-wrap justify-center gap-6 pt-4">
          <div className="flex items-center gap-2 text-sm md:text-base text-foreground">
            <AlertTriangle className="w-5 h-5 text-alert-high" />
            <span>Real-Time Alerts</span>
          </div>
          <div className="flex items-center gap-2 text-sm md:text-base text-foreground">
            <MapPin className="w-5 h-5 text-accent" />
            <span>Nearby Shelters</span>
          </div>
          <div className="flex items-center gap-2 text-sm md:text-base text-foreground">
            <Shield className="w-5 h-5 text-primary" />
            <span>AI-Powered Reports</span>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <Button
            size="lg"
            className="text-lg px-8 py-6 shadow-glow hover:shadow-[0_0_30px_hsl(var(--primary-glow)_/_0.5)] transition-all duration-300"
            onClick={() => navigate("/app")}
          >
            Check Flood Alerts
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="text-lg px-8 py-6 border-2 hover:bg-secondary/50"
            onClick={() => setAboutOpen(true)}
          >
            About FloodGuard
          </Button>
        </div>
      </div>

      {/* About Modal */}
      <Dialog open={aboutOpen} onOpenChange={setAboutOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">About FloodGuard</DialogTitle>
            <DialogDescription className="text-base leading-relaxed pt-4">
              FloodGuard is an AI-powered emergency response system designed to
              help communities prepare for and respond to flooding events. Using
              real-time data from satellites, sensors, and citizen reports, we
              provide instant alerts and direct you to the nearest safe
              shelters.
              <br />
              <br />
              Our advanced machine learning models analyze flood images and text
              reports to validate threats and notify affected areas
              automatically. Stay safe, stay informed with FloodGuard.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Landing;
