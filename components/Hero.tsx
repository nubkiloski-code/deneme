import React from 'react';

const Hero: React.FC = () => {
  return (
    <div className="relative pt-6 pb-2 overflow-hidden flex flex-col justify-center">
      
      {/* Content Container - Background is now handled globally in App.tsx */}
      <div className="container mx-auto px-4 text-center relative z-10">
        
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-3 leading-tight tracking-tight drop-shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-700">
          The Safest Way to <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-gt-gold via-yellow-200 to-gt-gold animate-gradient-x">
           Fuck Poyraz by Diamond Locks
          </span>
        </h1>

        <p className="text-slate-400 text-base max-w-2xl mx-auto mb-4 leading-relaxed font-light animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            POYRAZ KÖR GÖZÜNÜ SİKEYİM İKİ SAATTİR AMINAKOYAYIM BE
        </p>

        {/* Main Stats Row */}
        <div className="flex justify-center gap-8 md:gap-16 text-center border-t border-slate-800/50 pt-3 max-w-3xl mx-auto bg-slate-900/40 backdrop-blur-sm rounded-2xl p-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
            <div className="group">
                <div className="text-2xl font-bold text-white group-hover:text-gt-gold transition-colors">25k+</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">Trades</div>
            </div>
            <div className="w-px bg-slate-800 h-10"></div>
            <div className="group">
                <div className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">24/7</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">Support</div>
            </div>
            <div className="w-px bg-slate-800 h-10"></div>
            <div className="group">
                <div className="text-2xl font-bold text-white group-hover:text-green-400 transition-colors">High</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">Stock Level</div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
