"use client";

import { motion, type Variants, useReducedMotion } from "motion/react";
import { type ComponentProps, useCallback } from "react";

import { cn } from "@/lib/utils";

export type ShimmeringTextProps = Omit<
  ComponentProps<typeof motion.span>,
  "children"
> & {
  text: string;
  duration?: number;
  paused?: boolean;
  isStopped?: boolean;
};

export function ShimmeringText({
  text,
  duration = 1,
  isStopped = false,
  paused = false,
  className,
  ...props
}: ShimmeringTextProps) {
  const reducedMotion = useReducedMotion();
  const stopped = isStopped || paused || reducedMotion === true;
  const createCharVariants = useCallback(
    (charIndex: number): Variants => ({
      running: {
        color: ["var(--color)", "var(--shimmering-color)", "var(--color)"],
        transition: {
          duration,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "loop",
          repeatDelay: text.length * 0.05,
          delay: (charIndex * duration) / text.length,
          ease: "easeInOut",
        },
      },
      stopped: {
        color: "var(--color)",
        transition: {
          duration: duration * 0.5,
          ease: "easeOut",
        },
      },
    }),
    [duration, text.length],
  );

  return (
    <motion.span
      className={cn(
        "inline-flex select-none items-center leading-none",
        "[--color:var(--muted-foreground)]",
        "[--shimmering-color:var(--foreground)]",
        className,
      )}
      {...props}
    >
      {text.split("").map((char, index) => (
        <motion.span
          animate={stopped ? "stopped" : "running"}
          aria-hidden="true"
          className="inline-block whitespace-pre leading-none"
          initial="stopped"
          key={`${char}-${index}`}
          variants={createCharVariants(index)}
        >
          {char}
        </motion.span>
      ))}
      <span className="sr-only">{text}</span>
    </motion.span>
  );
}
