"use client";

import { useEffect, useRef } from "react";
import { Copy, Download, Printer, QrCode } from "lucide-react";
import QRCode from "qrcode";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

export function StorefrontQrCode({
    publicUrl,
    slug,
    storeName,
}: {
    publicUrl: string;
    slug: string;
    storeName: string;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        void QRCode.toCanvas(canvasRef.current, publicUrl, {
            color: {
                dark: "#17212b",
                light: "#ffffff",
            },
            errorCorrectionLevel: "H",
            margin: 2,
            width: 512,
        });
    }, [publicUrl]);

    const copyLink = async () => {
        await navigator.clipboard.writeText(publicUrl);
        toast.add({
            title: "Store link copied",
            description: "Share it with customers anywhere.",
            type: "success",
        });
    };

    const download = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const link = document.createElement("a");
        link.download = `${slug}-store-qr.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
    };

    const print = () => {
        const canvas = canvasRef.current;
        const printWindow = window.open("", "_blank", "width=640,height=720");
        if (!canvas || !printWindow) return;

        const document = printWindow.document;
        document.title = `${storeName} QR code`;

        const style = document.createElement("style");
        style.textContent =
            "body{font-family:Arial,sans-serif;text-align:center;padding:48px}" +
            "img{width:360px;height:360px}" +
            "h1{font-size:24px;margin:0 0 8px}" +
            "p{color:#555;margin:0 0 28px;word-break:break-all}";
        document.head.append(style);

        const heading = document.createElement("h1");
        heading.textContent = storeName;
        const description = document.createElement("p");
        description.textContent = `Scan to order online · ${publicUrl}`;
        const image = document.createElement("img");
        image.alt = `${storeName} store QR code`;
        image.src = canvas.toDataURL("image/png");
        image.addEventListener("load", () => {
            printWindow.focus();
            printWindow.print();
        });

        document.body.append(heading, description, image);
    };

    return (
        <section className="min-w-0 rounded-2xl bg-muted/35 p-4 sm:p-5">
            <div className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <QrCode className="size-4" />
                </span>
                <div>
                    <h3 className="text-sm font-semibold">Store QR code</h3>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        Place it on your counter, receipts, or social pages so
                        customers can open your store immediately.
                    </p>
                </div>
            </div>

            <div className="mt-4 grid min-w-0 justify-items-center gap-4 sm:grid-cols-[11rem_minmax(0,1fr)] sm:items-start sm:justify-items-stretch">
                <div className="size-fit shrink-0 rounded-2xl bg-white p-2 ring-1 ring-black/5">
                    <canvas
                        aria-label={`${storeName} store QR code`}
                        className="block !size-36 sm:!size-40"
                        ref={canvasRef}
                        role="img"
                    />
                </div>
                <div className="min-w-0 max-w-full pt-1 text-center sm:text-left">
                    <p className="text-xs font-medium">Public store link</p>
                    <p className="mt-1 break-all text-xs leading-5 text-muted-foreground sm:line-clamp-2">
                        {publicUrl}
                    </p>
                </div>
            </div>

            <div className="mt-4 grid gap-2 border-t pt-4 sm:flex sm:flex-wrap">
                <Button
                    className="w-full sm:w-auto"
                    onClick={download}
                    size="sm"
                    type="button"
                >
                    <Download className="size-3.5" />
                    Download PNG
                </Button>
                <Button
                    className="w-full sm:w-auto"
                    onClick={print}
                    size="sm"
                    type="button"
                    variant="outline"
                >
                    <Printer className="size-3.5" />
                    Print
                </Button>
                <Button
                    className="w-full sm:w-auto"
                    onClick={copyLink}
                    size="sm"
                    type="button"
                    variant="outline"
                >
                    <Copy className="size-3.5" />
                    Copy link
                </Button>
            </div>
        </section>
    );
}
