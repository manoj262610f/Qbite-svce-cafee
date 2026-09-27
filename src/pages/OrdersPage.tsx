import React, { useState } from 'react';
import { Clock, CheckCircle2, ChevronRight, FileText, ArrowRight } from 'lucide-react';
import { useCanteen } from '../context/CanteenContext';
import { Order, OrderStatus } from '../types';
import { ReceiptModal } from '../components/ReceiptModal';

interface OrdersPageProps {
  onSelectOrder: (orderId: string) => void;
  onBrowseMenu: () => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({ onSelectOrder, onBrowseMenu }) => {
  const { myOrders } = useCanteen();
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const filteredOrders = myOrders.filter((o) => {
    if (filter === 'active') return ['PLACED', 'ACCEPTED', 'PREPARING', 'READY'].includes(o.status);
    if (filter === 'completed') return o.status === 'COMPLETED' || o.status === 'CANCELLED';
    return true;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'READY':
        return <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[10px] px-2 py-0.5 rounded-full animate-pulse">READY FOR PICKUP</span>;
      case 'PREPARING':
        return <span className="bg-amber-100 text-amber-800 font-bold text-[10px] px-2 py-0.5 rounded-full">PREPARING</span>;
      case 'ACCEPTED':
        return <span className="bg-blue-100 text-blue-800 font-bold text-[10px] px-2 py-0.5 rounded-full">ACCEPTED</span>;
      case 'COMPLETED':
        return <span className="bg-stone-100 text-stone-600 font-semibold text-[10px] px-2 py-0.5 rounded-full">COMPLETED</span>;
      case 'CANCELLED':
        return <span className="bg-rose-100 text-rose-700 font-semibold text-[10px] px-2 py-0.5 rounded-full">CANCELLED</span>;
      default:
        return <span className="bg-orange-100 text-orange-800 font-bold text-[10px] px-2 py-0.5 rounded-full">PLACED</span>;
    }
  };

  return (
    <div className="pb-24 pt-3 px-4 max-w-md mx-auto space-y-4">
      <div>
        <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">
          My Canteen Orders
        </h2>
        <p className="text-xs text-stone-500">
          Track live tokens and past order receipts
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl cursor-pointer transition-colors ${
            filter === 'all'
              ? 'bg-stone-900 text-white'
              : 'bg-white text-stone-600 border border-stone-200'
          }`}
        >
          All ({myOrders.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl cursor-pointer transition-colors ${
            filter === 'active'
              ? 'bg-stone-900 text-white'
              : 'bg-white text-stone-600 border border-stone-200'
          }`}
        >
          Active ({myOrders.filter((o) => ['PLACED', 'ACCEPTED', 'PREPARING', 'READY'].includes(o.status)).length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl cursor-pointer transition-colors ${
            filter === 'completed'
              ? 'bg-stone-900 text-white'
              : 'bg-white text-stone-600 border border-stone-200'
          }`}
        >
          Completed
        </button>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-stone-100">
          <Clock className="w-10 h-10 text-stone-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-stone-800">No orders in this view</p>
          <p className="text-xs text-stone-400 mt-1">
            Order your food in advance to skip the canteen rush
          </p>
          <button
            onClick={onBrowseMenu}
            className="mt-4 px-4 py-2 bg-orange-600 text-white font-bold text-xs rounded-xl cursor-pointer"
          >
            ORDER NOW
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const isActive = ['PLACED', 'ACCEPTED', 'PREPARING', 'READY'].includes(order.status);

            return (
              <div
                key={order.id}
                onClick={() => onSelectOrder(order.id)}
                className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer hover:shadow-md ${
                  order.status === 'READY'
                    ? 'border-emerald-400 ring-2 ring-emerald-400/20'
                    : 'border-stone-100 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between pb-2.5 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold font-mono-token text-orange-600">
                      {order.tokenString}
                    </span>
                    <span className="text-stone-300">·</span>
                    <span className="text-xs font-mono-token text-stone-500">
                      {order.orderNumber}
                    </span>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                <div className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-stone-800 line-clamp-1">
                      {order.items.map((i) => `${i.name} (${i.quantity})`).join(', ')}
                    </p>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      {' · '}
                      <span className="font-semibold text-stone-700">₹{order.total}</span>
                    </p>
                  </div>

                  <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
                </div>

                {/* Footer buttons */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedReceiptOrder(order);
                    }}
                    className="font-bold text-stone-600 hover:text-stone-900 flex items-center gap-1 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-orange-600" />
                    <span>View Bill</span>
                  </button>

                  <span className={`font-bold ${isActive ? 'text-orange-600' : 'text-stone-500'}`}>
                    {isActive ? 'Track Live Queue →' : 'Order Details →'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Receipt Modal */}
      <ReceiptModal
        order={selectedReceiptOrder}
        isOpen={!!selectedReceiptOrder}
        onClose={() => setSelectedReceiptOrder(null)}
      />
    </div>
  );
};
