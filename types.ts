
export enum TradeMode {
  BUY = 'BUY',
  SELL = 'SELL'
}

export enum CryptoCurrency {
  BTC = 'Bitcoin',
  ETH = 'Ethereum',
  LTC = 'Litecoin',
  USDT = 'Tether (TRC20)'
}

export interface RateInfo {
  buyRate: number; // USD per DL
  sellRate: number; // USD per DL
}

export interface WalletConfig {
  [CryptoCurrency.BTC]: string;
  [CryptoCurrency.ETH]: string;
  [CryptoCurrency.LTC]: string;
  [CryptoCurrency.USDT]: string;
}

export interface EmailConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'admin';
  text: string;
  timestamp: number;
  isError?: boolean;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID', // User marked as paid/sent
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface OrderDestination {
  growId: string;
  worldName: string;
}

export interface Order {
  id: string;
  type: TradeMode;
  amount: number; // DLs
  cryptoAmount: number;
  currency: CryptoCurrency;
  totalUSD: number;
  growId: string; // Primary ID or "Multiple"
  worldName: string; // Primary World or "Safe Mode"
  isSafeMode?: boolean;
  isGuest?: boolean;
  destinations?: OrderDestination[];
  status: OrderStatus;
  timestamp: number;
  txHash?: string; // For Buy orders
  payoutAddress?: string; // For Sell orders
  completedTimestamp?: number;
}

export interface UserAccount {
  username: string;
  email: string;
  password: string;
  createdAt: number;
}
