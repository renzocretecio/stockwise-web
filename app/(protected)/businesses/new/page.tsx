import { Building2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateBusinessForm } from "@/modules/business/components/CreateBusinessForm";

export default function NewBusinessPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add a business</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create another independent workspace under your account.
        </p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <Building2 className="size-5" />
            </div>
            <CardTitle>New business</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <CreateBusinessForm />
        </CardContent>
      </Card>
    </div>
  );
}