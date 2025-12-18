import { RateInfo } from "../types";

/**
 * Static Auto-Bot Service
 * Replaces AI with a local template that updates based on Admin Panel rates.
 */
export const sendMessageToGemini = async (
  _message: string, 
  _history: string[], 
  rates: RateInfo
): Promise<string> => {
  // Artificial delay to mimic a typing bot
  await new Promise(resolve => setTimeout(resolve, 600));

  // The specific message requested by the user, dynamically injecting current rates
  return `Hello! I'm LockBot, your assistant for Nub.market. How can I help you today? Here are our current rates: - **We Sell:** $${rates.buyRate.toFixed(2)} USD/DL - **We Buy:** $${rates.sellRate.toFixed(2)} USD/DL We accept BTC, ETH, LTC, and USDT (TRC20). Let me know if you'd like to buy or sell DLs!`;
};


