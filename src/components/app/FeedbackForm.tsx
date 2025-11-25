import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Smile, Frown, Meh } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Sentiment from "sentiment";

const FeedbackForm = () => {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sentimentResult, setSentimentResult] = useState<{
    label: string;
    score: number;
  } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSentimentResult(null);

    // Client-side sentiment analysis using sentiment package
    setTimeout(() => {
      const sentiment = new Sentiment();
      const result = sentiment.analyze(feedback);
      
      let label = "neutral";
      if (result.score > 0) label = "positive";
      else if (result.score < 0) label = "negative";

      setSentimentResult({
        label,
        score: Math.abs(result.score),
      });

      setSubmitting(false);

      // Clear form after delay
      setTimeout(() => {
        setName("");
        setLocation("");
        setFeedback("");
        setSentimentResult(null);
      }, 5000);
    }, 500);
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
        {sentimentResult ? (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 text-center space-y-3">
              {sentimentResult.label === "positive" ? (
                <>
                  <Smile className="w-16 h-16 text-green-500 mx-auto" />
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Thank you! Your feedback sounds positive.
                    </h3>
                    <p className="text-muted-foreground">
                      We're glad to hear you're having a good experience!
                    </p>
                  </div>
                </>
              ) : sentimentResult.label === "negative" ? (
                <>
                  <Frown className="w-16 h-16 text-red-500 mx-auto" />
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Thanks for sharing. Your feedback seems negative and will help us improve.
                    </h3>
                    <p className="text-muted-foreground">
                      We take your concerns seriously and will work to address them.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <Meh className="w-16 h-16 text-gray-500 mx-auto" />
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Thank you for your feedback!
                    </h3>
                    <p className="text-muted-foreground">
                      Your neutral feedback helps us understand your experience.
                    </p>
                  </div>
                </>
              )}
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Sentiment:
                </span>
                <Badge
                  variant="secondary"
                  className={
                    sentimentResult.label === "positive"
                      ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                      : sentimentResult.label === "negative"
                      ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-950 dark:text-gray-400"
                  }
                >
                  {sentimentResult.label.toUpperCase()}
                </Badge>
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
              <MessageSquare className="w-4 h-4 mr-2" />
              Submit Feedback
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default FeedbackForm;
