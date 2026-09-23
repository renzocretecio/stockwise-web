import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const productLinks = [
  {
    href: "#features",
    label: "Workflow",
  },
  {
    href: "#online-store",
    label: "Online store",
  },
  {
    href: "#attention",
    label: "Inventory risks",
  },
  {
    href: "#intelligence",
    label: "Intelligence",
  },
  {
    href: "#offline",
    label: "Offline mode",
  },
  {
    href: "#pricing",
    label: "Pricing",
  },
];

const accountLinks = [
  {
    href: "/signup",
    label: "Create an account",
  },
  {
    href: "/login",
    label: "Sign in",
  },
];

export function MarketingFooter() {
  return (
    <footer className="bg-secondary px-4 text-white sm:px-6">
      <div className="mx-auto max-w-7xl py-12 sm:py-16">
        <div
          className={
            "grid gap-12 border-b border-white/10 pb-12 " +
            "sm:grid-cols-2 lg:grid-cols-[1.4fr_0.6fr_0.6fr]"
          }
        >
          <div>
            <Link
              className={
                "inline-flex items-center gap-2.5 " +
                "font-semibold focus-visible:outline-2 " +
                "focus-visible:outline-offset-4"
              }
              href="/"
            >
              <Image
                alt=""
                className="size-8 object-contain"
                height={32}
                src="/kitastock-logo-image.svg"
                width={32}
              />
              KitaStock
            </Link>
            <p className={"mt-5 max-w-md text-sm leading-7 " + "text-white/55"}>
              Sales, inventory, and practical guidance for small businesses that
              need a clear view of what is happening and what to do next.
            </p>
            <p
              className={
                "mt-5 text-xs font-semibold uppercase " +
                "tracking-[0.16em] text-primary"
              }
            >
              Kita ang stock. Kita ang kita.
            </p>
          </div>

          <FooterLinks label="Product" links={productLinks} />
          <FooterLinks label="Account" links={accountLinks} />
        </div>

        <div
          className={
            "flex flex-col gap-4 pt-6 text-xs text-white/40 " +
            "sm:flex-row sm:items-center sm:justify-between"
          }
        >
          <p>© 2026 KitaStock. Built for everyday business owners.</p>
          <Link
            className={
              "inline-flex w-fit items-center gap-1.5 " +
              "font-medium text-white/60 transition-colors " +
              "hover:text-white focus-visible:outline-2 " +
              "focus-visible:outline-offset-4"
            }
            href="#top"
          >
            Back to top
            <ArrowUpRight aria-hidden="true" className="size-3.5" />
          </Link>
        </div>
      </div>
    </footer>
  );
}

function FooterLinks({
  label,
  links,
}: {
  label: string;
  links: Array<{ href: string; label: string }>;
}) {
  return (
    <nav aria-label={`${label} links`}>
      <p
        className={
          "text-xs font-semibold uppercase tracking-[0.16em] " + "text-white/35"
        }
      >
        {label}
      </p>
      <ul className="mt-5 space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              className={
                "text-sm text-white/60 transition-colors " +
                "hover:text-white focus-visible:outline-2 " +
                "focus-visible:outline-offset-4"
              }
              href={link.href}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
