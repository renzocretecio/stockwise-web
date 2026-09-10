import { Suspense } from "react";

import { SignupForm } from "@/modules/auth/components/SignupForm";
import { AuthShell } from "@/modules/auth/components/AuthShell";

export default function SignupPage() {
    return (
        <AuthShell
            description={
                "Create your owner account and first business. No credit " +
                "card required."
            }
            eyebrow="14-day Pro trial"
            title="Start managing inventory with confidence"
        >
            <Suspense fallback={<div>Loading...</div>}>
                <SignupForm />
            </Suspense>
        </AuthShell>
    );
}
