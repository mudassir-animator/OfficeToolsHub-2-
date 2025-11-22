import { useState } from "react";
import { ToolWrapper } from "@/components/tool-wrapper";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { Download, Loader2, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export default function ImageEnhancer() {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [processing, setProcessing] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [downloadUrl, setDownloadUrl] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageUrl(e.target?.result as string);
      setFileName(file.name);
      setDownloadUrl("");
    };
    reader.readAsDataURL(file);
  };

  const resetFilters = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
  };

  const handleApply = () => {
    if (!imageUrl) return;

    setProcessing(true);
    
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get canvas context');

        // Apply filters
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
        ctx.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            setDownloadUrl(url);
            toast({
              title: "Enhancement Complete!",
              description: "Image has been enhanced. Ready to download!",
            });
          }
          setProcessing(false);
        }, 'image/png');
      } catch (error) {
        console.error('Enhancement error:', error);
        toast({
          title: "Enhancement Failed",
          description: "There was an error enhancing the image.",
          variant: "destructive",
        });
        setProcessing(false);
      }
    };

    img.onerror = () => {
      console.error('Image load error');
      toast({
        title: "Image Load Failed",
        description: "Could not load the image.",
        variant: "destructive",
      });
      setProcessing(false);
    };

    img.src = imageUrl;
  };

  const handleDownload = () => {
    if (!downloadUrl || !fileName) return;
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `enhanced-${fileName}`;
    link.click();
  };

  const filterStyle = {
    filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`,
  };

  return (
    <ToolWrapper
      toolName="Image Enhancer"
      toolDescription="Adjust brightness, contrast, and saturation of images"
      category="image"
      howToUse={[
        "Upload your image file",
        "Adjust brightness, contrast, and saturation sliders",
        "Preview changes in real-time",
        "Click 'Apply & Download' to save the enhanced image",
      ]}
      relatedTools={[
        { name: "Image Compressor", path: "/tool/image-compress" },
        { name: "Image Format Converter", path: "/tool/image-converter" },
        { name: "Image Resizer", path: "/tool/image-resize" },
      ]}
    >
      <div className="space-y-6">
        <FileUpload
          onFileSelect={handleFileSelect}
          acceptedFormats=".jpg,.jpeg,.png,.webp,.gif"
          maxSizeMB={20}
          disabled={processing}
        />

        {imageUrl && (
          <div className="space-y-6">
            <div className="border rounded-lg p-4 bg-muted/30">
              <img
                src={imageUrl}
                alt="Preview"
                className="max-w-full h-auto mx-auto rounded"
                style={{ ...filterStyle, maxHeight: "400px" }}
              />
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Brightness: {brightness}%</Label>
                </div>
                <Slider
                  value={[brightness]}
                  onValueChange={(value) => setBrightness(value[0])}
                  min={0}
                  max={200}
                  step={5}
                  className="w-full"
                  data-testid="slider-brightness"
                />
              </div>

              <div className="space-y-3">
                <Label>Contrast: {contrast}%</Label>
                <Slider
                  value={[contrast]}
                  onValueChange={(value) => setContrast(value[0])}
                  min={0}
                  max={200}
                  step={5}
                  className="w-full"
                  data-testid="slider-contrast"
                />
              </div>

              <div className="space-y-3">
                <Label>Saturation: {saturation}%</Label>
                <Slider
                  value={[saturation]}
                  onValueChange={(value) => setSaturation(value[0])}
                  min={0}
                  max={200}
                  step={5}
                  className="w-full"
                  data-testid="slider-saturation"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="flex-1"
                  data-testid="button-reset"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
                <Button
                  onClick={handleApply}
                  disabled={processing}
                  className="flex-1"
                  data-testid="button-apply"
                >
                  {processing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Apply & Download"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {downloadUrl && (
          <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950">
            <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-3">
              ✓ Enhancement complete! Your image is ready to download.
            </p>
            <Button
              onClick={handleDownload}
              className="w-full"
              data-testid="button-download"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Enhanced Image
            </Button>
          </div>
        )}
      </div>
    </ToolWrapper>
  );
}
