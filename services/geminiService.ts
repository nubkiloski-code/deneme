import { GoogleGenAI } from "@google/genai";
import { RateInfo } from "../types";

export const sendMessageToGemini = async (
  message: string, 
  history: string[], 
  rates: RateInfo
): Promise<string> => {
  try {
    // Initialize the client with the required named parameter.
    // We assume process.env.API_KEY is correctly injected by the hosting environment.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Using the recommended model for basic text/Q&A tasks as per guidelines.
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

    // Constructing the message with context
    const fullPrompt = `Conversation History Context:\n${history.join('\n')}\n\nNew Message from User: ${message}`;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts: [{ text: fullPrompt }] },
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
        // Disable thinking to prioritize low latency for a chat interface 
        // and ensure the response doesn't run out of tokens.
        thinkingConfig: { thinkingBudget: 0 },
      }
    });

    // Access .text property directly (getter) as per SDK rules.
    const text = response.text;
    
    if (text && text.trim().length > 0) {
      return text.trim();
    }
    
    return "I'm processing your request, but I couldn't generate a clear answer. Could you please rephrase your question?";
  } catch (error) {
    console.error("Gemini API Connectivity Error:", error);
    // This fallback is triggered if the API call fails, often due to network issues or 
    // environment variable configuration on the production domain.
    return "I'm having trouble connecting to my brain right now. Please try again in a few seconds!";
  }
};

