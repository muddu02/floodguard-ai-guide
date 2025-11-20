import { Phone, Mail, MessageCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const EmergencyContact = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");

  const emergencyNumbers = [
    { label: "Local Rescue", number: "911" },
    { label: "Fire Department", number: "112" },
    { label: "Medical Emergency", number: "108" },
  ];

  const handleStartChat = () => {
    if (name && contact) {
      // Mock chat initialization
      alert(`Chat started for ${name}. A volunteer will connect shortly.`);
      setChatOpen(false);
      setName("");
      setContact("");
    }
  };

  return (
    <>
      <Card className="shadow-soft border-alert-medium/20">
        <CardHeader>
          <CardTitle className="text-lg text-alert-high flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Emergency Contact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {emergencyNumbers.map((item) => (
            <div
              key={item.label}
              className="flex justify-between items-center p-2 rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <span className="text-sm font-medium">{item.label}</span>
              <a
                href={`tel:${item.number}`}
                className="text-primary font-bold hover:text-primary-glow transition-colors"
              >
                {item.number}
              </a>
            </div>
          ))}
          
          <div className="pt-3 border-t border-border">
            <Button
              variant="outline"
              className="w-full justify-start border-primary/30 hover:bg-primary/5"
              onClick={() => setChatOpen(true)}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat with Volunteer
            </Button>
            
            <p className="text-xs text-muted-foreground mt-2 text-center">
              If you need immediate help, call the top number
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Chat Modal */}
      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Chat with Volunteer</DialogTitle>
            <DialogDescription>
              Provide your details to connect with a volunteer operator
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="chat-name">Name</Label>
              <Input
                id="chat-name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="chat-contact">Contact</Label>
              <Input
                id="chat-contact"
                placeholder="Phone or email"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleStartChat}
              disabled={!name || !contact}
            >
              Start Chat
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EmergencyContact;
