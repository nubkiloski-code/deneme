import React, { useState, useRef, useEffect } from 'react';
import { Order, OrderStatus, RateInfo, WalletConfig, CryptoCurrency, ChatMessage, EmailConfig, FirebaseConfig, UserAccount } from '../types';
import { Settings, MessageSquare, ShoppingCart, Save, Check, X, Shield, RefreshCw, LogIn, UserPlus, Lock, Power, PowerOff, User, Mail, ArrowRight, LogOut, Loader2, RotateCcw, FileCode, Flame, ArrowLeft } from 'lucide-react';
import emailjs from '@emailjs/browser';

interface AdminPanelProps {
  orders: Order[];
  rates: RateInfo;
  wallets: WalletConfig;
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

const RECOMMENDED_EMAIL_TEMPLATE = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nub.market Verification</title>
    <style>
        body { margin: 0; padding: 0; min-width: 100%; background-color: #0f172a; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #0f172a; padding-bottom: 40px; }
        .content { background-color: #1e293b; margin: 0 auto; width: 100%; max-width: 600px; border-radius: 16px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5); }
        .header { background-color: #0f172a; padding: 40px; text-align: center; border-bottom: 1px solid #334155; }
        .body { padding: 40px; color: #e2e8f0; line-height: 1.6; }
        .code-box { background-color: #020617; border: 1px solid #334155; border-radius: 16px; padding: 30px; text-align: center; margin: 30px 0; box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.3); }
        .code-text { color: #FFD700; font-size: 48px; font-weight: 900; letter-spacing: 12px; font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; text-shadow: 0 4px 8px rgba(255, 215, 0, 0.2); }
        .footer { padding: 30px; background-color: #0f172a; text-align: center; color: #64748b; font-size: 12px; border-top: 1px solid #334155; }
        .logo-text { font-size: 28px; font-weight: 800; color: #ffffff; text-decoration: none; letter-spacing: -1px; }
        .logo-accent { color: #FFD700; }
        a { color: #FFD700; text-decoration: none; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="wrapper">
        <br><br>
        <table class="content" align="center" cellpadding="0" cellspacing="0" border="0">
            <tr>
                <td class="header">
                    <a href="#" class="logo-text">
                        Nub.<span class="logo-accent">market</span>
                    </a>
                </td>
            </tr>
            <tr>
                <td class="body">
                    <h2 style="color: #ffffff; margin-top: 0; font-size: 24px; font-weight: 700;">Verify Your Account</h2>
                    <p style="color: #cbd5e1; font-size: 16px;">Hello Trader,</p>
                    <p style="color: #cbd5e1; font-size: 16px;">Welcome to the safest marketplace for Growtopia Diamond Locks. Use the code below to complete your registration.</p>
                    
                    <div class="code-box">
                        <p style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; margin-top: 0; margin-bottom: 15px;">Verification Code</p>
                        <p class="code-text">{{code}}</p>
                    </div>

                    <p style="font-size: 14px; color: #94a3b8; background-color: rgba(239, 68, 68, 0.1); padding: 15px; border-radius: 8px; border-left: 4px solid #ef4444;">
                        <strong style="color: #ef4444;">Security Notice:</strong><br>
                        This code expires in 15 minutes. Never share this code with anyone. Nub.market staff will never ask for your password.
                    </p>
                </td>
            </tr>
            <tr>
                <td class="footer">
                    <p>&copy; 2024 Nub.market. All rights reserved.</p>
                    <p>
                        <a href="#">Help Center</a> • <a href="#">Privacy Policy</a>
                    </p>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>`;

const AdminPanel: React.FC<AdminPanelProps> = ({
  orders,
  rates,
  wallets,
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
  
  // Auth Inputs
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState(''); // Store the server-side code
  
  const [error, setError] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [notification, setNotification] = useState<{title: string, message: string} | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  // Dashboard State
  const [activeTab, setActiveTab] = useState<'orders' | 'settings' | 'support'>('orders');
  const [localRates, setLocalRates] = useState(rates);
  const [localWallets, setLocalWallets] = useState(wallets);
  const [localEmailConfig, setLocalEmailConfig] = useState(emailConfig);
  const [localFirebaseConfig, setLocalFirebaseConfig] = useState(firebaseConfig);
  const [adminChatInput, setAdminChatInput] = useState('');
  const [walletValidationErrors, setWalletValidationErrors] = useState<Record<string, string>>({});

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If Admin enters with specific credentials, elevate role
    if (email === 'admin@nub.market' && userRole === 'admin') {
         // Keep admin
    } else if (currentUser) {
        setUserRole('user');
        setUsername(currentUser.username);
        setEmail(currentUser.email);
    } else {
        setUserRole('guest');
    }
  }, [currentUser]);

  useEffect(() => {
    if (activeTab === 'support' && userRole === 'admin') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab, userRole]);

  useEffect(() => {
    if (notification) {
      // Longer timeout for error messages so user can read them
      const timeout = notification.title.includes('Error') || notification.title.includes('Blocked') ? 10000 : 5000;
      const timer = setTimeout(() => setNotification(null), timeout);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Sync props to local state when they change (e.g. from local storage load)
  useEffect(() => {
    setLocalRates(rates);
    setLocalWallets(wallets);
    setLocalEmailConfig(emailConfig);
    setLocalFirebaseConfig(firebaseConfig);
  }, [rates, wallets, emailConfig, firebaseConfig]);

  // --- Auth Handlers ---

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.toLowerCase() === 'admin@nub.market' && password === 'admin123') {
      setUserRole('admin');
      setError('');
    } else {
      // Check for user in the persisted users array
      const existingUser = users.find(u => u.email === email && u.password === password);
      
      if (existingUser) {
        setUserRole('user');
        setUsername(existingUser.username);
        setError('');
        onLoginSuccess(existingUser);
      } else {
        // Specifically requested error message
        setError('Wrong mail or password try again');
      }
    }
  };

  const sendVerificationEmail = async (targetEmail: string) => {
    setIsSendingEmail(true);
    setError('');
    setResendTimer(30); // 30s cooldown
    
    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);

    // Get keys from props (which come from App state/LocalStorage)
    // Trim them to ensure no whitespace issues
    const serviceId = emailConfig.serviceId?.trim();
    const templateId = emailConfig.templateId?.trim();
    const publicKey = emailConfig.publicKey?.trim();

    try {
      if (!serviceId || !templateId || !publicKey) {
        throw new Error("MISSING_KEYS");
      }
      
      // Initialize if needed (though we use send directly, init helps some blockers)
      if (emailjs) {
          try { emailjs.init({ publicKey }); } catch(e) {}
      } else {
        throw new Error("LIBRARY_ERROR");
      }

      // We send the email using multiple parameter keys (to_email, email, reply_to)
      // because EmailJS templates can be configured to look for different variable names
      // for the recipient. This ensures compatibility.
      const templateParams = {
        to_email: targetEmail,
        email: targetEmail,
        reply_to: targetEmail,
        user_email: targetEmail,
        to_name: username || 'Trader',
        code: code,
        message: `Your verification code is: ${code}`
      };

      // Attempt to send email
      try {
        // v4 syntax: send(serviceID, templateID, params, publicKey)
        await emailjs.send(serviceId, templateId, templateParams, publicKey);
        
        setNotification({
          title: 'Email Sent',
          message: `A verification code has been sent to ${targetEmail}`
        });
      } catch (innerErr: any) {
        // Handle Network/Fetch Errors gracefully so user can still proceed
        if (innerErr.message === 'Failed to fetch' || (innerErr.text && innerErr.text.includes('fetch'))) {
          console.warn('EmailJS Network Error (Blocked by AdBlock or Network). Falling back to manual code display.');
          setNotification({
            title: 'Email Network Blocked',
            message: `Your network blocked the email. FOR TESTING: Your code is ${code}`
          });
          // We return normally here, effectively "bypassing" the crash so the flow continues
          return code;
        }
        
        // Re-throw other errors (like invalid keys) to be caught by outer block
        throw innerErr;
      }
      
    } catch (err: any) {
      console.error("Email send failed:", err);
      
      let errorTitle = 'Email Failed';
      let errorMessage = 'Unknown error occurred.';

      if (err.message === 'MISSING_KEYS') {
        errorTitle = 'Setup Required';
        errorMessage = 'Admin: Please configure EmailJS keys in Settings tab.';
      } else if (err.message === 'LIBRARY_ERROR') {
        errorMessage = 'EmailJS library failed to load. Check your internet connection.';
      } else if (err.text) {
        // Actual EmailJS error message
        errorMessage = `Provider Error: ${err.text}`;
      } else if (err.message) {
        errorMessage = err.message;
      } else {
        try {
           errorMessage = JSON.stringify(err);
        } catch {
           errorMessage = "Check console for details.";
        }
      }

      setNotification({
        title: errorTitle,
        message: errorMessage
      });

      // Stop the flow if it was a configuration error
      throw new Error(errorMessage);
    } finally {
      setIsSendingEmail(false);
    }
    
    return code;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password) {
      setError('All fields are required.');
      return;
    }

    // Check if email already exists
    if (users.some(u => u.email === email)) {
      setError('This email is already registered.');
      return;
    }

    setError('');
    
    try {
      await sendVerificationEmail(email);
      setAuthMode('verify');
    } catch (err: any) {
      // If the inner function successfully handled a network block and returned, 
      // the outer catch won't trigger. 
      // If we are here, it means a real hard error occurred (like missing keys).
      console.log("Registration stopped due to error.");
    }
  };

  const handleResendCode = async () => {
    try {
      await sendVerificationEmail(email);
      setVerificationCode('');
      setError('');
    } catch(err) {
      // Error handled in notification
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode !== generatedCode) {
      setError('Invalid verification code.');
      return;
    }
    // Success - Save the new user
    const newUser: UserAccount = {
      username,
      email,
      password,
      createdAt: Date.now()
    };
    onRegisterUser(newUser);

    setError('');
    setNotification(null);
    setUserRole('user');
    onLoginSuccess(newUser);
  };

  const handleLogout = () => {
    setUserRole('guest');
    setAuthMode('login');
    setUsername('');
    setEmail('');
    setPassword('');
    setVerificationCode('');
    setGeneratedCode('');
    setNotification(null);
    onLogout();
  };

  // --- Admin Logic ---

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(RECOMMENDED_EMAIL_TEMPLATE);
    setNotification({
      title: 'Template Copied',
      message: 'Paste this HTML into your EmailJS Template "Source Code" view.'
    });
  };

  // Wallet Validation Logic
  const validateWalletAddress = (crypto: CryptoCurrency, address: string): string => {
    const trimmed = address.trim();
    if (!trimmed) return 'Address cannot be empty';
    
    switch (crypto) {
      case CryptoCurrency.BTC:
        // Matches Legacy (1...), P2SH (3...), and Bech32 (bc1...)
        if (!/^(1|3|bc1)[a-zA-HJ-NP-Z0-9]{25,62}$/.test(trimmed)) 
          return 'Invalid BTC address (must start with 1, 3, or bc1)';
        break;
      case CryptoCurrency.ETH:
        // ETH addresses match 0x followed by 40 hex chars
        if (!/^0x[a-fA-F0-9]{40}$/.test(trimmed)) 
          return 'Invalid ETH address (must start with 0x, 42 chars)';
        break;
      case CryptoCurrency.LTC:
        // LTC addresses start with L, M, 3 or ltc1
        if (!/^([LM3][a-km-zA-HJ-NP-Z1-9]{26,33}|ltc1[a-z0-9]{39,59})$/.test(trimmed)) 
          return 'Invalid LTC address (must start with L, M, 3 or ltc1)';
        break;
      case CryptoCurrency.USDT:
        // TRC20 addresses start with T and are usually 34 chars
        if (!/^T[A-Za-z1-9]{33}$/.test(trimmed)) 
          return 'Invalid TRC20 address (must start with T, 34 chars)';
        break;
    }
    return '';
  };

  const handleWalletChange = (crypto: CryptoCurrency, value: string) => {
      setLocalWallets(prev => ({...prev, [crypto]: value}));
      setWalletValidationErrors(prev => ({
          ...prev,
          [crypto]: validateWalletAddress(crypto, value)
      }));
  };

  const handleSaveSettings = () => {
    // Validate wallets before saving
    const newWalletErrors: Record<string, string> = {};
    let hasWalletErrors = false;
    
    (Object.keys(localWallets) as CryptoCurrency[]).forEach(crypto => {
        const error = validateWalletAddress(crypto, localWallets[crypto]);
        if (error) {
            newWalletErrors[crypto] = error;
            hasWalletErrors = true;
        }
    });
    
    setWalletValidationErrors(newWalletErrors);
    
    if (hasWalletErrors) {
        setNotification({ 
            title: 'Validation Error', 
            message: 'Please fix invalid wallet addresses before saving.' 
        });
        return;
    }

    // Trim values before saving to prevent copy-paste errors
    onUpdateRates(localRates);
    onUpdateWallets(localWallets);
    onUpdateEmailConfig({
      serviceId: localEmailConfig.serviceId.trim(),
      templateId: localEmailConfig.templateId.trim(),
      publicKey: localEmailConfig.publicKey.trim(),
    });
    onUpdateFirebaseConfig({
        apiKey: localFirebaseConfig.apiKey.trim(),
        authDomain: localFirebaseConfig.authDomain.trim(),
        projectId: localFirebaseConfig.projectId.trim(),
        storageBucket: localFirebaseConfig.storageBucket.trim(),
        messagingSenderId: localFirebaseConfig.messagingSenderId.trim(),
        appId: localFirebaseConfig.appId.trim(),
    });

    const btn = document.getElementById('save-btn');
    if (btn) {
      const originalText = btn.innerHTML;
      btn.innerHTML = `<span class="flex items-center gap-2"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Saved!</span>`;
      btn.classList.remove('bg-gt-gold', 'text-black');
      btn.classList.add('bg-green-500', 'text-white');
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.classList.add('bg-gt-gold', 'text-black');
        btn.classList.remove('bg-green-500', 'text-white');
      }, 2000);
    }
  };

  const handleSendChat = () => {
    if(!adminChatInput.trim()) return;
    onAdminSendMessage(adminChatInput);
    setAdminChatInput('');
  };

  // --- Render Views ---

  // 1. AUTH SCREEN
  if (userRole === 'guest') {
    return (
      <div className="fixed inset-0 z-[60] bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-500">
        
        {/* Back Arrow (Home) */}
        <button 
            onClick={onClose}
            className="absolute top-6 left-6 p-3 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all z-50 group border border-slate-700/50"
            title="Return Home"
        >
            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
        </button>

        {/* Toast Notification */}
        {notification && (
          <div 
            onClick={() => setNotification(null)}
            className={`fixed top-4 right-4 md:right-auto md:left-1/2 md:-translate-x-1/2 p-4 rounded-xl shadow-2xl border-l-4 max-w-sm w-full animate-in slide-in-from-top-10 duration-500 z-[70] cursor-pointer
              ${notification.title.includes('Error') || notification.title.includes('Failed') ? 'bg-white text-slate-900 border-red-500' : 'bg-white text-slate-900 border-blue-500'}
            `}
          >
            <div className="flex items-start gap-3">
               <div className={`p-2 rounded-full ${notification.title.includes('Error') ? 'bg-red-100' : 'bg-blue-100'}`}>
                 {notification.title.includes('Error') ? <X className="w-5 h-5 text-red-600" /> : <Mail className="w-5 h-5 text-blue-600" />}
               </div>
               <div>
                 <h4 className="font-bold text-sm">{notification.title}</h4>
                 <p className="text-sm text-slate-600 mt-1 break-words leading-snug">{notification.message}</p>
               </div>
               <button className="text-slate-400 hover:text-slate-600 ml-auto">
                 <X className="w-4 h-4" />
               </button>
            </div>
          </div>
        )}

        <div className="bg-gt-card w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-500 ease-out">
          
          {/* Tabs (Only visible if not verifying) */}
          {authMode !== 'verify' && (
            <div className="grid grid-cols-2 border-b border-slate-700">
              <button
                onClick={() => { setAuthMode('login'); setError(''); }}
                className={`py-4 text-sm font-bold transition-colors ${authMode === 'login' ? 'bg-gt-gold text-black' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
              >
                Log In
              </button>
              <button
                onClick={() => { setAuthMode('register'); setError(''); }}
                className={`py-4 text-sm font-bold transition-colors ${authMode === 'register' ? 'bg-gt-gold text-black' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
              >
                Create Account
              </button>
            </div>
          )}

          <div className="p-8">
            {/* Verification Header */}
            {authMode === 'verify' ? (
               <div className="text-center mb-8">
                  <div className="bg-blue-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <Mail className="w-8 h-8 text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
                  <p className="text-slate-400 text-sm">
                    We sent a verification code to <br/><span className="text-white font-bold">{email}</span>
                  </p>
               </div>
            ) : (
              <div className="text-center mb-6">
                <div className="bg-gt-gold/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-gt-gold" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {authMode === 'login' ? 'Welcome Back' : 'Join Nub.market'}
                </h2>
                <p className="text-slate-400 text-sm">
                  {authMode === 'login' 
                    ? 'Access your trading dashboard.' 
                    : 'Create a secure account to start trading.'}
                </p>
              </div>
            )}

            {/* ERROR MESSAGE (Inline) */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg text-center flex items-center justify-center gap-2 mb-4 animate-pulse">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                {error}
              </div>
            )}

            {/* VERIFICATION FORM */}
            {authMode === 'verify' ? (
              <form onSubmit={handleVerify} className="space-y-6">
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-2 text-center">Enter 6-Digit Code</label>
                   <input 
                      type="text" 
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0,6))}
                      className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-4 text-white text-center text-3xl tracking-[0.5em] font-mono focus:border-gt-gold outline-none transition-colors"
                      placeholder="······"
                      maxLength={6}
                      autoFocus
                    />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-gt-gold text-black font-bold py-3 rounded-xl hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-yellow-900/20"
                >
                  Verify Account <ArrowRight className="w-5 h-5" />
                </button>
                <div className="flex justify-between items-center px-2">
                   <button type="button" onClick={() => setAuthMode('register')} className="text-slate-500 text-xs hover:text-white">
                     Wrong email?
                   </button>
                   <button 
                    type="button" 
                    onClick={handleResendCode} 
                    disabled={isSendingEmail || resendTimer > 0} 
                    className="text-blue-400 text-xs hover:text-blue-300 flex items-center gap-1 disabled:opacity-50"
                   >
                     {isSendingEmail ? 'Sending...' : resendTimer > 0 ? `Resend in ${resendTimer}s` : <><RotateCcw className="w-3 h-3" /> Resend Code</>}
                   </button>
                </div>
              </form>
            ) : (
              /* LOGIN / REGISTER FORM */
              <div className="space-y-4">
                <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="space-y-4">
                  {authMode === 'register' && (
                    <div className="animate-in slide-in-from-top-2 fade-in">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Account Username</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input 
                          type="text" 
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-600 rounded-xl pl-10 pr-4 py-3 text-white focus:border-gt-gold outline-none transition-colors"
                          placeholder="Choose a username"
                          required={authMode === 'register'}
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-600 rounded-xl pl-10 pr-4 py-3 text-white focus:border-gt-gold outline-none transition-colors"
                        placeholder="name@gmail.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
                    <div className="relative">
                       <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                       <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-600 rounded-xl pl-10 pr-4 py-3 text-white focus:border-gt-gold outline-none transition-colors"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isSendingEmail}
                    className="w-full bg-gt-gold text-black font-bold py-3 rounded-xl hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-yellow-900/20 disabled:opacity-50 disabled:cursor-wait"
                  >
                    {isSendingEmail ? (
                       <>
                         <Loader2 className="w-5 h-5 animate-spin" /> Sending Email...
                       </>
                    ) : (
                       <>
                         {authMode === 'login' ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                         {authMode === 'login' ? 'Sign In' : 'Create Account'}
                       </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 2. USER DASHBOARD
  if (userRole === 'user') {
    return (
      <div className="fixed inset-0 z-[60] bg-slate-900 text-white flex flex-col animate-in fade-in duration-200">
        <div className="bg-slate-800 border-b border-slate-700 p-4 flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-3">
            <div className="bg-gt-gold/20 p-2 rounded-lg">
               <User className="text-gt-gold w-6 h-6" />
            </div>
            <div>
               <h1 className="text-xl font-bold">My Account</h1>
               <p className="text-xs text-slate-400">User Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400 hidden md:block">
              {username || email}
            </span>
             <button onClick={handleLogout} className="p-2 hover:bg-slate-700 rounded-lg text-red-400 hover:text-red-300" title="Sign Out">
               <LogOut className="w-5 h-5" />
             </button>
             <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white group">
              <X className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-900">
           <div className="max-w-4xl mx-auto">
             <div className="flex items-center justify-between mb-6">
               <h2 className="text-2xl font-bold flex items-center gap-2">
                 <ShoppingCart className="w-6 h-6 text-gt-gold" /> My Order History
               </h2>
               <button onClick={onClose} className="text-sm bg-gt-gold text-black px-4 py-2 rounded-lg font-bold hover:bg-yellow-400">
                 Start New Trade
               </button>
             </div>

             <div className="grid gap-4">
                {orders.length === 0 ? (
                  <div className="bg-slate-800 rounded-xl p-12 text-center border border-slate-700 border-dashed">
                    <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                       <ShoppingCart className="w-8 h-8 text-slate-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No Orders Yet</h3>
                    <p className="text-slate-400 mb-6">You haven't placed any orders with this account yet.</p>
                  </div>
                ) : (
                  orders.slice().reverse().map(order => (
                    <div key={order.id} className="bg-slate-800 rounded-xl p-6 border border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4 hover:border-slate-600 transition-colors">
                       <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                             <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${order.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                               {order.status}
                             </span>
                             <span className="text-xs text-slate-500 font-mono">#{order.id}</span>
                             <span className="text-xs text-slate-500">• {new Date(order.timestamp).toLocaleDateString()}</span>
                             {order.status === OrderStatus.COMPLETED && order.completedTimestamp && (
                                <span className="text-[10px] text-green-400 font-mono bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20 flex items-center gap-1">
                                    <Check className="w-3 h-3" /> {new Date(order.completedTimestamp).toLocaleString()}
                                </span>
                             )}
                          </div>
                          <div className="flex items-baseline gap-2">
                             <span className={`font-bold ${order.type === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                               {order.type}
                             </span>
                             <span className="text-2xl font-bold text-white">{order.amount} DLs</span>
                             <span className="text-slate-400 text-sm">for {order.cryptoAmount} {order.currency}</span>
                          </div>
                          {order.isSafeMode && (
                             <div className="text-xs text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded mt-2 inline-flex items-center gap-1">
                                <Shield className="w-3 h-3" /> Safe Mode: Split Delivery
                             </div>
                          )}
                       </div>
                       <div className="text-right flex flex-col items-end gap-1">
                          <div className="font-mono text-xl text-slate-300">${order.totalUSD}</div>
                          {order.txHash && <div className="text-[10px] text-slate-500 font-mono max-w-[150px] truncate">TX: {order.txHash}</div>}
                       </div>
                    </div>
                  ))
                )}
             </div>
           </div>
        </div>
      </div>
    );
  }

  // 3. ADMIN DASHBOARD
  return (
    <div className="fixed inset-0 z-[60] bg-slate-900 text-white flex flex-col animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <div className="bg-red-500/20 p-2 rounded-lg">
            <Shield className="text-red-500 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Admin Control Panel</h1>
            <p className="text-xs text-slate-400">Nub.market System Administration</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-slate-400 hidden md:block">
            Logged in as <span className="text-white font-bold">{email}</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white group">
            <X className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-slate-800 border-r border-slate-700 p-4 flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${activeTab === 'orders' ? 'bg-gt-gold text-black font-bold' : 'hover:bg-slate-700 text-slate-300'}`}
          >
            <ShoppingCart className="w-5 h-5" /> Orders
            {orders.some(o => o.status === OrderStatus.PENDING || o.status === OrderStatus.PAID) && (
               <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">!</span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${activeTab === 'settings' ? 'bg-gt-gold text-black font-bold' : 'hover:bg-slate-700 text-slate-300'}`}
          >
            <Settings className="w-5 h-5" /> Settings
          </button>
          <button 
            onClick={() => setActiveTab('support')}
            className={`flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${activeTab === 'support' ? 'bg-gt-gold text-black font-bold' : 'hover:bg-slate-700 text-slate-300'}`}
          >
            <MessageSquare className="w-5 h-5" /> Chat Support
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-900">
          
          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-4">Manage Orders</h2>
              <div className="grid gap-4">
                {orders.length === 0 ? (
                  <div className="text-slate-500 text-center py-20 bg-slate-800/30 rounded-xl border border-slate-700 border-dashed">No active orders found.</div>
                ) : (
                  orders.slice().reverse().map(order => (
                    <div key={order.id} className="bg-slate-800 rounded-xl p-6 border border-slate-700 flex flex-col lg:flex-row gap-6 shadow-sm hover:border-slate-600 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded">{order.id}</span>
                          <span className="text-xs text-slate-400">{new Date(order.timestamp).toLocaleString()}</span>
                          {order.status === OrderStatus.COMPLETED && order.completedTimestamp && (
                            <span className="text-[10px] text-green-400 font-mono bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20 flex items-center gap-1">
                                <Check className="w-3 h-3" /> Completed: {new Date(order.completedTimestamp).toLocaleString()}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mb-4">
                           <span className={`font-bold px-3 py-1 rounded text-sm ${order.type === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                             {order.type}
                           </span>
                           <span className="text-xl font-bold">{order.amount} DLs</span>
                           <span className="text-slate-400">→</span>
                           <span className="font-mono text-yellow-400">{order.cryptoAmount} {order.currency}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-slate-300">
                          {order.isSafeMode ? (
                             <div className="col-span-2 bg-slate-700/50 p-3 rounded border border-slate-600">
                               <div className="text-xs text-blue-300 font-bold mb-2 uppercase flex items-center gap-2">
                                 <Shield className="w-3 h-3" /> Safe Mode: 5 Destinations
                               </div>
                               {order.destinations?.map((d, idx) => (
                                 <div key={idx} className="grid grid-cols-2 text-xs border-b border-slate-600/50 last:border-0 py-1.5">
                                   <span>{d.worldName || '-'}</span>
                                   <span className="text-right text-gt-gold font-mono">{d.growId || '-'}</span>
                                 </div>
                               ))}
                             </div>
                          ) : (
                            <>
                              <div className="bg-slate-700/30 p-2 rounded"><span className="text-slate-500 text-xs block uppercase">GrowID</span> {order.growId}</div>
                              <div className="bg-slate-700/30 p-2 rounded"><span className="text-slate-500 text-xs block uppercase">World</span> {order.worldName}</div>
                            </>
                          )}
                          {order.txHash && <div className="col-span-2 break-all bg-slate-900 p-2 rounded font-mono text-xs text-slate-400"><span className="text-slate-600 select-none mr-2">TXID:</span>{order.txHash}</div>}
                          {order.payoutAddress && <div className="col-span-2 break-all bg-slate-900 p-2 rounded font-mono text-xs text-slate-400"><span className="text-slate-600 select-none mr-2">PAYOUT:</span>{order.payoutAddress}</div>}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 justify-center border-l border-slate-700 pl-6 min-w-[200px]">
                        <div className="text-sm font-bold text-slate-400 mb-2">Current Status: <span className={`text-white px-2 py-0.5 rounded ${order.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' : 'bg-slate-700'}`}>{order.status}</span></div>
                        {order.status !== OrderStatus.COMPLETED && order.status !== OrderStatus.CANCELLED && (
                          <>
                            <button 
                              onClick={() => onUpdateOrderStatus(order.id, OrderStatus.COMPLETED)}
                              className="bg-green-600 hover:bg-green-500 text-white py-2 px-4 rounded-lg text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-900/20"
                            >
                              <Check className="w-4 h-4" /> Complete Order
                            </button>
                            <button 
                              onClick={() => onUpdateOrderStatus(order.id, OrderStatus.CANCELLED)}
                              className="bg-red-600 hover:bg-red-500 text-white py-2 px-4 rounded-lg text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-900/20"
                            >
                              <X className="w-4 h-4" /> Cancel Order
                            </button>
                          </>
                        )}
                        {order.status === OrderStatus.COMPLETED && (
                          <div className="text-green-500 font-bold flex items-center gap-2 bg-green-500/10 p-3 rounded-lg justify-center border border-green-500/20">
                            <Check className="w-5 h-5" /> Completed
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="space-y-8 max-w-2xl">
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <RefreshCw className="w-6 h-6 text-gt-gold" /> Global Rates (USD)
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2 font-bold">Buy Price (User buys DL)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                      <input 
                        type="number" 
                        step="0.01"
                        value={localRates.buyRate}
                        onChange={e => setLocalRates({...localRates, buyRate: parseFloat(e.target.value)})}
                        className="w-full bg-slate-900 border border-slate-600 rounded-xl py-3 pl-8 pr-3 text-white focus:border-gt-gold outline-none font-mono text-lg"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Price visible on main page immediately after saving.</p>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2 font-bold">Sell Price (User sells DL)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                      <input 
                        type="number" 
                        step="0.01"
                        value={localRates.sellRate}
                        onChange={e => setLocalRates({...localRates, sellRate: parseFloat(e.target.value)})}
                        className="w-full bg-slate-900 border border-slate-600 rounded-xl py-3 pl-8 pr-3 text-white focus:border-gt-gold outline-none font-mono text-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                   <Settings className="w-6 h-6 text-gt-gold" /> Wallet Addresses
                </h2>
                <div className="space-y-4">
                  {(Object.keys(localWallets) as CryptoCurrency[]).map(crypto => (
                    <div key={crypto}>
                      <label className="block text-sm text-slate-400 mb-1 font-bold">{crypto}</label>
                      <input 
                        type="text"
                        value={localWallets[crypto]}
                        onChange={e => handleWalletChange(crypto, e.target.value)}
                        className={`w-full bg-slate-900 border rounded-lg px-4 py-2 text-white text-sm font-mono outline-none ${walletValidationErrors[crypto] ? 'border-red-500 focus:border-red-500' : 'border-slate-600 focus:border-gt-gold'}`}
                      />
                      {walletValidationErrors[crypto] && (
                        <p className="text-red-400 text-xs mt-1">{walletValidationErrors[crypto]}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Email Service Configuration */}
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                     <Mail className="w-6 h-6 text-blue-400" /> Email Service (EmailJS)
                  </h2>
                  <button 
                    onClick={handleCopyTemplate}
                    className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <FileCode className="w-3 h-3" /> Copy HTML Template
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded text-xs text-blue-300 mb-4">
                     <strong>Important:</strong> Your EmailJS template message must include the variable <code className="bg-black/30 px-1 rounded text-white">{`{{code}}`}</code>. Use the "Copy HTML Template" button above to get the new design.
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1 font-bold">Service ID</label>
                    <input 
                      type="text"
                      value={localEmailConfig.serviceId}
                      onChange={e => setLocalEmailConfig({...localEmailConfig, serviceId: e.target.value.trim()})}
                      placeholder="service_xxxxx"
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm font-mono focus:border-gt-gold outline-none"
                    />
                    <p className="text-[10px] text-slate-500 mt-1 pl-1">Found in: Dashboard &rarr; Email Services &rarr; Service ID</p>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1 font-bold">Template ID</label>
                    <input 
                      type="text"
                      value={localEmailConfig.templateId}
                      onChange={e => setLocalEmailConfig({...localEmailConfig, templateId: e.target.value.trim()})}
                      placeholder="template_xxxxx"
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm font-mono focus:border-gt-gold outline-none"
                    />
                     <p className="text-[10px] text-slate-500 mt-1 pl-1">Found in: Dashboard &rarr; Email Templates &rarr; Settings &rarr; Template ID</p>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1 font-bold">Public Key</label>
                    <input 
                      type="text"
                      value={localEmailConfig.publicKey}
                      onChange={e => setLocalEmailConfig({...localEmailConfig, publicKey: e.target.value.trim()})}
                      placeholder="user_xxxxx"
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm font-mono focus:border-gt-gold outline-none"
                    />
                     <p className="text-[10px] text-slate-500 mt-1 pl-1">Found in: Dashboard &rarr; Account (Top Right) &rarr; Public Key</p>
                  </div>
                </div>
              </div>

               {/* Firebase Service Configuration */}
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                     <Flame className="w-6 h-6 text-orange-500" /> Google Login (Firebase)
                  </h2>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-orange-500/10 border border-orange-500/20 p-3 rounded text-xs text-orange-300 mb-4">
                     <strong>Instructions:</strong> Go to Firebase Console &rarr; Project Settings. Copy the config values for your Web App.
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1 font-bold">API Key</label>
                    <input 
                      type="text"
                      value={localFirebaseConfig.apiKey}
                      onChange={e => setLocalFirebaseConfig({...localFirebaseConfig, apiKey: e.target.value.trim()})}
                      placeholder="AIzaSy..."
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm font-mono focus:border-gt-gold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1 font-bold">Auth Domain</label>
                    <input 
                      type="text"
                      value={localFirebaseConfig.authDomain}
                      onChange={e => setLocalFirebaseConfig({...localFirebaseConfig, authDomain: e.target.value.trim()})}
                      placeholder="project-id.firebaseapp.com"
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm font-mono focus:border-gt-gold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1 font-bold">Project ID</label>
                    <input 
                      type="text"
                      value={localFirebaseConfig.projectId}
                      onChange={e => setLocalFirebaseConfig({...localFirebaseConfig, projectId: e.target.value.trim()})}
                      placeholder="project-id"
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm font-mono focus:border-gt-gold outline-none"
                    />
                  </div>
                </div>
              </div>

              <button 
                id="save-btn"
                onClick={handleSaveSettings}
                className="w-full bg-gt-gold text-black font-bold py-4 rounded-xl hover:bg-yellow-400 transition-all text-lg shadow-lg flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" /> Save All Settings
              </button>
            </div>
          )}

          {/* SUPPORT CHAT TAB */}
          {activeTab === 'support' && (
            <div className="h-full flex flex-col">
              <div className="flex justify-between items-center mb-4">
                 <h2 className="text-2xl font-bold">Live Support Console</h2>
                 <button 
                    onClick={() => onToggleLiveSupport(!isLiveSupport)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm ${isLiveSupport ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-400'}`}
                 >
                   {isLiveSupport ? <><Power className="w-4 h-4" /> Live Support Active</> : <><PowerOff className="w-4 h-4" /> Bot Auto-Reply Active</>}
                 </button>
              </div>
              
              <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 p-4 mb-4 overflow-y-auto">
                {chatMessages.length === 0 ? (
                  <div className="text-center text-slate-500 mt-20">No chat history.</div>
                ) : (
                  <div className="space-y-4">
                    {chatMessages.map(msg => (
                      <div key={msg.id} className={`flex ${msg.role === 'admin' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-xl px-4 py-2 ${
                          msg.role === 'admin' ? 'bg-red-500/20 border border-red-500/30 text-white' : 
                          msg.role === 'model' ? 'bg-slate-700 text-slate-300' : 
                          'bg-gt-gold text-black'
                        }`}>
                           <div className="text-[10px] opacity-70 mb-1 font-bold uppercase">{msg.role}</div>
                           <div>{msg.text}</div>
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={adminChatInput}
                  onChange={e => setAdminChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                  placeholder="Type a message to the user..."
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-gt-gold outline-none"
                />
                <button 
                  onClick={handleSendChat}
                  disabled={!adminChatInput.trim()}
                  className="bg-gt-gold text-black px-6 rounded-xl font-bold hover:bg-yellow-400 disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminPanel;