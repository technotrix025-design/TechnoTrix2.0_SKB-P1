import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize the Google Gen AI SDK
// The SDK will automatically use the GEMINI_API_KEY environment variable.
const ai = new GoogleGenAI({});

export const getGeminiPrediction = async (prompt) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error('Error with Gemini API:', error);
    throw new Error('Failed to generate AI response');
  }
};

export const getStructuredAIResponse = async (prompt) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error('Error with Gemini API Structured Response:', error);
    throw new Error('Failed to generate structured AI response');
  }
};
