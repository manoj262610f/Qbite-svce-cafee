import React, { useState } from 'react';
import {
  ArrowLeft,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Banknote,
  QrCode
} from 'lucide-react';
import { useCanteen } from '../context/CanteenContext';
import { useAuth } from '../context/AuthContext';
import { PaymentMethod, Order } from '../types';

interface CheckoutPageProps {
  onBack: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  onBack,
  onOrderSuccess
}) => {
  const {
    cart,
    cartSubtotal,
    cartTotal,
    placeOrder,
    settings
  } = useCanteen();

  const { currentUser, userProfile } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COUNTER');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCanteenClosed = settings.status === 'CLOSED';
  const isCanteenPaused = settings.status === 'PAUSED';

  const handlePlaceOrder = async () => {
    if (isCanteenClosed) {
      setError('Canteen is currently closed. Orders cannot be accepted.');
      return;
    }
    if (isCanteenPaused) {
      setError('Ordering is temporarily paused due to kitchen rush. Please try in 5 minutes.');
      return;
    }
    if (cart.length === 0) {
      setError('Your cart is empty. Please add items to order.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const order = await placeOrder(specialInstructions, paymentMethod);
      onOrderSuccess(order);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to place order. Please try again.';
      setError(msg);
      setSubmitting(false);
    }
  };

  const paymentOptions: { id: PaymentMethod; label: string; desc: string; icon: any }[] = [
    {
      id: 'COUNTER',
      label: 'Cash at Counter',
      desc: 'Pay cash directly at Canteen Counter 1 & 2',
      icon: Banknote
    },
    {
      id: 'UPI',
      label: 'UPI Counter Pay',
      desc: 'Scan official SVCE Cafe QR code upon token collection',
      icon: QrCode
    },
    {
      id: 'ONLINE',
      label: 'Campus SmartCard',
      desc: 'Official SVCE Student / Staff SmartCard verification',
      icon: CreditCard
    }
  ];

  return (
    <div className="pb-36 lg:pb-24 pt-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center gap-3 border-b border-white/8 pb-4">
        <button
          onClick={onBack}
          disabled={submitting}
          className="w-9 h-9 rounded-xl bg-[#141414] hover:bg-[#1E1E1E] border border-white/10 flex items-center justify-center text-stone-300 hover:text-white cursor-pointer disabled:opacity-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Confirm Order
          </h1>
          <p className="text-xs sm:text-sm text-[#A1A1A1]">Official SVCE Cafe remote ordering</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-[#1C1111] border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-start gap-3 shadow-md max-w-2xl">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong className="block font-bold text-white">Order Notice</strong>
            <p className="mt-0.5 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Pickup & Payment Details */}
        <div className="lg:col-span-7 space-y-4">
          {/* Pickup Location Card */}
          <div className="bg-[#141414] rounded-3xl p-5 border border-white/8 shadow-md space-y-2">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#A1A1A1]">
              <MapPin className="w-4 h-4 text-[#FF6A00]" />
              <span>Pickup Location</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm sm:text-base text-white">
                  SVCE Central Canteen
                </h3>
                <p className="text-xs text-[#A1A1A1]">
                  Counters 1 & 2 · Campus Ground Floor
                </p>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full">
                Counter Pickup
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-[#141414] rounded-3xl p-5 border border-white/8 shadow-md space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-[#A1A1A1]">
              Select Payment Method
            </h2>

            <div className="space-y-2">
              {paymentOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = paymentMethod === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setPaymentMethod(opt.id)}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#1C1C1C] border-[#FF6A00] shadow-md glow-orange-sm'
                        : 'bg-[#181818] border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          isSelected ? 'bg-[#FF6A00] text-black' : 'bg-[#222] text-[#A1A1A1]'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-black text-xs sm:text-sm text-white">{opt.label}</p>
                        <p className="text-[11px] text-[#A1A1A1]">{opt.desc}</p>
                      </div>
                    </div>

                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-[#FF6A00] bg-[#FF6A00]' : 'border-stone-600'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Special Kitchen Notes */}
          <div className="bg-[#141414] rounded-3xl p-5 border border-white/8 shadow-md space-y-2">
            <label htmlFor="notes" className="text-xs font-black uppercase tracking-wider text-[#A1A1A1] block">
              Kitchen Preparation Note (Optional)
            </label>
            <input
              id="notes"
              type="text"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Extra chutney, less oil, takeaway parcel packing..."
              maxLength={100}
              className="w-full p-3.5 rounded-2xl bg-[#1C1C1C] border border-white/8 text-xs sm:text-sm font-medium text-white placeholder:text-stone-500 focus:outline-none focus:border-[#FF6A00]/60 focus:ring-1 focus:ring-[#FF6A00]/30 shadow-inner"
            />
          </div>
        </div>

        {/* Right Column: Order Summary & Place Order Action */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#141414] rounded-3xl p-6 border border-white/8 shadow-xl space-y-4">
            <h2 className="text-base font-black text-white pb-3 border-b border-white/8">
              Items Summary ({cart.length} {cart.length === 1 ? 'item' : 'items'})
            </h2>

            <div className="divide-y divide-white/5 max-h-56 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.foodId} className="py-2.5 first:pt-0 last:pb-0 flex justify-between text-xs sm:text-sm">
                  <span className="text-stone-300 font-medium">
                    {item.name} <span className="text-stone-500 font-mono-token">× {item.quantity}</span>
                  </span>
                  <span className="font-mono-token font-bold text-white">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Bill Breakdown */}
            <div className="pt-3 border-t border-white/8 space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between text-[#A1A1A1]">
                <span>Items Subtotal</span>
                <span className="font-mono-token font-bold text-white">₹{cartSubtotal}</span>
              </div>
              <div className="flex justify-between text-[#A1A1A1]">
                <span>Convenience Fee</span>
                <span className="font-mono-token font-bold text-emerald-400">FREE</span>
              </div>
              <div className="pt-2 border-t border-white/8 flex justify-between text-lg font-black text-white">
                <span>Total Due</span>
                <span className="font-mono-token text-[#FF6A00]">₹{cartTotal}</span>
              </div>
            </div>

            {/* Desktop Place Order Button */}
            <div className="hidden lg:block pt-3">
              <button
                onClick={handlePlaceOrder}
                disabled={submitting || isCanteenClosed || isCanteenPaused || cart.length === 0}
                className="w-full py-4 px-6 bg-[#FF6A00] hover:bg-[#FF7A00] text-black font-black text-base rounded-2xl shadow-xl glow-orange-sm flex items-center justify-between cursor-pointer transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {submitting ? (
                  <div className="w-full flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Placing order...</span>
                  </div>
                ) : (
                  <>
                    <div className="text-left">
                      <span className="text-[10px] uppercase font-bold text-black/70 block">Total</span>
                      <span className="font-mono-token font-black text-lg">₹{cartTotal}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>PLACE ORDER</span>
                      <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                    </div>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Confirmation Button (Mobile only) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-[#080808]/95 backdrop-blur-xl border-t border-white/8 z-30">
        <div className="max-w-md mx-auto">
          <button
            onClick={handlePlaceOrder}
            disabled={submitting || isCanteenClosed || isCanteenPaused || cart.length === 0}
            className="w-full py-4 px-6 bg-[#FF6A00] hover:bg-[#FF7A00] text-black font-black text-base rounded-2xl shadow-xl glow-orange-sm flex items-center justify-between cursor-pointer transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {submitting ? (
              <div className="w-full flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Placing order...</span>
              </div>
            ) : (
              <>
                <div className="text-left">
                  <span className="text-[10px] uppercase font-bold text-black/70 block">Total</span>
                  <span className="font-mono-token font-black text-lg">₹{cartTotal}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>PLACE ORDER</span>
                  <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                </div>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
