import React from 'react';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  UtensilsCrossed,
  MapPin,
  Clock,
  Sparkles,
  ShieldCheck
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
    cartTotal,
    settings
  } = useCanteen();

  const isCanteenClosed = settings.status === 'CLOSED';
  const isCanteenPaused = settings.status === 'PAUSED';

  if (cart.length === 0) {
    return (
      <div className="pb-24 pt-16 px-6 max-w-md mx-auto text-center">
        <div className="w-20 h-20 rounded-3xl bg-[#141414] border border-white/8 text-[#FF6A00] flex items-center justify-center mx-auto mb-5 shadow-2xl glow-orange-sm">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">
          Your order tray is empty.
        </h2>
        <p className="text-xs sm:text-sm text-[#A1A1A1] mt-2 max-w-xs mx-auto leading-relaxed">
          Explore delicious South Indian breakfast, lunch thalis, hot snacks and beverages from SVCE Cafe.
        </p>
        <button
          onClick={onBrowseMenu}
          className="mt-6 py-3.5 px-6 rounded-2xl bg-[#FF6A00] hover:bg-[#FF7A00] text-black font-black text-xs shadow-lg glow-orange-sm inline-flex items-center gap-2 cursor-pointer transition-all active:scale-95"
        >
          <UtensilsCrossed className="w-4 h-4 stroke-[2.5]" />
          <span>BROWSE CANTEEN MENU</span>
        </button>
      </div>
    );
  }

  return (
    <div className="pb-36 lg:pb-24 pt-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/8 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Order Tray
          </h1>
          <p className="text-xs sm:text-sm text-[#A1A1A1]">
            {cart.length} {cart.length === 1 ? 'item' : 'items'} ready for canteen kitchen fulfillment
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-bold text-[#A1A1A1] hover:text-rose-400 cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/8 hover:bg-rose-500/10 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Tray</span>
        </button>
      </div>

      {/* Canteen Status Warning */}
      {(isCanteenClosed || isCanteenPaused) && (
        <div className="bg-[#1C170E] border border-amber-500/30 rounded-2xl p-4 text-xs text-amber-300 flex items-center gap-3">
          <Clock className="w-5 h-5 text-amber-500 shrink-0" />
          <span>
            {isCanteenClosed
              ? 'Canteen is currently closed. Orders cannot be submitted right now.'
              : 'Ordering is temporarily paused while the kitchen clears peak rush.'}
          </span>
        </div>
      )}

      {/* 2-Column Responsive Layout for Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Items List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#141414] rounded-3xl p-5 border border-white/8 shadow-xl divide-y divide-white/8">
            {cart.map((item) => (
              <div key={item.foodId} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-sm sm:text-base text-white leading-tight truncate">
                    {item.name}
                  </h3>
                  <p className="text-xs font-mono-token text-[#A1A1A1] mt-1">
                    ₹{item.price} each · <strong className="text-white font-black">₹{item.price * item.quantity}</strong>
                  </p>
                </div>

                {/* Stepper */}
                <div className="flex items-center gap-2 bg-[#1C1C1C] border border-white/10 rounded-xl p-1 shrink-0">
                  <button
                    onClick={() => updateCartQuantity(item.foodId, item.quantity - 1)}
                    className="w-7 h-7 rounded-lg bg-[#262626] text-stone-200 font-bold flex items-center justify-center cursor-pointer active:scale-95 hover:bg-[#333333] transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs sm:text-sm font-mono-token font-bold text-white px-2 min-w-[20px] text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateCartQuantity(item.foodId, item.quantity + 1)}
                    className="w-7 h-7 rounded-lg bg-[#FF6A00] text-black font-bold flex items-center justify-center cursor-pointer active:scale-95 glow-orange-sm transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pickup Location Info */}
          <div className="bg-[#141414] rounded-3xl p-5 border border-white/8 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#A1A1A1]">
              <MapPin className="w-4 h-4 text-[#FF6A00]" />
              <span>Campus Pickup Counter</span>
            </div>
            <p className="text-sm font-black text-white">
              SVCE Central Canteen · Ground Floor Counters 1 & 2
            </p>
            <p className="text-xs text-[#737373]">
              Your order token is generated on checkout. Show the token screen when it changes to READY for instant food collection.
            </p>
          </div>
        </div>

        {/* Right Column: Order Summary & Checkout Action */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#141414] rounded-3xl p-6 border border-white/8 shadow-xl space-y-4">
            <h2 className="text-base font-black text-white pb-3 border-b border-white/8">
              Payment Summary
            </h2>

            <div className="space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between text-[#A1A1A1]">
                <span>Items Subtotal</span>
                <span className="font-mono-token font-bold text-white">₹{cartSubtotal}</span>
              </div>
              <div className="flex justify-between text-[#A1A1A1]">
                <span>Pickup Method</span>
                <span className="font-bold text-[#FF7A00]">Counter Pickup (Free)</span>
              </div>
              <div className="flex justify-between text-[#A1A1A1]">
                <span>Platform Fee</span>
                <span className="font-mono-token font-bold text-emerald-400">₹0 (SVCE Free)</span>
              </div>
              <div className="pt-3 border-t border-white/8 flex justify-between text-lg font-black text-white">
                <span>Total Amount</span>
                <span className="font-mono-token text-[#FF6A00]">₹{cartTotal}</span>
              </div>
            </div>

            {/* Desktop Proceed Button */}
            <div className="hidden lg:block pt-3">
              <button
                onClick={onProceedToCheckout}
                disabled={isCanteenClosed || isCanteenPaused}
                className="w-full py-4 px-5 bg-[#FF6A00] hover:bg-[#FF7A00] text-black font-black text-sm rounded-2xl shadow-xl glow-orange-sm flex items-center justify-between cursor-pointer transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            <div className="pt-2 text-[11px] text-stone-500 flex items-center gap-1.5 justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>UPI, QR & Cash accepted at counter</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Checkout Bar (only on smaller screens) */}
      <div className="lg:hidden fixed bottom-16 left-0 right-0 p-4 bg-[#080808]/95 backdrop-blur-xl border-t border-white/8 z-30">
        <div className="max-w-md mx-auto">
          <button
            onClick={onProceedToCheckout}
            disabled={isCanteenClosed || isCanteenPaused}
            className="w-full py-3.5 px-5 bg-[#FF6A00] hover:bg-[#FF7A00] text-black font-black text-sm rounded-2xl shadow-xl glow-orange-sm flex items-center justify-between cursor-pointer transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-left leading-tight">
              <span className="text-[10px] uppercase font-bold text-black/70 block">Total</span>
              <span className="font-mono-token text-base font-black">₹{cartTotal}</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider">
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
