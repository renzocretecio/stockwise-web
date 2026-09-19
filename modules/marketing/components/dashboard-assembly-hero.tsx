"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowRight, Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

type Piece = {
    alt: string;
    contentHeight?: string;
    height: string;
    left: string;
    rotation: number;
    scale: number;
    src: string;
    startX: number;
    startY: number;
    top: string;
    width: string;
};

const pieces: Piece[] = [
    {
        alt: "Revenue, gross profit, margin, and inventory KPI cards",
        height: "15.56%",
        left: "0.83%",
        rotation: -3.5,
        scale: 0.82,
        src: "/marketing/kpis.png",
        startX: -23,
        startY: -24,
        top: "16.48%",
        width: "67.86%",
    },
    {
        alt: "Yesterday's AI business briefing",
        height: "15.19%",
        left: "69.53%",
        rotation: 4,
        scale: 0.88,
        src: "/marketing/briefing.png",
        startX: 27,
        startY: -22,
        top: "16.48%",
        width: "29.01%",
    },
    {
        alt: "Revenue and gross profit performance chart",
        contentHeight: "89.75%",
        height: "37.96%",
        left: "0.83%",
        rotation: 2.5,
        scale: 0.78,
        src: "/marketing/chart.png",
        startX: -24,
        startY: 28,
        top: "33.52%",
        width: "67.76%",
    },
    {
        alt: "Inventory issues that need attention",
        height: "37.96%",
        left: "69.53%",
        rotation: -3,
        scale: 0.84,
        src: "/marketing/needs-attention.png",
        startX: 27,
        startY: 27,
        top: "33.52%",
        width: "29.01%",
    },
];

const sectionLinks = [
    {
        href: "#features",
        label: "How it works",
    },
    {
        href: "#intelligence",
        label: "Intelligence",
    },
    {
        href: "#pricing",
        label: "Pricing",
    },
];

export function DashboardAssemblyHero() {
    const sectionRef = useRef<HTMLElement>(null);
    const headerRef = useRef<HTMLElement>(null);
    const floatingHeaderRef = useRef<HTMLElement>(null);
    const introRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<HTMLDivElement>(null);
    const templateRef = useRef<HTMLDivElement>(null);
    const completedRef = useRef<HTMLDivElement>(null);
    const cueRef = useRef<HTMLDivElement>(null);
    const progressRef = useRef<HTMLSpanElement>(null);
    const pieceRefs = useRef<Array<HTMLDivElement | null>>([]);

    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;

        let frame = 0;
        let scheduled = false;

        const render = () => {
            const rect = section.getBoundingClientRect();
            const sectionDistance =
                section.offsetHeight - window.innerHeight;
            const progress = section.offsetHeight > 0
                ? clamp(-rect.top / Math.max(sectionDistance, 1))
                : clamp(window.scrollY / (window.innerHeight * 0.7));
            const introExit = smoothStep(progress, 0.06, 0.28);
            const headerExit = smoothStep(progress, 0.12, 0.38);
            const floatingEntry = smoothStep(progress, 0.28, 0.42);
            const stageEntry = smoothStep(progress, 0.08, 0.42);
            const assembly = smoothStep(progress, 0.14, 0.7);
            const templateReveal = smoothStep(progress, 0.26, 0.6);
            const completed = smoothStep(progress, 0.72, 0.9);

            if (introRef.current) {
                introRef.current.style.opacity = String(1 - introExit);
                introRef.current.style.transform =
                    `translate3d(0, ${-48 * introExit}px, 0) ` +
                    `scale(${1 - introExit * 0.04})`;
            }

            if (headerRef.current) {
                headerRef.current.style.opacity = String(1 - headerExit);
                headerRef.current.style.transform =
                    `translate3d(0, ${-18 * headerExit}px, 0)`;
                headerRef.current.style.pointerEvents =
                    headerExit > 0.8 ? "none" : "auto";
            }

            if (floatingHeaderRef.current) {
                floatingHeaderRef.current.style.opacity = String(
                    floatingEntry,
                );
                floatingHeaderRef.current.style.transform =
                    `translate3d(0, ${-20 * (1 - floatingEntry)}px, 0)`;
                floatingHeaderRef.current.style.pointerEvents =
                    floatingEntry > 0.8 ? "auto" : "none";
                floatingHeaderRef.current.setAttribute(
                    "aria-hidden",
                    floatingEntry > 0.8 ? "false" : "true",
                );
                floatingHeaderRef.current.inert = floatingEntry <= 0.8;
            }

            if (stageRef.current) {
                const rise = (1 - stageEntry) * 140;
                const scale = 0.76 + stageEntry * 0.24;
                stageRef.current.style.opacity = String(stageEntry);
                stageRef.current.style.transform =
                    `translate3d(-50%, calc(-50% + ${rise}px), 0) ` +
                    `scale(${scale})`;
            }

            if (templateRef.current) {
                templateRef.current.style.opacity = String(
                    templateReveal,
                );
            }

            pieceRefs.current.forEach((element, index) => {
                const piece = pieces[index];
                if (!element || !piece) return;

                const remaining = 1 - assembly;
                const rotation = piece.rotation * remaining;
                const scale = piece.scale +
                    (1 - piece.scale) * assembly;
                const shadowOpacity = 0.2 * remaining;

                if (remaining < 0.001) {
                    element.style.transform = "none";
                    element.style.filter = "none";
                    element.style.willChange = "auto";
                    return;
                }

                element.style.transform =
                    `translate3d(${piece.startX * remaining}vw, ` +
                    `${piece.startY * remaining}vh, 0) ` +
                    `rotate(${rotation}deg) scale(${scale})`;
                element.style.filter =
                    `drop-shadow(0 18px 28px ` +
                    `rgb(23 33 38 / ${shadowOpacity}))`;
                element.style.willChange = "filter, transform";
            });

            if (completedRef.current) {
                completedRef.current.style.opacity = String(completed);
            }

            if (cueRef.current) {
                cueRef.current.style.opacity = String(
                    1 - smoothStep(progress, 0, 0.13),
                );
            }

            if (progressRef.current) {
                progressRef.current.style.transform =
                    `scaleX(${progress})`;
            }
        };

        const scheduleRender = () => {
            if (scheduled) return;
            scheduled = true;
            frame = window.requestAnimationFrame(() => {
                render();
                scheduled = false;
            });
        };

        render();
        window.addEventListener("scroll", scheduleRender, {
            passive: true,
        });
        window.addEventListener("resize", scheduleRender);

        return () => {
            window.cancelAnimationFrame(frame);
            window.removeEventListener("scroll", scheduleRender);
            window.removeEventListener("resize", scheduleRender);
        };
    }, []);

    return (
        <>
            <FloatingNavigation headerRef={floatingHeaderRef} />
            <section
                className={
                    "relative hidden h-[270svh] overflow-clip " +
                    "bg-[#f4f7f8] text-[#203039] xl:block " +
                    "motion-reduce:hidden"
                }
                ref={sectionRef}
            >
                <div className="sticky top-0 h-svh overflow-hidden">
                    <HeroBackdrop />
                    <MarketingHeader headerRef={headerRef} />
                    <HeroCopy introRef={introRef} />

                    <div
                        className={
                            "absolute left-1/2 top-[57%] " +
                            "w-[min(82vw,80rem)] " +
                            "opacity-0 will-change-[opacity,transform]"
                        }
                        ref={stageRef}
                    >
                        <DashboardCanvas
                            completedRef={completedRef}
                            pieceRefs={pieceRefs}
                            templateRef={templateRef}
                        />
                    </div>

                    <div
                        className={
                            "absolute bottom-7 left-1/2 flex " +
                            "-translate-x-1/2 flex-col items-center gap-2 " +
                            "text-xs font-medium text-[#5e6d75]"
                        }
                        ref={cueRef}
                    >
                        <span>Scroll to assemble your workspace</span>
                        <ChevronDown className="size-4 animate-bounce" />
                    </div>

                    <div
                        aria-hidden="true"
                        className={
                            "absolute inset-x-0 bottom-0 h-0.5 " +
                            "bg-[#dbe3e6]"
                        }
                    >
                        <span
                            className={
                                "block h-full origin-left scale-x-0 " +
                                "bg-[#245564] will-change-transform"
                            }
                            ref={progressRef}
                        />
                    </div>
                </div>
            </section>

            <StaticHero />
        </>
    );
}

function FloatingNavigation({
    headerRef,
}: {
    headerRef: React.RefObject<HTMLElement | null>;
}) {
    return (
        <header
            aria-hidden="true"
            className={
                "fixed inset-x-0 top-4 z-[70] hidden justify-center " +
                "px-4 opacity-0 md:flex"
            }
            ref={headerRef}
        >
            <nav
                aria-label="Floating navigation"
                className={
                    "flex w-full max-w-2xl items-center justify-between " +
                    "rounded-2xl border border-[#c7d5da]/80 bg-white/90 " +
                    "px-5 py-3 shadow-xl shadow-[#172126]/10 " +
                    "backdrop-blur-xl"
                }
            >
                <BrandLink compact />
                <SectionLinks compact />
                <NavigationActions compact />
            </nav>
        </header>
    );
}

function MarketingHeader({
    headerRef,
}: {
    headerRef?: React.RefObject<HTMLElement | null>;
}) {
    return (
        <header
            className={
                "absolute inset-x-0 top-0 z-50 mx-auto flex h-20 " +
                "max-w-[96rem] items-center justify-between px-5 " +
                "will-change-[opacity,transform] lg:px-8"
            }
            ref={headerRef}
        >
            <BrandLink />
            <nav
                aria-label="Landing page sections"
                className="hidden md:block"
            >
                <SectionLinks />
            </nav>
            <NavigationActions />
        </header>
    );
}

function BrandLink({ compact = false }: { compact?: boolean }) {
    return (
        <Link
            className="flex items-center gap-2.5 font-semibold"
            href="/"
        >
            <Image
                alt=""
                className="size-8 object-contain"
                height={32}
                priority
                src="/logo-kitastock.png"
                width={32}
            />
            <span className={compact ? "text-base" : undefined}>
                KitaStock
            </span>
        </Link>
    );
}

function SectionLinks({ compact = false }: { compact?: boolean }) {
    return (
        <ul className="flex items-center gap-0.5">
            {sectionLinks.map((link) => (
                <li key={link.href}>
                    <Link
                        className={cn(
                            "block rounded-2xl font-medium text-[#52636b]",
                            "transition-colors hover:bg-[#e7f2f5]",
                            "hover:text-[#245564]",
                            compact
                                ? "px-2.5 py-2 text-xs"
                                : "px-3 py-2 text-sm",
                        )}
                        href={link.href}
                    >
                        {link.label}
                    </Link>
                </li>
            ))}
        </ul>
    );
}

function NavigationActions({ compact = false }: { compact?: boolean }) {
    return (
        <div className="flex items-center gap-2">
            <Link
                className={cn(
                    "rounded-2xl font-medium text-[#245564]",
                    "hover:bg-[#e2eef1]",
                    compact
                        ? "px-4 py-2 text-sm"
                        : "px-4 py-2 text-sm",
                )}
                href="/login"
            >
                Sign in
            </Link>
            <Link
                className={cn(
                    "rounded-2xl bg-[#245564] font-medium text-white",
                    "hover:bg-[#1c4653]",
                    compact
                        ? "px-4 py-2 text-sm"
                        : "px-4 py-2 text-sm",
                )}
                href="/signup"
            >
                Start free
            </Link>
        </div>
    );
}

function HeroCopy({
    introRef,
}: {
    introRef: React.RefObject<HTMLDivElement | null>;
}) {
    return (
        <div
            className={
                "absolute inset-0 z-40 flex items-center justify-center " +
                "px-6 pb-[8svh] pt-20 text-center"
            }
        >
            <div
                className={
                    "w-full max-w-5xl will-change-[opacity,transform]"
                }
                ref={introRef}
            >
                <p
                    className={
                        "text-xs font-semibold uppercase tracking-[0.2em] " +
                        "text-[#245564]"
                    }
                >
                    Kita ang stock. Kita ang kita.
                </p>
                <h1
                    className={
                        "mx-auto mt-5 max-w-5xl text-6xl font-semibold " +
                        "leading-[0.95] tracking-[-0.06em] lg:text-8xl"
                    }
                >
                    See the business.
                    <span className="block text-[#245564]">
                        Know what comes next.
                    </span>
                </h1>
                <p
                    className={
                        "mx-auto mt-6 max-w-2xl text-base leading-7 " +
                        "text-[#5e6d75] lg:text-lg"
                    }
                >
                    KitaStock brings sales, inventory, and practical AI
                    guidance into one workspace built for everyday business
                    decisions.
                </p>
                <HeroActions />
            </div>
        </div>
    );
}

function HeroActions() {
    return (
        <div className="mt-8 flex flex-col items-center gap-4">
            <div className="flex flex-wrap justify-center gap-3">
                <Link
                    className={
                        "inline-flex items-center gap-2 rounded-2xl " +
                        "bg-[#245564] px-5 py-3 text-sm font-semibold " +
                        "text-white hover:bg-[#1c4653]"
                    }
                    href="/signup"
                >
                    Start your free account
                    <ArrowRight className="size-4" />
                </Link>
                <Link
                    className={
                        "rounded-2xl border border-[#c7d5da] bg-white/80 " +
                        "px-5 py-3 text-sm font-semibold text-[#203039] " +
                        "hover:bg-white"
                    }
                    href="/login"
                >
                    Open your workspace
                </Link>
            </div>
            <div
                className={
                    "flex flex-wrap justify-center gap-x-5 gap-y-2 " +
                    "text-xs text-[#5e6d75]"
                }
            >
                <HeroCheck label="No card required" />
                <HeroCheck label="14-day Pro trial" />
                <HeroCheck label="Free plan available" />
            </div>
        </div>
    );
}

function HeroCheck({ label }: { label: string }) {
    return (
        <span className="inline-flex items-center gap-1.5">
            <Check className="size-3.5 text-[#245564]" />
            {label}
        </span>
    );
}

function DashboardCanvas({
    completedRef,
    pieceRefs,
    templateRef,
}: {
    completedRef?: React.RefObject<HTMLDivElement | null>;
    pieceRefs?: React.MutableRefObject<
        Array<HTMLDivElement | null>
    >;
    templateRef?: React.RefObject<HTMLDivElement | null>;
}) {
    return (
        <figure>
            <div
                className={
                    "relative aspect-video rounded-2xl border " +
                    "border-[#c7d5da] bg-[#f4f7f8] shadow-2xl " +
                    "shadow-[#172126]/15"
                }
            >
                <div
                    className={cn(
                        "absolute inset-0 overflow-hidden rounded-2xl " +
                            "transition-opacity",
                        templateRef ? "opacity-0" : "opacity-100",
                    )}
                    ref={templateRef}
                >
                    <Image
                        alt=""
                        className="object-cover"
                        fill
                        priority
                        sizes="94vw"
                        src="/marketing/light-mode.png"
                        unoptimized
                    />
                </div>

                {pieces.map((piece, index) => (
                    <div
                        className={
                            "absolute overflow-hidden rounded-2xl bg-white"
                        }
                        key={piece.src}
                        ref={(element) => {
                            if (pieceRefs) {
                                pieceRefs.current[index] = element;
                            }
                        }}
                        style={{
                            height: piece.height,
                            left: piece.left,
                            top: piece.top,
                            width: piece.width,
                        }}
                    >
                        <div
                            className="absolute inset-x-0 top-0"
                            style={{
                                height: piece.contentHeight ?? "100%",
                            }}
                        >
                            <Image
                                alt={piece.alt}
                                className="object-fill"
                                fill
                                priority
                                sizes={
                                    piece.width === "29.01%"
                                        ? "(min-width: 1640px) 446px, 29vw"
                                        : "(min-width: 1640px) 1042px, 68vw"
                                }
                                src={piece.src}
                                unoptimized
                            />
                            {piece.contentHeight ? (
                                <span
                                    aria-hidden="true"
                                    className={
                                        "absolute inset-x-0 bottom-0 h-1 " +
                                        "bg-white"
                                    }
                                />
                            ) : null}
                        </div>
                    </div>
                ))}

                <div
                    className={
                        "pointer-events-none absolute inset-0 rounded-2xl " +
                        "ring-1 ring-inset ring-[#245564]/20"
                    }
                    ref={completedRef}
                />
            </div>
            <figcaption
                className={
                    "mt-4 text-center text-xs font-medium " +
                    "text-[#5e6d75]"
                }
            >
                Your business, assembled into one clear view.
            </figcaption>
        </figure>
    );
}

function HeroBackdrop() {
    return (
        <div aria-hidden="true" className="absolute inset-0">
            <div
                className={
                    "absolute -left-24 top-1/4 size-96 rounded-full " +
                    "bg-[#d6e8ec] opacity-70 blur-3xl"
                }
            />
            <div
                className={
                    "absolute -right-24 bottom-1/4 size-[30rem] " +
                    "rounded-full bg-[#e5eee9] opacity-80 blur-3xl"
                }
            />
            <div
                className="absolute inset-0 opacity-[0.22]"
                style={{
                    backgroundImage:
                        "radial-gradient(#89b0bd 1px, transparent 1px)",
                    backgroundSize: "22px 22px",
                }}
            />
        </div>
    );
}

function StaticHero() {
    return (
        <section
            className={
                "relative overflow-hidden bg-[#f4f7f8] px-4 pb-16 " +
                "pt-24 text-[#203039] xl:hidden motion-reduce:block"
            }
        >
            <HeroBackdrop />
            <MarketingHeader />
            <div className="relative mx-auto max-w-3xl text-center">
                <p
                    className={
                        "text-xs font-semibold uppercase tracking-[0.2em] " +
                        "text-[#245564]"
                    }
                >
                    Kita ang stock. Kita ang kita.
                </p>
                <h1
                    className={
                        "mt-5 text-5xl font-semibold leading-[0.95] " +
                        "tracking-[-0.055em]"
                    }
                >
                    See the business.
                    <span className="block text-[#245564]">
                        Know what comes next.
                    </span>
                </h1>
                <p
                    className={
                        "mx-auto mt-5 max-w-xl text-sm leading-6 " +
                        "text-[#5e6d75]"
                    }
                >
                    Sales, inventory, and practical guidance in one clear
                    workspace.
                </p>
                <HeroActions />
                <div className="mx-auto mt-12 w-full max-w-4xl sm:w-[94%]">
                    <ResponsiveHeroVisual />
                </div>
            </div>
        </section>
    );
}

function ResponsiveHeroVisual() {
    return (
        <figure>
            <div
                className={
                    "relative aspect-[6/5] w-full overflow-hidden " +
                    "sm:aspect-[16/9] sm:overflow-visible"
                }
            >
                <div
                    className={
                        "absolute left-[4%] top-0 " +
                        "aspect-[1920/911] w-[285%] overflow-hidden " +
                        "rounded-2xl border sm:bottom-auto sm:left-0 " +
                        "sm:top-[9%] sm:w-[94%] " +
                        "border-[#c7d5da] bg-white shadow-2xl " +
                        "shadow-[#172126]/15"
                    }
                >
                    <Image
                        alt="KitaStock desktop business dashboard"
                        className="object-cover"
                        fill
                        priority
                        sizes="(max-width: 1279px) 88vw, 0px"
                        src="/marketing/desktop-view.png"
                        unoptimized
                    />
                </div>

                <div
                    className={
                        "absolute bottom-0 left-[2%] aspect-[500/910] " +
                        "w-[43%] overflow-hidden rounded-2xl border-2 " +
                        "border-white bg-white shadow-2xl " +
                        "shadow-[#172126]/25 sm:left-auto sm:right-0 " +
                        "sm:w-[24%]"
                    }
                >
                    <Image
                        alt="KitaStock mobile inventory dashboard"
                        className="object-cover"
                        fill
                        priority
                        sizes="(max-width: 639px) 29vw, 22vw"
                        src="/marketing/mobile-view.png"
                        unoptimized
                    />
                </div>
            </div>
            <figcaption
                className={
                    "mt-4 text-center text-xs font-medium " +
                    "text-[#5e6d75]"
                }
            >
                One workspace, ready for the counter or the office.
            </figcaption>
        </figure>
    );
}

function clamp(value: number) {
    return Math.min(Math.max(value, 0), 1);
}

function smoothStep(value: number, start: number, end: number) {
    const progress = clamp((value - start) / (end - start));
    return progress * progress * (3 - 2 * progress);
}
