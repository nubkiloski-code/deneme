
import { GoogleGenAI } from "@google/genai";
import { RateInfo } from "../types";

/**
 * AI Bot Service using Gemini 3 Flash
 * Dynamically responds based on the platform's current rates and user history.
 */
export const sendMessageToGemini = async (
  message: string, 
  history: string[], 
  rates: RateInfo
): Promise<string> => {
  // Always initialize with the API key from process.env.API_KEY as per guidelines.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Construct a comprehensive prompt including the conversation context and system state.
  const prompt = `
    Previous conversation history:
    ${history.join('\n')}
    
    Current User Input: ${message}
  `;

  // Use ai.models.generateContent with gemini-3-flash-preview for general assistant tasks.
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      systemInstruction: `You are LockBot, the friendly and professional AI assistant for Nub.market, a premium Growtopia trading marketplace.
      
      Current Platform Rates:
      - We Sell (Buy from us): $${rates.buyRate.toFixed(2)} USD per Diamond Lock (DL)
      - We Buy (Sell to us): $${rates.sellRate.toFixed(2)} USD per Diamond Lock (DL)
      
      Accepted Payment Methods: Bitcoin (BTC), Ethereum (ETH), Litecoin (LTC), and Tether (USDT TRC20).
      
      Guidelines:
      - Be concise and helpful.
      - If a user wants to buy or sell, guide them to the respective tabs in the app.
      - Always mention the current rates if asked.
      - Maintain a secure and trustworthy persona.`,
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
    },
  });

  // Extract and return the text output from the response. Use the .text property directly.
  return response.text || "I'm sorry, I encountered an error processing your request.";
};



