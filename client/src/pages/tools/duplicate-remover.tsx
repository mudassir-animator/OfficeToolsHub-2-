import { useState } from "react";
import { ToolWrapper } from "@/components/tool-wrapper";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DuplicateRemover() {
  const [inputText, setInputText] = useState<string>("");
  const [outputText, setOutputText] = useState<string>("");
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const handleRemoveDuplicates = () => {
    if (!inputText.trim()) {
      toast({
        title: "No Text",
        description: "Please enter some text to process.",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    const lines = inputText.split('\n');
    const uniqueLines = Array.from(new Set(lines));
    const result = uniqueLines.join('\n');
    
    setOutputText(result);
    const removed = lines.length - uniqueLines.length;
    
    toast({
      title: "Duplicates Removed!",
      description: `Removed ${removed} duplicate line(s).`,
    });
    setProcessing(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
    toast({
      title: "Copied!",
      description: "Text copied to clipboard.",
    });
  };

  return (
    <ToolWrapper
      toolName="Duplicate Line Remover"
      toolDescription="Remove duplicate lines from text"
      category="text"
      howToUse={[
        "Paste your text into the input area",
        "Click 'Remove Duplicates' to process",
        "View the result with duplicates removed",
        "Copy the cleaned text",
      ]}
      relatedTools={[
        { name: "Word Counter", path: "/tool/word-counter" },
        { name: "Case Converter", path: "/tool/case-converter" },
        { name: "Lorem Ipsum Generator", path: "/tool/lorem-ipsum" },
      ]}
    >
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Input Text</label>
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter or paste your text here... Each line will be checked for duplicates."
            className="min-h-[200px]"
            data-testid="textarea-input"
          />
        </div>

        <Button
          onClick={handleRemoveDuplicates}
          disabled={processing || !inputText.trim()}
          className="w-full"
          size="lg"
          data-testid="button-remove"
        >
          {processing ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            "Remove Duplicates"
          )}
        </Button>

        {outputText && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium">Result</label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                data-testid="button-copy"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
            </div>
            <Textarea
              value={outputText}
              readOnly
              className="min-h-[200px]"
              data-testid="textarea-output"
            />
          </div>
        )}
      </div>
    </ToolWrapper>
  );
}
