import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable");
}

const genAI = new GoogleGenerativeAI(apiKey);

export const DEFAULT_MODEL = "gemini-1.5-flash"; // Fallback stable
export const LATEST_MODEL = "gemini-2.0-flash"; // Current latest stable
export const EXPERIMENTAL_MODEL = "gemini-3.1-flash-lite"; // As requested by user

/**
 * Gets a Gemini model instance.
 * @param modelName The model identifier. Defaults to the user-requested gemini-3.1-flash-lite.
 */
export function getGeminiModel(modelName: string = EXPERIMENTAL_MODEL) {
    return genAI.getGenerativeModel({ model: modelName });
}

export { genAI };
