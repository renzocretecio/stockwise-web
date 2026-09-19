import Link from "next/link";
import { ArrowRight, Braces, MessageSquareText } from "lucide-react";

import { IntelligencePreview } from "./intelligence-preview";
import { WorkflowScrollReveal } from "./workflow-scroll-reveal";

const principles = [
  {
    description: "Sales, stock, purchase, and count records produce the facts.",
    icon: Braces,
    title: "The system calculates.",
  },
  {
    description: "AI turns compact results into guidance an owner can act on.",
    icon: MessageSquareText,
    title: "AI explains.",
  },
];

export function IntelligenceSection() {
  return (
    <section
      aria-labelledby="intelligence-heading"
      className={
        "scroll-mt-24 border-t border-white/10 bg-secondary " +
        "px-4 py-16 text-white sm:px-6 lg:py-20"
      }
      id="intelligence"
    >
      <WorkflowScrollReveal>
        <div
          className={
            "grid gap-8 lg:grid-cols-[1.1fr_0.9fr] " + "lg:items-end lg:gap-12"
          }
        >
          <div data-workflow-reveal>
            <p
              className={
                "text-xs font-semibold uppercase " +
                "tracking-[0.18em] text-primary"
              }
            >
              Practical inventory intelligence
            </p>
            <h2
              className={
                "mt-5 max-w-3xl text-4xl font-semibold " +
                "leading-[0.98] tracking-[-0.055em] " +
                "sm:text-5xl"
              }
              id="intelligence-heading"
            >
              Your numbers first.
              <span className="block text-primary">
                A clear explanation after.
              </span>
            </h2>
          </div>
          <div data-workflow-order="1" data-workflow-reveal>
            <p
              className={
                "max-w-xl text-sm leading-7 text-white/65 " + "sm:text-base"
              }
            >
              KitaStock does not ask AI to invent inventory answers. It
              calculates from your records, then uses AI to communicate what
              changed, why it matters, and what to review next.
            </p>
            <Link
              className={
                "group mt-5 inline-flex min-h-11 " +
                "items-center " +
                "gap-2 rounded-2xl text-sm font-semibold " +
                "text-primary focus-visible:outline-2 " +
                "focus-visible:outline-offset-4"
              }
              href="/signup"
            >
              Try the intelligence workspace
              <ArrowRight
                aria-hidden="true"
                className={
                  "size-4 transition-transform " +
                  "motion-safe:group-hover:translate-x-1 " +
                  "motion-reduce:transition-none"
                }
              />
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-px bg-white/10 sm:grid-cols-2">
          {principles.map((principle, index) => {
            const Icon = principle.icon;

            return (
              <div className="bg-secondary py-5 sm:px-6" key={principle.title}>
                <div
                  className="flex items-start gap-3"
                  data-workflow-order={index}
                  data-workflow-reveal
                >
                  <span
                    className={
                      "grid size-9 shrink-0 " +
                      "place-items-center rounded-xl " +
                      "bg-white/10 text-primary"
                    }
                  >
                    <Icon aria-hidden="true" className="size-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold">{principle.title}</h3>
                    <p
                      className={
                        "mt-1 max-w-md text-sm " + "leading-6 text-white/55"
                      }
                    >
                      {principle.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 lg:mt-12" data-workflow-reveal>
          <IntelligencePreview />
        </div>
      </WorkflowScrollReveal>
    </section>
  );
}
