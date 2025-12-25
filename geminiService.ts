
import { GoogleGenAI, Type } from "@google/genai";
import { Question, Difficulty, QuestionType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Extract questions from text and optional images using Gemini.
 * Fix: Added 10th parameter `pageImages` to match caller in AdminPanel.tsx.
 */
export const extractQuestionsFromText = async (
  text: string, 
  year: string,
  subject: string,
  topic: string, 
  subTopic: string, 
  section: string,
  difficulty: Difficulty, 
  type: QuestionType,
  customInstructions: string,
  pageImages: string[] = []
): Promise<Question[]> => {
  const prompt = `SYSTEM: Elite STEM content specialist. Extract ${type} questions from the provided text and images.
  RULES: Use KaTeX ($...$ or $$...$$) for all math. Fractions as \\frac{}{}. 
  MCQ: Provide 4 options and the exact correct string.
  STRUCTURE: Provide detailed solution.
  ${customInstructions}
  
  TEXT SOURCE: ${text}`;

  // Fix: Prepare parts for multi-modal generation to handle image inputs
  const parts: any[] = [{ text: prompt }];
  
  if (pageImages && pageImages.length > 0) {
    pageImages.forEach(img => {
      // Handle base64 strings with or without prefix
      const base64Data = img.includes(',') ? img.split(',')[1] : img;
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Data,
        },
      });
    });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.STRING },
            explanation: { type: Type.STRING },
            difficulty: { type: Type.STRING }
          },
          required: ["question", "options", "correctAnswer", "explanation"]
        }
      }
    }
  });

  const parsed = JSON.parse(response.text || "[]");
  return parsed.map((q: any, idx: number) => ({
    ...q,
    id: `q-gen-${Date.now()}-${idx}`,
    year, subject, topic, subTopic, section, type,
    difficulty: q.difficulty || difficulty
  }));
};
