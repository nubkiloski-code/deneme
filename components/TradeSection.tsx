import React, { useState, useEffect, useRef } from 'react';
import { TradeMode, CryptoCurrency, RateInfo, WalletConfig, Order, OrderDestination } from '../types';
import CryptoSelector from './CryptoSelector';
import { ArrowRight, Wallet, Lock, Copy, Check, ShieldCheck, Plus, Minus, Info, Activity, Globe, MessageCircleQuestion, Zap, ExternalLink, Loader2, XCircle, CheckCircle } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';

interface TradeSectionProps {
  rates: RateInfo;
  wallets: WalletConfig;
  userWalletAddress: string;
  onOrderSubmit: (orderData: Partial<Order>) => void;
  isLoggedIn: boolean;
  onRequestLogin: () => void;
  onOpenSupport: () => void;
}

const TradeSection: React.FC<TradeSectionProps> = ({ rates, wallets, userWalletAddress, onOrderSubmit, isLoggedIn, onRequestLogin, onOpenSupport }) => {
  const [mode, setMode] = useState<TradeMode>(TradeMode.BUY);
  const [amount, setAmount] = useState<number>(10); // Amount in DLs
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoCurrency | null>(null);
  const [cryptoPrices, setCryptoPrices] = useState<Record<CryptoCurrency, number>>({
    [CryptoCurrency.BTC]: 65000,
    [CryptoCurrency.ETH]: 3500,
    [CryptoCurrency.LTC]: 85,
    [CryptoCurrency.USDT]: 1,
  });
  
  // Input Handling
  const [activeInput, setActiveInput] = useState<'dls' | 'crypto' | 'usd' | null>(null);
  const [cryptoInputValue, setCryptoInputValue] = useState<string>('');
  const [usdInputValue, setUSDInputValue] = useState<string>('');

  // Single Mode State
  const [growId, setGrowId] = useState('');
  const [worldName, setWorldName] = useState('');

  // Safe Mode State
  const [isSafeMode, setIsSafeMode] = useState(false);
  const [worldCount, setWorldCount] = useState(5);
  const [destinations, setDestinations] = useState<OrderDestination[]>(
    Array(5).fill({ growId: '', worldName: '' })
  );

  const [step, setStep] = useState<1 | 2>(1);
  const [txHash, setTxHash] = useState('');
  const [txStatus, setTxStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
  const [payoutAddress, setPayoutAddress] = useState('');
  const [copied, setCopied] = useState(false);
  const [formRevealed, setFormRevealed] = useState(false);
  
  const formEndRef = useRef<HTMLDivElement>(null);
  const { sendTransaction } = useWallet();

  const isBuy = mode === TradeMode.BUY;
  const rate = isBuy ? rates.buyRate : rates.sellRate;
  
  // Calculate raw values
  const totalUSD = amount * rate;
  const currentCryptoPrice = selectedCrypto ? cryptoPrices[selectedCrypto] : 0;
  
  // Derived Crypto Value (what should be shown if not editing crypto)
  const derivedCryptoValue = (selectedCrypto && currentCryptoPrice > 0) ? totalUSD / currentCryptoPrice : 0;
  
  // Display Value Logic
  const displayCrypto = activeInput === 'crypto' 
    ? cryptoInputValue 
    : !selectedCrypto 
      ? '' 
      : derivedCryptoValue.toFixed(selectedCrypto === CryptoCurrency.USDT ? 2 : 6);

  const getCryptoShortName = (c: CryptoCurrency | null) => {
    if (!c) return '';
    switch(c) {
        case CryptoCurrency.BTC: return 'BTC';
        case CryptoCurrency.ETH: return 'ETH';
        case CryptoCurrency.LTC: return 'LTC';
        case CryptoCurrency.USDT: return 'USDT';
        default: return '';
    }
  };
  const shortName = getCryptoShortName(selectedCrypto);

  // Auto-scroll when Safe Mode is toggled to ensure visibility
  useEffect(() => {
    if (isSafeMode) {
      // Delay to allow the UI to expand before scrolling
      const timer = setTimeout(() => {
        formEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isSafeMode]);

  // Fetch Live Prices
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,litecoin,tether&vs_currencies=usd', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        if (!response.ok) {
           return; 
        }
        const data = await response.json();
        
        // Ensure we map the API response correctly to our Enum keys
        setCryptoPrices(prev => ({
          ...prev,
          [CryptoCurrency.BTC]: data.bitcoin.usd,
          [CryptoCurrency.ETH]: data.ethereum.usd,
          [CryptoCurrency.LTC]: data.litecoin.usd,
          [CryptoCurrency.USDT]: data.tether.usd,
        }));
      } catch (error) {
        // Suppress error logging
      }
    };

    fetchPrices();
    // 60 seconds interval
    const interval = setInterval(fetchPrices, 60000); 
    return () => clearInterval(interval);
  }, []);

  // TX Hash Validation Logic
  useEffect(() => {
    if (!txHash) {
      setTxStatus('idle');
      return;
    }

    setTxStatus('validating');
    const timer = setTimeout(() => {
      let isValid = false;
      const cleanHash = txHash.trim();

      if (selectedCrypto === CryptoCurrency.ETH) {
        isValid = /^0x([A-Fa-f0-9]{64})$/.test(cleanHash);
      } else if (selectedCrypto === CryptoCurrency.BTC || selectedCrypto === CryptoCurrency.LTC || selectedCrypto === CryptoCurrency.USDT) {
        // BTC/LTC/Tron transaction hashes are 64 hex characters
        isValid = /^[a-fA-F0-9]{64}$/.test(cleanHash);
      }

      setTxStatus(isValid ? 'valid' : 'invalid');
    }, 600); // Simulate network check delay

    return () => clearTimeout(timer);
  }, [txHash, selectedCrypto]);

  const handleCryptoSelection = (crypto: CryptoCurrency) => {
    setSelectedCrypto(crypto);
    if (!formRevealed) {
      setFormRevealed(true);
      setTimeout(() => {
        formEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    }
  };

  const handleCryptoInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCryptoInputValue(val);
    
    const numVal = parseFloat(val);
    if (!isNaN(numVal) && currentCryptoPrice > 0) {
        // Reverse calc: Crypto -> USD -> DLs
        const usdValue = numVal * currentCryptoPrice;
        const dlAmount = usdValue / rate;
        setAmount(dlAmount);
    } else if (val === '') {
        // Allow empty
    } else {
        setAmount(0);
    }
  };

  const handleUSDInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUSDInputValue(val);
    
    const numVal = parseFloat(val);
    if (!isNaN(numVal)) {
        // Reverse calc: USD -> DLs
        const newAmount = numVal / rate;
        setAmount(newAmount);
    } else if (val === '') {
        // Allow empty
    } else {
        setAmount(0);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(Math.max(0, parseFloat(e.target.value) || 0));
  };

  // Split Calculation Logic (Integer Distribution)
  const getSplitAmounts = () => {
    const baseAmount = Math.floor(amount / worldCount); 
    const splits = [];
    let remainingAmount = amount;
    
    for (let i = 0; i < worldCount; i++) {
      if (i === worldCount - 1) {
        // Last world gets whatever is left
        splits.push(parseFloat(remainingAmount.toFixed(2)));
      } else {
        let val = Math.floor(amount / worldCount);
        const intRemainder = Math.floor(amount) % worldCount;
        if (i < intRemainder) {
          val += 1;
        }
        splits.push(val);
        remainingAmount -= val;
      }
    }
    return splits;
  };

  const splitAmounts = getSplitAmounts();

  // Update destinations when worldCount changes
  useEffect(() => {
    setDestinations(prev => {
      if (prev.length === worldCount) return prev;
      if (prev.length < worldCount) {
        const added = Array(worldCount - prev.length).fill({ growId: '', worldName: '' });
        return [...prev, ...added];
      } else {
        return prev.slice(0, worldCount);
      }
    });
  }, [worldCount]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const validateForm = () => {
    if (amount <= 0) return false;
    if (!isBuy && !payoutAddress) return false;
    
    if (isSafeMode) {
      return destinations.every(d => d.growId.trim() !== '' && d.worldName.trim() !== '');
    } else {
      return growId.trim() !== '' && worldName.trim() !== '';
    }
  };

  const handleDestinationChange = (index: number, field: keyof OrderDestination, value: string) => {
    setDestinations(prev => {
      const newDestinations = [...prev];
      newDestinations[index] = { ...newDestinations[index], [field]: value };
      return newDestinations;
    });
  };

  const handlePayWithWallet = async () => {
    if (!selectedCrypto) return;
    
    const toAddress = wallets[selectedCrypto];
    const amountToSend = parseFloat(displayCrypto);
    
    const result = await sendTransaction(toAddress, amountToSend, selectedCrypto);
    
    if (result) {
        setTxHash(result);
        alert("Transaction sent! Hash copied to form.");
    }
  };

  const handleSubmit = (isGuest: boolean = false) => {
    if (!isLoggedIn && !isGuest) {
        onRequestLogin();
        return;
    }

    if (step === 1) {
      setStep(2);
    } else {
      const orderData: Partial<Order> = {
        type: mode,
        amount: parseFloat(amount.toFixed(2)),
        cryptoAmount: parseFloat(displayCrypto),
        currency: selectedCrypto as CryptoCurrency,
        totalUSD: parseFloat(totalUSD.toFixed(2)),
        isSafeMode: isSafeMode,
        isGuest: isGuest,
        txHash: isBuy ? txHash : undefined,
        payoutAddress: !isBuy ? payoutAddress : undefined
      };

      if (isSafeMode) {
        orderData.growId = "Multiple (Safe Mode)";
        orderData.worldName = "See Destinations";
        orderData.destinations = destinations;
      } else {
        orderData.growId = growId;
        orderData.worldName = worldName;
      }

      onOrderSubmit(orderData);

      // Reset
      setStep(1);
      setTxHash('');
      setPayoutAddress('');
      setAmount(10);
      setGrowId('');
      setWorldName('');
      setWorldCount(5);
      setDestinations(Array(5).fill({ growId: '', worldName: '' }));
      setFormRevealed(false);
      setSelectedCrypto(null); 
    }
  };

  const getExplorerLink = (hash: string) => {
    if (!selectedCrypto || !hash) return '#';
    switch (selectedCrypto) {
      case CryptoCurrency.BTC: return `https://mempool.space/tx/${hash}`;
      case CryptoCurrency.ETH: return `https://etherscan.io/tx/${hash}`;
      case CryptoCurrency.LTC: return `https://blockchair.com/litecoin/transaction/${hash}`;
      case CryptoCurrency.USDT: return `https://tronscan.org/#/transaction/${hash}`;
      default: return '#';
    }
  };

  return (
    <div id="trade" className="pt-2 px-4 pb-20">
      <div className="max-w-4xl mx-auto">
        
        {/* Main Card */}
        <div className="bg-gt-card/90 backdrop-blur-xl rounded-[32px] border border-slate-700/50 shadow-2xl overflow-hidden pt-4">
          
          <div className="flex justify-center items-center gap-2 mb-4">
            <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase flex items-center gap-1.5 ${isBuy ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isBuy ? 'bg-green-400' : 'bg-blue-400'}`}></span>
              System Operational
            </div>
          </div>

          {/* Interactive Form - Full Width/Centered */}
          <div className="px-4 pb-6 md:px-6 lg:px-12 lg:pb-12 relative">

             <div className="max-w-2xl mx-auto flex flex-col pt-0">
                {step === 1 ? (
                  <div className="space-y-2 animate-in slide-in-from-right-4 fade-in duration-500">
                    
                    {/* Input Group - Compacted Gaps */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4 md:mt-6">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase ml-1">Quantity</label>
                        <div className="relative group">
                          <input
                            type="number"
                            value={amount}
                            onChange={handleAmountChange}
                            onFocus={() => setActiveInput('dls')}
                            onBlur={() => setActiveInput(null)}
                            className="w-full bg-slate-800 border border-slate-600 rounded-2xl px-4 py-2.5 text-xl md:text-2xl font-bold text-white focus:border-gt-gold focus:ring-1 focus:ring-gt-gold outline-none transition-all shadow-inner [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 pointer-events-none">DLs</div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase ml-1">You Pay ({shortName || '---'})</label>
                         <div className="relative group">
                           <input
                             type="number"
                             value={displayCrypto}
                             onChange={handleCryptoInputChange}
                             onFocus={() => {
                                 if (selectedCrypto) {
                                     setActiveInput('crypto');
                                     setCryptoInputValue(displayCrypto);
                                 }
                             }}
                             onBlur={() => setActiveInput(null)}
                             disabled={!selectedCrypto}
                             placeholder={!selectedCrypto ? "Select Coin" : ""}
                             className="w-full bg-slate-800 border border-slate-600 rounded-2xl px-4 py-2.5 text-xl md:text-2xl font-bold text-white focus:border-gt-gold focus:ring-1 focus:ring-gt-gold outline-none transition-all shadow-inner disabled:opacity-50 disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                           />
                           {selectedCrypto && (
                             <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-end z-10">
                                <span className="text-[10px] font-bold text-slate-400 mb-0.5 pointer-events-none">{shortName}</span>
                                <div className="flex items-center gap-0.5">
                                  <span className="text-sm font-bold text-white tracking-wide pointer-events-none">≈ $</span>
                                  <input
                                    type="number"
                                    value={activeInput === 'usd' ? usdInputValue : totalUSD.toFixed(2)}
                                    onChange={handleUSDInputChange}
                                    onFocus={(e) => {
                                        e.stopPropagation();
                                        setActiveInput('usd');
                                        setUSDInputValue(totalUSD.toFixed(2));
                                    }}
                                    onBlur={() => setActiveInput(null)}
                                    className="w-20 bg-transparent text-sm font-bold text-white outline-none text-right p-0 m-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder-slate-500"
                                    placeholder="0.00"
                                  />
                                </div>
                             </div>
                           )}
                         </div>
                      </div>
                    </div>

                    {/* Crypto Selector */}
                    <div>
                      {/* Live Market Rate Display */}
                      {selectedCrypto && (
                        <div className="flex justify-center my-3 animate-in fade-in slide-in-from-top-1">
                            <div className="inline-flex items-center gap-3 bg-slate-900/50 rounded-lg px-3 py-1.5 border border-slate-700/50 shadow-sm">
                               <div className="flex items-center gap-1.5">
                                  <Activity className="w-3.5 h-3.5 text-gt-gold animate-pulse" />
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Live Rate</span>
                               </div>
                               <div className="h-3 w-px bg-slate-700"></div>
                               <div className="text-xs font-mono font-bold text-slate-200">
                                  1 <span className="text-white">{selectedCrypto}</span> = <span className="text-emerald-400">${currentCryptoPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>
                      )}
                      
                      <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Select Payment Method</label>
                      <CryptoSelector selected={selectedCrypto} onSelect={handleCryptoSelection} />
                      
                      {/* Contact Admin Helper Text */}
                      <div className="text-center mt-3">
                        <button 
                            onClick={onOpenSupport}
                            className="text-xs text-slate-300 hover:text-white transition-colors flex items-center justify-center gap-1.5 mx-auto hover:underline decoration-slate-500 font-medium"
                        >
                            <MessageCircleQuestion className="w-3.5 h-3.5 text-gt-gold" /> Using another currency? Contact with our admin
                        </button>
                      </div>
                    </div>

                    {/* Dynamic Content Area - Revealed on Interaction */}
                    <div 
                        ref={formEndRef}
                        className={`transition-all duration-700 ease-in-out overflow-hidden ${formRevealed ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}
                    >
                      <div className="pt-6">
                        
                        {/* DISTINCT WORLD SECTION CARD */}
                        <div className="bg-slate-900/80 rounded-3xl p-4 md:p-6 border border-slate-700/80 shadow-2xl relative overflow-hidden">
                          {/* Card Header Background */}
                          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gt-gold to-transparent opacity-50"></div>
                          
                          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700/50">
                             <div className="bg-slate-800 p-2 rounded-lg">
                                <Globe className="w-5 h-5 text-gt-gold" />
                             </div>
                             <div>
                               <h4 className="text-sm font-bold text-white uppercase tracking-wider">Delivery Details</h4>
                               <p className="text-[10px] text-slate-500">Where should we deliver your DLs?</p>
                             </div>
                          </div>

                          {isBuy ? (
                              /* BUY MODE OPTIONS */
                              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                                <div 
                                    onClick={() => setIsSafeMode(!isSafeMode)}
                                    className={`group border cursor-pointer rounded-2xl p-1 relative overflow-hidden transition-all duration-300 ${isSafeMode ? 'bg-emerald-500/10 border-emerald-500' : 'bg-slate-800/30 border-slate-700 hover:border-slate-500'}`}
                                >
                                    <div className="flex items-start md:items-center gap-3 p-3 md:p-4 relative z-10">
                                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-colors shrink-0 ${isSafeMode ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                                        <ShieldCheck className="w-4 h-4 md:w-5 md:h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                                            <h4 className={`font-bold text-xs md:text-sm truncate ${isSafeMode ? 'text-emerald-400' : 'text-white'}`}>Looking for a Safer Way?</h4>
                                            {!isSafeMode && <span className="text-[9px] md:text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full font-bold animate-pulse self-start md:self-auto">RECOMMENDED</span>}
                                        </div>
                                        <p className="text-[10px] md:text-xs text-slate-400 mt-0.5">Split order across multiple worlds to prevent bans.</p>
                                    </div>
                                    <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${isSafeMode ? 'border-emerald-500 bg-emerald-500' : 'border-slate-600'}`}>
                                        {isSafeMode && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                    </div>

                                    {/* Expanded Safe Mode Settings */}
                                    <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isSafeMode ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                                    <div className="overflow-hidden">
                                        <div className="px-3 pb-3 pt-0 md:px-4 md:pb-4">
                                            <div className="bg-slate-900/50 rounded-xl p-3 border border-emerald-500/20 flex justify-between items-center">
                                                <span className="text-xs font-bold text-emerald-100">Worlds to split between:</span>
                                                <div className="flex items-center gap-2">
                                                <button onClick={(e) => { e.stopPropagation(); setWorldCount(Math.max(2, worldCount - 1)); }} className="w-6 h-6 rounded bg-slate-800 hover:bg-emerald-500/20 text-white flex items-center justify-center transition-colors"><Minus className="w-3 h-3" /></button>
                                                <span className="w-6 text-center font-mono font-bold text-emerald-400">{worldCount}</span>
                                                <button onClick={(e) => { e.stopPropagation(); setWorldCount(Math.min(10, worldCount + 1)); }} className="w-6 h-6 rounded bg-slate-800 hover:bg-emerald-500/20 text-white flex items-center justify-center transition-colors"><Plus className="w-3 h-3" /></button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    </div>
                                </div>

                                {/* Destinations Input */}
                                {isSafeMode ? (
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-xs font-bold text-slate-500 px-1 uppercase">
                                        <span>Destination</span>
                                        <span>Amount</span>
                                        </div>
                                        {destinations.map((dest, idx) => (
                                        <div key={idx} className="flex gap-2 items-start md:items-center animate-in slide-in-from-bottom-2 fade-in flex-col md:flex-row" style={{ animationDelay: `${idx * 50}ms` }}>
                                            <div className="flex items-center gap-2 w-full md:w-auto">
                                              <span className="text-xs text-slate-600 w-4 font-mono">{idx + 1}</span>
                                              {/* Mobile View: Amount next to index */}
                                              <div className="md:hidden w-12 text-right ml-auto">
                                                  <span className="text-xs font-bold text-emerald-400">{splitAmounts[idx]}</span>
                                              </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1 w-full">
                                                <input 
                                                placeholder="GrowID" 
                                                value={dest.growId}
                                                onChange={(e) => handleDestinationChange(idx, 'growId', e.target.value)}
                                                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-gt-gold outline-none w-full min-w-0"
                                                />
                                                <input 
                                                placeholder="World" 
                                                value={dest.worldName}
                                                onChange={(e) => handleDestinationChange(idx, 'worldName', e.target.value)}
                                                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-gt-gold outline-none w-full min-w-0"
                                                />
                                            </div>
                                            <div className="hidden md:block w-12 text-right">
                                                <span className="text-xs font-bold text-emerald-400">{splitAmounts[idx]}</span>
                                            </div>
                                        </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="min-w-0">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">GrowID</label>
                                        <div className="relative">
                                          <input
                                              type="text"
                                              value={growId}
                                              onChange={(e) => setGrowId(e.target.value)}
                                              placeholder="Player123"
                                              className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm focus:border-gt-gold outline-none min-w-0"
                                          />
                                        </div>
                                        </div>
                                        <div className="min-w-0">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">World Name</label>
                                        <div className="relative">
                                          <input
                                              type="text"
                                              value={worldName}
                                              onChange={(e) => setWorldName(e.target.value)}
                                              placeholder="MYWORLD"
                                              className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm focus:border-gt-gold outline-none min-w-0"
                                          />
                                        </div>
                                        </div>
                                    </div>
                                )}
                              </div>
                          ) : (
                              /* SELL MODE OPTIONS */
                              <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                              <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4 flex gap-4">
                                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                                  <Info className="w-5 h-5 text-blue-400" />
                                  </div>
                                  <div>
                                  <h4 className="font-bold text-sm text-blue-100">Seller Instructions</h4>
                                  <p className="text-xs text-blue-300/70 mt-1 leading-relaxed">
                                      We will provide a Drop World on the next screen. After you drop the DLs, our system will verify and send crypto to your address below.
                                  </p>
                                  </div>
                              </div>
                              <div>
                                  <div className="flex justify-between items-center mb-2">
                                      <label className="text-xs font-bold text-slate-500 uppercase ml-1">Your {selectedCrypto} Wallet Address</label>
                                      {userWalletAddress && !payoutAddress && (
                                          <button 
                                            onClick={() => setPayoutAddress(userWalletAddress)}
                                            className="text-[10px] bg-gt-gold text-black px-2 py-0.5 rounded font-bold hover:bg-yellow-400 flex items-center gap-1 transition-colors"
                                          >
                                              <Wallet className="w-3 h-3" /> Auto-Fill Connected Wallet
                                          </button>
                                      )}
                                  </div>
                                  <input
                                      type="text"
                                      value={payoutAddress}
                                      onChange={(e) => setPayoutAddress(e.target.value)}
                                      placeholder={`Enter your ${selectedCrypto || 'crypto'} address...`}
                                      className="w-full bg-slate-800/50 border border-slate-600 rounded-2xl px-5 py-4 text-sm font-mono text-white focus:border-gt-gold outline-none focus:ring-1 focus:ring-gt-gold transition-all"
                                  />
                              </div>
                              </div>
                          )}
                        </div>

                        <div className="mt-6">
                            {!isLoggedIn ? (
                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={() => handleSubmit(true)}
                                        disabled={!validateForm()}
                                        className="w-full py-3.5 rounded-2xl font-bold text-sm border-2 border-slate-700 text-slate-300 hover:border-gt-gold/50 hover:text-white hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Continue as Guest <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 opacity-70 group-hover:opacity-100" />
                                    </button>

                                    <div className="flex items-center gap-4 px-2 opacity-70 my-2">
                                        <div className="h-px bg-slate-600 flex-1"></div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">OR Log In</span>
                                        <div className="h-px bg-slate-600 flex-1"></div>
                                    </div>

                                    <button
                                        onClick={onRequestLogin}
                                        className="w-full py-4 rounded-2xl font-bold text-lg shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 bg-slate-700 text-white hover:bg-slate-600 shadow-slate-900/20"
                                    >
                                        {isBuy ? 'Log in to Buy' : 'Log in to Sell'}
                                    </button>
                                    
                                </div>
                            ) : (
                                <button
                                    onClick={() => handleSubmit(false)}
                                    disabled={!validateForm()}
                                    className={`w-full py-4 rounded-2xl font-bold text-lg shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${
                                        isBuy 
                                        ? 'bg-gt-gold text-slate-900 hover:bg-yellow-400 shadow-yellow-900/20' 
                                        : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-900/20'
                                    } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                                >
                                    {isBuy ? 'Continue to Payment' : 'Start Trade'} <ArrowRight className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                      </div>
                    </div>

                  </div>
                ) : (
                  /* STEP 2: CONFIRMATION */
                  <div className="space-y-8 animate-in slide-in-from-right-8 fade-in duration-500 h-full flex flex-col justify-center">
                     <div className="text-center">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isBuy ? 'bg-gt-gold/20' : 'bg-blue-500/20'}`}>
                           {isBuy ? <Wallet className="w-10 h-10 text-gt-gold" /> : <Lock className="w-10 h-10 text-blue-400" />}
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2">
                           {isBuy ? 'Send Payment' : 'Drop Items'}
                        </h2>
                        <p className="text-slate-400 text-sm max-w-md mx-auto">
                           {isBuy 
                             ? `Please send exactly ${displayCrypto} ${selectedCrypto} to the address below. Your order will process automatically.` 
                             : `Go to the world below and drop ${amount} DLs. Ensure the world owner is correct.`}
                        </p>
                     </div>

                     <div 
                        onClick={() => copyToClipboard(isBuy && selectedCrypto ? wallets[selectedCrypto] : 'MARKET123')}
                        className={`p-6 rounded-2xl border-2 border-dashed cursor-pointer transition-all group relative ${isBuy ? 'bg-slate-800/30 border-slate-600 hover:border-gt-gold' : 'bg-slate-800/30 border-blue-500/30 hover:border-blue-500'}`}
                     >
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-xs font-bold uppercase tracking-widest text-slate-500">{isBuy ? 'Wallet Address' : 'World Name'}</span>
                           {copied && <span className="text-xs font-bold text-green-500 flex items-center gap-1"><Check className="w-3 h-3" /> Copied</span>}
                        </div>
                        <div className="font-mono text-xl md:text-2xl text-white break-all">
                           {isBuy && selectedCrypto ? wallets[selectedCrypto] : 'MARKET123'}
                        </div>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 p-2 rounded-lg shadow-lg">
                           <Copy className="w-4 h-4 text-white" />
                        </div>
                     </div>

                     {isBuy && (
                        <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
                           <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-2 block">Transaction Hash (TXID)</label>
                           <div className="relative">
                             <input 
                                type="text"
                                value={txHash}
                                onChange={(e) => setTxHash(e.target.value)}
                                placeholder="Paste your transaction ID here..."
                                className={`w-full bg-slate-900 border rounded-xl px-4 py-3 text-sm text-white outline-none font-mono transition-all pr-10
                                  ${txStatus === 'valid' ? 'border-green-500/50 focus:border-green-500' : 
                                    txStatus === 'invalid' ? 'border-red-500/50 focus:border-red-500' : 
                                    'border-slate-600 focus:border-gt-gold'}`}
                             />
                             <div className="absolute right-3 top-1/2 -translate-y-1/2">
                               {txStatus === 'validating' && <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />}
                               {txStatus === 'valid' && <CheckCircle className="w-4 h-4 text-green-500" />}
                               {txStatus === 'invalid' && <XCircle className="w-4 h-4 text-red-500" />}
                             </div>
                           </div>
                           
                           {/* Validation Feedback & Explorer Link */}
                           <div className="mt-2 flex justify-between items-center min-h-[20px]">
                              <div>
                                {txStatus === 'valid' && <span className="text-[10px] text-green-400 font-bold">Format Valid</span>}
                                {txStatus === 'invalid' && <span className="text-[10px] text-red-400 font-bold">Invalid Hash Format</span>}
                              </div>
                              {txHash && txStatus !== 'invalid' && (
                                <a 
                                  href={getExplorerLink(txHash)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                                >
                                  Check on Explorer <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                           </div>
                        </div>
                     )}

                     {/* Pay With Wallet Button */}
                     {isBuy && selectedCrypto && selectedCrypto !== CryptoCurrency.USDT && (
                        <button
                            onClick={handlePayWithWallet}
                            className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all mb-2 shadow-lg ${
                                selectedCrypto === CryptoCurrency.ETH ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/20' :
                                selectedCrypto === CryptoCurrency.BTC ? 'bg-orange-500 hover:bg-orange-400 text-white shadow-orange-900/20' :
                                'bg-blue-500 hover:bg-blue-400 text-white shadow-blue-900/20'
                            }`}
                        >
                            <Wallet className="w-4 h-4" /> 
                            {selectedCrypto === CryptoCurrency.ETH ? 'Pay via MetaMask' : 'Open Wallet App'}
                        </button>
                     )}

                     <div className="flex gap-4">
                        <button
                           onClick={() => setStep(1)}
                           className="flex-1 py-4 rounded-xl font-bold text-slate-400 hover:bg-slate-800 hover:text-white transition-colors border border-transparent hover:border-slate-700"
                        >
                           Go Back
                        </button>
                        <button
                           onClick={() => handleSubmit(false)}
                           disabled={isBuy && (!txHash || txStatus === 'invalid')}
                           className={`flex-[2] py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] ${isBuy ? 'bg-green-600 hover:bg-green-500' : 'bg-blue-600 hover:bg-blue-500'} disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                        >
                           {isBuy ? 'I Have Sent Payment' : 'I Have Dropped Items'} <Check className="w-5 h-5" />
                        </button>
                     </div>
                  </div>
                )}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TradeSection;