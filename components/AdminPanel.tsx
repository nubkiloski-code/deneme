import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Order, OrderStatus, RateInfo, WalletConfig, CryptoCurrency, ChatMessage, EmailConfig, FirebaseConfig, UserAccount } from '../types';
import { Settings, MessageSquare, ShoppingCart, Save, Check, X, Shield, RefreshCw, LogIn, UserPlus, Lock, Power, PowerOff, User, Mail, ArrowRight, LogOut, Loader2, RotateCcw, FileCode, Flame, ArrowLeft, Send, Bot, Globe, LogIn as SignInIcon } from 'lucide-react';

interface AdminPanelProps {
  orders: Order[];
  rates: RateInfo;
  wallets: WalletConfig;
  dropWorldName: string;
  onUpdateDropWorldName: (name: string) => void;
  emailConfig: EmailConfig;
  firebaseConfig: FirebaseConfig;
  chatMessages: ChatMessage[];
  isLiveSupport: boolean;
  users: UserAccount[];
  currentUser: UserAccount | null;
  onRegisterUser: (user: UserAccount) => void;
  onUpdateRates: (rates: RateInfo) => void;
  onUpdateWallets: (wallets: WalletConfig) => void;
  onUpdateEmailConfig: (config: EmailConfig) => void;
  onUpdateFirebaseConfig: (config: FirebaseConfig) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onAdminSendMessage: (text: string) => void;
  onToggleLiveSupport: (isActive: boolean) => void;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
  onLogout: () => void;
}

type AuthMode = 'login' | 'register' | 'verify';
type UserRole = 'guest' | 'user' | 'admin';

const AdminPanel: React.FC<AdminPanelProps> = ({
  orders,
  rates,
  wallets,
  dropWorldName,
  onUpdateDropWorldName,
  emailConfig,
  firebaseConfig,
  chatMessages,
  isLiveSupport,
  users,
  currentUser,
  onRegisterUser,
  onUpdateRates,
  onUpdateWallets,
  onUpdateEmailConfig,
  onUpdateFirebaseConfig,
  onUpdateOrderStatus,
  onAdminSendMessage,
  onToggleLiveSupport,
  onClose,
  onLoginSuccess,
  onLogout
}) => {
  const [userRole, setUserRole] = useState<UserRole>(currentUser ? 'user' : 'guest');
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [notification, setNotification] = useState<{title: string, message: string} | null>(null);

  const [activeTab, setActiveTab] = useState<'orders' | 'settings' | 'support'>('orders');
  const [localRates, setLocalRates] = useState(rates);
  const [localDropWorld, setLocalDropWorld] = useState(dropWorldName);
  
  const [adminReply, setAdminReply] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const userFilteredOrders = useMemo(() => {
    if (userRole === 'admin') return orders;
    if (!currentUser) return [];
    return orders.filter(o => o.userEmail === currentUser.email);
  }, [orders, currentUser, userRole]);

  useEffect(() => {
    if (currentUser) {
        setUserRole('user');
        setUsername(currentUser.username);
        setEmail(currentUser.email);
    } else if (email !== 'admin@nub.market' || userRole !== 'admin') {
        setUserRole('guest');
    }
  }, [currentUser]);

  useEffect(() => {
    if (activeTab === 'support') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTab, chatMessages]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.toLowerCase() === 'admin@nub.market' && password === 'admin123') {
      setUserRole('admin');
      setError('');
    } else {
      const existingUser = users.find(u => u.email === email && u.password === password);
      if (existingUser) {
        setUserRole('user');
        setUsername(existingUser.username);
        setError('');
        onLoginSuccess(existingUser);
      } else {
        setError('Incorrect email or password.');
      }
    }
  };

  const handleLogout = () => {
    setUserRole('guest');
    setAuthMode('login');
    setUsername('');
    setEmail('');
    setPassword('');
    onLogout();
  };

  const handleSaveSettings = () => {
    onUpdateRates(localRates);
    onUpdateDropWorldName(localDropWorld);
    setNotification({ title: 'Success', message: 'Settings saved.' });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAdminReply = () => {
    if (!adminReply.trim()) return;
    onAdminSendMessage(adminReply);
    setAdminReply('');
  };

  if (userRole === 'guest') {
    return (
      <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
        <button 
          onClick={onClose} 
          className="absolute top-8 left-8 p-3 rounded-full bg-slate-900/50 text-slate-400 hover:text-white border border-slate-800 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="bg-[#1a2332] w-full max-w-[540px] rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.7)] overflow-hidden border border-slate-800/40">
          <div className="flex bg-[#252f3f]/10 border-b border-slate-800/30">
            <button 
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-6 text-[13px] font-black uppercase tracking-widest transition-all ${authMode === 'login' ? 'bg-gt-gold text-slate-950' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Log In
            </button>
            <button 
              onClick={() => setAuthMode('register')}
              className={`flex-1 py-6 text-[13px] font-black uppercase tracking-widest transition-all ${authMode === 'register' ? 'bg-gt-gold text-slate-950' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Create Account
            </button>
          </div>

          <div className="px-12 py-16 flex flex-col items-center">
            <div className="w-24 h-24 bg-[#1e2a3b]/80 rounded-full flex items-center justify-center mb-10 border border-slate-700/50 shadow-inner">
              <Lock className="w-10 h-10 text-gt-gold" strokeWidth={1.5} />
            </div>

            <h2 className="text-[36px] font-bold text-white mb-3 tracking-tight leading-none text-center">
              {authMode === 'login' ? 'Welcome Back' : 'Join Nub.market'}
            </h2>
            <p className="text-slate-400 text-[16px] mb-12 font-medium text-center">
              {authMode === 'login' ? 'Access your trading dashboard.' : 'Start trading Diamond Locks securely.'}
            </p>

            {error && (
               <div className="w-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm py-3 px-4 rounded-xl mb-8 text-center animate-in fade-in zoom-in-95">
                 {error}
               </div>
            )}

            <form onSubmit={handleLogin} className="w-full space-y-9">
              <div className="space-y-3.5">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.25em] ml-2">Email Address</label>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 z-20 pointer-events-none">
                    <Mail className="w-full h-full text-slate-500 group-focus-within:text-gt-gold transition-colors" />
                  </div>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    className="w-full bg-[#202b3d]/80 border border-slate-700/50 py-5.5 pl-16 pr-8 rounded-2xl text-white outline-none focus:border-gt-gold focus:ring-4 focus:ring-gt-gold/5 transition-all placeholder-slate-600 font-medium text-[17px] z-10 relative"
                  />
                </div>
              </div>

              <div className="space-y-3.5">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.25em] ml-2">Password</label>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 z-20 pointer-events-none">
                    <Lock className="w-full h-full text-slate-500 group-focus-within:text-gt-gold transition-colors" />
                  </div>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#202b3d]/80 border border-slate-700/50 py-5.5 pl-16 pr-8 rounded-2xl text-white outline-none focus:border-gt-gold focus:ring-4 focus:ring-gt-gold/5 transition-all placeholder-slate-600 font-mono text-[17px] z-10 relative"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full bg-gt-gold text-slate-950 font-bold py-5.5 rounded-[22px] hover:bg-yellow-400 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-[0_20px_48px_-12px_rgba(255,215,0,0.4)]"
                >
                  <SignInIcon className="w-6 h-6" />
                  <span className="text-[20px]">Sign In</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950 flex flex-col text-white animate-in fade-in duration-300">
      <div className="bg-slate-900 border-b border-slate-800 p-5 flex justify-between items-center">
        <div className="flex items-center gap-4">
            <div className="bg-gt-gold/10 p-2 rounded-xl border border-gt-gold/20">
                <Shield className="w-6 h-6 text-gt-gold" />
            </div>
            <div>
                <h1 className="text-xl font-bold tracking-tight">System Control</h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{userRole} MODE - {username}</p>
            </div>
        </div>
        <div className="flex items-center gap-3">
            <button onClick={handleLogout} className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-red-500/20 transition-all">
                <LogOut className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all">
                <X className="w-5 h-5" />
            </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {userRole === 'admin' && (
            <aside className="w-72 bg-slate-900 border-r border-slate-800 p-6 flex flex-col gap-3">
                <button onClick={() => setActiveTab('orders')} className={`flex items-center gap-3 p-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'orders' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
                    <ShoppingCart className="w-5 h-5" /> Orders
                </button>
                <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-3 p-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'settings' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
                    <Settings className="w-5 h-5" /> Settings
                </button>
                <div className="mt-4 border-t border-slate-800 pt-4">
                  <button onClick={() => setActiveTab('support')} className={`w-full flex items-center gap-3 p-4 rounded-2xl font-bold text-sm transition-all shadow-xl ${activeTab === 'support' ? 'bg-gt-gold text-slate-950 scale-105' : 'bg-gt-gold/80 text-slate-900 hover:bg-gt-gold'}`}>
                      <MessageSquare className="w-5 h-5" /> Live Support
                  </button>
                </div>
            </aside>
        )}

        <main className="flex-1 overflow-y-auto bg-[#0c111d] relative">
          <div className="h-full flex flex-col p-10 max-w-6xl mx-auto">
            {activeTab === 'orders' && (
              <div className="grid gap-6">
                <div className="flex justify-between items-end mb-4">
                    <h2 className="text-3xl font-bold text-white">{userRole === 'admin' ? 'Manage Orders' : 'My Orders'}</h2>
                    <span className="bg-slate-800 px-3 py-1 rounded-full text-xs font-bold text-slate-400">{userFilteredOrders.length} TOTAL</span>
                </div>
                {userFilteredOrders.slice().reverse().map(order => (
                  <div key={order.id} className="bg-slate-900 p-8 rounded-[24px] border border-slate-800 flex flex-col lg:flex-row gap-8 items-start group hover:border-slate-700 transition-all">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 text-[11px] font-black text-slate-500 uppercase tracking-[0.15em] mb-3">
                        <span className="bg-slate-800 px-2 py-0.5 rounded">#{order.id}</span>
                        <span>•</span>
                        <span className="text-gt-gold">{order.userEmail || 'GUEST ORDER'}</span>
                      </div>
                      <h3 className="text-2xl font-bold mb-4">{order.amount} DLs <span className="text-slate-500 text-lg">via {order.currency}</span></h3>
                      <div className="flex flex-wrap gap-4">
                        <div className="bg-slate-800/50 px-4 py-2 rounded-xl text-xs font-bold text-slate-300 border border-slate-800">
                            ID: <span className="text-white ml-1">{order.growId}</span>
                        </div>
                        <div className="bg-slate-800/50 px-4 py-2 rounded-xl text-xs font-bold text-slate-300 border border-slate-800">
                            WORLD: <span className="text-white ml-1">{order.worldName}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 min-w-[220px]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Current Status</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${order.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>{order.status}</span>
                      </div>
                      {userRole === 'admin' && order.status !== OrderStatus.COMPLETED && (
                        <button 
                          onClick={() => onUpdateOrderStatus(order.id, OrderStatus.COMPLETED)} 
                          className="bg-green-600 hover:bg-green-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                          <Check className="w-5 h-5" /> Mark Completed
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {activeTab === 'settings' && userRole === 'admin' && (
                <div className="max-w-2xl mx-auto w-full space-y-12">
                   <h2 className="text-3xl font-bold text-white mb-8">Platform Settings</h2>
                   
                   {notification && (
                       <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                           <Check className="w-5 h-5" />
                           <span className="text-sm font-bold">{notification.message}</span>
                       </div>
                   )}

                   <div className="bg-slate-900 p-8 rounded-[32px] border border-slate-800 space-y-8">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] ml-1">Buy Rate (USD/DL)</label>
                            <input type="number" step="0.01" value={localRates.buyRate} onChange={e => setLocalRates({...localRates, buyRate: parseFloat(e.target.value)})} className="w-full bg-[#1e293b] border border-slate-700 p-4 rounded-2xl text-white outline-none focus:border-gt-gold" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] ml-1">Sell Rate (USD/DL)</label>
                            <input type="number" step="0.01" value={localRates.sellRate} onChange={e => setLocalRates({...localRates, sellRate: parseFloat(e.target.value)})} className="w-full bg-[#1e293b] border border-slate-700 p-4 rounded-2xl text-white outline-none focus:border-gt-gold" />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] ml-1 flex items-center gap-2">
                           <Globe className="w-3 h-3" /> Drop World Name (For Sellers)
                        </label>
                        <input 
                            type="text" 
                            value={localDropWorld} 
                            onChange={e => setLocalDropWorld(e.target.value)} 
                            placeholder="e.g. MARKET123"
                            className="w-full bg-[#1e293b] border border-slate-700 p-4 rounded-2xl text-white outline-none focus:border-gt-gold font-mono uppercase" 
                        />
                        <p className="text-[10px] text-slate-500 ml-1 font-medium italic">This is the world name users see when they start a "Sell to Us" order.</p>
                      </div>

                      <button onClick={handleSaveSettings} className="w-full bg-gt-gold text-slate-950 font-bold py-4.5 rounded-[18px] hover:bg-yellow-400 transition-all shadow-xl">
                        Update Core Settings
                      </button>
                   </div>
                </div>
            )}

            {activeTab === 'support' && userRole === 'admin' && (
                <div className="flex flex-col h-full animate-in fade-in duration-300">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-3xl font-bold text-white">Live Support Manager</h2>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Chat Status:</span>
                            <div className="bg-slate-800 px-3 py-1 rounded-full flex items-center gap-2 border border-slate-700">
                                <span className={`w-2 h-2 rounded-full ${isLiveSupport ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`}></span>
                                <span className="text-[10px] font-black uppercase text-slate-300">{isLiveSupport ? 'Live' : 'Auto-Bot Only'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 bg-slate-900 border border-slate-800 rounded-[32px] overflow-hidden flex flex-col shadow-2xl">
                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-950/20">
                            {chatMessages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.role === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%] flex flex-col ${msg.role === 'admin' ? 'items-end' : 'items-start'}`}>
                                        <div className="flex items-center gap-2 mb-1.5 px-1">
                                            {msg.role === 'model' && <Bot className="w-3 h-3 text-gt-gold" />}
                                            {msg.role === 'user' && <User className="w-3 h-3 text-blue-400" />}
                                            {msg.role === 'admin' && <Shield className="w-3 h-3 text-red-500" />}
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                                {msg.role === 'model' ? 'LockBot (AI)' : msg.role === 'admin' ? 'Support Agent' : 'User'}
                                            </span>
                                        </div>
                                        <div className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed ${
                                            msg.role === 'admin' 
                                            ? 'bg-red-500/10 text-white border border-red-500/20 rounded-tr-none' 
                                            : msg.role === 'model'
                                            ? 'bg-slate-800 text-slate-300 border border-slate-700 rounded-tl-none'
                                            : 'bg-blue-500/10 text-blue-100 border border-blue-500/20 rounded-tl-none font-medium'
                                        }`}>
                                            {msg.text}
                                        </div>
                                        <span className="text-[9px] text-slate-600 mt-1.5 font-bold">
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Reply Box */}
                        <div className="p-6 bg-slate-900 border-t border-slate-800">
                            <div className="relative group">
                                <textarea 
                                    value={adminReply}
                                    onChange={(e) => setAdminReply(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleAdminReply();
                                        }
                                    }}
                                    placeholder="Type your official response here... (Enter to send)"
                                    className="w-full bg-[#1a2332] border border-slate-700/50 p-5 rounded-2xl text-white outline-none focus:border-red-500/50 focus:ring-4 focus:ring-red-500/5 transition-all placeholder-slate-600 font-medium text-sm min-h-[100px] resize-none pr-20"
                                />
                                <button 
                                    onClick={handleAdminReply}
                                    disabled={!adminReply.trim()}
                                    className="absolute right-4 bottom-4 bg-red-600 text-white p-3 rounded-xl hover:bg-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="mt-3 flex items-center justify-between">
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Shift+Enter for new line</p>
                                <button 
                                    onClick={() => onToggleLiveSupport(!isLiveSupport)}
                                    className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${isLiveSupport ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'}`}
                                >
                                    {isLiveSupport ? <PowerOff className="w-3 h-3" /> : <Power className="w-3 h-3" />}
                                    {isLiveSupport ? 'Disable Live Chat' : 'Go Online'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;

