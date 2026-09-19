import Image from "next/image";
import Link from "next/link";

export function AuthShell({
    children,
    description,
    eyebrow,
    title,
}: {
    children: React.ReactNode;
    description: string;
    eyebrow: string;
    title: string;
}) {
    return (
        <main className="min-h-svh bg-muted/30 p-4 sm:p-6">
            <div className="mx-auto flex min-h-[calc(100svh-2rem)] w-full max-w-md flex-col sm:min-h-[calc(100svh-3rem)]">
                <BrandLink />

                <section
                    className={
                        "my-auto overflow-hidden rounded-2xl border " +
                        "bg-background"
                    }
                >
                    <header className="border-b p-5 sm:p-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                            {eyebrow}
                        </p>
                        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
                            {title}
                        </h1>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            {description}
                        </p>
                    </header>
                    <div className="p-5 sm:p-6">{children}</div>
                </section>

                <p className="mt-6 text-center text-xs text-muted-foreground">
                    Kita ang stock. Kita ang kita. Inventory decisions made
                    clearer for small businesses.
                </p>
            </div>
        </main>
    );
}

function BrandLink() {
    return (
        <Link
            className="flex w-fit items-center gap-2.5"
            href="/"
        >
            <Image
                alt=""
                className="size-9 object-contain"
                height={36}
                priority
                src="/kitastock-logo-image.svg"
                width={36}
            />
            <span className="text-xl font-semibold tracking-tight">
                KitaStock
            </span>
        </Link>
    );
}
