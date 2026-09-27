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
  X
} from 'lucide-react';
import { useCanteen } from '../context/CanteenContext';
import { Order, OrderStatus } from '../types';
import { formatTokenNumber } from '../services/queueService';

interface StaffPageProps {
  onBackToHome: () => void;
}

export const StaffPage: React.FC<StaffPageProps> = ({ onBackToHome }) => {
  const {
    queueState,
    orders,
    updateOrderStatus,
    callNextToken,
    setCurrentServingToken
  } = useCanteen();

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<'incoming' | 'preparing' | 'ready'>('incoming');

  const currentServing = queueState.currentServingToken || 42;
  const nextToken = currentServing + 1;

  // Filter orders by kitchen stages
  const placedOrders = orders.filter((o) => o.status === 'PLACED');
  const acceptedOrders = orders.filter((o) => o.status === 'ACCEPTED');
  const incomingOrders = [...placedOrders, ...acceptedOrders];
  const preparingOrders = orders.filter((o) => o.status === 'PREPARING');
  const readyOrders = orders.filter((o) => o.status === 'READY');

  const handleCallNext = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Call Next Token?',
      message: `This will advance the currently serving display from ${formatTokenNumber(currentServing)} to ${formatTokenNumber(nextToken)}.`,
      onConfirm: async () => {
        await callNextToken();
        setConfirmDialog(null);
      }
    });
  };

  const handleSkipToken = (targetToken: number) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Jump to Token ' + formatTokenNumber(targetToken) + '?',
      message: 'Are you sure you want to adjust the currently serving token counter directly?',
      onConfirm: async () => {
        await setCurrentServingToken(targetToken);
        setConfirmDialog(null);
      }
    });
  };

  return (
    <div className="pb-24 pt-3 px-4 max-w-lg mx-auto space-y-4">
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
            <p className="text-xs text-stone-500 font-medium">Fast Kitchen Counter Controls</p>
          </div>
        </div>

        <button
          onClick={onBackToHome}
          className="text-xs font-bold text-stone-500 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-xl cursor-pointer"
        >
          Student View
        </button>
      </div>

      {/* Staff Queue Control Panel (Requirement 22) */}
      <div className="bg-stone-900 text-white rounded-3xl p-5 shadow-xl border border-stone-800">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <span className="text-[11px] uppercase font-bold tracking-wider text-orange-400">
            STAFF QUEUE CONTROL
          </span>
          <span className="text-xs font-mono-token text-stone-400">
            Counter 1 & 2 Active
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 items-center mb-4">
          <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/5">
            <p className="text-[10px] uppercase font-bold text-stone-400 mb-1">
              CURRENTLY SERVING
            </p>
            <div className="text-4xl md:text-5xl font-black font-mono-token text-white">
              {formatTokenNumber(currentServing)}
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/5">
            <p className="text-[10px] uppercase font-bold text-stone-400 mb-1">
              NEXT TOKEN
            </p>
            <div className="text-4xl md:text-5xl font-black font-mono-token text-amber-400">
              {formatTokenNumber(nextToken)}
            </div>
          </div>
        </div>

        {/* Big Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleCallNext}
            className="py-4 px-4 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-orange-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
          >
            <BellRing className="w-5 h-5" />
            <span>CALL NEXT ({formatTokenNumber(nextToken)})</span>
          </button>

          <button
            onClick={() => {
              if (readyOrders.length > 0) {
                updateOrderStatus(readyOrders[0].id, 'COMPLETED');
              }
            }}
            className="py-4 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>COMPLETE SERVED</span>
          </button>
        </div>
      </div>

      {/* Kitchen Stages Tabs */}
      <div className="flex gap-2 bg-stone-100 p-1 rounded-2xl">
        <button
          onClick={() => setActiveTab('incoming')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl cursor-pointer transition-all ${
            activeTab === 'incoming'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          Incoming ({incomingOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('preparing')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl cursor-pointer transition-all ${
            activeTab === 'preparing'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          Preparing ({preparingOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('ready')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl cursor-pointer transition-all ${
            activeTab === 'ready'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          Ready ({readyOrders.length})
        </button>
      </div>

      {/* Kitchen Tickets List */}
      <div className="space-y-3">
        {/* INCOMING TAB */}
        {activeTab === 'incoming' && (
          incomingOrders.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-stone-100 text-stone-500 text-xs">
              <CheckCircle2 className="w-8 h-8 text-stone-300 mx-auto mb-2" />
              No incoming orders waiting for kitchen acceptance.
            </div>
          ) : (
            incomingOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black font-mono-token text-orange-600">
                      {order.tokenString}
                    </span>
                    <span className="text-xs font-mono-token text-stone-400">
                      {order.orderNumber}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-stone-500">
                    {order.userName}
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-1">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm font-bold text-stone-900">
                      <span>{item.name}</span>
                      <span className="text-orange-600 font-mono-token">× {item.quantity}</span>
                    </div>
                  ))}
                  {order.notes && (
                    <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg mt-1 italic">
                      Note: {order.notes}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-1">
                  {order.status === 'PLACED' ? (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'ACCEPTED')}
                      className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-extrabold text-sm rounded-xl cursor-pointer active:scale-95"
                    >
                      [ ACCEPT ORDER ]
                    </button>
                  ) : (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'PREPARING')}
                      className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-stone-950 font-extrabold text-sm rounded-xl cursor-pointer active:scale-95"
                    >
                      START PREPARING 👨‍🍳
                    </button>
                  )}
                </div>
              </div>
            ))
          )
        )}

        {/* PREPARING TAB */}
        {activeTab === 'preparing' && (
          preparingOrders.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-stone-100 text-stone-500 text-xs">
              <ChefHat className="w-8 h-8 text-stone-300 mx-auto mb-2" />
              No orders currently in cooking stage.
            </div>
          ) : (
            preparingOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl p-4 border-2 border-amber-200 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black font-mono-token text-amber-600">
                      {order.tokenString}
                    </span>
                    <span className="text-xs font-mono-token text-stone-400">
                      {order.orderNumber}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                    Cooking
                  </span>
                </div>

                <div className="space-y-1">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm font-bold text-stone-900">
                      <span>{item.name}</span>
                      <span className="text-amber-600 font-mono-token">× {item.quantity}</span>
                    </div>
                  ))}
                  {order.notes && (
                    <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg mt-1 italic">
                      Note: {order.notes}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => updateOrderStatus(order.id, 'READY')}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl cursor-pointer active:scale-95 shadow-md shadow-emerald-600/20"
                >
                  MARK READY FOR PICKUP 🎉
                </button>
              </div>
            ))
          )
        )}

        {/* READY TAB */}
        {activeTab === 'ready' && (
          readyOrders.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-stone-100 text-stone-500 text-xs">
              <CheckCircle2 className="w-8 h-8 text-stone-300 mx-auto mb-2" />
              All ready orders have been collected by students.
            </div>
          ) : (
            readyOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl p-4 border-2 border-emerald-400 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-black font-mono-token text-emerald-600">
                      {order.tokenString}
                    </span>
                    <span className="text-xs font-mono-token text-stone-400">
                      {order.orderNumber}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full animate-pulse">
                    At Counter
                  </span>
                </div>

                <div className="space-y-1">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs font-semibold text-stone-800">
                      <span>{item.name}</span>
                      <span className="font-mono-token">× {item.quantity}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => updateOrderStatus(order.id, 'COMPLETED')}
                  className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-extrabold text-sm rounded-xl cursor-pointer active:scale-95"
                >
                  HAND OVER & COMPLETE ✓
                </button>
              </div>
            ))
          )
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xs w-full p-5 shadow-2xl border border-stone-200 text-center">
            <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
            <h3 className="font-extrabold text-base text-stone-900">
              {confirmDialog.title}
            </h3>
            <p className="text-xs text-stone-600 mt-1 mb-5">
              {confirmDialog.message}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDialog(null)}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-700 font-bold text-xs hover:bg-stone-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className="flex-1 py-2.5 rounded-xl bg-orange-600 text-white font-bold text-xs hover:bg-orange-700 cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
