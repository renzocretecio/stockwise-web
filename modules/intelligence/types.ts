export type IntelligenceMessage = {
  answer: string;
  facts: string[];
  estimates: string[];
  recommended_actions: string[];
  limitations: string[];
};

export type IntelligenceResponse = {
  success: boolean;
  intent: string;
  provider: "groq" | "template";
  model: string | null;
  message: IntelligenceMessage;
  context: Record<string, unknown>;
};
