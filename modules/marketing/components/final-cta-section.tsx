import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { WorkflowScrollReveal } from "./workflow-scroll-reveal";

const assurances = [
  "Free plan available",
  "No card required",
  "14-day Pro trial for eligible accounts",
];

const movingArrowClassName =
  "size-4 transition-transform " +
  "motion-safe:group-hover:translate-x-1 " +
  "motion-reduce:transition-none";

export function FinalCtaSection() {
  return (
    <section
      aria-labelledby="final-cta-heading"
      className={
        "border-t border-border bg-card px-4 py-12 " +
        "text-foreground sm:px-6 lg:py-16"
      }
    >
      <WorkflowScrollReveal>
        <div
          className={
            "relative isolate overflow-hidden rounded-2xl " +
            "bg-secondary px-5 py-12 text-center text-white " +
            "sm:px-10 sm:py-16 lg:px-16 lg:py-20"
          }
          data-workflow-reveal
        >
          <div className="relative mx-auto max-w-4xl">
            <p
              className={
                "text-xs font-semibold uppercase " +
                "tracking-[0.2em] text-primary"
              }
            >
              Kita ang stock. Kita ang kita.
            </p>
            <h2
              className={
                "mt-5 text-4xl font-semibold leading-[0.96] " +
                "tracking-[-0.055em] sm:text-5xl " +
                "lg:text-6xl"
              }
              id="final-cta-heading"
            >
              Make the next business decision with a clearer view.
            </h2>
            <p
              className={
                "mx-auto mt-5 max-w-2xl text-sm leading-7 " +
                "text-white/65 sm:text-base"
              }
            >
              Bring sales, purchasing, inventory, reports, and practical
              guidance into one workspace built for everyday owners.
            </p>

            <div
              className={
                "mt-7 flex flex-col justify-center gap-3 " + "sm:flex-row"
              }
            >
              <Link
                className={
                  "group inline-flex min-h-12 items-center " +
                  "justify-center gap-2 rounded-2xl " +
                  "bg-primary " +
                  "px-6 text-sm font-semibold " +
                  "text-primary-foreground transition-colors " +
                  "hover:bg-primary/85 " +
                  "focus-visible:outline-2 " +
                  "focus-visible:outline-offset-4 " +
                  "focus-visible:outline-white"
                }
                href="/signup"
              >
                Start your free account
                <ArrowRight
                  aria-hidden="true"
                  className={movingArrowClassName}
                />
              </Link>
              <Link
                className={
                  "inline-flex min-h-12 items-center " +
                  "justify-center rounded-2xl border " +
                  "border-white/20 px-6 text-sm " +
                  "font-semibold text-white " +
                  "transition-colors hover:bg-white/10 " +
                  "focus-visible:outline-2 " +
                  "focus-visible:outline-offset-4 " +
                  "focus-visible:outline-white"
                }
                href="/login"
              >
                Sign in to your workspace
              </Link>
            </div>

            <ul
              className={
                "mt-6 flex flex-wrap justify-center gap-x-6 " +
                "gap-y-2 text-xs text-white/55"
              }
            >
              {assurances.map((assurance) => (
                <li className="flex items-center gap-1.5" key={assurance}>
                  <Check aria-hidden="true" className="size-3.5 text-primary" />
                  {assurance}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </WorkflowScrollReveal>
    </section>
  );
}
