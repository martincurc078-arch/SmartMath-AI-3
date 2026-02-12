import { GoogleGenAI, Type, Schema } from "@google/genai";
import { MathSolution } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const mathSolutionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    latex_expression: {
      type: Type.STRING,
      description: "The mathematical expression extracted from the image in valid LaTeX format.",
    },
    final_answer: {
      type: Type.STRING,
      description: "The final result of the math problem in LaTeX format.",
    },
    difficulty: {
      type: Type.STRING,
      enum: ["Easy", "Medium", "Hard"],
      description: "The estimated difficulty level of the problem.",
    },
    topic: {
      type: Type.STRING,
      description: "The mathematical topic (e.g., Algebra, Calculus, Geometry) in Bulgarian.",
    },
    steps: {
      type: Type.ARRAY,
      description: "A step-by-step breakdown of the solution in Bulgarian.",
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Short title of the step in Bulgarian (e.g., 'Опростяване на израза')." },
          explanation: { type: Type.STRING, description: "Detailed natural language explanation in Bulgarian of what happened in this step." },
          latex_result: { type: Type.STRING, description: "The state of the equation after this step in LaTeX." },
        },
        required: ["title", "explanation", "latex_result"],
      },
    },
  },
  required: ["latex_expression", "final_answer", "difficulty", "steps", "topic"],
};

export const solveMathProblemFromImage = async (base64Image: string, mimeType: string = 'image/jpeg'): Promise<MathSolution> => {
  try {
    // Using gemini-3-flash-preview as it supports JSON schema and multimodal input.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: "Анализирай това изображение. Идентифицирай математическата задача. Реши я стъпка по стъпка. Върни резултата в JSON формат. Обясненията и заглавията трябва да са на БЪЛГАРСКИ език. Математическите изрази трябва да са в LaTeX. ВАЖНО: Ако изображението НЕ съдържа математическа задача или не можеш да я разчетеш, в полето 'latex_expression' върни '\\text{Не открих задача}' (задължително използвай \\text{} командата за да се запазят интервалите), за 'final_answer' върни '-', за 'topic' върни 'Грешка' и празен масив за стъпки.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: mathSolutionSchema,
        systemInstruction: "Ти си експертен учител по математика. Целта ти е да обясняваш задачите ясно и педагогически на български език. Идентифицирай задачата от снимката точно. Ако няма задача, бъди честен.",
      },
    });

    if (response.text) {
      // Clean up potential markdown code blocks if the model includes them
      const cleanText = response.text.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanText) as MathSolution;
    }
    throw new Error("No response text generated");
  } catch (error) {
    console.error("Error solving math problem:", error);
    throw error;
  }
};

export const getTutorResponse = async (history: { role: string; parts: { text: string }[] }[], newMessage: string, currentProblemContext: MathSolution): Promise<string> => {
  try {
    const contextPrompt = `
      Current Problem Context:
      Expression: ${currentProblemContext.latex_expression}
      Answer: ${currentProblemContext.final_answer}
      Topic: ${currentProblemContext.topic}
      
      Ти си приятелски настроен AI учител по математика. 
      Отговаряй винаги на БЪЛГАРСКИ език.
      Обяснявай просто ("Обясни като на 13-годишен").
      Използвай LaTeX за математически нотации (обградени с единични $ знаци, напр. $x^2$).
      Бъди окуражаващ.
    `;

    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      history: [
        {
          role: 'user',
          parts: [{ text: contextPrompt }],
        },
        {
          role: 'model',
          parts: [{ text: "Разбрах. Готов съм да помогна с тази задача. Какъв е въпросът ти?" }],
        },
        ...history
      ],
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text || "Съжалявам, не можах да генерирам отговор.";
  } catch (error) {
    console.error("Error in tutor chat:", error);
    return "Нещо се обърка. Моля, опитай пак.";
  }
};