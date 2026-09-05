"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Bot, MessageCircle, Send, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { IntelligenceMessageView } from "./message";
import { useAskIntelligence } from "../services/intelligence";
import type { IntelligenceResponse } from "../types";

const examples = [
  "What should I reorder this week?",
  "Which products are not selling?",
  "Did we have unusual stock losses?",
  "What are my top-selling products?",
  "Why were sales lower this week?",
  "Which products have the best profit?",
  "Which supplier has the longest lead time?"
];

type AuthContext = {
  active_business?: {
    id: string;
    permissions?: string[];
  };
  permissions?: string[];
};

type ChatEntry = {
  id: number;
  question: string;
  response: IntelligenceResponse;
};

async function loadAuthContext(): Promise<AuthContext> {
  const response = await fetch("/api/auth/me", { cache: "no-store" });
  if (!response.ok) throw new Error("Unable to load AI access");
  return response.json();
}

export function AskAi() {
  const pathname = usePathname();
  const { data } = useQuery<AuthContext>({
    queryKey: ["auth", "me"],
    queryFn: loadAuthContext,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const isOnboarding = pathname.startsWith("/onboarding");
  const permissions =
    data?.permissions ?? data?.active_business?.permissions ?? [];
  const canAsk = permissions.includes("reports.read");

  if (isOnboarding || !data?.active_business || !canAsk) return null;

  return <FloatingChat key={data.active_business.id} />;
}

function FloatingChat() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const [history, setHistory] = useState<ChatEntry[]>([]);
  const ask = useAskIntelligence();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, pendingQuestion]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const value = question.trim();
    if (!value || ask.isPending) return;

    ask.reset();
    setQuestion("");
    setPendingQuestion(value);
    try {
      const response = await ask.mutateAsync(value);
      setHistory((current) => [
        ...current,
        { id: Date.now(), question: value, response },
      ]);
    } catch {
      // The mutation exposes the error in the conversation panel.
      setQuestion(value);
    } finally {
      setPendingQuestion(null);
    }
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  return (
    <div className="fixed bottom-5 right-4 z-50 sm:right-6">
      {open && (
        <section
          id="stockwise-chat"
          aria-label="Ask StockWise"
          className={cn(
            "absolute bottom-16 right-0 flex w-[calc(100vw-2rem)]",
            "max-w-md flex-col overflow-hidden rounded-2xl border",
            "bg-background shadow-2xl",
            "h-[min(620px,calc(100dvh-7rem))]",
          )}
        >
          <header
            className={cn(
              "flex items-center justify-between border-b bg-primary",
              "px-4 py-3 text-primary-foreground",
            )}
          >
            <div className="flex items-center gap-2.5">
              <span className="rounded-lg bg-white/15 p-2">
                <Bot className="size-5" />
              </span>
              <div>
                <h2 className="font-semibold">Ask StockWise</h2>
                <p className="text-xs text-primary-foreground/75">
                  Inventory intelligence assistant
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setOpen(false)}
              className="text-primary-foreground hover:bg-white/15"
              aria-label="Close Ask StockWise"
            >
              <X className="size-4" />
            </Button>
          </header>

          <div
            aria-live="polite"
            className="flex-1 space-y-4 overflow-y-auto p-4"
          >
            {!history.length && !pendingQuestion && (
              <div className="space-y-4 py-3 text-center">
                <span
                  className={cn(
                    "mx-auto flex size-11 items-center justify-center ",
                    "rounded-full bg-primary/10 text-primary",
                  )}
                >
                  <Sparkles className="size-5" />
                </span>
                <div>
                  <p className="font-medium">How can I help?</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Ask about your inventory and approved business analytics.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {examples.map((example) => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => {
                        setQuestion(example);
                        inputRef.current?.focus();
                      }}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs",
                        "text-muted-foreground hover:bg-muted",
                      )}
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {history.map((entry) => (
              <div key={entry.id} className="space-y-3">
                <div
                  className={cn(
                    "ml-auto max-w-[85%] rounded-2xl rounded-br-sm",
                    "bg-primary px-3 py-2 text-sm text-primary-foreground",
                  )}
                >
                  {entry.question}
                </div>
                <IntelligenceMessageView response={entry.response} />
              </div>
            ))}

            {pendingQuestion && (
              <div className="space-y-3">
                <div
                  className={cn(
                    "ml-auto max-w-[85%] rounded-2xl rounded-br-sm",
                    "bg-primary px-3 py-2 text-sm text-primary-foreground",
                  )}
                >
                  {pendingQuestion}
                </div>
                <div
                  role="status"
                  className={cn(
                    "flex items-center gap-2 text-sm",
                    "text-muted-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "size-2 animate-pulse rounded-full",
                      "bg-primary",
                    )}
                  />
                  Checking your business data…
                </div>
              </div>
            )}

            {ask.error && (
              <p
                role="alert"
                className={cn(
                  "rounded-lg bg-destructive/10 p-3 text-sm",
                  "text-destructive",
                )}
              >
                {ask.error.message}
              </p>
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={submit} className="border-t bg-background p-3">
            <div className="flex items-end gap-2">
              <Textarea
                ref={inputRef}
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Ask about your inventory…"
                maxLength={500}
                rows={1}
                className="max-h-28 min-h-10 resize-none rounded-xl"
              />
              <Button
                type="submit"
                size="icon"
                disabled={ask.isPending || question.trim().length < 3}
                aria-label="Send question"
              >
                <Send className="size-4" />
              </Button>
            </div>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              StockWise calculates the facts; AI communicates them.
            </p>
          </form>
        </section>
      )}

      <Button
        type="button"
        size="lg"
        onClick={() => setOpen((current) => !current)}
        aria-label={open ? "Close Ask StockWise" : "Open Ask StockWise"}
        aria-expanded={open}
        aria-controls="stockwise-chat"
        className={cn(
          "h-12 rounded-full px-4 shadow-lg transition-transform",
          "hover:scale-105 sm:h-14 sm:px-5",
        )}
      >
        {open ? <X className="size-5" /> : <MessageCircle className="size-5" />}
        <span className="hidden sm:inline">Ask StockWise</span>
      </Button>
    </div>
  );
}
