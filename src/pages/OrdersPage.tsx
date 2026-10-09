import React, { useState } from 'react';
import {
  Clock,
  ChevronRight,
  ArrowRight,
  UtensilsCrossed,
  CalendarClock,
  Zap,
  Calendar,
  AlertCircle,
  RotateCcw,
  XCircle,
  CheckCircle2,
  Info
} from 'lucide-react';
import { useCanteen } from '../context/CanteenContext';
import { Order, OrderType } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { ScheduleSelectorModal } from '../components/ScheduleSelectorModal';
import {
  getTimeRemainingUntilPickup,
  canRescheduleOrCancel
} from '../services/scheduleService';

interface OrdersPageProps {
  onSelectOrder: (orderId: string) => void;
  onBrowseMenu: () => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({ onSelectOrder, onBrowseMenu }) => {
  const { myOrders, settings, cancelOrder } = useCanteen();

  // Primary Tab: 'instant' vs 'scheduled'
  const [orderTypeTab, setOrderTypeTab] = useState<OrderType>('instant');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');

  // Reschedule & Cancel state
  const [rescheduleOrderId, setRescheduleOrderId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isProcessingId, setIsProcessingId] = useState<string | null>(null);

  const cutoffMin = settings.cancelCutoffMinutes ?? 30;

  // Split into instant & scheduled
  const instantOrders = myOrders.filter((o) => o.orderType !== 'scheduled');
  const scheduledOrders = myOrders.filter((o) => o.orderType === 'scheduled');

  const baseOrders = orderTypeTab === 'instant' ? instantOrders : scheduledOrders;

  const filteredOrders = baseOrders.filter((o) => {
    if (statusFilter === 'active') return ['PLACED', 'ACCEPTED', 'PREPARING', 'READY'].includes(o.status);
    if (statusFilter === 'completed') return o.status === 'COMPLETED' || o.status === 'CANCELLED' || o.status === 'REJECTED';
    return true;
  });

  const handleCancelClick = async (e: React.MouseEvent, order: Order) => {
    e.stopPropagation();
    setActionError(null);
    setActionSuccess(null);

    const check = canRescheduleOrCancel(order, cutoffMin);
    if (!check.allowed) {
      setActionError(check.reason || 'This order cannot be cancelled.');
      return;
    }

    if (!window.confirm(`Are you sure you want to cancel order ${order.tokenString}?`)) {
      return;
    }

    setIsProcessingId(order.id);
    try {
      await cancelOrder(order.id);
      setActionSuccess(`Order ${order.tokenString} was cancelled successfully.`);
    } catch (err: any) {
      setActionError(err?.message || 'Failed to cancel order.');
    } finally {
      setIsProcessingId(null);
    }
  };

  const handleRescheduleClick = (e: React.MouseEvent, order: Order) => {
    e.stopPropagation();
    setActionError(null);
    setActionSuccess(null);

    const check = canRescheduleOrCancel(order, cutoffMin);
    if (!check.allowed) {
      setActionError(check.reason || 'This order cannot be rescheduled.');
      return;
    }

    setRescheduleOrderId(order.id);
  };

  return (
    <div className="pb-24 pt-4 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/8 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            My Canteen Orders
          </h1>
          <p className="text-xs sm:text-sm text-[#A1A1A1] mt-0.5">
            Track live tokens, kitchen fulfillment and scheduled pickups
          </p>
        </div>

        {/* Primary Ordering Tabs: Order Now vs Scheduled Orders */}
        <div className="grid grid-cols-2 gap-1.5 bg-[#141414] p-1.5 rounded-2xl border border-white/8 self-start sm:self-auto">
          <button
            onClick={() => {
              setOrderTypeTab('instant');
              setActionError(null);
            }}
            className={`px-4 py-2 text-xs font-black rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 ${
              orderTypeTab === 'instant'
                ? 'bg-[#FF6A00] text-black shadow-md glow-orange-sm'
                : 'text-[#A1A1A1] hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Order Now ({instantOrders.length})</span>
          </button>

          <button
            onClick={() => {
              setOrderTypeTab('scheduled');
              setActionError(null);
            }}
            className={`px-4 py-2 text-xs font-black rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 ${
              orderTypeTab === 'scheduled'
                ? 'bg-[#FF6A00] text-black shadow-md glow-orange-sm'
                : 'text-[#A1A1A1] hover:text-white'
            }`}
          >
            <CalendarClock className="w-3.5 h-3.5" />
            <span>Scheduled Orders ({scheduledOrders.length})</span>
          </button>
        </div>
      </div>

      {/* Action Notices */}
      {actionError && (
        <div className="p-3.5 rounded-2xl bg-[#1C1111] border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button
            onClick={() => setActionError(null)}
            className="text-stone-400 hover:text-white text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {actionSuccess && (
        <div className="p-3.5 rounded-2xl bg-[#101C12] border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button
            onClick={() => setActionSuccess(null)}
            className="text-stone-400 hover:text-white text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Scheduled Orders Cutoff Rules Banner */}
      {orderTypeTab === 'scheduled' && (
        <div className="bg-[#1C170E] border border-amber-500/30 rounded-2xl p-4 text-xs text-amber-300 flex items-start gap-3 shadow-sm">
          <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-white block font-bold mb-0.5">
              Canteen Scheduling & Cutoff Policy
            </strong>
            <span>
              Orders can be rescheduled or cancelled up to <strong className="text-white">{cutoffMin} minutes</strong> prior to the scheduled pickup time, provided kitchen cooking has not started (Status: PLACED).
            </span>
          </div>
        </div>
      )}

      {/* Sub-Filters: All, Active, History */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl cursor-pointer transition-colors ${
              statusFilter === 'all'
                ? 'bg-white/10 text-white border border-white/20'
                : 'text-[#A1A1A1] hover:text-white'
            }`}
          >
            All ({baseOrders.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl cursor-pointer transition-colors ${
              statusFilter === 'active'
                ? 'bg-white/10 text-white border border-white/20'
                : 'text-[#A1A1A1] hover:text-white'
            }`}
          >
            Active ({baseOrders.filter((o) => ['PLACED', 'ACCEPTED', 'PREPARING', 'READY'].includes(o.status)).length})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl cursor-pointer transition-colors ${
              statusFilter === 'completed'
                ? 'bg-white/10 text-white border border-white/20'
                : 'text-[#A1A1A1] hover:text-white'
            }`}
          >
            History ({baseOrders.filter((o) => ['COMPLETED', 'CANCELLED', 'REJECTED'].includes(o.status)).length})
          </button>
        </div>

        <span className="text-[11px] font-mono-token text-stone-500">
          Showing {filteredOrders.length} orders
        </span>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-[#141414] rounded-3xl p-10 text-center border border-white/8 shadow-md max-w-md mx-auto my-8">
          {orderTypeTab === 'scheduled' ? (
            <CalendarClock className="w-12 h-12 text-stone-600 mx-auto mb-3" />
          ) : (
            <Clock className="w-12 h-12 text-stone-600 mx-auto mb-3" />
          )}
          <h3 className="text-base font-bold text-white">
            {orderTypeTab === 'scheduled'
              ? 'No scheduled orders in this view'
              : 'No instant orders in this view'}
          </h3>
          <p className="text-xs sm:text-sm text-[#A1A1A1] mt-1 max-w-xs mx-auto">
            {orderTypeTab === 'scheduled'
              ? 'Schedule your food ahead of time to skip queues and pick up precisely on schedule.'
              : 'Place an order now from SVCE Cafe to receive your live counter token.'}
          </p>
          <button
            onClick={onBrowseMenu}
            className="mt-5 px-6 py-3 bg-[#FF6A00] hover:bg-[#FF7A00] text-black font-black text-xs rounded-xl cursor-pointer shadow-md glow-orange-sm transition-all active:scale-95 inline-flex items-center gap-2"
          >
            <UtensilsCrossed className="w-4 h-4 stroke-[2.5]" />
            <span>ORDER FOOD NOW</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredOrders.map((order) => {
            const isReady = order.status === 'READY';
            const isPlaced = order.status === 'PLACED';
            const isScheduledOrder = order.orderType === 'scheduled';
            const timing = isScheduledOrder
              ? getTimeRemainingUntilPickup(order.scheduledPickupAt, settings.kitchenLeadTimeMinutes || 25)
              : null;
            const canModify = isPlaced && (!isScheduledOrder || (timing && timing.minutes >= cutoffMin));

            return (
              <div
                key={order.id}
                onClick={() => onSelectOrder(order.id)}
                className={`bg-[#141414] hover:bg-[#181818] rounded-3xl p-5 border transition-all cursor-pointer shadow-lg flex flex-col justify-between ${
                  isReady
                    ? 'border-emerald-500/50 glow-emerald-sm'
                    : isScheduledOrder
                    ? 'border-[#FF6A00]/30 hover:border-[#FF6A00]/60'
                    : 'border-white/8 hover:border-[#FF6A00]/40'
                }`}
              >
                <div>
                  {/* Top Row: Token & Status */}
                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black font-mono-token text-[#FF6A00]">
                        {order.tokenString}
                      </span>
                      <span className="text-stone-600">·</span>
                      <span className="text-xs font-mono-token text-stone-400">
                        {order.orderNumber}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isScheduledOrder && (
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#FF9D2E] bg-[#FF6A00]/15 border border-[#FF6A00]/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CalendarClock className="w-3 h-3" />
                          <span>Scheduled</span>
                        </span>
                      )}
                      <StatusBadge status={order.status} size="sm" />
                    </div>
                  </div>

                  {/* Scheduled Pickup Date & Countdown Highlight */}
                  {isScheduledOrder && (
                    <div className="my-3 p-3 rounded-2xl bg-[#1A1815] border border-[#FF6A00]/25 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-stone-300 font-bold flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#FF6A00]" />
                          <span>{order.scheduledDate || 'Date set'}</span>
                        </span>
                        <span className="font-mono-token font-black text-[#FF6A00]">
                          {order.scheduledTimeSlot || timing?.formattedTime}
                        </span>
                      </div>

                      {timing && !['COMPLETED', 'CANCELLED', 'REJECTED'].includes(order.status) && (
                        <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px]">
                          <span className="text-stone-400">Fulfillment countdown:</span>
                          <span
                            className={`font-mono-token font-bold ${
                              timing.isUrgent
                                ? 'text-amber-400 animate-pulse'
                                : timing.isPast
                                ? 'text-rose-400'
                                : 'text-emerald-400'
                            }`}
                          >
                            {timing.label}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Items and Details */}
                  <div className="py-2.5 text-xs sm:text-sm">
                    <p className="font-bold text-white line-clamp-1">
                      {(order.items || []).map((i) => `${i.name} (${i.quantity})`).join(', ') || 'Canteen Meal'}
                    </p>
                    <p className="text-xs text-[#A1A1A1] mt-1">
                      Ordered: {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      {' · '}
                      <span className="font-bold text-white font-mono-token">₹{order.total}</span>
                      {' · '}
                      <span className={order.paymentStatus === 'PAID' ? 'text-emerald-400 font-bold' : 'text-[#FF9D2E]'}>
                        {order.paymentStatus === 'PAID' ? 'PAID' : 'Pay on Pickup'}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Bottom Row: Actions (Reschedule, Cancel, or Navigate) */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                  {canModify && isScheduledOrder ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => handleRescheduleClick(e, order)}
                        className="px-2.5 py-1.5 rounded-lg bg-[#221C16] hover:bg-[#30261D] border border-[#FF6A00]/30 text-[#FF9D2E] text-xs font-bold cursor-pointer transition-colors flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reschedule</span>
                      </button>

                      <button
                        type="button"
                        disabled={isProcessingId === order.id}
                        onClick={(e) => handleCancelClick(e, order)}
                        className="px-2.5 py-1.5 rounded-lg bg-[#1C1111] hover:bg-[#2A1616] border border-rose-500/30 text-rose-300 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1 disabled:opacity-50"
                      >
                        <XCircle className="w-3 h-3" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  ) : canModify && !isScheduledOrder ? (
                    <button
                      type="button"
                      disabled={isProcessingId === order.id}
                      onClick={(e) => handleCancelClick(e, order)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#1C1111] hover:bg-[#2A1616] border border-rose-500/30 text-rose-300 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1 disabled:opacity-50"
                    >
                      <XCircle className="w-3 h-3" />
                      <span>Cancel Order</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-stone-500">
                      {['COMPLETED', 'CANCELLED', 'REJECTED'].includes(order.status)
                        ? 'Order closed'
                        : 'Preparation underway'}
                    </span>
                  )}

                  <div className="flex items-center gap-1 text-xs text-[#FF6A00] font-bold">
                    <span>View Token</span>
                    <ChevronRight className="w-4 h-4 text-[#FF6A00]" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reschedule Modal */}
      <ScheduleSelectorModal
        isOpen={Boolean(rescheduleOrderId)}
        onClose={() => setRescheduleOrderId(null)}
        orderIdToReschedule={rescheduleOrderId}
        title="Reschedule Pickup Time"
        subtitle="Select a new future date and time slot for your order."
      />
    </div>
  );
};
