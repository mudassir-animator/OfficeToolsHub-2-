import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText } from "lucide-react";

interface TemplateCardProps {
  name: string;
  category: string;
  description: string;
  thumbnailUrl: string;
  downloadUrl: string;
}

export function TemplateCard({
  name,
  category,
  description,
  thumbnailUrl,
  downloadUrl,
}: TemplateCardProps) {
  const handleDownload = () => {
    window.open(downloadUrl, '_blank');
  };

  return (
    <Card className="overflow-hidden hover-elevate active-elevate-2 transition-transform group" data-testid={`card-template-${name.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="aspect-[3/4] bg-muted flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/20"></div>
        <FileText className="w-20 h-20 text-muted-foreground/30 relative z-10" />
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-base group-hover:text-primary transition-colors" data-testid={`text-template-name-${name.toLowerCase().replace(/\s+/g, '-')}`}>
            {name}
          </h3>
          <Badge variant="secondary" className="text-xs ml-2">
            {category}
          </Badge>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {description}
        </p>
        
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={handleDownload}
          data-testid={`button-download-template-${name.toLowerCase().replace(/\s+/g, '-')}`}
        >
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
      </div>
    </Card>
  );
}
