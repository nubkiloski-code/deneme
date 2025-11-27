import React from 'react';
import { Order, OrderStatus, TradeMode } from '../types';
import { Clock, CheckCircle2, XCircle, Loader2, ShieldCheck, ChevronDown, ChevronUp, ShoppingBag, Search } from 'lucide-react';

interface OrderListProps {
  orders: Order[];
}

const OrderList: React.FC<OrderListProps> = ({ orders }) => {
  const [expandedOrders, setExpandedOrders] = React.useState<Set<string>>(new Set());
  const [filter, setFilter] = React.useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');

  const toggleExpand = (id: string) => {
    const newSet = new Set(expandedOrders);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedOrders(newSet);
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.COMPLETED: return 'text-green-400 border-green-400/30 bg-green-400/10';
      case OrderStatus.PAID: return 'text-blue-400 border-blue-400/30 bg-blue-400/10';
      case OrderStatus.CANCELLED: return 'text-red-400 border-red-400/30 bg-red-400/10';
      default: return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.COMPLETED: return <CheckCircle2 className="w-4 h-4" />;
      case OrderStatus.PAID: return <Loader2 className="w-4 h-4 animate-spin" />;
      case OrderStatus.CANCELLED: return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredOrders = orders.filter(o => {
      if (filter === 'ALL') return true;
      if (filter === 'PENDING') return o.status === OrderStatus.PENDING || o.status === OrderStatus.PAID;
      if (filter === 'COMPLETED') return o.status === OrderStatus.COMPLETED;
      return true;
  });

  return (
    <div className="min-h-screen py-8 px-4 md:px-8 animate-in fade-in duration-500">
      <div className="max-w-6xl mx-auto">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <div className="bg-gt-gold p-2 rounded-xl text-black">
                        <ShoppingBag className="w-6 h-6" />
                    </div>
                    My Orders
                </h1>
                <p className="text-slate-400 mt-1 ml-1 text-sm">Manage and track your Growtopia trades.</p>
            </div>
            
            {/* Filter Tabs */}
            <div className="bg-slate-800/50 p-1 rounded-xl flex gap-1 border border-slate-700">
                {['ALL', 'PENDING', 'COMPLETED'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f as any)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                            filter === f 
                            ? 'bg-slate-700 text-white shadow-md' 
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                        }`}
                    >
                        {f}
                    </button>
                ))}
            </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl p-16 text-center flex flex-col items-center">
               <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <Search className="w-10 h-10 text-slate-600" />
               </div>
               <h3 className="text-2xl font-bold text-white mb-2">No Orders Found</h3>
               <p className="text-slate-400 max-w-md mx-auto mb-8">
                 You haven't started any trades yet. Go back to the trade section to buy or sell Diamond Locks.
               </p>
            </div>
          ) : filteredOrders.length === 0 ? (
             <div className="text-center py-20 text-slate-500">
                 No {filter.toLowerCase()} orders found.
             </div>
          ) : (
            filteredOrders.slice().reverse().map((order) => (
              <div key={order.id} className="bg-gt-card/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-5 md:p-6 flex flex-col gap-4 hover:border-slate-600 transition-all shadow-lg group hover:shadow-xl hover:translate-y-[-2px]">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  
                  {/* Order Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-2 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                      <span className="text-slate-500 text-xs font-mono bg-slate-800 px-2 py-0.5 rounded">#{order.id}</span>
                      {order.isSafeMode && (
                        <span className="text-[10px] bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Safe Mode
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-baseline gap-3">
                      <span className={`text-xl md:text-2xl font-black tracking-tight ${order.type === TradeMode.BUY ? 'text-green-400' : 'text-red-400'}`}>
                        {order.type}
                      </span>
                      <span className="text-2xl md:text-3xl font-bold text-white">{order.amount} DLs</span>
                      <div className="hidden md:block w-px h-6 bg-slate-700 mx-2"></div>
                      <span className="text-slate-400 text-sm md:text-base font-medium">
                        <span className="text-slate-500">for</span> <span className="text-white font-mono">{order.cryptoAmount} {order.currency}</span>
                      </span>
                    </div>

                    {/* Destinations / Details */}
                    <div className="mt-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                        {order.isSafeMode ? (
                        <div className="w-full">
                            <button 
                                onClick={() => toggleExpand(order.id)}
                                className="w-full flex justify-between items-center text-xs font-bold text-blue-300 hover:text-white transition-colors uppercase tracking-wider"
                            >
                                <span>Split Delivery (5 Worlds)</span>
                                {expandedOrders.has(order.id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                            
                            {expandedOrders.has(order.id) && (
                                <div className="mt-3 grid gap-2 animate-in slide-in-from-top-2">
                                    {order.destinations?.map((dest, i) => (
                                    <div key={i} className="flex justify-between text-sm border-b border-slate-700/50 pb-2 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-3">
                                            <span className="text-slate-500 font-mono w-4 text-xs">0{i+1}</span>
                                            <span className="text-white">{dest.worldName || '---'}</span>
                                        </div>
                                        <span className="text-gt-gold font-mono">{dest.growId || '---'}</span>
                                    </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        ) : (
                        <div className="flex items-center gap-6 text-sm">
                            <div>
                                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">World Name</span>
                                <span className="text-white font-medium">{order.worldName}</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">GrowID</span>
                                <span className="text-white font-medium">{order.growId}</span>
                            </div>
                        </div>
                        )}
                    </div>
                  </div>
                  
                  {/* Price & Time */}
                  <div className="flex flex-row md:flex-col justify-between md:justify-center items-end gap-1 w-full md:w-auto border-t md:border-t-0 border-slate-800 pt-4 md:pt-0">
                    <div className="text-2xl font-mono font-bold text-white">${order.totalUSD.toFixed(2)}</div>
                    <div className="text-right">
                        <div className="text-xs text-slate-500 font-medium">{new Date(order.timestamp).toLocaleDateString()}</div>
                        <div className="text-[10px] text-slate-600">{new Date(order.timestamp).toLocaleTimeString()}</div>
                    </div>
                    {order.status === OrderStatus.COMPLETED && order.completedTimestamp && (
                      <div className="hidden md:block mt-2 text-[10px] text-green-400 font-bold bg-green-900/20 px-2 py-1 rounded border border-green-900/30">
                          Done: {new Date(order.completedTimestamp).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderList;