import { useState } from "react";
import { ToolWrapper } from "@/components/tool-wrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ZakatCalculator() {
  const [cash, setCash] = useState<string>("");
  const [gold, setGold] = useState<string>("");
  const [silver, setSilver] = useState<string>("");
  const [investments, setInvestments] = useState<string>("");
  const [businessAssets, setBusinessAssets] = useState<string>("");
  const [debts, setDebts] = useState<string>("");
  const [zakatAmount, setZakatAmount] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const NISAB_THRESHOLD = 4455; // Approximate nisab in USD (based on silver)
  const ZAKAT_RATE = 0.025; // 2.5%

  const calculateZakat = () => {
    setProcessing(true);

    const totalAssets = 
      (parseFloat(cash) || 0) +
      (parseFloat(gold) || 0) +
      (parseFloat(silver) || 0) +
      (parseFloat(investments) || 0) +
      (parseFloat(businessAssets) || 0);

    const totalDebts = parseFloat(debts) || 0;
    const zakatable = totalAssets - totalDebts;

    if (zakatable < NISAB_THRESHOLD) {
      setZakatAmount(0);
      toast({
        title: "Below Nisab Threshold",
        description: `Your zakatable wealth ($${zakatable.toFixed(2)}) is below the nisab threshold ($${NISAB_THRESHOLD}). No zakat is due.`,
      });
    } else {
      const zakat = zakatable * ZAKAT_RATE;
      setZakatAmount(zakat);
      toast({
        title: "Zakat Calculated!",
        description: `Your zakat amount is $${zakat.toFixed(2)}.`,
      });
    }

    setProcessing(false);
  };

  return (
    <ToolWrapper
      toolName="Zakat Calculator"
      toolDescription="Calculate Islamic charity (Zakat) on your wealth"
      category="calculators"
      howToUse={[
        "Enter your assets (cash, gold, silver, investments, business)",
        "Enter any outstanding debts",
        "Click 'Calculate Zakat' to get the amount",
        "Zakat is 2.5% of wealth above nisab threshold",
      ]}
      relatedTools={[
        { name: "Percentage Calculator", path: "/tool/percentage-calculator" },
        { name: "Loan Calculator", path: "/tool/loan-calculator" },
        { name: "GPA Calculator", path: "/tool/gpa-calculator" },
      ]}
    >
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cash">Cash & Savings ($)</Label>
              <Input
                id="cash"
                type="number"
                value={cash}
                onChange={(e) => setCash(e.target.value)}
                placeholder="0"
                data-testid="input-cash"
              />
            </div>
            <div>
              <Label htmlFor="gold">Gold Value ($)</Label>
              <Input
                id="gold"
                type="number"
                value={gold}
                onChange={(e) => setGold(e.target.value)}
                placeholder="0"
                data-testid="input-gold"
              />
            </div>
            <div>
              <Label htmlFor="silver">Silver Value ($)</Label>
              <Input
                id="silver"
                type="number"
                value={silver}
                onChange={(e) => setSilver(e.target.value)}
                placeholder="0"
                data-testid="input-silver"
              />
            </div>
            <div>
              <Label htmlFor="investments">Investments ($)</Label>
              <Input
                id="investments"
                type="number"
                value={investments}
                onChange={(e) => setInvestments(e.target.value)}
                placeholder="0"
                data-testid="input-investments"
              />
            </div>
            <div>
              <Label htmlFor="business">Business Assets ($)</Label>
              <Input
                id="business"
                type="number"
                value={businessAssets}
                onChange={(e) => setBusinessAssets(e.target.value)}
                placeholder="0"
                data-testid="input-business"
              />
            </div>
            <div>
              <Label htmlFor="debts">Outstanding Debts ($)</Label>
              <Input
                id="debts"
                type="number"
                value={debts}
                onChange={(e) => setDebts(e.target.value)}
                placeholder="0"
                data-testid="input-debts"
              />
            </div>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg text-sm">
            <p className="text-muted-foreground">
              <span className="font-semibold">Nisab Threshold:</span> ${NISAB_THRESHOLD.toFixed(2)} (approximate, based on silver)
            </p>
            <p className="text-muted-foreground mt-1">
              <span className="font-semibold">Zakat Rate:</span> {ZAKAT_RATE * 100}% of wealth above nisab
            </p>
          </div>
        </div>

        <Button
          onClick={calculateZakat}
          disabled={processing}
          className="w-full"
          size="lg"
          data-testid="button-calculate"
        >
          {processing ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Calculating...
            </>
          ) : (
            "Calculate Zakat"
          )}
        </Button>

        {zakatAmount !== null && (
          <div className="space-y-4">
            <div className="p-6 border rounded-lg bg-primary/5 text-center">
              <p className="text-sm text-muted-foreground mb-2">Zakat Due</p>
              <p className="text-4xl font-bold text-primary" data-testid="text-zakat">
                ${zakatAmount.toFixed(2)}
              </p>
            </div>

            {zakatAmount === 0 && (
              <div className="p-4 border rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  Your zakatable wealth is below the nisab threshold. No zakat is due at this time.
                </p>
              </div>
            )}

            {zakatAmount > 0 && (
              <div className="p-4 border rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  This is a simplified calculation. For precise zakat calculation, please consult with a qualified Islamic scholar.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolWrapper>
  );
}
