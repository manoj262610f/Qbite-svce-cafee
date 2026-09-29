import React from 'react';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  UtensilsCrossed,
  MapPin,
  Clock
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
      <div className="pb-24 pt-12 px-6 max-w-md mx-auto text-center">
        <div className="w-20 h-20 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-extrabold text-stone-900">
          Your tray is empty
        </h2>
        <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto leading-relaxed">
          Looks like you haven't added any snacks or meals yet. Check out today's fresh campus specials!
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
            Order Tray
          </h2>
          <p className="text-xs text-stone-500">
            {cart.length} {cart.length === 1 ? 'item' : 'items'} ready for counter pickup
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-bold text-stone-400 hover:text-rose-600 cursor-pointer flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear</span>
        </button>
      </div>

      {/* Canteen Status Warning */}
      {(isCanteenClosed || isCanteenPaused) && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3 text-xs text-amber-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            {isCanteenClosed
              ? 'Canteen is currently closed. Orders cannot be submitted.'
              : 'Ordering is temporarily paused while kitchen clears backlog.'}
          </span>
        </div>
      )}

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

      {/* Pickup Location Info */}
      <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-400">
          <MapPin className="w-3.5 h-3.5 text-orange-600" />
          <span>Pickup Location</span>
        </div>
        <p className="text-xs font-bold text-stone-800">
          SVCE Central Canteen · Ground Floor Counters 1 & 2
        </p>
        <p className="text-[11px] text-stone-500">
          Show your live token on your phone when order status turns READY.
        </p>
      </div>

      {/* Bill Breakdown */}
      <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm space-y-2 text-xs">
        <div className="flex justify-between text-stone-500">
          <span>Items Total</span>
          <span className="font-mono-token font-bold text-stone-900">₹{cartSubtotal}</span>
        </div>
        <div className="flex justify-between text-stone-500">
          <span>Payment Mode</span>
          <span className="font-bold text-orange-700">Pay at Counter on Pickup</span>
        </div>
        <div className="pt-2 border-t border-stone-100 flex justify-between text-base font-extrabold text-stone-900">
          <span>To Pay</span>
          <span className="font-mono-token text-orange-600">₹{cartTotal}</span>
        </div>
      </div>

      {/* Bottom Sticky Checkout Button */}
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-stone-200/80 max-w-md mx-auto z-30">
        <button
          onClick={onProceedToCheckout}
          disabled={isCanteenClosed || isCanteenPaused}
          className="w-full py-3.5 px-5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-orange-600/25 flex items-center justify-between cursor-pointer transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="text-left leading-tight">
            <span className="text-[10px] uppercase font-bold text-orange-200 block">Total</span>
            <span className="font-mono-token text-base font-black">₹{cartTotal}</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider">
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>
      </div>
    </div>
  );
};
