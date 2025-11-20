import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Smile, Frown, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const FeedbackForm = () => {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sentiment, setSentiment] = useState<{
    label: string;
    score: number;
  } | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSentiment(null);

    try {
      // Call sentiment analysis edge function
      const { data, error } = await supabase.functions.invoke("analyze-sentiment", {
        body: {
          name,
          location,
          message: feedback,
        },
      });

      if (error) {
        console.error("Sentiment analysis error:", error);
        toast({
          title: "Error",
          description: "Failed to submit feedback. Please try again.",
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }

      console.log("Sentiment result:", data);

      setSentiment({
        label: data.sentiment,
        score: data.score,
      });

      // Clear form after delay
      setTimeout(() => {
        setName("");
        setLocation("");
        setFeedback("");
        setSentiment(null);
      }, 5000);
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = name.trim() && location.trim() && feedback.trim();

  return (
    <Card className="shadow-medium">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl">
          <MessageSquare className="w-6 h-6 text-accent" />
          <span>Feedback</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sentiment ? (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 text-center space-y-3">
              {sentiment.label === "positive" ? (
                <Smile className="w-16 h-16 text-green-500 mx-auto" />
              ) : (
                <Frown className="w-16 h-16 text-orange-500 mx-auto" />
              )}
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Thank you for your feedback!
                </h3>
                <p className="text-muted-foreground">
                  We've analyzed your feedback
                </p>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Sentiment:
                </span>
                <Badge
                  variant="secondary"
                  className={
                    sentiment.label === "positive"
                      ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                      : "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400"
                  }
                >
                  {sentiment.label.toUpperCase()}
                </Badge>
                <span className="text-sm font-medium">
                  ({Math.round(sentiment.score * 100)}%)
                </span>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="feedback-name">Name</Label>
              <Input
                id="feedback-name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback-location">
                Location
                <span className="text-xs text-muted-foreground ml-2">
                  (or auto-detect)
                </span>
              </Label>
              <Input
                id="feedback-location"
                placeholder="Your location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback-message">Feedback</Label>
              <Textarea
                id="feedback-message"
                placeholder="Share your experience with FloodGuard..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={!isFormValid || submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Submit Feedback
                </>
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default FeedbackForm;
