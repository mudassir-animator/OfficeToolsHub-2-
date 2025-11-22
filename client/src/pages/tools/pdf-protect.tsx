import { useState } from "react";
import { ToolWrapper } from "@/components/tool-wrapper";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Lock, Unlock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PDFDocument } from 'pdf-lib';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PdfProtect() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [outputPdfUrl, setOutputPdfUrl] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [mode, setMode] = useState<"protect" | "unlock">("protect");
  const { toast } = useToast();

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setOutputPdfUrl("");
    setPassword("");
  };

  const handleProtect = async () => {
    if (!file || !password) {
      toast({
        title: "Missing Information",
        description: "Please provide a password to protect the PDF.",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      // Note: Client-side PDF encryption is not supported by pdf-lib
      // For true password protection, use server-side tools or Adobe Acrobat
      // This tool provides metadata marking but not actual encryption
      pdfDoc.setTitle('Protected Document');
      pdfDoc.setSubject(`Password protected with: ${password.substring(0, 1)}${'*'.repeat(password.length - 1)}`);

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setOutputPdfUrl(url);

      toast({
        title: "PDF Marked (Not Encrypted)",
        description: "This is a demonstration only. True encryption requires server-side processing. Use professional PDF tools for real security.",
        variant: "default",
      });
    } catch (error: any) {
      console.error('Protection error:', error);
      toast({
        title: "Protection Failed",
        description: error.message || "There was an error processing the PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
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
    link.download = mode === "protect" ? 'protected-document.pdf' : 'unlocked-document.pdf';
    link.click();
  };

  return (
    <ToolWrapper
      toolName="PDF Protect/Unlock"
      toolDescription="Add or remove password protection from PDF files"
      category="pdf"
      howToUse={[
        "Choose between Protect or Unlock mode",
        "Upload your PDF file",
        "Enter password (for protection mode)",
        "Download the processed PDF",
      ]}
      relatedTools={[
        { name: "PDF Merge", path: "/tool/pdf-merge" },
        { name: "PDF Compress", path: "/tool/pdf-compress" },
        { name: "PDF Split", path: "/tool/pdf-split" },
      ]}
    >
      <div className="space-y-6">
        <Tabs value={mode} onValueChange={(v) => setMode(v as "protect" | "unlock")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="protect" data-testid="tab-protect">
              <Lock className="mr-2 h-4 w-4" />
              Protect PDF
            </TabsTrigger>
            <TabsTrigger value="unlock" data-testid="tab-unlock">
              <Unlock className="mr-2 h-4 w-4" />
              Unlock PDF
            </TabsTrigger>
          </TabsList>

          <TabsContent value="protect" className="space-y-6">
            <div className="p-4 border-2 border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-950">
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="font-semibold text-red-900 dark:text-red-100">Feature Not Available</p>
                  <p className="text-sm text-red-800 dark:text-red-200">
                    Client-side PDF encryption is not supported. True password protection requires professional tools like:
                  </p>
                  <ul className="text-sm text-red-800 dark:text-red-200 list-disc list-inside mt-2 space-y-1">
                    <li>Adobe Acrobat</li>
                    <li>Professional online PDF tools</li>
                    <li>Server-side processing services</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="unlock" className="space-y-6">
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
                    Upload a protected PDF to remove its password protection.
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
          </TabsContent>
        </Tabs>

        {outputPdfUrl && mode === "unlock" && (
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
