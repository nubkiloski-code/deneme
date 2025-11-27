import React from 'react';
import { CryptoCurrency } from '../types';
import { CheckCircle2 } from 'lucide-react';

interface CryptoSelectorProps {
  selected: CryptoCurrency | null;
  onSelect: (crypto: CryptoCurrency) => void;
}

const CryptoIcon = ({ type, className = "w-10 h-10" }: { type: CryptoCurrency, className?: string }) => {
  switch (type) {
    case CryptoCurrency.BTC:
      return (
        <svg viewBox="0 0 32 32" className={className}>
          <circle cx="16" cy="16" r="16" fill="#F7931A" />
          <path fill="#FFF" d="M23.189 14.02c.314-2.096-1.283-3.223-3.465-3.975l.708-2.84-1.728-.43-.69 2.765c-.454-.114-.92-.22-1.385-.326l.695-2.783L15.596 6l-.708 2.839c-.376-.086-.746-.17-1.104-.26l.002-.009-2.384-.595-.46 1.846s1.283.294 1.256.312c.7.175.826.638.805 1.006l-.806 3.235c.048.012.11.03.18.057l-.183-.045-1.13 4.532c-.086.212-.303.531-.793.41.018.025-1.256-.313-1.256-.313l-.858 1.978 2.25.561c.418.105.828.215 1.231.318l-.715 2.872 1.727.43.708-2.84c.472.127.93.245 1.378.357l-.706 2.828 1.728.43.715-2.866c2.948.558 5.164.333 6.097-2.333.752-2.146-.037-3.385-1.588-4.192 1.13-.26 1.98-1.003 2.207-2.538zm-3.95 5.538c-.533 2.147-4.148.986-5.32.695l.95-3.805c1.172.293 4.929.872 4.37 3.11zm.535-5.569c-.487 1.953-3.495.96-4.47.717l.86-3.45c.975.243 4.118 1.416 3.61 2.733z"/>
        </svg>
      );
    case CryptoCurrency.ETH:
      return (
        <svg viewBox="0 0 32 32" className={className}>
          <circle cx="16" cy="16" r="16" fill="#627EEA"/>
          <path fill="#FFF" fillOpacity=".602" d="M16.498 4v8.87l7.497 3.35z"/>
          <path fill="#FFF" d="M16.498 4L9 16.22l7.498-3.35z"/>
          <path fill="#FFF" fillOpacity=".602" d="M16.498 21.968v6.027L24 17.616z"/>
          <path fill="#FFF" d="M16.498 27.995v-6.028L9 17.616z"/>
          <path fill="#FFF" fillOpacity=".2" d="M16.498 20.573l7.497-4.353-7.497-3.349z"/>
          <path fill="#FFF" fillOpacity=".602" d="M9 16.22l7.498 4.353v-7.702z"/>
        </svg>
      );
    case CryptoCurrency.LTC:
      return (
        <svg viewBox="0 0 32 32" className={className}>
          <circle cx="16" cy="16" r="16" fill="#345D9D" />
          <path fill="#FFF" d="M9.8 22.3l1.8-6.8h-2.5l.5-1.9h2.5l1.7-6.5h3l-1.7 6.5h4.2l-.5 1.9h-4.2l-1.8 6.8h5l-.5 2h-8.2z"/>
        </svg>
      );
    case CryptoCurrency.USDT:
      return (
        <svg viewBox="0 0 32 32" className={className}>
          <circle cx="16" cy="16" r="16" fill="#26A17B"/>
          <path fill="#FFF" d="M17.922 17.383v-.002c-.11.008-.677.042-1.942.042-1.01 0-1.721-.03-1.971-.042v.003c-3.888-.171-6.79-1.214-6.79-2.435 0-1.365 3.628-2.434 8.73-2.434 5.101 0 8.733 1.069 8.733 2.434 0 1.221-2.903 2.264-6.76 2.434zM13.248 11.696V7.482h5.366v4.214c2.89.288 5.25 1.127 5.25 2.112 0 .984-2.36 1.822-5.25 2.111v8.599h-5.366v-8.599c-2.89-.289-5.25-1.127-5.25-2.111 0-.985 2.36-1.824 5.25-2.112z"/>
        </svg>
      );
    default:
      return <div className="w-10 h-10 bg-slate-600 rounded-full" />;
  }
};

const CryptoSelector: React.FC<CryptoSelectorProps> = ({ selected, onSelect }) => {
  const options = [
    { value: CryptoCurrency.LTC, label: 'LTC', name: 'Litecoin' },
    { value: CryptoCurrency.USDT, label: 'USDT', name: 'Tether' },
    { value: CryptoCurrency.BTC, label: 'BTC', name: 'Bitcoin' },
    { value: CryptoCurrency.ETH, label: 'ETH', name: 'Ethereum' },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 mt-2">
      {options.map((option) => {
        const isSelected = selected === option.value;
        return (
          <button
            key={option.value}
            onClick={() => onSelect(option.value)}
            className={`relative flex items-center gap-3 p-3 rounded-2xl border-2 transition-all duration-300 group ${
              isSelected 
                ? 'bg-slate-800 border-gt-gold ring-2 ring-gt-gold/20 shadow-xl scale-[1.02]' 
                : 'bg-slate-800/50 border-slate-700 hover:bg-slate-700 hover:border-slate-500'
            }`}
          >
            <CryptoIcon type={option.value} />
            <div className="text-left flex-1">
              <div className={`font-bold text-sm tracking-wide ${isSelected ? 'text-gt-gold' : 'text-white'}`}>
                {option.label}
              </div>
              <div className="text-slate-400 text-[10px] font-medium uppercase tracking-wider">{option.name}</div>
            </div>
            {isSelected && (
              <div className="absolute top-2 right-2 bg-gt-gold rounded-full p-0.5">
                <CheckCircle2 className="w-3 h-3 text-slate-900" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default CryptoSelector;