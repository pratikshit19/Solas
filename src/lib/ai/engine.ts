import { aiClient, MODELS } from "./client";
import { analyzeInput, AnalysisResult } from "./classification";
import { localSentry } from "./localSentry";
import { BASE_SYSTEM_PROMPT, SYSTEM_PERSONAS, TherapistIdentity } from "./prompts";

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface SolasResponse {
  content: string;
  analysis: AnalysisResult;
  localSentiment?: any;
}

export async function getSolasResponse(
  input: string, 
  history: ChatMessage[], 
  identity: TherapistIdentity,
  tier: string = 'standard'
): Promise<SolasResponse> {
  // 1. Layer 0: IN-HOUSE LOCAL AI (Transformers.js)
  const localAnalysis = await localSentry.analyze(input);

  // 2. Layer 1: Background Analysis (Llama 3 8B)
  const analysis = await analyzeInput(input);

  // 3. Layer 2: Main Response Switch based on Tier
  const modelToUse = tier === 'sentinel' ? MODELS.PRO : MODELS.FLASH;
  
  const persona = SYSTEM_PERSONAS[identity];
  const systemPrompt = `
    ${BASE_SYSTEM_PROMPT}
    CURRENT IDENTITY: ${persona}
    ANALYSIS: Mood: ${analysis.mood}, Intensity: ${analysis.intensity}, Distortions: ${analysis.distortions.join(', ')}
  `;

  try {
    const response = await aiClient.chat.completions.create({
      model: modelToUse,
      messages: [
        { role: "system", content: systemPrompt },
        ...history.map(msg => ({ 
          role: msg.role === 'assistant' ? 'assistant' : 'user' as any, 
          content: msg.content 
        })),
        { role: "user", content: input }
      ],
      temperature: 0.7,
    });

    return {
      content: response.choices[0].message.content || "",
      analysis: analysis,
      localSentiment: localAnalysis
    };
  } catch (error) {
    console.error("AI Engine Error:", error);
    return {
      content: "I'm having a slight delay in my thoughts. Let's take a deep breath together. How are you feeling right now?",
      analysis: analysis
    };
  }
}

export async function summarizeChatToJournal(history: ChatMessage[]): Promise<any> {
  const prompt = `
    Based on the following chat history, generate a structured cognitive journal entry.
    
    Return ONLY a JSON object with:
    1. situation: (concise fact-based summary of what happened)
    2. emotion: (primary identified emotion)
    3. intensity: (number 1-10)
    4. thought: (the core automatic thought identified)
    5. reframed: (a rational restructuring of that thought)

    History:
    ${history.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}
  `;

  try {
    const response = await aiClient.chat.completions.create({
      model: MODELS.FLASH,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("Summarization Error:", error);
    return null;
  }
}
