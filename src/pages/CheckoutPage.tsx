import React, { useState } from 'react';
import {
  ArrowLeft,
  Clock,
  ShieldCheck,
  Banknote,
  MapPin,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useCanteen } from '../context/CanteenContext';
import { Order } from '../types';

interface CheckoutPageProps {
  onBack: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onBack, onOrderSuccess }) => {
  const {
    cart,
    cartSubtotal,
    cartTotal,
    placeOrder,
    settings
  } = useCanteen();

  const [specialInstructions, setSpecialInstructions] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCanteenClosed = settings.status === 'CLOSED';
  const isCanteenPaused = settings.status === 'PAUSED';

  const handlePlaceOrder = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const order = await placeOrder(specialInstructions);
      onOrderSuccess(order);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Order could not be confirmed. Please check your connection and try again.';
      setError(msg);
      setSubmitting(false);
    }
  };

  return (
    <div className="pb-28 pt-3 px-4 max-w-md mx-auto space-y-4">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          disabled={submitting}
          className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-700 hover:bg-stone-50 cursor-pointer disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">
            Confirm Order
          </h2>
          <p className="text-xs text-stone-500">Official SVCE Cafe remote ordering</p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 shadow-2xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong className="block font-bold text-rose-900">Order Notice</strong>
            <p className="mt-0.5 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Pickup Location Card */}
      <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-400">
          <MapPin className="w-3.5 h-3.5 text-orange-600" />
          <span>Pickup Location</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-stone-900">
              SVCE Central Canteen
            </h4>
            <p className="text-xs text-stone-500">
              Counters 1 & 2 · Campus Ground Floor
            </p>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
            Counter Pickup
          </span>
        </div>
      </div>

      {/* Order Summary Card */}
      <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
          Items Summary ({cart.length} {cart.length === 1 ? 'item' : 'items'})
        </h3>

        <div className="divide-y divide-stone-100 max-h-48 overflow-y-auto pr-1">
          {cart.map((item) => (
            <div key={item.foodId} className="py-2 first:pt-0 last:pb-0 flex justify-between text-xs">
              <span className="text-stone-800 font-medium">
                {item.name} <span className="text-stone-400 font-mono-token">× {item.quantity}</span>
              </span>
              <span className="font-mono-token font-bold text-stone-900">
                ₹{item.price * item.quantity}
              </span>
            </div>
          ))}
        </div>

        {/* Pricing calculations */}
        <div className="border-t border-dashed border-stone-200 pt-3 space-y-1 text-xs">
          <div className="flex justify-between text-stone-500">
            <span>Subtotal</span>
            <span className="font-mono-token font-semibold text-stone-800">₹{cartSubtotal}</span>
          </div>
          <div className="flex justify-between text-base font-extrabold text-stone-900 pt-1.5 border-t border-stone-100">
            <span>Total Payable</span>
            <span className="font-mono-token text-orange-600">₹{cartTotal}</span>
          </div>
        </div>
      </div>

      {/* Payment Method: Pay at Counter ONLY (Stage 1) */}
      <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
          Payment Method
        </h3>

        <div className="p-3.5 rounded-xl border-2 border-orange-500 bg-orange-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-xs">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <p className="font-extrabold text-sm text-stone-900">
                Pay at Canteen Counter
              </p>
              <p className="text-[11px] text-stone-500">
                Pay cash or UPI at Counter 1 or 2 when collecting your order
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
            Selected
          </span>
        </div>
      </div>

      {/* Special Kitchen Notes */}
      <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm space-y-2">
        <label htmlFor="notes" className="text-xs font-bold uppercase tracking-wider text-stone-400 block">
          Cooking / Packaging Note (Optional)
        </label>
        <input
          id="notes"
          type="text"
          value={specialInstructions}
          onChange={(e) => setSpecialInstructions(e.target.value)}
          placeholder="e.g. Extra spicy, less oil, parcel packing..."
          maxLength={100}
          className="w-full p-3 rounded-xl border border-stone-200 text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 shadow-2xs"
        />
      </div>

      {/* Trust & Policy Badge */}
      <div className="p-3 bg-stone-100/80 rounded-2xl text-[11px] text-stone-500 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Atomic daily token issued upon confirmation. Orders cannot be modified once preparation begins.</span>
      </div>

      {/* Fixed Bottom Confirmation Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-stone-200 max-w-md mx-auto z-30">
        <button
          onClick={handlePlaceOrder}
          disabled={submitting || isCanteenClosed || isCanteenPaused || cart.length === 0}
          className="w-full py-4 px-6 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-base rounded-2xl shadow-xl shadow-orange-600/30 flex items-center justify-between cursor-pointer transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {submitting ? (
            <div className="w-full flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Confirming Order with Kitchen...</span>
            </div>
          ) : (
            <>
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-orange-200 block">Total</span>
                <span className="font-mono-token font-black text-lg">₹{cartTotal}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>PLACE ORDER</span>
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
