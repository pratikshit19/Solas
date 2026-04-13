import OpenAI from "openai";

// Using Groq as a stable bridge provider for Llama 3.1
export const aiClient = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY || "",
  baseURL: "https://api.groq.com/openai/v1",
  dangerouslyAllowBrowser: true // For development convenience, ideally proxied through a backend
});

// Model Identifiers
export const MODELS = {
  PRO: "llama-3.3-70b-versatile",
  FLASH: "llama-3.1-8b-instant",
};
