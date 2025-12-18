
import { GoogleGenAI } from "@google/genai";
import { RateInfo } from "../types";

export const sendMessageToGemini = async (
  message: string, 
  history: string[], 
  rates: RateInfo
): Promise<string> => {
  try {
    // Access process.env.API_KEY directly as per guidelines.
    // This assumes the key is pre-configured and valid in the environment.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const modelName = 'gemini-3-flash-preview';
    
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
      model: modelName,
      contents: `Context History: ${history.join('\n')}\n\nUser Question: ${message}`,
      config: {
        systemInstruction: systemInstruction,
        maxOutputTokens: 500,
      }
    });

    // Use .text property directly as per guidelines
    return response.text || "I'm having trouble connecting to the server right now.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Return a graceful failure message instead of environment error
    return "I'm having trouble connecting to my brain right now. Please try again in a few seconds!";
  }
};

