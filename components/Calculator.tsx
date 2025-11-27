import React, { useState } from 'react';
import { Calculator as CalcIcon, TrendingUp, RefreshCw, ArrowRight } from 'lucide-react';

const Calculator: React.FC = () => {
  const [buyPrice, setBuyPrice] = useState<number | ''>('');
  const [sellPrice, setSellPrice] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number | ''>('');
  
  const calculateProfit = () => {
    if (!buyPrice || !sellPrice || !quantity) return 0;
    // Simple logic: (Quantity / Buy Price) - (Quantity / Sell Price) is wrong for GT usually.
    // GT Logic usually: Buy X items for 1 WL. Sell Y items for 1 WL.
    // Let's assume input is "Blocks per WL".
    // Cost = Quantity / BuyRate
    // Revenue = Quantity / SellRate
    // This is tricky without specific context, so we will use a simple "WLs spent vs WLs earned" model
    // Assuming inputs are "Price per Item (in WLs)" for simplicity, or we let user decide unit.
    
    // Let's go with the standard "Mass" calc:
    // Input: Total Seeds/Blocks
    // Input: Rarity? No, let's keep it simple: "Buy Rate (Items/WL)" and "Sell Rate (Items/WL)"
    
    const costInWLs = Number(quantity) / Number(buyPrice);
    const revenueInWLs = Number(quantity) / Number(sellPrice);
    
    // If selling blocks (higher rate) usually means less WLs. 
    // Profit logic depends heavily on what they are trading.
    // Let's switch to a simple "WL to DL/BGL Converter" and "Tax Calculator" for V1.
    return 0;
  };

  // CONVERTER STATE
  const [wlInput, setWlInput] = useState<string>('');
  
  const dls = Number(wlInput) / 100;
  const bgls = Number(wlInput) / 10000;

  // TAX STATE
  const [tradeAmount, setTradeAmount] = useState<string>('');
  // GT Tax is usually not a fixed thing unless using vending machines (5% or 10%). 
  // Let's do Vending Machine Tax Calc (usually 5-10% depending on role/event).
  
  return (
    <div className="pt-8 px-4 pb-20 animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto">
        
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Growtopia <span className="text-gt-gold">Tools</span>
          </h1>
          <p className="text-slate-400">Essential calculators for traders and mass producers.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          
          {/* CURRENCY CONVERTER */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <RefreshCw className="w-24 h-24 text-gt-gold" />
            </div>
            
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-gt-gold" /> Currency Converter
            </h2>

            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">World Locks (WL)</label>
                <input
                  type="number"
                  value={wlInput}
                  onChange={(e) => setWlInput(e.target.value)}
                  placeholder="0"
                  className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-gt-gold outline-none font-mono text-lg"
                />
              </div>

              <div className="space-y-2">
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 flex justify-between items-center">
                  <span className="text-slate-400 text-sm font-bold">Diamond Locks</span>
                  <span className="text-xl font-mono text-cyan-400 font-bold">{dls.toLocaleString()} <span className="text-xs text-slate-500">DLs</span></span>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 flex justify-between items-center">
                  <span className="text-slate-400 text-sm font-bold">Blue Gem Locks</span>
                  <span className="text-xl font-mono text-blue-500 font-bold">{bgls.toLocaleString()} <span className="text-xs text-slate-500">BGLs</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* PROFIT ESTIMATOR (Simple) */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
              <TrendingUp className="w-24 h-24 text-green-500" />
            </div>

            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" /> Vending Tax Calc
            </h2>

            <div className="space-y-4">
               <p className="text-sm text-slate-400">Calculate how much you lose to tax when selling via Vending Machines.</p>
               
               <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Selling Price (WLs)</label>
                <input
                  type="number"
                  value={tradeAmount}
                  onChange={(e) => setTradeAmount(e.target.value)}
                  placeholder="0"
                  className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-green-500 outline-none font-mono text-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                 <div className="bg-slate-900 p-3 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Standard Tax (10%)</span>
                    <span className="text-lg font-mono text-red-400">-{((Number(tradeAmount) * 0.1).toFixed(0))} WLs</span>
                 </div>
                 <div className="bg-slate-900 p-3 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Profit</span>
                    <span className="text-lg font-mono text-green-400">{(Number(tradeAmount) * 0.9).toFixed(0)} WLs</span>
                 </div>
              </div>
            </div>
          </div>

        </div>

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-r from-gt-gold/10 to-transparent p-8 rounded-3xl border border-gt-gold/20 flex flex-col md:flex-row items-center justify-between gap-6">
           <div>
             <h3 className="text-2xl font-bold text-white mb-2">Need more WLs for your project?</h3>
             <p className="text-slate-400">Get Diamond Locks instantly with crypto at the best market rates.</p>
           </div>
           <a href="/" className="bg-gt-gold text-black px-8 py-4 rounded-xl font-bold hover:bg-yellow-400 transition-colors flex items-center gap-2 shadow-lg shadow-yellow-500/10">
             Buy DLs Now <ArrowRight className="w-5 h-5" />
           </a>
        </div>

      </div>
    </div>
  );
};

export default Calculator;