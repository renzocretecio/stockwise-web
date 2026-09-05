import { Header } from "@/modules/layout/components/Header";
import { AskAi } from "@/modules/intelligence/components/ask-ai";
import { Card } from "@/components/ui/card";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 overflow-auto p-4 w-full">
        <div className="rounded-2xl border border-border/70 bg-card/90 shadow-lg shadow-black/5 backdrop-blur-xl supports-[backdrop-filter]:bg-card">
          {children}
        </div>
      </main>
      <AskAi />
    </div>
  );
}
