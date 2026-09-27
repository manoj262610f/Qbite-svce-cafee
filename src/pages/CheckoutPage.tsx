import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  ShieldCheck,
  CreditCard,
  Banknote,
  QrCode,
  MapPin,
  Sparkles,
  AlertCircle
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
    discountAmount,
    cartTotal,
    appliedCoupon,
    placeOrder,
    settings
  } = useCanteen();

  const [paymentMethod, setPaymentMethod] = useState<'COUNTER' | 'UPI' | 'ONLINE'>('COUNTER');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePlaceOrder = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const order = await placeOrder(paymentMethod, specialInstructions);
      onOrderSuccess(order);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pb-28 pt-3 px-4 max-w-md mx-auto space-y-4">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-700 hover:bg-stone-50 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">
            Checkout
          </h2>
          <p className="text-xs text-stone-500">Fast remote canteen ordering</p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
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
              Fast Pickup Counters 1 & 2 · Campus Ground Floor
            </p>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg">
            Canteen Pickup
          </span>
        </div>
      </div>

      {/* Order Summary Card */}
      <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
          Order Summary ({cart.length} {cart.length === 1 ? 'item' : 'items'})
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
          {discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>Discount ({appliedCoupon?.code})</span>
              <span className="font-mono-token">-₹{discountAmount}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-extrabold text-stone-900 pt-1.5 border-t border-stone-100">
            <span>Total Amount</span>
            <span className="font-mono-token text-orange-600">₹{cartTotal}</span>
          </div>
        </div>
      </div>

      {/* Payment Selection Card */}
      <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
          Select Payment Method
        </h3>

        <div className="space-y-2">
          {/* Option 1: Pay at Counter (Default & instantaneous for college deployment) */}
          <label
            onClick={() => setPaymentMethod('COUNTER')}
            className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
              paymentMethod === 'COUNTER'
                ? 'bg-orange-50/70 border-orange-500 ring-1 ring-orange-500/20'
                : 'bg-white border-stone-200 hover:bg-stone-50'
            }`}
          >
            <input
              type="radio"
              name="payment"
              checked={paymentMethod === 'COUNTER'}
              onChange={() => setPaymentMethod('COUNTER')}
              className="mt-0.5 text-orange-600"
            />
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <Banknote className="w-4 h-4 text-orange-600" />
                <span className="font-bold text-xs text-stone-900">Pay at Counter</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-md">
                  Recommended
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Order now, receive your queue token immediately, and pay via cash/UPI when collecting your food.
              </p>
            </div>
          </label>

          {/* Option 2: UPI QR at Counter */}
          <label
            onClick={() => setPaymentMethod('UPI')}
            className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
              paymentMethod === 'UPI'
                ? 'bg-orange-50/70 border-orange-500 ring-1 ring-orange-500/20'
                : 'bg-white border-stone-200 hover:bg-stone-50'
            }`}
          >
            <input
              type="radio"
              name="payment"
              checked={paymentMethod === 'UPI'}
              onChange={() => setPaymentMethod('UPI')}
              className="mt-0.5 text-orange-600"
            />
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-orange-600" />
                <span className="font-bold text-xs text-stone-900">UPI / QR Code Scan</span>
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Pay using Google Pay, PhonePe, or Paytm QR displayed at pickup counter.
              </p>
            </div>
          </label>

          {/* Option 3: Online Payment */}
          <label
            onClick={() => setPaymentMethod('ONLINE')}
            className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
              paymentMethod === 'ONLINE'
                ? 'bg-orange-50/70 border-orange-500 ring-1 ring-orange-500/20'
                : 'bg-white border-stone-200 hover:bg-stone-50'
            }`}
          >
            <input
              type="radio"
              name="payment"
              checked={paymentMethod === 'ONLINE'}
              onChange={() => setPaymentMethod('ONLINE')}
              className="mt-0.5 text-orange-600"
            />
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-stone-500" />
                <span className="font-bold text-xs text-stone-900">Online Campus Card / Netbanking</span>
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Direct student card wallet or online banking integration.
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Special Kitchen Instructions */}
      <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-stone-400 block">
          Kitchen Notes (Optional)
        </label>
        <input
          type="text"
          value={specialInstructions}
          onChange={(e) => setSpecialInstructions(e.target.value)}
          placeholder="e.g. Less spicy, extra coconut chutney, no onions"
          className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-orange-500"
        />
      </div>

      {/* Place Order CTA */}
      <div className="pt-2">
        <button
          onClick={handlePlaceOrder}
          disabled={submitting}
          className="w-full py-4 px-6 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-base shadow-lg shadow-orange-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {submitting ? (
            <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>PLACE ORDER · ₹{cartTotal}</span>
              <Sparkles className="w-4 h-4" />
            </>
          )}
        </button>

        <p className="text-[11px] text-stone-400 text-center mt-2.5">
          🔒 Secure college canteen token generation with real-time tracking
        </p>
      </div>
    </div>
  );
};
