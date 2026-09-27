import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Printer, CheckCircle2, ShieldCheck, Download } from 'lucide-react';
import { Order } from '../types';

interface ReceiptModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const formattedTime = new Date(order.createdAt).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-stone-200"
        >
          {/* Header */}
          <div className="bg-stone-900 text-white p-5 text-center relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-stone-300 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-orange-400">
              OFFICIAL DIGITAL RECEIPT
            </span>
            <h2 className="text-xl font-extrabold tracking-tight mt-0.5">
              QBite – SVCE Cafe
            </h2>
            <p className="text-[11px] text-stone-400">Sri Venkateswara College of Engineering</p>
          </div>

          {/* Receipt Body */}
          <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Token & Order Number Box */}
            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100 flex items-center justify-between text-center">
              <div>
                <p className="text-[10px] text-stone-400 uppercase font-semibold">Queue Token</p>
                <p className="text-2xl font-extrabold font-mono-token text-orange-600">
                  {order.tokenString}
                </p>
              </div>
              <div className="h-8 w-px bg-stone-200" />
              <div>
                <p className="text-[10px] text-stone-400 uppercase font-semibold">Order ID</p>
                <p className="text-xs font-bold font-mono-token text-stone-900 mt-1">
                  {order.orderNumber}
                </p>
              </div>
            </div>

            {/* Meta details */}
            <div className="space-y-1 text-xs border-b border-stone-100 pb-3">
              <div className="flex justify-between text-stone-500">
                <span>Date & Time</span>
                <span className="font-semibold text-stone-800">{formattedDate} · {formattedTime}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Customer</span>
                <span className="font-semibold text-stone-800">{order.userName}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Email</span>
                <span className="font-semibold text-stone-800 truncate max-w-[180px]">{order.userEmail}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Payment</span>
                <span className="font-semibold text-stone-800">
                  {order.paymentMethod === 'COUNTER' ? 'Pay at Counter' : order.paymentMethod}
                  <span className={`ml-1 text-[10px] font-bold ${order.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    ({order.paymentStatus})
                  </span>
                </span>
              </div>
            </div>

            {/* Line Items */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
                Items Ordered
              </p>
              <div className="space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs">
                    <span className="text-stone-800 font-medium">
                      {item.name} <span className="text-stone-400 font-mono-token">× {item.quantity}</span>
                    </span>
                    <span className="font-bold font-mono-token text-stone-900">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Subtotal, Discount & Total */}
            <div className="border-t border-dashed border-stone-200 pt-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-500">
                <span>Subtotal</span>
                <span className="font-mono-token font-semibold text-stone-800">₹{order.subtotal}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Coupon Discount ({order.couponCode || 'PROMO'})</span>
                  <span className="font-mono-token">-₹{order.discount}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-extrabold text-stone-900 pt-2 border-t border-stone-200">
                <span>Total Amount</span>
                <span className="font-mono-token text-orange-600">₹{order.total}</span>
              </div>
            </div>

            {/* Verified badge */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400 font-medium pt-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified SVCE Canteen Digital Bill</span>
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex-1 py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.98]"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PRINT RECEIPT</span>
            </button>
            <button
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl border border-stone-200 text-stone-700 font-bold text-xs hover:bg-stone-100 cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
