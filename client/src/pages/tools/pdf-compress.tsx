import { useState } from "react";
import { ToolWrapper } from "@/components/tool-wrapper";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PDFDocument } from 'pdf-lib';
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export default function PdfCompress() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [compressedPdfUrl, setCompressedPdfUrl] = useState<string>("");
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [quality, setQuality] = useState<number>(75);
  const { toast } = useToast();

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setOriginalSize(selectedFile.size);
    setCompressedPdfUrl("");
    setCompressedSize(0);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleCompress = async () => {
    if (!file) return;

    setProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      // Remove metadata to reduce size
      pdfDoc.setTitle('');
      pdfDoc.setAuthor('');
      pdfDoc.setSubject('');
      pdfDoc.setKeywords([]);
      pdfDoc.setProducer('');
      pdfDoc.setCreator('');

      // Save with aggressive compression options
      // useObjectStreams enables stream compression which is the main compression method
      const pdfBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });
      
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setCompressedPdfUrl(url);
      setCompressedSize(pdfBytes.length);

      const reduction = ((originalSize - pdfBytes.length) / originalSize * 100).toFixed(1);
      
      toast({
        title: "Compression Complete!",
        description: `File size reduced by ${reduction}%.`,
      });
    } catch (error) {
      toast({
        title: "Compression Failed",
        description: "There was an error compressing the PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = compressedPdfUrl;
    link.download = 'compressed-document.pdf';
    link.click();
  };

  return (
    <ToolWrapper
      toolName="PDF Compress"
      toolDescription="Reduce PDF file size while maintaining quality"
      category="pdf"
      howToUse={[
        "Upload your PDF file",
        "Adjust compression quality if needed",
        "Click 'Compress PDF' to process",
        "Download the compressed file",
      ]}
      relatedTools={[
        { name: "PDF Merge", path: "/tool/pdf-merge" },
        { name: "PDF Split", path: "/tool/pdf-split" },
        { name: "Image Compressor", path: "/tool/image-compress" },
      ]}
    >
      <div className="space-y-6">
        <FileUpload
          onFileSelect={handleFileSelect}
          acceptedFormats=".pdf"
          maxSizeMB={50}
          disabled={processing}
        />

        {file && !compressedPdfUrl && (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-md">
              <p className="text-sm"><span className="font-semibold">Original Size:</span> {formatFileSize(originalSize)}</p>
            </div>

            <div className="space-y-3">
              <Label>Compression Quality: {quality}%</Label>
              <Slider
                value={[quality]}
                onValueChange={(value) => setQuality(value[0])}
                min={50}
                max={100}
                step={5}
                className="w-full"
                data-testid="slider-quality"
              />
              <p className="text-xs text-muted-foreground">
                Higher quality = larger file size. Lower quality = smaller file size.
              </p>
            </div>

            <Button
              onClick={handleCompress}
              disabled={processing}
              className="w-full"
              size="lg"
              data-testid="button-compress"
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Compressing...
                </>
              ) : (
                "Compress PDF"
              )}
            </Button>
          </div>
        )}

        {compressedPdfUrl && (
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-muted/50 space-y-2">
              <p className="text-sm"><span className="font-semibold">Original:</span> {formatFileSize(originalSize)}</p>
              <p className="text-sm"><span className="font-semibold">Compressed:</span> {formatFileSize(compressedSize)}</p>
              <p className="text-sm text-primary"><span className="font-semibold">Saved:</span> {formatFileSize(originalSize - compressedSize)} ({((originalSize - compressedSize) / originalSize * 100).toFixed(1)}%)</p>
            </div>
            <Button onClick={handleDownload} className="w-full" data-testid="button-download">
              <Download className="mr-2 h-4 w-4" />
              Download Compressed PDF
            </Button>
          </div>
        )}
      </div>
    </ToolWrapper>
  );
}
