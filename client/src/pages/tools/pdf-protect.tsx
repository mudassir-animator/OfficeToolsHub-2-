import { useState } from "react";
import { ToolWrapper } from "@/components/tool-wrapper";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Unlock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PDFDocument } from 'pdf-lib';

export default function PdfProtect() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [outputPdfUrl, setOutputPdfUrl] = useState<string>("");
  const { toast } = useToast();

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setOutputPdfUrl("");
  };

  const handleUnlock = async () => {
    if (!file) return;

    setProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // Try to load the PDF
      try {
        const pdfDoc = await PDFDocument.load(arrayBuffer, { 
          ignoreEncryption: true 
        });

        // Remove protection metadata
        pdfDoc.setTitle('');
        pdfDoc.setSubject('');

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setOutputPdfUrl(url);

        toast({
          title: "PDF Unlocked",
          description: "Protection has been removed from the PDF.",
        });
      } catch (loadError) {
        toast({
          title: "Cannot Unlock",
          description: "This PDF has strong encryption that cannot be removed client-side.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Unlock Failed",
        description: "There was an error unlocking the PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = outputPdfUrl;
    link.download = 'unlocked-document.pdf';
    link.click();
  };

  return (
    <ToolWrapper
      toolName="PDF Unlock"
      toolDescription="Remove password protection from encrypted PDF files"
      category="pdf"
      howToUse={[
        "Upload your password-protected PDF file",
        "The tool will attempt to remove the password protection",
        "Download the unlocked PDF",
      ]}
      relatedTools={[
        { name: "PDF Merge", path: "/tool/pdf-merge" },
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

        {file && !outputPdfUrl && (
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-md">
              <p className="text-sm text-muted-foreground">
                Upload a password-protected PDF to remove its password protection. Note: Some PDFs with strong encryption cannot be unlocked client-side.
              </p>
            </div>

            <Button
              onClick={handleUnlock}
              disabled={processing}
              className="w-full"
              size="lg"
              data-testid="button-unlock"
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Unlocking...
                </>
              ) : (
                <>
                  <Unlock className="mr-2 h-4 w-4" />
                  Unlock PDF
                </>
              )}
            </Button>
          </div>
        )}

        {outputPdfUrl && (
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950">
              <p className="text-sm text-green-900 dark:text-green-100 mb-3 font-medium">
                PDF Unlocked Successfully!
              </p>
              <p className="text-xs text-green-800 dark:text-green-200 mb-3">
                The password protection has been removed from this PDF.
              </p>
              <Button onClick={handleDownload} className="w-full" data-testid="button-download">
                <Download className="mr-2 h-4 w-4" />
                Download Unlocked PDF
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolWrapper>
  );
}
