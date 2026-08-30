"use client";

import { FormEvent, useState } from "react";
import { Bot, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IntelligenceMessageView } from
  "@/modules/intelligence/components/message";
import { useAskIntelligence } from
  "@/modules/intelligence/services/intelligence";

const examples = [
  "What should I reorder this week?",
  "Which products are not selling?",
  "Did we have unusual stock losses?",
];

export function AskAi() {
  const [question, setQuestion] = useState("");
  const ask = useAskIntelligence();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const value = question.trim();
    if (value) ask.mutate(value);
  };

  return (
    <Card className="p-6">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-primary p-2.5 text-primary-foreground">
          <Bot className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Ask Stockwise</h2>
          <p className="text-sm text-muted-foreground">
            Ask about approved inventory and business analytics.
          </p>
        </div>
      </div>
      <form onSubmit={submit} className="mt-5 flex gap-2">
        <input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="What should I reorder this week?"
          className={
            "h-10 min-w-0 flex-1 rounded-lg border bg-background px-3 " +
            "text-sm outline-none focus:ring-2 focus:ring-primary"
          }
          maxLength={500}
        />
        <Button disabled={ask.isPending || question.trim().length < 3}>
          <Send className="mr-2 h-4 w-4" />
          {ask.isPending ? "Checking…" : "Ask"}
        </Button>
      </form>
      <div className="mt-3 flex flex-wrap gap-2">
        {examples.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => setQuestion(example)}
            className={
              "rounded-full border px-3 py-1 text-xs " +
              "text-muted-foreground hover:bg-muted"
            }
          >
            {example}
          </button>
        ))}
      </div>
      {ask.error ? (
        <p className="mt-4 text-sm text-destructive">{ask.error.message}</p>
      ) : null}
      {ask.data ? (
        <div className="mt-5">
          <IntelligenceMessageView response={ask.data} />
        </div>
      ) : null}
    </Card>
  );
}
