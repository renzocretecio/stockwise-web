import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "@/providers";
import { PwaRegistration } from "@/components/PwaRegistration";
import { appearanceScript } from "@/lib/appearance";
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KitaStock",
  description:
    "Kita ang stock. Kita ang kita. Inventory clarity for Filipino " +
    "small businesses.",
  icons: {
    apple: {
      type: "image/png",
      url: "/icons/apple-touch-icon.png",
    },
    icon: [
      {
        sizes: "192x192",
        type: "image/png",
        url: "/icons/icon-192.png",
      },
      {
        sizes: "512x512",
        type: "image/png",
        url: "/icons/icon-512.png",
      },
    ],
    shortcut: "/icons/icon-192.png",
  },
  manifest: "/manifest.webmanifest?v=8",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "KitaStock",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f0f0f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      suppressHydrationWarning
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        inter.variable,
      )}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: appearanceScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>
          <PwaRegistration />
          {children}
        </Providers>
      </body>
    </html>
  );
}
