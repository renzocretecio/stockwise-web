import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export function GoogleOAuthButton({
    callbackUrl,
    label,
}: {
    callbackUrl?: string | null;
    label: string;
}) {
    const href = callbackUrl
        ? `/api/auth/google/start?callbackUrl=${encodeURIComponent(
              callbackUrl,
          )}`
        : "/api/auth/google/start";

    return (
        <Link
            className={buttonVariants({
                className: "h-11 w-full rounded-2xl",
                size: "lg",
                variant: "outline",
            })}
            href={href}
        >
            <GoogleIcon />
            {label}
        </Link>
    );
}

function GoogleIcon() {
    return (
        <svg
            aria-hidden="true"
            className="size-4"
            viewBox="0 0 24 24"
        >
            <path
                d={
                    "M21.6 12.23c0-.71-.06-1.24-.2-1.79H12v3.4h5.52" +
                    "a4.75 4.75 0 0 1-2.05 3.03l-.02.11 2.98 2.31.21.02" +
                    "c1.94-1.8 3.06-4.44 3.06-7.08Z"
                }
                fill="#4285F4"
            />
            <path
                d={
                    "M12 22c2.77 0 5.1-.91 6.8-2.49l-3.33-2.64" +
                    "c-.89.6-2.08 1.03-3.47 1.03a6.03 6.03 0 0 1-5.7-4.16" +
                    "l-.1.01-3.1 2.4-.04.1A10 10 0 0 0 12 22Z"
                }
                fill="#34A853"
            />
            <path
                d={
                    "M6.3 13.74A6.16 6.16 0 0 1 5.97 12" +
                    "c0-.61.11-1.2.32-1.75v-.12L3.16 7.7l-.1.05" +
                    "A10 10 0 0 0 2 12c0 1.53.35 2.97 1.06 4.25l3.24-2.51Z"
                }
                fill="#FBBC05"
            />
            <path
                d={
                    "M12 6.1c1.93 0 3.23.83 3.97 1.52l2.9-2.83" +
                    "C17.09 3.13 14.77 2 12 2a10 10 0 0 0-8.94 5.75" +
                    "l3.23 2.5A6.05 6.05 0 0 1 12 6.1Z"
                }
                fill="#EA4335"
            />
        </svg>
    );
}
