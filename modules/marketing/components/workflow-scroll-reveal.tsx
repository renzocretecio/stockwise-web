"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function WorkflowScrollReveal({ children }: { children: ReactNode }) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const reducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        );
        const wideScreen = window.matchMedia("(min-width: 1280px)");
        const targets = Array.from(
            container.querySelectorAll<HTMLElement>(
                "[data-workflow-reveal]",
            ),
            (element) => ({ element, offset: 0, progress: 0 }),
        );
        let frame: number | null = null;
        let previousTime = performance.now();

        const reset = () => {
            targets.forEach((target) => {
                target.element.style.removeProperty("opacity");
                target.element.style.removeProperty("transform");
                target.offset = 0;
                target.progress = 1;
            });
        };

        const render = (time = performance.now()) => {
            frame = null;
            if (reducedMotion.matches) {
                reset();
                return;
            }

            const viewportHeight = window.innerHeight;
            // Begin as an element enters the viewport and finish while it is
            // still in the lower two-thirds. Text should be fully readable
            // before the user has scrolled past the section introduction.
            const distance = Math.max(viewportHeight * 0.34, 1);
            const elapsed = Math.min(Math.max(time - previousTime, 1), 64);
            const blend = 1 - Math.exp(-elapsed / 55);
            previousTime = time;
            let settling = false;
            const scrollTop = window.scrollY;
            const maxScroll = Math.max(
                0,
                document.documentElement.scrollHeight - viewportHeight,
            );
            const positions = targets.map((target) => (
                target.element.getBoundingClientRect().top - target.offset
            ));

            targets.forEach((target, index) => {
                const order = Number(
                    target.element.dataset.workflowOrder ?? 0,
                );
                const stagger = wideScreen.matches ? order * 10 : 0;
                const start = positions[index] + scrollTop -
                    viewportHeight * 0.98 + stagger;
                const end = Math.min(start + distance, maxScroll);
                const focused = target.element.contains(
                    document.activeElement,
                );
                const measuredProgress = focused ? 1 : Math.min(
                    1,
                    Math.max(0, (scrollTop - start) /
                        Math.max(end - start, 1)),
                );
                const progress = measuredProgress >= 0.92
                    ? 1
                    : measuredProgress <= 0.03
                        ? 0
                        : measuredProgress;
                const difference = progress - target.progress;
                if (focused || Math.abs(difference) < 0.002) {
                    target.progress = progress;
                } else {
                    target.progress += difference * blend;
                    settling = true;
                }
                const current = target.progress;
                const eased = current * current * (3 - 2 * current);
                target.offset = 40 * (1 - eased);
                target.element.style.opacity = String(eased);
                target.element.style.transform = eased === 1
                    ? "none"
                    : `translateY(${target.offset}px)`;
            });
            if (settling) frame = window.requestAnimationFrame(render);
        };

        const schedule = () => {
            if (frame === null) {
                frame = window.requestAnimationFrame(render);
            }
        };

        const resizeObserver = typeof ResizeObserver !== "undefined"
            ? new ResizeObserver(schedule)
            : null;
        resizeObserver?.observe(container);
        window.addEventListener("scroll", schedule, { passive: true });
        window.addEventListener("resize", schedule);
        container.addEventListener("focusin", schedule);
        container.addEventListener("focusout", schedule);
        reducedMotion.addEventListener("change", schedule);
        render();

        return () => {
            if (frame !== null) window.cancelAnimationFrame(frame);
            resizeObserver?.disconnect();
            window.removeEventListener("scroll", schedule);
            window.removeEventListener("resize", schedule);
            container.removeEventListener("focusin", schedule);
            container.removeEventListener("focusout", schedule);
            reducedMotion.removeEventListener("change", schedule);
            reset();
        };
    }, []);

    return (
        <div className="mx-auto max-w-7xl" ref={containerRef}>
            {children}
        </div>
    );
}
