import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChefHat,
  BellRing,
  CheckCircle2,
  Clock,
  Flame,
  ArrowRight,
  AlertTriangle,
  Play,
  Check,
  ChevronRight,
  RefreshCw,
  X,
  Banknote,
  Search,
  XCircle,
  PackageCheck
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
    <div className="pb-24 pt-3 px-4 max-w-2xl mx-auto space-y-4">
      {/* Top Staff Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-stone-900 text-orange-400 flex items-center justify-center shadow-xs">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-stone-900 tracking-tight flex items-center gap-2">
              <span>SVCE Kitchen Staff</span>
            </h2>
            <p className="text-xs text-stone-500 font-medium">Real-Time Kitchen Orders & Pickup Hub</p>
          </div>
        </div>

        <button
          onClick={onBackToHome}
          className="text-xs font-bold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-xl cursor-pointer"
        >
          Student View
        </button>
      </div>

      {/* Kitchen Workload Counter Summary */}
      <div className="bg-stone-900 text-white rounded-3xl p-4 shadow-xl border border-stone-800">
        <div className="flex items-center justify-between pb-2.5 border-b border-white/10 mb-3">
          <span className="text-[10px] uppercase font-bold tracking-wider text-orange-400">
            KITCHEN WORKLOAD · COUNTERS 1 & 2
          </span>
          <span className="text-[10px] font-mono-token text-stone-400">
            Auto-Syncing
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center">
          <div
            onClick={() => setActiveTab('new')}
            className={`p-2.5 rounded-2xl cursor-pointer transition-all ${
              activeTab === 'new' ? 'bg-orange-600/30 border border-orange-500' : 'bg-white/5'
            }`}
          >
            <span className="text-[9px] uppercase font-bold text-stone-400 block">NEW</span>
            <span className="text-2xl font-black font-mono-token text-orange-400">
              {newOrders.length}
            </span>
          </div>

          <div
            onClick={() => setActiveTab('accepted')}
            className={`p-2.5 rounded-2xl cursor-pointer transition-all ${
              activeTab === 'accepted' ? 'bg-blue-600/30 border border-blue-500' : 'bg-white/5'
            }`}
          >
            <span className="text-[9px] uppercase font-bold text-stone-400 block">QUEUED</span>
            <span className="text-2xl font-black font-mono-token text-blue-400">
              {acceptedOrders.length}
            </span>
          </div>

          <div
            onClick={() => setActiveTab('preparing')}
            className={`p-2.5 rounded-2xl cursor-pointer transition-all ${
              activeTab === 'preparing' ? 'bg-amber-600/30 border border-amber-500' : 'bg-white/5'
            }`}
          >
            <span className="text-[9px] uppercase font-bold text-stone-400 block">COOKING</span>
            <span className="text-2xl font-black font-mono-token text-amber-400">
              {preparingOrders.length}
            </span>
          </div>

          <div
            onClick={() => setActiveTab('ready')}
            className={`p-2.5 rounded-2xl cursor-pointer transition-all ${
              activeTab === 'ready' ? 'bg-emerald-600/30 border border-emerald-500' : 'bg-white/5'
            }`}
          >
            <span className="text-[9px] uppercase font-bold text-stone-400 block">READY</span>
            <span className="text-2xl font-black font-mono-token text-emerald-400">
              {readyOrders.length}
            </span>
          </div>
        </div>
      </div>

      {actionError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="p-1 text-rose-500 hover:text-rose-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search Bar for Quick Token Verification */}
      <div className="relative">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchToken}
          onChange={(e) => setSearchToken(e.target.value)}
          placeholder="Lookup token (e.g. 47) or student name..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-2xl text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-orange-500"
        />
        {searchToken && (
          <button
            onClick={() => setSearchToken('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400 hover:text-stone-600 cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 bg-stone-100 p-1 rounded-2xl overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('new')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'new' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
          }`}
        >
          New ({newOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('accepted')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'accepted' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
          }`}
        >
          Queued ({acceptedOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('preparing')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'preparing' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
          }`}
        >
          Cooking ({preparingOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('ready')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'ready' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
          }`}
        >
          Ready ({readyOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'completed' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
          }`}
        >
          Done ({completedOrders.length})
        </button>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {list.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-stone-200/80 shadow-xs">
            <Clock className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-stone-800">
              No orders in {activeTab.toUpperCase()} queue
            </p>
            <p className="text-xs text-stone-400 mt-0.5">
              New orders submitted by students will appear here automatically in real time.
            </p>
          </div>
        ) : (
          list.map((order) => {
            const isProcessingThis = isProcessing === order.id;

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-3"
              >
                {/* Header: Token, Order ID, Time, Student */}
                <div className="flex items-start justify-between pb-3 border-b border-stone-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black font-mono-token text-orange-600">
                        {order.tokenString}
                      </span>
                      <span className="text-stone-300">·</span>
                      <span className="text-xs font-mono-token text-stone-500">
                        {order.orderNumber}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-stone-900 mt-0.5">
                      {order.userName}
                      <span className="text-stone-400 font-normal ml-1">({order.userEmail})</span>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-mono-token text-stone-400 block">
                      {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full inline-block mt-1 ${
                        order.paymentStatus === 'PAID'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {order.paymentStatus === 'PAID' ? 'PAID ✓' : `COLLECT ₹${order.total}`}
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-1.5 text-xs">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-stone-800">
                      <span className="font-semibold">
                        {item.name} <strong className="font-mono-token text-orange-600 ml-1">× {item.quantity}</strong>
                      </span>
                      <span className="font-mono-token text-stone-500">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Special Instructions */}
                {order.notes && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                    <span className="font-bold mr-1">Note:</span>
                    {order.notes}
                  </div>
                )}

                {/* Staff Actions per Stage */}
                <div className="pt-2 border-t border-stone-100 flex items-center gap-2">
                  {/* PLACED (NEW) STAGE */}
                  {order.status === 'PLACED' && (
                    <>
                      <button
                        onClick={() => handleAction(order.id, () => acceptOrder(order.id))}
                        disabled={isProcessingThis}
                        className="flex-1 py-2.5 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        <span>Accept Order</span>
                      </button>

                      <button
                        onClick={() => setRejectDialogOrder(order)}
                        disabled={isProcessingThis}
                        className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 cursor-pointer disabled:opacity-50"
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
                      className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Play className="w-4 h-4" />
                      <span>Start Cooking</span>
                    </button>
                  )}

                  {/* PREPARING STAGE */}
                  {order.status === 'PREPARING' && (
                    <button
                      onClick={() => handleAction(order.id, () => markOrderReady(order.id))}
                      disabled={isProcessingThis}
                      className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <BellRing className="w-4 h-4" />
                      <span>MARK READY FOR PICKUP</span>
                    </button>
                  )}

                  {/* READY STAGE */}
                  {order.status === 'READY' && (
                    <div className="w-full flex items-center gap-2">
                      {order.paymentStatus === 'PENDING' && (
                        <button
                          onClick={() => handleAction(order.id, () => markPaymentPaid(order.id))}
                          disabled={isProcessingThis}
                          className="py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <Banknote className="w-3.5 h-3.5" />
                          <span>Mark Paid</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleAction(order.id, () => completePickup(order.id))}
                        disabled={isProcessingThis}
                        className="flex-1 py-2.5 px-4 bg-stone-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <PackageCheck className="w-4 h-4 text-emerald-400" />
                        <span>Verify & Complete Pickup</span>
                      </button>
                    </div>
                  )}

                  {/* COMPLETED STAGE */}
                  {order.status === 'COMPLETED' && (
                    <div className="w-full text-center text-xs text-stone-400 font-medium">
                      Completed at {new Date(order.completedAt || order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reject Order Confirmation Dialog */}
      {rejectDialogOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-3 shadow-2xl border border-stone-200">
            <h3 className="font-extrabold text-base text-stone-900">
              Reject Order {rejectDialogOrder.tokenString}?
            </h3>
            <p className="text-xs text-stone-500">
              The student will be notified immediately in-app. Select a reason:
            </p>

            <select
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:outline-none"
            >
              <option value="Item currently unavailable in kitchen">Item currently unavailable</option>
              <option value="Kitchen counter closing for break">Kitchen counter closing for break</option>
              <option value="High queue capacity reached">High queue capacity reached</option>
              <option value="Operational issue">Operational issue</option>
            </select>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setRejectDialogOrder(null)}
                className="flex-1 py-2 rounded-xl border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
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
