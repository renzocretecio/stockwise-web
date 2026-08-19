"use client";

import { Suspense } from "react";
import { LoginForm } from "@/modules/auth/components/LoginForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="w-full h-dvh px-4">
      <div className="flex items-center justify-center h-full">
        <Card className="w-full sm:max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Sign in to your account</CardDescription>
          </CardHeader>

          <CardContent>
            <Suspense fallback={<div>Loading...</div>}>
              <LoginForm />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
