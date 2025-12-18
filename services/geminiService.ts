
import { GoogleGenAI } from "@google/genai";
import { RateInfo } from "../types";

// Safer access to process.env to prevent crashes in browser environments
const getApiKey = () => {
  try {
    return process.env.API_KEY || '';
  } catch {
    return '';
  }
};

const API_KEY = getApiKey();

export const sendMessageToGemini = async (
  message: string, 
  history: string[], 
  rates: RateInfo
): Promise<string> => {
  if (!API_KEY) {
    return "Error: API Key not found. Please configure your environment.";
  }

  try {
    // Initialize Gemini Client inside the call or ensure it's ready
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const model = 'gemini-3-flash-preview';
    
    const systemInstruction = `You are "LockBot", the automated support assistant for Nub.market. 
    This website allows users to Buy and Sell Growtopia Diamond Locks (DLs) using Cryptocurrency ONLY.
    
    Current Market Rates:
    - We Sell DLs for: $${rates.buyRate} USD
    - We Buy DLs for: $${rates.sellRate} USD
    
    Rules:
    1. Be concise, friendly, and professional.
    2. Explain that we support Bitcoin (BTC), Ethereum (ETH), Litecoin (LTC), and Tether (USDT).
    3. For Buying: Users enter amount -> Pay Crypto -> Provide GrowID & World Name -> We deliver to donation box/display box.
    4. For Selling: Users enter amount -> Provide payout address -> We provide World Name to drop DLs -> We pay Crypto.
    5. Warning: Always remind users to check the world name exactly to avoid scams.
    6. Do not answer questions unrelated to Growtopia or Crypto trading.
    7. If a user asks for human support, tell them an admin can see this chat and will reply shortly.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: `Context History: ${history.join('\n')}\n\nUser Question: ${message}`,
      config: {
        systemInstruction: systemInstruction,
        maxOutputTokens: 300,
      }
    });

    return response.text || "I'm having trouble connecting to the server right now.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I am currently experiencing high traffic. Please try again later.";
  }
};
