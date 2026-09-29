import React, { useState } from 'react';
import { ArrowLeft, Clock, FileText, UtensilsCrossed } from 'lucide-react';
import { useCanteen } from '../context/CanteenContext';
import { TokenCard } from '../components/TokenCard';
import { ReceiptModal } from '../components/ReceiptModal';
import { Order } from '../types';

interface TokenDetailPageProps {
  orderId?: string | null;
  onBack: () => void;
  onBrowseMenu: () => void;
}

export const TokenDetailPage: React.FC<TokenDetailPageProps> = ({
  orderId,
  onBack,
  onBrowseMenu
}) => {
  const { activeOrder, myOrders } = useCanteen();
  const [showReceipt, setShowReceipt] = useState(false);

  // If specific orderId requested, find it; otherwise show activeOrder or latest order
  const displayOrder: Order | null =
    (orderId ? myOrders.find((o) => o.id === orderId) : null) ||
    activeOrder ||
    (myOrders.length > 0 ? myOrders[0] : null);

  if (!displayOrder) {
    return (
      <div className="pb-24 pt-16 px-6 max-w-md mx-auto text-center">
        <div className="w-16 h-16 rounded-3xl bg-[#141414] border border-white/8 text-[#FF6A00] flex items-center justify-center mx-auto mb-4 shadow-xl glow-orange-sm">
          <Clock className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-black text-white">
          No Active Token Found
        </h3>
        <p className="text-xs text-[#A1A1A1] mt-1.5 max-w-xs mx-auto leading-relaxed">
          You don't have any active orders right now. Place an order from the canteen menu to receive your live queue token!
        </p>
        <button
          onClick={onBrowseMenu}
          className="mt-6 py-3.5 px-6 rounded-2xl bg-[#FF6A00] hover:bg-[#FF7A00] text-black font-black text-xs cursor-pointer shadow-lg glow-orange-sm inline-flex items-center gap-2 transition-all active:scale-95"
        >
          <UtensilsCrossed className="w-4 h-4 stroke-[2.5]" />
          <span>ORDER FOOD NOW</span>
        </button>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-3 px-4 max-w-md mx-auto space-y-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-xl bg-[#141414] hover:bg-[#1E1E1E] border border-white/8 flex items-center justify-center text-stone-300 hover:text-white cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">
              Live Queue Token
            </h2>
            <p className="text-xs text-[#A1A1A1]">Real-time sync with SVCE kitchen</p>
          </div>
        </div>

        <button
          onClick={() => setShowReceipt(true)}
          className="py-1.5 px-3 rounded-xl bg-[#141414] hover:bg-[#1E1E1E] border border-white/8 text-white cursor-pointer text-xs font-black flex items-center gap-1.5 shadow-md transition-colors"
          title="View Digital Bill"
        >
          <FileText className="w-3.5 h-3.5 text-[#FF6A00]" />
          <span>Bill</span>
        </button>
      </div>

      {/* Main Token Card with live timeline & celebration */}
      <TokenCard order={displayOrder} onViewBill={() => setShowReceipt(true)} />

      {/* Items in this Order */}
      <div className="bg-[#141414] rounded-3xl p-5 border border-white/8 shadow-xl space-y-3">
        <h4 className="text-[10px] font-black uppercase tracking-wider text-[#A1A1A1]">
          Order Items ({displayOrder.items.length})
        </h4>
        <div className="divide-y divide-white/5">
          {displayOrder.items.map((item, idx) => (
            <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                <span className="font-semibold text-stone-200">{item.name}</span>
                <span className="text-[#A1A1A1] font-mono-token">× {item.quantity}</span>
              </div>
              <span className="font-mono-token font-bold text-white">
                ₹{item.price * item.quantity}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Receipt Modal */}
      <ReceiptModal
        order={displayOrder}
        isOpen={showReceipt}
        onClose={() => setShowReceipt(false)}
      />
    </div>
  );
};
