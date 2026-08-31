import { Building2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BusinessProfileForm } from "@/modules/business/components/BusinessProfileForm";

export default function BusinessOnboardingPage() {
  return (
    <div className="mx-auto max-w-2xl py-6">
      <Card>
        <CardHeader>
          <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Building2 className="size-5" />
          </div>
          <CardTitle>Tell us about your business</CardTitle>
          <p className="text-sm text-muted-foreground">
            These settings control currency, dates, and business information
            throughout StockWise.
          </p>
        </CardHeader>
        <CardContent>
          <BusinessProfileForm />
        </CardContent>
      </Card>
    </div>
  );
}
