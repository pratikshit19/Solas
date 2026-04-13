import { aiClient, MODELS } from "./client";

export interface AnalysisResult {
  mood: string;
  intensity: number; // 1-10
  distortions: string[];
  triggers: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  suggestedExercise?: string;
}

export async function analyzeInput(input: string): Promise<AnalysisResult> {
  const prompt = `
    Analyze the following user input for a mental health context. 
    User Input: "${input}"

    Return a JSON object with:
    1. mood: (string, e.g., "Anxious")
    2. intensity: (number 1-10)
    3. distortions: (array of strings, e.g., ["Catastrophizing"])
    4. triggers: (array of strings)
    5. riskLevel: (LOW, MEDIUM, HIGH, CRITICAL)
    6. suggestedExercise: (string)

    ONLY return the JSON. No preamble.
  `;

  try {
    const response = await aiClient.chat.completions.create({
      model: MODELS.FLASH,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const text = response.choices[0].message.content || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error("Analysis Error:", error);
    return {
      mood: 'Unknown',
      intensity: 5,
      distortions: [],
      triggers: [],
      riskLevel: 'LOW'
    };
  }
}
