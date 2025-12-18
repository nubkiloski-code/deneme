
import React, { useState } from 'react';
import { Calculator as CalcIcon, RefreshCw, ArrowRight } from 'lucide-react';

const Calculator: React.FC = () => {
  // CONVERTER STATE
  const [wlInput, setWlInput] = useState<string>('');
  
  const dls = Number(wlInput) / 100;
  const bgls = Number(wlInput) / 10000;

  return (
    <div className="pt-8 px-4 pb-20 animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto">
        
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Growtopia <span className="text-gt-gold">Tools</span>
          </h1>
          <p className="text-slate-400">Essential calculators for traders and mass producers.</p>
        </div>

        <div className="flex justify-center">
          {/* CURRENCY CONVERTER */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 md:p-8 relative overflow-hidden w-full max-w-xl shadow-2xl">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <RefreshCw className="w-24 h-24 text-gt-gold" />
            </div>
            
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-gt-gold" /> Currency Converter
            </h2>

            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block ml-1">World Locks (WL)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={wlInput}
                    onChange={(e) => setWlInput(e.target.value)}
                    placeholder="0"
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-4 text-white focus:border-gt-gold outline-none font-mono text-2xl shadow-inner transition-all focus:ring-1 focus:ring-gt-gold"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 pointer-events-none">WLs</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-700/50 flex justify-between items-center group hover:border-slate-600 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Diamond Locks</span>
                    <span className="text-slate-500 text-[10px]">100 WL = 1 DL</span>
                  </div>
                  <span className="text-2xl font-mono text-cyan-400 font-bold">{dls.toLocaleString(undefined, { maximumFractionDigits: 2 })} <span className="text-xs text-slate-500">DLs</span></span>
                </div>
                
                <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-700/50 flex justify-between items-center group hover:border-slate-600 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Blue Gem Locks</span>
                    <span className="text-slate-500 text-[10px]">10,000 WL = 1 BGL</span>
                  </div>
                  <span className="text-2xl font-mono text-blue-500 font-bold">{bgls.toLocaleString(undefined, { maximumFractionDigits: 4 })} <span className="text-xs text-slate-500">BGLs</span></span>
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
