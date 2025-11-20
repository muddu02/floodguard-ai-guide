import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Upload, CheckCircle, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const UploadReport = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{
    severity: string;
    reach: string;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type and size
      const validTypes = ["image/jpeg", "image/png", "image/jpg"];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!validTypes.includes(selectedFile.type)) {
        alert("Please upload a JPG or PNG image");
        return;
      }

      if (selectedFile.size > maxSize) {
        alert("File size must be less than 10MB");
        return;
      }

      setFile(selectedFile);
      setResult(null);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);

    // Simulate upload and AI processing
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Mock API call to /api/reports
    setTimeout(() => {
      setUploading(false);
      setResult({
        severity: "Medium",
        reach: "~500 nearby users notified",
      });
    }, 2000);
  };

  return (
    <Card className="shadow-medium">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl">
          <Camera className="w-6 h-6 text-primary" />
          <span>Upload Flood Image</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Upload a photo — we'll analyze and notify nearby users if urgent.
        </p>

        {/* File Input */}
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
          <Label
            htmlFor="flood-image"
            className="cursor-pointer flex flex-col items-center gap-3"
          >
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="max-w-full max-h-64 rounded-lg shadow-soft"
              />
            ) : (
              <>
                <Upload className="w-12 h-12 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    JPG or PNG, max 10MB
                  </p>
                </div>
              </>
            )}
          </Label>
          <Input
            id="flood-image"
            type="file"
            accept="image/jpeg,image/png,image/jpg"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Analyzing image...</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-4 space-y-2 animate-fade-in">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">Upload Successful</span>
            </div>
            <p className="text-sm text-green-600 dark:text-green-500">
              Severity: <strong>{result.severity}</strong>
            </p>
            <p className="text-sm text-green-600 dark:text-green-500">
              {result.reach}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            className="flex-1"
            disabled={!file || uploading}
            onClick={handleUpload}
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Submit Report
              </>
            )}
          </Button>
          {file && (
            <Button
              variant="outline"
              onClick={() => {
                setFile(null);
                setPreview(null);
                setResult(null);
              }}
            >
              Clear
            </Button>
          )}
        </div>

        {/* Privacy Notice */}
        <p className="text-xs text-muted-foreground text-center">
          By uploading, you agree to share this image with nearby users and
          emergency services if validated as urgent.
        </p>
      </CardContent>
    </Card>
  );
};

export default UploadReport;
