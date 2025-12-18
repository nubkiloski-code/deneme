
import { GoogleGenAI } from "@google/genai";
import { RateInfo } from "../types";

export const sendMessageToGemini = async (
  message: string, 
  history: string[], 
  rates: RateInfo
): Promise<string> => {
  try {
    // Safety check: Access process.env carefully to prevent ReferenceErrors 
    // in browser contexts where 'process' is not globally defined.
    const apiKey = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : '';
    
    if (!apiKey) {
      console.error("Gemini API Key is not configured in the environment variables.");
      return "I'm currently unable to chat because my connection isn't set up. Please contact the site administrator.";
    }

    // Initialize the AI client using the named parameter.
    const ai = new GoogleGenAI({ apiKey });
    
    // 'gemini-3-flash-preview' is the recommended model for basic text and Q&A.
    const modelName = 'gemini-3-flash-preview';
    
    const systemInstruction = `You are "LockBot", the support assistant for Nub.market.
    Nub.market is a professional marketplace for Growtopia Diamond Locks (DLs) using Cryptocurrency.
    
    Current Rates:
    - We Sell (Buy from us): $${rates.buyRate} USD/DL
    - We Buy (Sell to us): $${rates.sellRate} USD/DL
    
    Accepted Cryptocurrencies: Bitcoin (BTC), Ethereum (ETH), Litecoin (LTC), and Tether (USDT TRC20).
    
    Guidelines:
    - Be brief, professional, and helpful.
    - Buying process: Enter amount -> Select Crypto -> Pay -> Provide GrowID/World -> Instant Delivery.
    - Selling process: Enter amount -> Select Crypto -> Drop DLs in our world -> Provide payout address -> Receive Crypto.
    - Safety: Always warn users to verify World Names before dropping items.
    - If a user needs human help, mention that an admin monitors this chat.
    `;

    // Constructing a robust prompt that includes history and instructions.
    const promptText = `System: ${systemInstruction}\n\nChat Context:\n${history.join('\n')}\n\nUser Question: ${message}`;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: promptText,
      config: {
        temperature: 0.7,
        maxOutputTokens: 1000,
        // Disabling the thinking budget minimizes latency and prevents errors 
        // related to thinking token limits during simple conversations.
        thinkingConfig: { thinkingBudget: 0 },
      }
    });

    // Use the .text property getter to extract the output string.
    const text = response.text;
    
    if (text && text.trim().length > 0) {
      return text.trim();
    }
    
    return "I'm listening, but I couldn't generate a clear response. Could you rephrase your question?";
  } catch (error) {
    console.error("Gemini API Error Detail:", error);
    // This fallback message matches the one in the user's reported error.
    return "I'm having trouble connecting to my brain right now. Please try again in a few seconds!";
  }
};


