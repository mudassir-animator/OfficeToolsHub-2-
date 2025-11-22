import { useState, useEffect } from "react";
import { ToolWrapper } from "@/components/tool-wrapper";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as pdfjsLib from 'pdfjs-dist';

export default function PdfToJpg() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const { toast } = useToast();

  // Initialize PDF.js worker on mount
  useEffect(() => {
    // Use the built-in worker from pdfjs-dist
    pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;
    
    // Fallback: if that doesn't work, try to use the CDN
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    }
  }, []);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setImages([]);
  };

  const handleConvert = async () => {
    if (!file) return;

    setProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const imageUrls: string[] = [];

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          const scale = 2;
          const viewport = page.getViewport({ scale });
          
          const canvas = document.createElement('canvas') as HTMLCanvasElement;
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          
          const context = canvas.getContext('2d') as CanvasRenderingContext2D;
          if (!context) {
            throw new Error('Failed to get canvas context');
          }

          // Render page to canvas with proper parameters
          await page.render({
            canvasContext: context,
            viewport
          }).promise;
          
          // Create JPEG with white background
          const jpegCanvas = document.createElement('canvas') as HTMLCanvasElement;
          jpegCanvas.width = canvas.width;
          jpegCanvas.height = canvas.height;
          
          const jpegCtx = jpegCanvas.getContext('2d') as CanvasRenderingContext2D;
          jpegCtx.fillStyle = '#FFFFFF';
          jpegCtx.fillRect(0, 0, jpegCanvas.width, jpegCanvas.height);
          jpegCtx.drawImage(canvas, 0, 0);
          
          const jpegData = jpegCanvas.toDataURL('image/jpeg', 0.95);
          imageUrls.push(jpegData);
        } catch (pageError) {
          console.error(`Error rendering page ${pageNum}:`, pageError);
        }
      }

      if (imageUrls.length === 0) {
        throw new Error('No pages were successfully converted');
      }

      setImages(imageUrls);
      toast({
        title: "Conversion Complete!",
        description: `Successfully converted ${imageUrls.length} page(s) to JPG.`,
      });
    } catch (error) {
      console.error('PDF conversion error:', error);
      toast({
        title: "Conversion Failed",
        description: "There was an error converting your PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = (imageUrl: string, index: number) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `page-${index + 1}.jpg`;
    link.click();
  };

  const handleDownloadAll = () => {
    images.forEach((url, index) => {
      setTimeout(() => handleDownload(url, index), index * 100);
    });
  };

  return (
    <ToolWrapper
      toolName="PDF to JPG"
      toolDescription="Convert PDF pages to high-quality JPG images"
      category="pdf"
      howToUse={[
        "Upload your PDF file using the upload area",
        "Click 'Convert to JPG' to start the conversion",
        "Preview the converted images",
        "Download individual pages or all pages at once",
      ]}
      relatedTools={[
        { name: "JPG to PDF", path: "/tool/jpg-to-pdf" },
        { name: "PDF Compress", path: "/tool/pdf-compress" },
        { name: "PDF Split", path: "/tool/pdf-split" },
      ]}
    >
      <div className="space-y-6">
        <FileUpload
          onFileSelect={handleFileSelect}
          acceptedFormats=".pdf"
          maxSizeMB={20}
          disabled={processing}
        />

        {file && !images.length && (
          <Button
            onClick={handleConvert}
            disabled={processing}
            className="w-full"
            size="lg"
            data-testid="button-convert"
          >
            {processing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Converting...
              </>
            ) : (
              "Convert to JPG"
            )}
          </Button>
        )}

        {images.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Converted Images ({images.length})</h3>
              <Button onClick={handleDownloadAll} data-testid="button-download-all">
                <Download className="mr-2 h-4 w-4" />
                Download All
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {images.map((url, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3" data-testid={`image-preview-${index}`}>
                  <img src={url} alt={`Page ${index + 1}`} className="w-full rounded" />
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleDownload(url, index)}
                    data-testid={`button-download-${index}`}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Page {index + 1}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolWrapper>
  );
}
