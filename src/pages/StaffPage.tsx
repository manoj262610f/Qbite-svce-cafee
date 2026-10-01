import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChefHat,
  BellRing,
  Clock,
  Play,
  Check,
  Search,
  X,
  XCircle,
  PackageCheck,
  Banknote,
  AlertTriangle
} from 'lucide-react';
import { useCanteen } from '../context/CanteenContext';
import { Order, OrderStatus } from '../types';

interface StaffPageProps {
  onBackToHome: () => void;
}

export const StaffPage: React.FC<StaffPageProps> = ({ onBackToHome }) => {
  const {
    orders,
    acceptOrder,
    startPreparingOrder,
    markOrderReady,
    markPaymentPaid,
    completePickup,
    rejectOrder
  } = useCanteen();

  const [activeTab, setActiveTab] = useState<'new' | 'accepted' | 'preparing' | 'ready' | 'completed'>('new');
  const [rejectDialogOrder, setRejectDialogOrder] = useState<Order | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('Item currently unavailable');
  const [searchToken, setSearchToken] = useState<string>('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // Filter orders by kitchen stages
  const newOrders = orders.filter((o) => o.status === 'PLACED');
  const acceptedOrders = orders.filter((o) => o.status === 'ACCEPTED');
  const preparingOrders = orders.filter((o) => o.status === 'PREPARING');
  const readyOrders = orders.filter((o) => o.status === 'READY');
  const completedOrders = orders.filter((o) => o.status === 'COMPLETED').slice(0, 30);

  const getFilteredList = () => {
    let list: Order[] = [];
    if (activeTab === 'new') list = newOrders;
    else if (activeTab === 'accepted') list = acceptedOrders;
    else if (activeTab === 'preparing') list = preparingOrders;
    else if (activeTab === 'ready') list = readyOrders;
    else if (activeTab === 'completed') list = completedOrders;

    if (searchToken.trim()) {
      const q = searchToken.trim().toLowerCase().replace('#', '');
      list = list.filter(
        (o) =>
          String(o.tokenNumber).includes(q) ||
          o.tokenString.toLowerCase().includes(q) ||
          o.orderNumber.toLowerCase().includes(q) ||
          o.userName.toLowerCase().includes(q)
      );
    }
    return list;
  };

  const handleAction = async (orderId: string, action: () => Promise<void>) => {
    setIsProcessing(orderId);
    setActionError(null);
    try {
      await action();
    } catch (err: any) {
      setActionError(err?.message || 'Operation failed. Please try again.');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectDialogOrder) return;
    setIsProcessing(rejectDialogOrder.id);
    setActionError(null);
    try {
      await rejectOrder(rejectDialogOrder.id, rejectReason);
      setRejectDialogOrder(null);
    } catch (err: any) {
      setActionError(err?.message || 'Could not reject order.');
    } finally {
      setIsProcessing(null);
    }
  };

  const list = getFilteredList();

  return (
    <div className="pb-28 pt-3 px-4 max-w-2xl mx-auto space-y-4">
      {/* Top Staff Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl overflow-hidden bg-[#0D0D0D] border border-white/10 flex items-center justify-center shadow-lg glow-orange-sm shrink-0">
            <img
              src="/icons/qbite-icon-192.png"
              alt="QBite"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <span>QBite · Kitchen Portal</span>
            </h2>
            <p className="text-xs text-[#A1A1A1] font-medium">SVCE Cafe · Real-Time Kitchen Operations</p>
          </div>
        </div>

        <button
          onClick={onBackToHome}
          className="text-xs font-bold text-stone-300 hover:text-white bg-[#141414] hover:bg-[#1E1E1E] border border-white/10 px-3 py-1.5 rounded-xl cursor-pointer transition-colors"
        >
          Student View
        </button>
      </div>

      {/* Kitchen Workload Counter Summary */}
      <div className="bg-[#141414] text-white rounded-3xl p-4 shadow-xl border border-white/8">
        <div className="flex items-center justify-between pb-2.5 border-b border-white/8 mb-3">
          <span className="text-[10px] uppercase font-black tracking-widest text-[#FF6A00]">
            KITCHEN WORKLOAD · COUNTERS 1 & 2
          </span>
          <span className="text-[10px] font-mono-token text-stone-400">
            Realtime Synced
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center">
          <div
            onClick={() => setActiveTab('new')}
            className={`p-2.5 rounded-2xl cursor-pointer transition-all ${
              activeTab === 'new' ? 'bg-[#FF6A00]/25 border border-[#FF6A00]' : 'bg-[#1C1C1C]'
            }`}
          >
            <span className="text-[9px] uppercase font-black text-stone-400 block">NEW</span>
            <span className="text-2xl font-black font-mono-token text-[#FF7A00]">
              {newOrders.length}
            </span>
          </div>

          <div
            onClick={() => setActiveTab('accepted')}
            className={`p-2.5 rounded-2xl cursor-pointer transition-all ${
              activeTab === 'accepted' ? 'bg-blue-600/30 border border-blue-500' : 'bg-[#1C1C1C]'
            }`}
          >
            <span className="text-[9px] uppercase font-black text-stone-400 block">QUEUED</span>
            <span className="text-2xl font-black font-mono-token text-blue-400">
              {acceptedOrders.length}
            </span>
          </div>

          <div
            onClick={() => setActiveTab('preparing')}
            className={`p-2.5 rounded-2xl cursor-pointer transition-all ${
              activeTab === 'preparing' ? 'bg-[#FF9D2E]/25 border border-[#FF9D2E]' : 'bg-[#1C1C1C]'
            }`}
          >
            <span className="text-[9px] uppercase font-black text-stone-400 block">COOKING</span>
            <span className="text-2xl font-black font-mono-token text-[#FF9D2E]">
              {preparingOrders.length}
            </span>
          </div>

          <div
            onClick={() => setActiveTab('ready')}
            className={`p-2.5 rounded-2xl cursor-pointer transition-all ${
              activeTab === 'ready' ? 'bg-emerald-600/30 border border-emerald-500' : 'bg-[#1C1C1C]'
            }`}
          >
            <span className="text-[9px] uppercase font-black text-stone-400 block">READY</span>
            <span className="text-2xl font-black font-mono-token text-emerald-400">
              {readyOrders.length}
            </span>
          </div>
        </div>
      </div>

      {actionError && (
        <div className="p-3 bg-[#1C1111] border border-rose-500/30 rounded-2xl text-xs text-rose-300 flex items-center justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="p-1 text-rose-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search Bar for Quick Token Verification */}
      <div className="relative">
        <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchToken}
          onChange={(e) => setSearchToken(e.target.value)}
          placeholder="Lookup token (e.g. 47) or student name..."
          className="w-full pl-10 pr-4 py-2.5 bg-[#141414] border border-white/8 rounded-2xl text-xs font-medium text-white placeholder:text-stone-500 focus:outline-none focus:border-[#FF6A00]"
        />
        {searchToken && (
          <button
            onClick={() => setSearchToken('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400 hover:text-white cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* Pipeline Tabs */}
      <div className="flex gap-1.5 bg-[#141414] p-1.5 rounded-2xl border border-white/8 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('new')}
          className={`flex-1 py-2 px-3 text-xs font-black rounded-xl whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'new' ? 'bg-[#FF6A00] text-black shadow-md glow-orange-sm' : 'text-stone-400 hover:text-white'
          }`}
        >
          New ({newOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('accepted')}
          className={`flex-1 py-2 px-3 text-xs font-black rounded-xl whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'accepted' ? 'bg-[#FF6A00] text-black shadow-md glow-orange-sm' : 'text-stone-400 hover:text-white'
          }`}
        >
          Queued ({acceptedOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('preparing')}
          className={`flex-1 py-2 px-3 text-xs font-black rounded-xl whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'preparing' ? 'bg-[#FF6A00] text-black shadow-md glow-orange-sm' : 'text-stone-400 hover:text-white'
          }`}
        >
          Cooking ({preparingOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('ready')}
          className={`flex-1 py-2 px-3 text-xs font-black rounded-xl whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'ready' ? 'bg-emerald-500 text-black shadow-md glow-emerald-sm' : 'text-stone-400 hover:text-white'
          }`}
        >
          Ready ({readyOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 py-2 px-3 text-xs font-black rounded-xl whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'completed' ? 'bg-white/20 text-white' : 'text-stone-400 hover:text-white'
          }`}
        >
          Done ({completedOrders.length})
        </button>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {list.length === 0 ? (
          <div className="bg-[#141414] rounded-3xl p-8 text-center border border-white/8 shadow-md">
            <Clock className="w-10 h-10 text-stone-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-white">
              No orders in {activeTab.toUpperCase()} queue
            </p>
            <p className="text-xs text-[#A1A1A1] mt-0.5">
              New orders submitted by students will appear here automatically in real time.
            </p>
          </div>
        ) : (
          list.map((order) => {
            const isProcessingThis = isProcessing === order.id;

            return (
              <div
                key={order.id}
                className="bg-[#141414] rounded-3xl p-5 border border-white/8 shadow-xl space-y-3"
              >
                {/* Header: Token, Order ID, Time, Student */}
                <div className="flex items-start justify-between pb-3 border-b border-white/5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-black font-mono-token text-[#FF6A00]">
                        {order.tokenString}
                      </span>
                      <span className="text-stone-600">·</span>
                      <span className="text-xs font-mono-token text-stone-400">
                        {order.orderNumber}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-white mt-0.5">
                      {order.userName}
                      <span className="text-[#A1A1A1] font-normal ml-1">({order.userEmail})</span>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-mono-token text-stone-400 block">
                      {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full inline-block mt-1 ${
                        order.paymentStatus === 'PAID'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {order.paymentStatus === 'PAID' ? 'PAID ✓' : `COLLECT ₹${order.total}`}
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-1.5 text-xs">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-stone-200">
                      <span className="font-semibold">
                        {item.name} <strong className="font-mono-token text-[#FF7A00] ml-1">× {item.quantity}</strong>
                      </span>
                      <span className="font-mono-token text-stone-400">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Special Instructions */}
                {order.notes && (
                  <div className="p-2.5 rounded-xl bg-[#1C170E] border border-amber-500/30 text-xs text-amber-300">
                    <span className="font-bold mr-1">Kitchen Note:</span>
                    {order.notes}
                  </div>
                )}

                {/* Staff Actions per Stage */}
                <div className="pt-2 border-t border-white/5 flex items-center gap-2">
                  {/* PLACED (NEW) STAGE */}
                  {order.status === 'PLACED' && (
                    <>
                      <button
                        onClick={() => handleAction(order.id, () => acceptOrder(order.id))}
                        disabled={isProcessingThis}
                        className="flex-1 py-3 px-4 bg-[#FF6A00] hover:bg-[#FF7A00] text-black font-black text-xs rounded-xl shadow-md glow-orange-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all active:scale-[0.98]"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>ACCEPT ORDER</span>
                      </button>

                      <button
                        onClick={() => setRejectDialogOrder(order)}
                        disabled={isProcessingThis}
                        className="py-3 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-bold text-xs rounded-xl border border-rose-500/30 cursor-pointer disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {/* ACCEPTED STAGE */}
                  {order.status === 'ACCEPTED' && (
                    <button
                      onClick={() => handleAction(order.id, () => startPreparingOrder(order.id))}
                      disabled={isProcessingThis}
                      className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all active:scale-[0.98]"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>START COOKING</span>
                    </button>
                  )}

                  {/* PREPARING STAGE */}
                  {order.status === 'PREPARING' && (
                    <button
                      onClick={() => handleAction(order.id, () => markOrderReady(order.id))}
                      disabled={isProcessingThis}
                      className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs rounded-xl shadow-lg glow-emerald-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all active:scale-[0.98]"
                    >
                      <BellRing className="w-4 h-4" />
                      <span>MARK ORDER READY FOR PICKUP</span>
                    </button>
                  )}

                  {/* READY STAGE */}
                  {order.status === 'READY' && (
                    <div className="w-full flex items-center gap-2">
                      {order.paymentStatus !== 'PAID' && (
                        <button
                          onClick={() => handleAction(order.id, () => markPaymentPaid(order.id))}
                          disabled={isProcessingThis}
                          className="flex-1 py-3 px-3 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
                        >
                          <Banknote className="w-4 h-4" />
                          <span>MARK PAID (₹{order.total})</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleAction(order.id, () => completePickup(order.id))}
                        disabled={isProcessingThis}
                        className="flex-1 py-3 px-4 bg-[#FF6A00] hover:bg-[#FF7A00] text-black font-black text-xs rounded-xl shadow-md glow-orange-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all active:scale-[0.98]"
                      >
                        <PackageCheck className="w-4 h-4 stroke-[2.5]" />
                        <span>COMPLETE PICKUP</span>
                      </button>
                    </div>
                  )}

                  {/* COMPLETED STAGE */}
                  {order.status === 'COMPLETED' && (
                    <div className="w-full flex items-center justify-between text-xs text-stone-400 py-1">
                      <span className="flex items-center gap-1 text-emerald-400 font-bold">
                        <Check className="w-4 h-4" />
                        <span>Picked up & Completed</span>
                      </span>
                      <span className="font-mono-token text-[11px]">
                        {order.completedAt ? new Date(order.completedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reject Order Modal */}
      {rejectDialogOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#141414] rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-white/10 space-y-4">
            <div className="flex items-center gap-2.5 text-rose-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="font-black text-base text-white">
                Reject Order #{rejectDialogOrder.tokenString}?
              </h3>
            </div>

            <p className="text-xs text-stone-300">
              Provide a reason to inform the student why this order could not be fulfilled:
            </p>

            <div className="space-y-2">
              {[
                'Item currently unavailable',
                'Kitchen at maximum capacity',
                'Canteen closing soon',
                'Ingredient out of stock'
              ].map((reason) => (
                <button
                  key={reason}
                  onClick={() => setRejectReason(reason)}
                  className={`w-full p-2.5 rounded-xl text-left text-xs font-semibold cursor-pointer border transition-colors ${
                    rejectReason === reason
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                      : 'bg-[#1C1C1C] border-white/5 text-stone-300 hover:bg-[#252525]'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-white/8">
              <button
                onClick={() => setRejectDialogOrder(null)}
                className="flex-1 py-2.5 px-3 rounded-xl border border-white/10 text-stone-300 hover:text-white font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                className="flex-1 py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs cursor-pointer shadow-md"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
