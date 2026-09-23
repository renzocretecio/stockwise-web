import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Check,
  CloudOff,
  Crown,
  ShieldCheck,
  Users,
} from "lucide-react";

import { WorkflowScrollReveal } from "./workflow-scroll-reveal";

type Plan = {
  accent: string;
  aiActions: string;
  description: string;
  features: string[];
  icon: typeof Users;
  members: string;
  name: string;
  price: string;
  priceNote: string;
  skuLimit: string;
  trial?: string;
};

const plans: Plan[] = [
  {
    accent: "light",
    aiActions: "5 per week",
    description: "For one owner organizing a small product catalog.",
    features: [
      "Sales, purchasing, inventory, reports, and online store",
      "All inventory intelligence tools",
      "Use indefinitely without a subscription",
    ],
    icon: Users,
    members: "1 member",
    name: "Free",
    price: "₱0",
    priceNote: "No card required",
    skuLimit: "50 active SKUs",
  },
  {
    accent: "dark",
    aiActions: "30 per week",
    description: "For growing shops that need a team and offline work.",
    features: [
      "Offline operations and automatic sync",
      "Weekly owner summary",
      "Add members for ₱79 each, up to 10 total",
    ],
    icon: CloudOff,
    members: "3 members included",
    name: "Pro",
    price: "₱299",
    priceNote: "Billed per business",
    skuLimit: "500 active SKUs",
    trial: "14-day free trial",
  },
  {
    accent: "light",
    aiActions: "150 per week",
    description: "For larger teams that need more capacity and control.",
    features: [
      "Everything in Pro",
      "Up to 25 members",
      "Custom roles and permissions",
    ],
    icon: Crown,
    members: "25 members",
    name: "Business",
    price: "₱899",
    priceNote: "Billed per business",
    skuLimit: "10,000 active SKUs",
  },
];

const intelligenceFeatures = [
  "Daily briefing",
  "Demand forecasting",
  "Reorder assistant",
  "Anomaly explanations",
  "Report summaries",
];

export function PricingSection() {
  return (
    <section
      aria-labelledby="pricing-heading"
      className={
        "scroll-mt-24 border-t border-border bg-card px-4 " +
        "py-16 text-foreground sm:px-6 lg:py-20"
      }
      id="pricing"
    >
      <WorkflowScrollReveal>
        <div
          className={
            "grid gap-8 lg:grid-cols-[1.2fr_0.8fr] " + "lg:items-end lg:gap-16"
          }
        >
          <div data-workflow-reveal>
            <p
              className={
                "text-xs font-semibold uppercase " +
                "tracking-[0.18em] text-accent-foreground"
              }
            >
              Simple plans
            </p>
            <h2
              className={
                "mt-5 max-w-4xl text-4xl font-semibold " +
                "leading-[0.98] tracking-[-0.055em] " +
                "sm:text-5xl"
              }
              id="pricing-heading"
            >
              Start small. Pay more only when the business grows.
            </h2>
          </div>
          <div data-workflow-order="1" data-workflow-reveal>
            <p
              className={
                "max-w-xl text-sm leading-7 text-muted-foreground " +
                "sm:text-base"
              }
            >
              Every plan includes KitaStock&apos;s core operations and inventory
              intelligence. Higher plans expand capacity and add tools for teams
              and unreliable connections.
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              Plans apply separately to each business.
            </p>
          </div>
        </div>

        <div
          className={
            "mt-10 overflow-hidden rounded-2xl border " +
            "border-border lg:mt-12"
          }
          data-workflow-reveal
        >
          <div className="grid lg:grid-cols-3">
            {plans.map((plan, index) => (
              <PlanColumn index={index} key={plan.name} plan={plan} />
            ))}
          </div>

          <div
            className={
              "border-t border-border bg-muted " +
              "px-5 py-6 sm:px-7 lg:flex lg:items-center " +
              "lg:justify-between lg:gap-8"
            }
          >
            <div className="flex items-start gap-3">
              <span
                className={
                  "grid size-9 shrink-0 place-items-center " +
                  "rounded-xl bg-[#123f3d] text-[#087966]"
                }
              >
                <Bot aria-hidden="true" className="size-4" />
              </span>
              <div>
                <h3 className="text-sm font-semibold">
                  Intelligence is included in every plan
                </h3>
                <p
                  className={
                    "mt-1 max-w-xl text-xs leading-5 " + "text-muted-foreground"
                  }
                >
                  The weekly allowance changes with the plan; the capabilities
                  do not.
                </p>
              </div>
            </div>
            <ul
              className={
                "mt-5 flex flex-wrap gap-x-5 gap-y-2 " +
                "lg:mt-0 lg:justify-end"
              }
            >
              {intelligenceFeatures.map((feature) => (
                <li
                  className={
                    "flex items-center gap-1.5 text-xs " +
                    "font-medium text-muted-foreground"
                  }
                  key={feature}
                >
                  <Check
                    aria-hidden="true"
                    className="size-3.5 text-[#087966]"
                  />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          className={
            "mt-6 flex flex-col items-start justify-between " +
            "gap-4 text-xs text-muted-foreground sm:flex-row " +
            "sm:items-center"
          }
        >
          <p>
            Yearly billing is available. Paid upgrades are reviewed and
            activated after payment confirmation.
          </p>
          <div className="flex items-center gap-2 text-muted-foreground">
            <ShieldCheck aria-hidden="true" className="size-4" />
            Your data remains yours if a paid plan ends.
          </div>
        </div>
      </WorkflowScrollReveal>
    </section>
  );
}

function PlanColumn({ index, plan }: { index: number; plan: Plan }) {
  const isFeatured = plan.accent === "dark";
  const Icon = plan.icon;

  return (
    <article
      className={
        "relative flex min-w-0 flex-col border-b p-6 last:border-b-0 " +
        "lg:min-h-[32rem] lg:border-r lg:border-b-0 " +
        "lg:last:border-r-0 lg:p-7 " +
        (isFeatured
          ? "border-border bg-secondary text-white"
          : "border-border bg-card text-foreground")
      }
    >
      <div data-workflow-order={index} data-workflow-reveal>
        <div className="flex items-center justify-between gap-3">
          <span
            className={
              "grid size-10 place-items-center rounded-2xl " +
              (isFeatured
                ? "bg-white/10 text-primary"
                : "bg-accent text-accent-foreground")
            }
          >
            <Icon aria-hidden="true" className="size-5" />
          </span>
          {plan.trial ? (
            <span
              className={
                "rounded-full bg-primary/20 px-3 py-1.5 " +
                "text-[0.7rem] font-semibold text-primary-foreground"
              }
            >
              {plan.trial}
            </span>
          ) : null}
        </div>

        <p
          className={
            "mt-7 text-sm font-semibold " +
            (isFeatured ? "text-primary" : "text-accent-foreground")
          }
        >
          {plan.name}
        </p>
        <div className="mt-3 flex items-end gap-2">
          <p
            className={
              "text-5xl font-semibold tracking-[-0.055em] " + "sm:text-5xl"
            }
          >
            {plan.price}
          </p>
          {plan.price !== "₱0" ? (
            <span
              className={
                "pb-2 text-xs " +
                (isFeatured ? "text-white/50" : "text-muted-foreground")
              }
            >
              /mo
            </span>
          ) : null}
        </div>
        <p
          className={
            "mt-2 text-xs " +
            (isFeatured ? "text-white/50" : "text-muted-foreground")
          }
        >
          {plan.priceNote}
        </p>
        <p
          className={
            "mt-6 min-h-12 text-sm leading-6 " +
            (isFeatured ? "text-white/65" : "text-muted-foreground")
          }
        >
          {plan.description}
        </p>
      </div>

      <dl
        className={
          "mt-7 grid grid-cols-2 gap-px overflow-hidden " +
          "rounded-2xl " +
          (isFeatured ? "bg-white/10" : "bg-border")
        }
      >
        <PlanMetric dark={isFeatured} label="Catalog" value={plan.skuLimit} />
        <PlanMetric dark={isFeatured} label="Team" value={plan.members} />
        <PlanMetric
          className="col-span-2"
          dark={isFeatured}
          label="AI actions"
          value={plan.aiActions}
        />
      </dl>

      <ul className="mt-7 space-y-3">
        {plan.features.map((feature) => (
          <li
            className={
              "flex items-start gap-2.5 text-sm leading-6 " +
              (isFeatured ? "text-white/75" : "text-muted-foreground")
            }
            key={feature}
          >
            <Check
              aria-hidden="true"
              className={
                "mt-1 size-4 shrink-0 " +
                (isFeatured ? "text-primary" : "text-[#087966]")
              }
            />
            {feature}
          </li>
        ))}
      </ul>

      <Link
        className={
          "group mt-8 inline-flex min-h-11 w-full items-center " +
          "justify-between rounded-2xl px-4 text-sm font-semibold " +
          "transition-colors focus-visible:outline-2 " +
          "focus-visible:outline-offset-2 lg:mt-auto " +
          (isFeatured
            ? "bg-primary text-primary-foreground hover:bg-primary/85"
            : "border border-border text-accent-foreground " +
              "hover:bg-accent")
        }
        href="/signup"
      >
        {plan.name === "Free"
          ? "Start free"
          : plan.name === "Pro"
            ? "Try Pro free"
            : "Start with KitaStock"}
        <ArrowRight
          aria-hidden="true"
          className={
            "size-4 transition-transform " +
            "motion-safe:group-hover:translate-x-1 " +
            "motion-reduce:transition-none"
          }
        />
      </Link>
    </article>
  );
}

function PlanMetric({
  className = "",
  dark,
  label,
  value,
}: {
  className?: string;
  dark: boolean;
  label: string;
  value: string;
}) {
  return (
    <div
      className={
        "p-3.5 " + (dark ? "bg-card" : "bg-secondary") + " " + className
      }
    >
      <dt
        className={
          "text-[0.65rem] uppercase tracking-wide " +
          (dark ? "text-white/40" : "text-muted-foreground")
        }
      >
        {label}
      </dt>
      <dd className="mt-1 text-sm font-semibold">{value}</dd>
    </div>
  );
}
