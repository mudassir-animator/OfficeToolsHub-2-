import { useState } from "react";
import { ToolWrapper } from "@/components/tool-wrapper";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { Loader2, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Color {
  hex: string;
  rgb: string;
  hsl: string;
  count: number;
}

export default function ColorPicker() {
  const [processing, setProcessing] = useState(false);
  const [colors, setColors] = useState<Color[]>([]);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [copiedColor, setCopiedColor] = useState<string>("");
  const { toast } = useToast();

  const handleFileSelect = (selectedFile: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageUrl(e.target?.result as string);
      setColors([]);
    };
    reader.readAsDataURL(selectedFile);
  };

  const rgbToHex = (r: number, g: number, b: number): string => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
  };

  const rgbToHsl = (r: number, g: number, b: number): string => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  };

  const handleExtractColors = () => {
    if (!imageUrl) return;

    setProcessing(true);
    
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Could not get canvas context');
        }

        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const colorMap = new Map<string, number>();

        // Sample every pixel
        for (let i = 0; i < imageData.data.length; i += 4) {
          const r = imageData.data[i];
          const g = imageData.data[i + 1];
          const b = imageData.data[i + 2];
          const a = imageData.data[i + 3];

          // Skip transparent pixels
          if (a < 128) continue;

          const hex = rgbToHex(r, g, b);
          colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
        }

        if (colorMap.size === 0) {
          toast({
            title: "No colors found",
            description: "The image appears to be empty or transparent.",
            variant: "destructive",
          });
          setProcessing(false);
          return;
        }

        const sortedColors = Array.from(colorMap.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([hex, count]) => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return {
              hex,
              rgb: `rgb(${r}, ${g}, ${b})`,
              hsl: rgbToHsl(r, g, b),
              count,
            };
          });

        setColors(sortedColors);
        toast({
          title: "Colors Extracted!",
          description: `Found ${sortedColors.length} dominant colors.`,
        });
      } catch (error) {
        console.error('Color extraction error:', error);
        toast({
          title: "Extraction Failed",
          description: "There was an error extracting colors from the image.",
          variant: "destructive",
        });
      } finally {
        setProcessing(false);
      }
    };

    img.onerror = () => {
      console.error('Image load error');
      toast({
        title: "Image Load Failed",
        description: "Could not load the image. Please try a different file.",
        variant: "destructive",
      });
      setProcessing(false);
    };
  };

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedColor(value);
    toast({
      title: "Copied!",
      description: `${value} copied to clipboard.`,
    });
    setTimeout(() => setCopiedColor(""), 2000);
  };

  return (
    <ToolWrapper
      toolName="Color Picker"
      toolDescription="Extract color palette from any image"
      category="image"
      howToUse={[
        "Upload your image file",
        "Click 'Extract Colors' to analyze",
        "View the dominant colors found in your image",
        "Click any color value to copy to clipboard",
      ]}
      relatedTools={[
        { name: "Image Format Converter", path: "/tool/image-converter" },
        { name: "Image Enhancer", path: "/tool/image-enhancer" },
        { name: "Image Compressor", path: "/tool/image-compress" },
      ]}
    >
      <div className="space-y-6">
        <FileUpload
          onFileSelect={handleFileSelect}
          acceptedFormats=".jpg,.jpeg,.png,.webp,.gif"
          maxSizeMB={20}
          disabled={processing}
        />

        {imageUrl && colors.length === 0 && (
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-muted/30">
              <img src={imageUrl} alt="Original" className="max-w-full h-auto mx-auto rounded" style={{ maxHeight: '300px' }} />
            </div>

            <Button
              onClick={handleExtractColors}
              disabled={processing}
              className="w-full"
              size="lg"
              data-testid="button-extract"
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Extracting Colors...
                </>
              ) : (
                "Extract Colors"
              )}
            </Button>
          </div>
        )}

        {colors.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Color Palette</h3>
            <div className="grid grid-cols-1 gap-3">
              {colors.map((color, index) => (
                <div key={index} className="flex items-center gap-4 p-3 border rounded-lg hover-elevate" data-testid={`color-${index}`}>
                  <div
                    className="w-16 h-16 rounded border-2 border-border flex-shrink-0"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono">{color.hex}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(color.hex)}
                        className="h-6 w-6 p-0"
                        data-testid={`button-copy-hex-${index}`}
                      >
                        {copiedColor === color.hex ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono text-muted-foreground">{color.rgb}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(color.rgb)}
                        className="h-5 w-5 p-0"
                        data-testid={`button-copy-rgb-${index}`}
                      >
                        {copiedColor === color.rgb ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono text-muted-foreground">{color.hsl}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(color.hsl)}
                        className="h-5 w-5 p-0"
                        data-testid={`button-copy-hsl-${index}`}
                      >
                        {copiedColor === color.hsl ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={() => {
                setColors([]);
                setImageUrl("");
              }}
              variant="outline"
              className="w-full"
              data-testid="button-reset"
            >
              Extract From Another Image
            </Button>
          </div>
        )}
      </div>
    </ToolWrapper>
  );
}
