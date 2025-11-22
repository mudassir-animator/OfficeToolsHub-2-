import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

export default function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for individuals and light usage",
      features: [
        "All basic tools access",
        "5MB file size limit",
        "Standard processing speed",
        "Community support",
        "Ad-supported",
      ],
      cta: "Get Started",
      highlighted: false,
    },
    {
      name: "Pro",
      price: "$9",
      period: "per month",
      description: "Best for professionals and businesses",
      features: [
        "All tools with priority access",
        "50MB file size limit",
        "Lightning fast processing",
        "Priority email support",
        "No ads",
        "Save projects & history",
        "Batch processing",
        "Advanced features",
      ],
      cta: "Go Pro",
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact us",
      description: "For teams and organizations",
      features: [
        "Everything in Pro",
        "Unlimited file size",
        "API access",
        "Team collaboration",
        "Dedicated support",
        "Custom integrations",
        "SLA guarantee",
        "Volume discounts",
      ],
      cta: "Contact Sales",
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-semibold mb-4" data-testid="text-page-title">
            Choose Your Plan
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start for free, upgrade when you need more power
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`p-8 relative ${plan.highlighted ? "border-primary shadow-lg" : ""}`}
              data-testid={`card-plan-${plan.name.toLowerCase()}`}
            >
              {plan.highlighted && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2" data-testid="badge-popular">
                  Most Popular
                </Badge>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-semibold mb-2" data-testid={`text-plan-name-${plan.name.toLowerCase()}`}>
                  {plan.name}
                </h3>
                <div className="mb-2">
                  <span className="text-4xl font-semibold" data-testid={`text-plan-price-${plan.name.toLowerCase()}`}>
                    {plan.price}
                  </span>
                  {plan.price !== "Custom" && (
                    <span className="text-muted-foreground ml-2">/ {plan.period}</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <Button
                variant={plan.highlighted ? "default" : "outline"}
                className="w-full mb-6"
                size="lg"
                data-testid={`button-${plan.name.toLowerCase()}-cta`}
              >
                {plan.cta}
              </Button>

              <div className="space-y-3">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3" data-testid={`feature-${plan.name.toLowerCase()}-${index}`}>
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-semibold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Can I cancel anytime?</h3>
              <p className="text-muted-foreground">
                Yes, you can cancel your subscription at any time. No questions asked, no cancellation fees.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">What payment methods do you accept?</h3>
              <p className="text-muted-foreground">
                We accept all major credit cards, PayPal, and bank transfers for enterprise plans.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Is there a free trial for Pro?</h3>
              <p className="text-muted-foreground">
                Yes, all Pro features come with a 14-day free trial. No credit card required.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Are my files secure?</h3>
              <p className="text-muted-foreground">
                Absolutely. All processing happens in your browser. We never store your files on our servers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
