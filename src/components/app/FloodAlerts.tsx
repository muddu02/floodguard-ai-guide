import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Satellite, Users, Radio, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface Alert {
  id: string;
  time: string;
  description: string;
  severity: "high" | "medium" | "low";
  source: "satellite" | "citizen" | "sensor";
  details: {
    actions: string[];
    affectedAreas: string[];
  };
}

// Mock data - would come from /api/alerts
const mockAlerts: Alert[] = [
  {
    id: "1",
    time: "11:32 AM — Nov 20, 2025",
    description: "Severe overflow on Riverbank Rd",
    severity: "high",
    source: "satellite",
    details: {
      actions: ["Evacuate immediately", "Move to higher ground", "Avoid Riverbank Rd area"],
      affectedAreas: ["Riverbank Rd", "Downtown district", "East Bridge"],
    },
  },
  {
    id: "2",
    time: "10:15 AM — Nov 20, 2025",
    description: "Water level rising near Central Park",
    severity: "medium",
    source: "sensor",
    details: {
      actions: ["Monitor situation", "Prepare emergency kit", "Stay informed"],
      affectedAreas: ["Central Park", "Park Avenue", "Green Street"],
    },
  },
  {
    id: "3",
    time: "08:45 AM — Nov 20, 2025",
    description: "Minor flooding reported on Oak Street",
    severity: "low",
    source: "citizen",
    details: {
      actions: ["Avoid area if possible", "Drive carefully"],
      affectedAreas: ["Oak Street", "Maple Avenue"],
    },
  },
];

const FloodAlerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // In production: fetch from /api/alerts or websocket
      console.log("Polling for new alerts...");
    }, 30000); // Poll every 30s

    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: Alert["severity"]) => {
    switch (severity) {
      case "high":
        return "bg-alert-high text-white";
      case "medium":
        return "bg-alert-medium text-white";
      case "low":
        return "bg-alert-low text-white";
    }
  };

  const getSourceIcon = (source: Alert["source"]) => {
    switch (source) {
      case "satellite":
        return <Satellite className="w-4 h-4" />;
      case "citizen":
        return <Users className="w-4 h-4" />;
      case "sensor":
        return <Radio className="w-4 h-4" />;
    }
  };

  return (
    <Card className="shadow-medium">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl">
          <AlertTriangle className="w-6 h-6 text-alert-high" />
          <span>FloodGuard Alerts</span>
          <span className="live-indicator text-sm font-normal text-muted-foreground ml-auto">
            Real-time
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => (
          <Collapsible
            key={alert.id}
            open={expandedId === alert.id}
            onOpenChange={() =>
              setExpandedId(expandedId === alert.id ? null : alert.id)
            }
          >
            <Card className="card-hover border-l-4 border-l-transparent hover:border-l-primary">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        {getSourceIcon(alert.source)}
                        {alert.source}
                      </span>
                    </div>
                    <p className="font-medium text-foreground">
                      {alert.description}
                    </p>
                    <p className="text-sm text-muted-foreground">{alert.time}</p>
                  </div>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="shrink-0">
                      {expandedId === alert.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </div>

                <CollapsibleContent className="space-y-3 animate-fade-in">
                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-foreground">
                      Suggested Actions:
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {alert.details.actions.map((action, idx) => (
                        <li key={idx}>{action}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-foreground">
                      Affected Areas:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {alert.details.affectedAreas.map((area, idx) => (
                        <Badge key={idx} variant="secondary">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CollapsibleContent>
              </CardContent>
            </Card>
          </Collapsible>
        ))}
      </CardContent>
    </Card>
  );
};

export default FloodAlerts;
