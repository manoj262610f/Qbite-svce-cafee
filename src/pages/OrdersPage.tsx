import React, { useState } from 'react';
import { Clock, ChevronRight, ArrowRight, UtensilsCrossed } from 'lucide-react';
import { useCanteen } from '../context/CanteenContext';
import { Order } from '../types';
import { StatusBadge } from '../components/StatusBadge';

interface OrdersPageProps {
  onSelectOrder: (orderId: string) => void;
  onBrowseMenu: () => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({ onSelectOrder, onBrowseMenu }) => {
  const { myOrders } = useCanteen();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const filteredOrders = myOrders.filter((o) => {
    if (filter === 'active') return ['PLACED', 'ACCEPTED', 'PREPARING', 'READY'].includes(o.status);
    if (filter === 'completed') return o.status === 'COMPLETED' || o.status === 'CANCELLED' || o.status === 'REJECTED';
    return true;
  });

  return (
    <div className="pb-24 pt-3 px-4 max-w-md mx-auto space-y-4">
      <div>
        <h2 className="text-xl font-black text-white tracking-tight">
          My Canteen Orders
        </h2>
        <p className="text-xs text-[#A1A1A1]">
          Track live tokens and past order receipts
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 bg-[#141414] p-1.5 rounded-2xl border border-white/8">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-2 text-xs font-black rounded-xl cursor-pointer transition-all ${
            filter === 'all'
              ? 'bg-[#FF6A00] text-black shadow-md glow-orange-sm'
              : 'text-[#A1A1A1] hover:text-white'
          }`}
        >
          All ({myOrders.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`flex-1 py-2 text-xs font-black rounded-xl cursor-pointer transition-all ${
            filter === 'active'
              ? 'bg-[#FF6A00] text-black shadow-md glow-orange-sm'
              : 'text-[#A1A1A1] hover:text-white'
          }`}
        >
          Active ({myOrders.filter((o) => ['PLACED', 'ACCEPTED', 'PREPARING', 'READY'].includes(o.status)).length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`flex-1 py-2 text-xs font-black rounded-xl cursor-pointer transition-all ${
            filter === 'completed'
              ? 'bg-[#FF6A00] text-black shadow-md glow-orange-sm'
              : 'text-[#A1A1A1] hover:text-white'
          }`}
        >
          History
        </button>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-[#141414] rounded-3xl p-8 text-center border border-white/8 shadow-md">
          <Clock className="w-10 h-10 text-stone-600 mx-auto mb-2" />
          <p className="text-sm font-bold text-white">No orders in this view</p>
          <p className="text-xs text-[#A1A1A1] mt-1 max-w-xs mx-auto">
            Order your food in advance to skip the canteen queue.
          </p>
          <button
            onClick={onBrowseMenu}
            className="mt-4 px-5 py-2.5 bg-[#FF6A00] hover:bg-[#FF7A00] text-black font-black text-xs rounded-xl cursor-pointer shadow-md glow-orange-sm transition-all active:scale-95"
          >
            ORDER NOW
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const isReady = order.status === 'READY';

            return (
              <div
                key={order.id}
                onClick={() => onSelectOrder(order.id)}
                className={`bg-[#141414] hover:bg-[#181818] rounded-3xl p-4 border transition-all cursor-pointer shadow-lg ${
                  isReady
                    ? 'border-emerald-500/50 glow-emerald-sm'
                    : 'border-white/8 hover:border-[#FF6A00]/40'
                }`}
              >
                <div className="flex items-center justify-between pb-2.5 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black font-mono-token text-[#FF6A00]">
                      {order.tokenString}
                    </span>
                    <span className="text-stone-600">·</span>
                    <span className="text-xs font-mono-token text-stone-400">
                      {order.orderNumber}
                    </span>
                  </div>
                  <StatusBadge status={order.status} size="sm" />
                </div>

                <div className="py-2.5 flex items-center justify-between text-xs">
                  <div className="pr-2 min-w-0">
                    <p className="font-bold text-white line-clamp-1">
                      {order.items.map((i) => `${i.name} (${i.quantity})`).join(', ')}
                    </p>
                    <p className="text-[11px] text-[#A1A1A1] mt-0.5">
                      {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      {' · '}
                      <span className="font-bold text-white font-mono-token">₹{order.total}</span>
                      {' · '}
                      <span className={order.paymentStatus === 'PAID' ? 'text-emerald-400 font-bold' : 'text-[#FF9D2E]'}>
                        {order.paymentStatus === 'PAID' ? 'PAID' : 'Pay on Pickup'}
                      </span>
                    </p>
                  </div>

                  <ChevronRight className="w-4 h-4 text-stone-500 shrink-0" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
