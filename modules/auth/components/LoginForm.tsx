"use client";

import { useForm } from "@tanstack/react-form";
import * as z from "zod";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { EyeOffIcon, EyeIcon, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

const formSchema = z.object({
  email: z.string("Email is required").min(1, "Email is required"),
  password: z.string("Password is required").min(1, "Password is required"),
});

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible((prevState) => !prevState);
  const [error, setError] = useState<string | null>(null);
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async (form) => {
      setError(null);
      setLoading(true);

      try {
        const res = await fetch("api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.value.email,
            password: form.value.password,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));

          if (res.status === 429) {
            setError("Too many attempts. Please wait a moment.");
          } else if (res.status === 401) {
            setError("Invalid email or password");
          } else {
            setError(data.message || "An error occurred during login.");
          }
          return;
        }

        const callbackUrl = searchParams.get("callbackUrl");
        const destination =
          callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//")
            ? callbackUrl
            : "/dashboard/overview";
        router.replace(destination);
        router.refresh();
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="space-y-4">
      {error && (
        <Alert
          variant="destructive"
          className="animate-in fade-in zoom-in duration-200"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <form
        id="login-form"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          <form.Field name="email">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="Enter email"
                    autoComplete="email"
                    disabled={loading}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="password">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      autoComplete="current-password"
                      aria-invalid={isInvalid}
                      type={isVisible ? "text" : "password"}
                      placeholder="Enter password"
                      disabled={loading}
                    />
                    <InputGroupAddon align="inline-end">
                      <Button
                        variant="ghost"
                        onClick={toggleVisibility}
                        aria-label={
                          isVisible ? "Hide password" : "Show password"
                        }
                        className="cursor-pointer"
                        type="button"
                      >
                        {isVisible ? (
                          <EyeOffIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                      </Button>
                    </InputGroupAddon>
                  </InputGroup>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>
        </FieldGroup>
      </form>
      <div className="my-4 flex justify-between cursor-pointer">
        <Link
          href="/forgot-password"
          className="text-[10px] font-black tracking-[0.15em] text-slate-400 
             hover:text-blue-600 dark:hover:text-blue-400 
             transition-all duration-200 ease-in-out
             hover:translate-x-0.5 active:scale-95
             flex items-center gap-1.5"
        >
          Forgot password?
          <span className="opacity-0 group-hover:opacity-100 transition-opacity">
            →
          </span>
        </Link>
        <Button
          variant="outline"
          aria-label="Submit"
          type="submit"
          form="login-form"
          className="cursor-pointer bg-primary text-primary-foreground"
          disabled={loading}
        >
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </div>
      <p className="text-center text-sm text-muted-foreground">
        New to StockWise?{" "}
        <Link href="/signup" className="font-medium text-primary">
          Create an account
        </Link>
      </p>
    </div>
  );
}
