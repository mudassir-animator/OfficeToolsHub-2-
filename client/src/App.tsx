import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

// Pages
import Home from "@/pages/home";
import AllTools from "@/pages/all-tools";
import ToolCategory from "@/pages/tool-category";
import Templates from "@/pages/templates";
import Pricing from "@/pages/pricing";
import Contact from "@/pages/contact";
import Terms from "@/pages/terms";
import Privacy from "@/pages/privacy";
import NotFound from "@/pages/not-found";

// Tool Pages
import PdfToJpg from "@/pages/tools/pdf-to-jpg";
import JpgToPdf from "@/pages/tools/jpg-to-pdf";
import WordCounter from "@/pages/tools/word-counter";
import CaseConverter from "@/pages/tools/case-converter";
import QrCode from "@/pages/tools/qr-code";
import ImageToText from "@/pages/tools/image-to-text";
import PercentageCalculator from "@/pages/tools/percentage-calculator";
import PasswordGenerator from "@/pages/tools/password-generator";
import GenericTool from "@/pages/tools/generic-tool";

function Router() {
  return (
    <Switch>
      {/* Main Pages */}
      <Route path="/" component={Home} />
      <Route path="/tools" component={AllTools} />
      <Route path="/tools/:category" component={ToolCategory} />
      <Route path="/templates" component={Templates} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/contact" component={Contact} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />

      {/* Specific Tool Pages */}
      <Route path="/tool/pdf-to-jpg" component={PdfToJpg} />
      <Route path="/tool/jpg-to-pdf" component={JpgToPdf} />
      <Route path="/tool/word-counter" component={WordCounter} />
      <Route path="/tool/case-converter" component={CaseConverter} />
      <Route path="/tool/qr-code" component={QrCode} />
      <Route path="/tool/image-to-text" component={ImageToText} />
      <Route path="/tool/percentage-calculator" component={PercentageCalculator} />
      <Route path="/tool/password" component={PasswordGenerator} />

      {/* Generic Tool Page for remaining tools */}
      <Route path="/tool/:toolId" component={GenericTool} />

      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
              <Router />
            </main>
            <Footer />
          </div>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
