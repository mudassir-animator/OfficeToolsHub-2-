import { useState } from "react";
import { ToolWrapper } from "@/components/tool-wrapper";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { Download, Loader2, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export default function ImageEnhancer() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [enhancedImageUrl, setEnhancedImageUrl] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);
  const { toast } = useToast();

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setEnhancedImageUrl("");
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageUrl(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const resetFilters = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
  };

  const handleEnhance = async () => {
    if (!file || !imageUrl) return;

    setProcessing(true);
    try {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d')!;
        
        // Apply filters using CSS filter
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
        ctx.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            setEnhancedImageUrl(url);
            toast({
              title: "Enhancement Complete!",
              description: "Image has been enhanced successfully.",
            });
          }
          setProcessing(false);
        }, file.type);
      };
      img.src = imageUrl;
    } catch (error) {
      toast({
        title: "Enhancement Failed",
        description: "There was an error enhancing the image. Please try again.",
        variant: "destructive",
      });
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = enhancedImageUrl;
    link.download = `enhanced-${file?.name || 'image.jpg'}`;
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
        "Download the enhanced image",
      ]}
      relatedTools={[
        { name: "Color Picker", path: "/tool/color-picker" },
        { name: "Image Compressor", path: "/tool/image-compress" },
        { name: "Image Format Converter", path: "/tool/image-converter" },
      ]}
    >
      <div className="space-y-6">
        <FileUpload
          onFileSelect={handleFileSelect}
          acceptedFormats=".jpg,.jpeg,.png,.webp"
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
                style={{ ...filterStyle, maxHeight: '400px' }}
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
                  onClick={handleEnhance}
                  disabled={processing}
                  className="flex-1"
                  data-testid="button-enhance"
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

        {enhancedImageUrl && (
          <div className="p-4 border rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground mb-3">Your enhanced image is ready!</p>
            <Button onClick={handleDownload} className="w-full" data-testid="button-download">
              <Download className="mr-2 h-4 w-4" />
              Download Enhanced Image
            </Button>
          </div>
        )}
      </div>
    </ToolWrapper>
  );
}
