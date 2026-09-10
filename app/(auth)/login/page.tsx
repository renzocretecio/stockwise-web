import { Suspense } from "react";

import { LoginForm } from "@/modules/auth/components/LoginForm";
import { AuthShell } from "@/modules/auth/components/AuthShell";

export default function LoginPage() {
    return (
        <AuthShell
            description={
                "Enter your details to access your business overview."
            }
            eyebrow="Welcome back"
            title="Sign in"
        >
            <Suspense fallback={<div>Loading...</div>}>
                <LoginForm />
            </Suspense>
        </AuthShell>
    );
}
