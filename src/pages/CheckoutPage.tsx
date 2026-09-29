import React, { useState } from 'react';
import {
  ArrowLeft,
  Clock,
  ShieldCheck,
  Banknote,
  MapPin,
  AlertCircle,
  CheckCircle2,
  QrCode,
  CreditCard,
  Building,
  Info
} from 'lucide-react';
import { useCanteen } from '../context/CanteenContext';
import { Order, PaymentMethod } from '../types';

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

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COUNTER');
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

  const paymentOptions: { id: PaymentMethod; label: string; desc: string; icon: React.FC<{ className?: string }> }[] = [
    {
      id: 'COUNTER',
      label: 'Pay at Counter',
      desc: 'Pay Cash or UPI directly at Counter 1 & 2 on pickup',
      icon: Banknote
    },
    {
      id: 'UPI',
      label: 'UPI (Demo / Test)',
      desc: 'Instant UPI Sandbox verification (Demo Mode)',
      icon: QrCode
    },
    {
      id: 'ONLINE',
      label: 'Card / NetBanking (Demo)',
      desc: 'Simulated campus card payment sandbox',
      icon: CreditCard
    }
  ];

  return (
    <div className="pb-36 pt-3 px-4 max-w-md mx-auto space-y-4">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          disabled={submitting}
          className="w-8 h-8 rounded-xl bg-[#141414] hover:bg-[#1E1E1E] border border-white/10 flex items-center justify-center text-stone-300 hover:text-white cursor-pointer disabled:opacity-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">
            Confirm Order
          </h2>
          <p className="text-xs text-[#A1A1A1]">Official SVCE Cafe remote ordering</p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-[#1C1111] border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 shadow-md">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong className="block font-bold text-white">Order Notice</strong>
            <p className="mt-0.5 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Pickup Location Card */}
      <div className="bg-[#141414] rounded-3xl p-4 border border-white/8 shadow-md space-y-2">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-[#A1A1A1]">
          <MapPin className="w-3.5 h-3.5 text-[#FF6A00]" />
          <span>Pickup Location</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-black text-sm text-white">
              SVCE Central Canteen
            </h4>
            <p className="text-xs text-[#A1A1A1]">
              Counters 1 & 2 · Campus Ground Floor
            </p>
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-full">
            Counter Pickup
          </span>
        </div>
      </div>

      {/* Order Summary Card */}
      <div className="bg-[#141414] rounded-3xl p-4 border border-white/8 shadow-md space-y-3">
        <h3 className="text-[10px] font-black uppercase tracking-wider text-[#A1A1A1]">
          Items Summary ({cart.length} {cart.length === 1 ? 'item' : 'items'})
        </h3>

        <div className="divide-y divide-white/5 max-h-48 overflow-y-auto pr-1">
          {cart.map((item) => (
            <div key={item.foodId} className="py-2.5 first:pt-0 last:pb-0 flex justify-between text-xs">
              <span className="text-stone-300 font-medium">
                {item.name} <span className="text-stone-500 font-mono-token">× {item.quantity}</span>
              </span>
              <span className="font-mono-token font-bold text-white">
                ₹{item.price * item.quantity}
              </span>
            </div>
          ))}
        </div>

        {/* Pricing calculations */}
        <div className="border-t border-dashed border-white/10 pt-3 space-y-1 text-xs">
          <div className="flex justify-between text-[#A1A1A1]">
            <span>Subtotal</span>
            <span className="font-mono-token font-bold text-white">₹{cartSubtotal}</span>
          </div>
          <div className="flex justify-between text-base font-black text-white pt-1.5 border-t border-white/10">
            <span>Total Payable</span>
            <span className="font-mono-token text-[#FF6A00]">₹{cartTotal}</span>
          </div>
        </div>
      </div>

      {/* Payment Method Selector */}
      <div className="bg-[#141414] rounded-3xl p-4 border border-white/8 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-black uppercase tracking-wider text-[#A1A1A1]">
            Payment Method
          </h3>
          <span className="text-[10px] font-bold text-[#FF9D2E] flex items-center gap-1">
            <Info className="w-3 h-3" />
            <span>Test Mode</span>
          </span>
        </div>

        <div className="space-y-2">
          {paymentOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = paymentMethod === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => setPaymentMethod(opt.id)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'border-[#FF6A00] bg-[#FF6A00]/10 shadow-md'
                    : 'border-white/5 bg-[#1C1C1C] hover:bg-[#222222]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-[#FF6A00] text-black shadow-sm'
                        : 'bg-[#2A2A2A] text-stone-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-black text-xs text-white">
                      {opt.label}
                    </p>
                    <p className="text-[10px] text-[#A1A1A1]">
                      {opt.desc}
                    </p>
                  </div>
                </div>

                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    isSelected ? 'border-[#FF6A00]' : 'border-stone-600'
                  }`}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-[#FF6A00]" />}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[10px] text-[#A1A1A1] flex items-start gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
          <span>Demo / Test Payment: Official college canteen policy allows payment on counter pickup. Never enter real CVV or PIN credentials.</span>
        </div>
      </div>

      {/* Special Kitchen Notes */}
      <div className="bg-[#141414] rounded-3xl p-4 border border-white/8 shadow-md space-y-2">
        <label htmlFor="notes" className="text-[10px] font-black uppercase tracking-wider text-[#A1A1A1] block">
          Kitchen Preparation Note (Optional)
        </label>
        <input
          id="notes"
          type="text"
          value={specialInstructions}
          onChange={(e) => setSpecialInstructions(e.target.value)}
          placeholder="e.g. Extra spicy, less oil, parcel packing..."
          maxLength={100}
          className="w-full p-3 rounded-2xl bg-[#1C1C1C] border border-white/8 text-xs font-medium text-white placeholder:text-stone-500 focus:outline-none focus:border-[#FF6A00]/60 focus:ring-1 focus:ring-[#FF6A00]/30 shadow-inner"
        />
      </div>

      {/* Fixed Bottom Confirmation Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#080808]/95 backdrop-blur-xl border-t border-white/8 max-w-md mx-auto z-30">
        <button
          onClick={handlePlaceOrder}
          disabled={submitting || isCanteenClosed || isCanteenPaused || cart.length === 0}
          className="w-full py-4 px-6 bg-[#FF6A00] hover:bg-[#FF7A00] text-black font-black text-base rounded-2xl shadow-xl glow-orange-sm flex items-center justify-between cursor-pointer transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {submitting ? (
            <div className="w-full flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              <span>Confirming with Kitchen...</span>
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
  );
};
