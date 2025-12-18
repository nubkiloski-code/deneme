
import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import TradeSection from './components/TradeSection';
import Footer from './components/Footer';
import SupportChat from './components/SupportChat';
import OrderList from './components/OrderList';
import AdminPanel from './components/AdminPanel';
import Calculator from './components/Calculator';
import { CryptoCurrency, Order, RateInfo, WalletConfig, OrderStatus, ChatMessage, EmailConfig, FirebaseConfig, UserAccount, TradeMode } from './types';
import { sendMessageToGemini } from './services/geminiService';
import { useWallet } from './hooks/useWallet';
import { initFirebase, saveMessageToFirestore, subscribeToMessages } from './services/firebaseService';

const INITIAL_RATES: RateInfo = {
  buyRate: 0.35,
  sellRate: 0.28
};

const INITIAL_WALLETS: WalletConfig = {
  [CryptoCurrency.BTC]: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  [CryptoCurrency.ETH]: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  [CryptoCurrency.LTC]: 'ltc1qrg5j89ur2e6r527589257924752985',
  [CryptoCurrency.USDT]: 'TVj7xAB4...xk9'
};

const INITIAL_EMAIL_CONFIG: EmailConfig = {
  serviceId: 'service_g3bcm7z',
  templateId: 'template_76o6k2v',
  publicKey: 'y2bjtNFeIqs8q5Lxv'
};

const INITIAL_FIREBASE_CONFIG: FirebaseConfig = {
  apiKey: "AIzaSyCSDhlXY2yBCJ1ATnwE7FVGVMlbQhLTv4I",
  authDomain: "nuub-fec74.firebaseapp.com",
  projectId: "nuub-fec74",
  storageBucket: "nuub-fec74.firebasestorage.app",
  messagingSenderId: "243668980624",
  appId: "1:243668980624:web:72669d1644dc4155d4d915"
};

const GlobalBackground = () => {
  const textString = "INSTANTDELIVERY";
  const marqueeContent = Array(40).fill(textString).join("");

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
       <div className="absolute inset-0 bg-gt-dark"></div>
       <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-gt-gold/5 rounded-full blur-[120px]" />
       <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]" />
       <div className="absolute inset-0 flex flex-col justify-center opacity-[0.03] select-none">
         <div className="w-full overflow-hidden mb-16">
           <div className="animate-marquee-reverse whitespace-nowrap text-[8rem] font-black text-white leading-none">
             {marqueeContent}
           </div>
         </div>
         <div className="w-full overflow-hidden mb-16">
           <div className="animate-marquee whitespace-nowrap text-[8rem] font-black text-transparent stroke-white stroke-2 leading-none" style={{ WebkitTextStroke: '2px white' }}>
             {marqueeContent}
           </div>
         </div>
         <div className="w-full overflow-hidden">
           <div className="animate-marquee-reverse whitespace-nowrap text-[8rem] font-black text-white leading-none">
             {marqueeContent}
           </div>
         </div>
       </div>
    </div>
  );
};

const usePersistedState = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [state, setState] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage`, error);
    }
  }, [key, state]);

  return [state, setState];
};

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'sell' | 'orders' | 'tools'>('home');
  const [pendingView, setPendingView] = useState<'home' | 'sell' | 'orders' | 'tools' | null>(null);

  const [rates, setRates] = usePersistedState<RateInfo>('nub_rates', INITIAL_RATES);
  const [wallets, setWallets] = usePersistedState<WalletConfig>('nub_wallets', INITIAL_WALLETS);
  const [dropWorldName, setDropWorldName] = usePersistedState<string>('nub_drop_world', 'MARKET123');
  const [emailConfig, setEmailConfig] = usePersistedState<EmailConfig>('nub_email_config', INITIAL_EMAIL_CONFIG);
  const [firebaseConfig, setFirebaseConfig] = usePersistedState<FirebaseConfig>('nub_firebase_config', INITIAL_FIREBASE_CONFIG);
  const [orders, setOrders] = usePersistedState<Order[]>('nub_orders', []);
  const [users, setUsers] = usePersistedState<UserAccount[]>('nub_users', []);
  
  // Chat state is now driven by Firebase
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isLiveSupport, setIsLiveSupport] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Generate a stable Session ID for guest users
  const sessionId = useMemo(() => {
    let id = sessionStorage.getItem('nub_session_id');
    if (!id) {
        id = 'sess_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('nub_session_id', id);
    }
    return id;
  }, []);

  const { userWalletAddress, connectWallet, disconnectWallet } = useWallet();
  const [showAdmin, setShowAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  // Initialize Firebase once
  useEffect(() => {
    if (firebaseConfig.apiKey) {
        initFirebase(firebaseConfig);
        const unsubscribe = subscribeToMessages((fetchedMessages) => {
            setMessages(fetchedMessages);
        });
        return () => unsubscribe();
    }
  }, [firebaseConfig]);

  // Determine current user context for the chat
  const chatUserId = currentUser ? currentUser.email : sessionId;
  const chatUserName = useMemo(() => {
      if (currentUser) return currentUser.username;
      
      // Calculate guest number based on existing unique sessions in message history
      const uniqueGuestSessions = Array.from(new Set(messages.filter(m => m.userId.startsWith('sess_')).map(m => m.userId)));
      const index = uniqueGuestSessions.indexOf(sessionId);
      const guestNum = index === -1 ? uniqueGuestSessions.length + 1 : index + 1;
      return `User${guestNum}`;
  }, [currentUser, messages, sessionId]);

  useEffect(() => {
    if (!emailConfig.serviceId || !emailConfig.templateId || !emailConfig.publicKey) {
      setEmailConfig(INITIAL_EMAIL_CONFIG);
    }
  }, []); 

  useEffect(() => {
    if (!firebaseConfig.apiKey && INITIAL_FIREBASE_CONFIG.apiKey) {
      setFirebaseConfig(INITIAL_FIREBASE_CONFIG);
    }
  }, []);

  const handleAdminSendMessage = async (text: string, targetUserId?: string) => {
    await saveMessageToFirestore({ 
      role: 'admin', 
      text, 
      timestamp: Date.now(),
      userId: targetUserId || 'global',
      userName: 'Admin'
    });
  };

  const handleOrderSubmit = (orderData: Partial<Order>) => {
    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      type: orderData.type!,
      amount: orderData.amount!,
      cryptoAmount: orderData.cryptoAmount!,
      currency: orderData.currency!,
      totalUSD: orderData.totalUSD!,
      growId: orderData.growId!,
      worldName: orderData.worldName!,
      userEmail: currentUser?.email,
      status: OrderStatus.PENDING,
      timestamp: Date.now(),
      txHash: orderData.txHash,
      payoutAddress: orderData.payoutAddress,
      isSafeMode: orderData.isSafeMode,
      isGuest: orderData.isGuest,
      destinations: orderData.destinations
    };
    setOrders(prev => [...prev, newOrder]);
    
    if (orderData.isGuest) {
      const alertText = `🚨 SYSTEM ALERT: New Guest Order #${newOrder.id} (${newOrder.amount} DLs - $${newOrder.totalUSD}). Check Orders tab.`;
      handleAdminSendMessage(alertText, 'system');
    }

    setCurrentView('orders');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => {
      const next = prev.map(o => {
        if (o.id === orderId) {
          const updated = { ...o, status };
          if (status === OrderStatus.COMPLETED) {
            updated.completedTimestamp = Date.now();
          }
          return updated;
        }
        return o;
      });
      return next;
    });

    if (status === OrderStatus.COMPLETED) {
        const order = orders.find(o => o.id === orderId);
        const targetUserId = order?.userEmail || sessionId;
        
        saveMessageToFirestore({
            role: 'model',
            text: `✅ Order #${orderId} completed! Our team has finalized your trade. Thank you for choosing Nub.market. We hope to see you again soon!`,
            timestamp: Date.now(),
            userId: targetUserId,
            userName: 'LockBot'
        });
        
        if (chatUserId === targetUserId) {
            setIsChatOpen(true);
        }
    }
  };

  const handleRegisterUser = (newUser: UserAccount) => {
    setUsers(prev => [...prev, newUser]);
  };

  const handleUserSendMessage = async (text: string) => {
    const userMsg = { 
        role: 'user' as const, 
        text, 
        timestamp: Date.now(),
        userId: chatUserId,
        userName: chatUserName
    };
    await saveMessageToFirestore(userMsg);

    if (isLiveSupport) return;

    setIsChatLoading(true);
    const history = messages.filter(m => m.userId === chatUserId).slice(-5).map(m => `${m.role}: ${m.text}`);
    const responseText = await sendMessageToGemini(text, history, rates);
    
    await saveMessageToFirestore({ 
        role: 'model', 
        text: responseText, 
        timestamp: Date.now(),
        userId: chatUserId,
        userName: 'LockBot'
    });
    setIsChatLoading(false);
  };

  const userFilteredOrders = useMemo(() => {
    if (!currentUser) return [];
    return orders.filter(o => o.userEmail === currentUser.email);
  }, [orders, currentUser]);

  const currentUserMessages = useMemo(() => {
      return messages.filter(m => m.userId === chatUserId || m.userId === 'system' || m.userId === 'global');
  }, [messages, chatUserId]);

  return (
    <div className="min-h-screen flex flex-col relative">
      <GlobalBackground />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar 
          onAdminClick={() => setShowAdmin(true)} 
          userWalletAddress={userWalletAddress}
          onConnect={connectWallet}
          onDisconnect={disconnectWallet}
          currentUser={currentUser}
          onLogout={() => setCurrentUser(null)}
          onNavigate={(view) => {
            if (view === 'orders' && !currentUser) {
              setPendingView('orders');
              setShowAdmin(true);
            } else {
              setCurrentView(view);
            }
          }}
          currentView={currentView}
        />
        
        <main className="flex-grow">
          {(currentView === 'home' || currentView === 'sell') && (
            <>
              <Hero />
              <TradeSection 
                rates={rates} 
                wallets={wallets} 
                dropWorldName={dropWorldName}
                userWalletAddress={userWalletAddress}
                onOrderSubmit={handleOrderSubmit} 
                isLoggedIn={!!currentUser}
                onRequestLogin={() => setShowAdmin(true)}
                onOpenSupport={() => setIsChatOpen(true)}
                initialMode={currentView === 'sell' ? TradeMode.SELL : TradeMode.BUY}
              />
            </>
          )}
          {currentView === 'orders' && <OrderList orders={userFilteredOrders} />}
          {currentView === 'tools' && <Calculator />}
        </main>
        
        <Footer />
      </div>
      
      <SupportChat 
        messages={currentUserMessages} 
        onSendMessage={handleUserSendMessage}
        isLoading={isChatLoading}
        externalOpen={isChatOpen}
        setExternalOpen={setIsChatOpen}
      />

      {showAdmin && (
        <AdminPanel 
          orders={orders}
          rates={rates}
          wallets={wallets}
          dropWorldName={dropWorldName}
          onUpdateDropWorldName={setDropWorldName}
          emailConfig={emailConfig}
          firebaseConfig={firebaseConfig}
          chatMessages={messages}
          isLiveSupport={isLiveSupport}
          users={users}
          currentUser={currentUser}
          onRegisterUser={handleRegisterUser}
          onUpdateRates={setRates}
          onUpdateWallets={setWallets}
          onUpdateEmailConfig={setEmailConfig}
          onUpdateFirebaseConfig={setFirebaseConfig}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onAdminSendMessage={handleAdminSendMessage}
          onToggleLiveSupport={setIsLiveSupport}
          onClose={() => setShowAdmin(false)}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            setShowAdmin(false);
            if (pendingView) {
              setCurrentView(pendingView);
              setPendingView(null);
            }
          }}
          onLogout={() => setCurrentUser(null)}
        />
      )}
    </div>
  );
}

export default App;

