import { LayoutDashboard, AlertTriangle, Navigation } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface QuickLinksProps {
  onNavigate?: () => void;
}

const QuickLinks = ({ onNavigate }: QuickLinksProps) => {
  const links = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, target: "#" },
    { id: "alerts", label: "Active Alerts", icon: AlertTriangle, target: "#alerts-section" },
    { id: "shelters", label: "Directions", icon: Navigation, target: "#shelters-section" },
  ];

  const handleClick = (target: string) => {
    if (target === "#") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const element = document.querySelector(target);
      element?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    onNavigate?.();
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="text-lg">Quick Links</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {links.map((link) => (
          <Button
            key={link.id}
            variant="ghost"
            className="w-full justify-start hover:bg-secondary/80 transition-colors"
            onClick={() => handleClick(link.target)}
          >
            <link.icon className="w-4 h-4 mr-3 text-primary" />
            <span>{link.label}</span>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};

export default QuickLinks;
