import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Tag,
  ArrowRight,
  UtensilsCrossed,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useCanteen } from '../context/CanteenContext';

interface CartPageProps {
  onProceedToCheckout: () => void;
  onBrowseMenu: () => void;
}

export const CartPage: React.FC<CartPageProps> = ({
  onProceedToCheckout,
  onBrowseMenu
}) => {
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    appliedCoupon,
    discountAmount,
    cartTotal,
    applyCoupon,
    removeCoupon,
    coupons
  } = useCanteen();

  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  const handleApplyCoupon = (codeToApply?: string) => {
    const code = codeToApply || couponInput;
    if (!code.trim()) return;
    const res = applyCoupon(code);
    setCouponFeedback(res);
    if (res.success) {
      setCouponInput('');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="pb-24 pt-12 px-6 max-w-md mx-auto text-center">
        <div className="w-20 h-20 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-extrabold text-stone-900">
          Your cart is empty
        </h2>
        <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto leading-relaxed">
          Looks like you haven't added any snacks or meals yet. Check out today's hot specials!
        </p>
        <button
          onClick={onBrowseMenu}
          className="mt-6 py-3.5 px-6 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md shadow-orange-600/20 inline-flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <UtensilsCrossed className="w-4 h-4" />
          <span>BROWSE CANTEEN MENU</span>
        </button>
      </div>
    );
  }

  return (
    <div className="pb-32 pt-3 px-4 max-w-md mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">
            Review Order
          </h2>
          <p className="text-xs text-stone-500">
            {cart.length} unique {cart.length === 1 ? 'item' : 'items'} in your tray
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-bold text-stone-400 hover:text-rose-600 cursor-pointer flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Tray</span>
        </button>
      </div>

      {/* Cart Items List */}
      <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm divide-y divide-stone-100">
        {cart.map((item) => (
          <div key={item.foodId} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
                <h4 className="font-bold text-sm text-stone-900 leading-tight">
                  {item.name}
                </h4>
              </div>
              <p className="text-xs font-mono-token text-stone-500 mt-1 pl-4.5">
                ₹{item.price} each · <strong className="text-stone-800">₹{item.price * item.quantity}</strong>
              </p>
            </div>

            {/* Stepper */}
            <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl p-1">
              <button
                onClick={() => updateCartQuantity(item.foodId, item.quantity - 1)}
                className="w-7 h-7 rounded-lg bg-white text-stone-700 font-bold shadow-xs flex items-center justify-center cursor-pointer active:scale-95"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-sm font-bold text-stone-900 px-1 min-w-[18px] text-center font-mono-token">
                {item.quantity}
              </span>
              <button
                onClick={() => updateCartQuantity(item.foodId, item.quantity + 1)}
                className="w-7 h-7 rounded-lg bg-orange-600 text-white font-bold shadow-xs flex items-center justify-center cursor-pointer active:scale-95"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Coupon Box */}
      <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700">
          <Tag className="w-3.5 h-3.5 text-orange-600" />
          <span>Have a Student Coupon?</span>
        </div>

        {appliedCoupon ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-emerald-800 font-mono-token">{appliedCoupon.code} Applied</span>
              <p className="text-emerald-700 text-[11px]">Saved ₹{discountAmount} on this order</p>
            </div>
            <button
              onClick={removeCoupon}
              className="font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
              placeholder="e.g. SVCE10"
              className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold uppercase placeholder:normal-case placeholder:font-normal focus:outline-none focus:border-orange-500"
            />
            <button
              onClick={() => handleApplyCoupon()}
              className="px-4 py-2 bg-stone-900 text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-stone-800"
            >
              Apply
            </button>
          </div>
        )}

        {couponFeedback && (
          <p className={`text-xs ${couponFeedback.success ? 'text-emerald-600 font-semibold' : 'text-rose-600'}`}>
            {couponFeedback.message}
          </p>
        )}

        {/* Quick Coupon Chips */}
        {!appliedCoupon && coupons.length > 0 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar pt-1">
            {coupons.map((c) => (
              <button
                key={c.code}
                onClick={() => handleApplyCoupon(c.code)}
                className="text-[11px] font-mono-token font-bold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 px-2 py-1 rounded-lg cursor-pointer whitespace-nowrap"
              >
                {c.code}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bill Summary */}
      <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm space-y-2 text-xs">
        <h4 className="font-bold uppercase tracking-wider text-stone-400 mb-2">
          Bill Details
        </h4>
        <div className="flex justify-between text-stone-600">
          <span>Item Total</span>
          <span className="font-mono-token font-semibold text-stone-900">₹{cartSubtotal}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-emerald-600 font-medium">
            <span>Coupon Discount</span>
            <span className="font-mono-token">-₹{discountAmount}</span>
          </div>
        )}
        <div className="flex justify-between text-stone-600">
          <span>Convenience / Queue Skip Fee</span>
          <span className="font-bold text-emerald-600">FREE</span>
        </div>
        <div className="flex justify-between text-base font-extrabold text-stone-900 pt-2 border-t border-stone-100">
          <span>To Pay</span>
          <span className="font-mono-token text-orange-600">₹{cartTotal}</span>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-16 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-stone-200 p-4 shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] text-stone-400 uppercase font-semibold">Total Payable</p>
            <p className="text-xl font-extrabold font-mono-token text-stone-900">
              ₹{cartTotal}
            </p>
          </div>
          <button
            onClick={onProceedToCheckout}
            className="flex-1 py-3.5 px-6 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md shadow-orange-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
          >
            <span>PROCEED TO CHECKOUT</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
