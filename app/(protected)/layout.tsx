import { Header } from "@/modules/layout/components/Header";
import { AskAi } from "@/modules/intelligence/components/ask-ai";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-muted/60">
      <Header />
      <main className="flex-1 overflow-auto p-6 md:p-8 w-full">
        {children}
      </main>
      <AskAi />
    </div>
  );
}
