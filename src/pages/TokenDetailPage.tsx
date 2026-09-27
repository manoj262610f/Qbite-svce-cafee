import React, { useState } from 'react';
import { ArrowLeft, Clock, RefreshCw, FileText, CheckCircle2 } from 'lucide-react';
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
  const { activeOrder, myOrders, queueState } = useCanteen();
  const [showReceipt, setShowReceipt] = useState(false);

  // If specific orderId requested, find it; otherwise show activeOrder or latest order
  const displayOrder: Order | null =
    (orderId ? myOrders.find((o) => o.id === orderId) : null) ||
    activeOrder ||
    (myOrders.length > 0 ? myOrders[0] : null);

  if (!displayOrder) {
    return (
      <div className="pb-24 pt-12 px-6 max-w-md mx-auto text-center">
        <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-extrabold text-stone-900">
          No Active Token Found
        </h3>
        <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
          Currently serving token <strong className="font-mono-token text-orange-600">#{queueState.currentServingToken}</strong> at the canteen counter. Place an order to receive your queue token.
        </p>
        <button
          onClick={onBrowseMenu}
          className="mt-6 py-3 px-6 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs cursor-pointer"
        >
          ORDER FOOD NOW
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
            className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-700 hover:bg-stone-50 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">
              Live Queue Token
            </h2>
            <p className="text-xs text-stone-500">Real-time sync with SVCE kitchen</p>
          </div>
        </div>

        <button
          onClick={() => setShowReceipt(true)}
          className="p-2 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 cursor-pointer text-xs font-bold flex items-center gap-1 shadow-xs"
          title="View Receipt"
        >
          <FileText className="w-4 h-4 text-orange-600" />
          <span>Bill</span>
        </button>
      </div>

      {/* Main Token Card with live timeline & celebration */}
      <TokenCard order={displayOrder} onViewBill={() => setShowReceipt(true)} />

      {/* Items in this Order */}
      <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
          Order Items ({displayOrder.items.length})
        </h4>
        <div className="divide-y divide-stone-100">
          {displayOrder.items.map((item, idx) => (
            <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span className="font-semibold text-stone-800">{item.name}</span>
                <span className="text-stone-400 font-mono-token">× {item.quantity}</span>
              </div>
              <span className="font-bold font-mono-token text-stone-900">
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
