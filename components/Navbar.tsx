
import React, { useState, useRef, useEffect } from 'react';
import { Menu, UserCircle, Wallet, LogOut, X, Lock, Copy, Check, ExternalLink, ChevronDown, Calculator, Tag } from 'lucide-react';
import { UserAccount } from '../types';

interface NavbarProps {
  onAdminClick?: () => void;
  userWalletAddress: string;
  onConnect: () => void;
  onDisconnect: () => void;
  currentUser: UserAccount | null;
  onLogout: () => void;
  onNavigate: (view: 'home' | 'sell' | 'orders' | 'tools') => void;
  currentView: 'home' | 'sell' | 'orders' | 'tools';
}

const Navbar: React.FC<NavbarProps> = ({ 
  onAdminClick, 
  userWalletAddress, 
  onConnect,
  onDisconnect,
  currentUser, 
  onLogout,
  onNavigate,
  currentView
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isWalletDropdownOpen, setIsWalletDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsWalletDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogoClick = () => {
    onNavigate('home');
  };

  const handleConnect = () => {
    if (userWalletAddress) {
        setIsWalletDropdownOpen(!isWalletDropdownOpen);
    } else {
        onConnect();
    }
  };

  const handleDisconnect = () => {
    if (window.confirm("Are you sure you want to disconnect your wallet?")) {
        onDisconnect();
        setIsWalletDropdownOpen(false);
    }
  };

  const copyAddress = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(userWalletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <nav className="w-full bg-gt-dark/90 backdrop-blur-md border-b border-slate-800/50 py-4 sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <div onClick={handleLogoClick} className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            <div className="bg-gt-gold/10 p-2.5 rounded-xl border border-gt-gold/20 shadow-lg shadow-gt-gold/5 group-hover:scale-105 transition-transform duration-300">
                <Lock className="w-8 h-8 text-gt-gold" />
            </div>
          </div>
          <span className="text-xl font-bold text-white tracking-tight group-hover:text-gt-gold transition-colors">
            Nub.<span className="text-gt-gold">market</span>
          </span>
        </div>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6 text-slate-300 font-medium text-sm">
          
          <button 
            onClick={() => onNavigate('home')} 
            className={`hover:text-gt-gold transition-colors ${currentView === 'home' ? 'text-gt-gold font-bold' : ''}`}
          >
            Buy
          </button>

          <button 
            onClick={() => onNavigate('sell')} 
            className={`hover:text-gt-gold transition-colors flex items-center gap-1 ${currentView === 'sell' ? 'text-gt-gold font-bold' : ''}`}
          >
            <Tag className="w-4 h-4" /> Sell to Us
          </button>

          <button 
            onClick={() => onNavigate('tools')} 
            className={`hover:text-gt-gold transition-colors flex items-center gap-1 ${currentView === 'tools' ? 'text-gt-gold font-bold' : ''}`}
          >
            <Calculator className="w-4 h-4" /> Tools
          </button>

          <button 
            onClick={() => onNavigate('orders')} 
            className={`hover:text-gt-gold transition-colors ${currentView === 'orders' ? 'text-gt-gold font-bold' : ''}`}
          >
            My Orders
          </button>
          
          {currentUser ? (
             <div className="flex items-center gap-4">
                <button 
                    onClick={onAdminClick}
                    className="flex items-center gap-2 text-white font-bold hover:text-gt-gold transition-colors bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-gt-gold/50"
                >
                    <UserCircle className="w-5 h-5" />
                    {currentUser.username}
                </button>
             </div>
          ) : (
            <button 
                onClick={onAdminClick}
                className="flex items-center gap-2 hover:text-white transition-colors"
            >
                <UserCircle className="w-5 h-5" />
                Open Account
            </button>
          )}
          
          {/* Wallet Button & Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
                onClick={handleConnect}
                className={`group relative px-4 py-2 rounded-full font-bold transition-all flex items-center gap-2 ${
                    userWalletAddress 
                    ? 'bg-slate-800 text-gt-gold border border-gt-gold/50 hover:bg-slate-700 hover:shadow-lg hover:shadow-gt-gold/10' 
                    : 'bg-gt-gold text-black hover:bg-yellow-400 hover:shadow-lg hover:shadow-yellow-400/20'
                }`}
            >
                {userWalletAddress ? (
                    <>
                        <Wallet className="w-4 h-4" />
                        <span className="font-mono text-xs tracking-wide">
                            {userWalletAddress.slice(0, 6)}...{userWalletAddress.slice(-4)}
                        </span>
                        <ChevronDown className={`w-3 h-3 transition-transform ${isWalletDropdownOpen ? 'rotate-180' : ''}`} />
                    </>
                ) : (
                    'Connect Wallet'
                )}
            </button>

            {/* Wallet Menu Dropdown */}
            {isWalletDropdownOpen && userWalletAddress && (
                <div className="absolute top-full right-0 mt-3 w-72 bg-gt-card border border-slate-700 rounded-2xl shadow-2xl p-4 animate-in slide-in-from-top-2 fade-in duration-200 overflow-hidden z-50">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-700/50">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Wallet Connected</span>
                        <span className="flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                    </div>
                    
                    <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800 mb-4 group cursor-pointer" onClick={copyAddress}>
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Address</span>
                            <div className="text-slate-400 group-hover:text-white transition-colors">
                                {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                            </div>
                        </div>
                        <div className="font-mono text-sm text-slate-300 leading-relaxed font-bold">
                            {userWalletAddress.slice(0, 5)}...
                        </div>
                        <div className="text-[9px] text-slate-600 mt-1 group-hover:text-gt-gold transition-colors font-bold uppercase tracking-tighter">Click to copy full address</div>
                    </div>

                    <div className="space-y-2">
                        <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors text-sm text-slate-300 hover:text-white group">
                            <span className="flex items-center gap-2"><ExternalLink className="w-4 h-4" /> View on Explorer</span>
                        </button>
                        <button 
                            onClick={handleDisconnect}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-red-500/10 transition-colors text-sm text-red-400 hover:text-red-300 group"
                        >
                            <span className="flex items-center gap-2"><LogOut className="w-4 h-4" /> Disconnect</span>
                        </button>
                    </div>
                </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-slate-300 hover:text-white transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-gt-card/95 backdrop-blur-xl border-b border-slate-700 shadow-2xl animate-slide-down">
          <div className="flex flex-col p-6 space-y-4">
            <button 
              onClick={() => { onNavigate('home'); setIsMobileMenuOpen(false); }}
              className={`text-lg font-medium text-left transition-colors border-b border-slate-800 pb-3 ${currentView === 'home' ? 'text-gt-gold' : 'text-slate-300'}`}
            >
              Buy
            </button>
            <button 
              onClick={() => { onNavigate('sell'); setIsMobileMenuOpen(false); }}
              className={`text-lg font-medium text-left transition-colors border-b border-slate-800 pb-3 flex items-center gap-2 ${currentView === 'sell' ? 'text-gt-gold' : 'text-slate-300'}`}
            >
              <Tag className="w-5 h-5" /> Sell to Us
            </button>
            <button 
              onClick={() => { onNavigate('tools'); setIsMobileMenuOpen(false); }}
              className={`text-lg font-medium text-left transition-colors border-b border-slate-800 pb-3 flex items-center gap-2 ${currentView === 'tools' ? 'text-gt-gold' : 'text-slate-300'}`}
            >
              <Calculator className="w-5 h-5" /> Tools
            </button>
            <button 
              onClick={() => { onNavigate('orders'); setIsMobileMenuOpen(false); }}
              className={`text-lg font-medium text-left transition-colors border-b border-slate-800 pb-3 ${currentView === 'orders' ? 'text-gt-gold' : 'text-slate-300'}`}
            >
              My Orders
            </button>
            
            <button 
              onClick={() => {
                onAdminClick?.();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 text-lg font-medium text-slate-300 hover:text-white transition-colors border-b border-slate-800 pb-3"
            >
              <UserCircle className="w-6 h-6" />
              {currentUser ? currentUser.username : 'Open Account'}
            </button>
            
            <button 
              onClick={() => {
                if (userWalletAddress) {
                    if(window.confirm("Disconnect wallet?")) {
                        onDisconnect();
                    }
                } else {
                    onConnect();
                }
                setIsMobileMenuOpen(false);
              }}
              className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 mt-2 ${
                  userWalletAddress 
                  ? 'bg-slate-800 text-gt-gold border border-gt-gold/50' 
                  : 'bg-gt-gold text-black'
              }`}
            >
              {userWalletAddress ? (
                  <>
                      <Wallet className="w-5 h-5" />
                      <span className="font-mono text-sm">
                          {userWalletAddress.slice(0, 6)}...{userWalletAddress.slice(-4)}
                      </span>
                  </>
              ) : (
                  'Connect Wallet'
              )}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

