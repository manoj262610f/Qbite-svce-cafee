import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Printer, ShieldCheck } from 'lucide-react';
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-[#141414] rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-white/10"
        >
          {/* Header */}
          <div className="bg-[#0A0A0A] text-white p-5 text-center relative border-b border-white/8">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/8 flex items-center justify-center text-stone-300 hover:text-white cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <span className="text-[10px] uppercase font-black tracking-[0.2em] text-[#FF6A00]">
              OFFICIAL DIGITAL BILL
            </span>
            <h2 className="text-xl font-black tracking-tight mt-0.5 text-white">
              QBite · SVCE Cafe
            </h2>
            <p className="text-[11px] text-[#A1A1A1]">Sri Venkateswara College of Engineering</p>
          </div>

          {/* Receipt Body */}
          <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Token & Order Number Box */}
            <div className="bg-[#1A1A1A] rounded-2xl p-4 border border-white/8 flex items-center justify-between text-center">
              <div>
                <p className="text-[10px] text-[#A1A1A1] uppercase font-bold">Queue Token</p>
                <p className="text-2xl font-black font-mono-token text-[#FF6A00]">
                  {order.tokenString}
                </p>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <p className="text-[10px] text-[#A1A1A1] uppercase font-bold">Order ID</p>
                <p className="text-xs font-mono-token text-white font-bold mt-1">
                  {order.orderNumber}
                </p>
              </div>
            </div>

            {/* Meta details */}
            <div className="space-y-1.5 text-xs border-b border-white/8 pb-3">
              <div className="flex justify-between text-[#A1A1A1]">
                <span>Date & Time</span>
                <span className="font-semibold text-white">{formattedDate} · {formattedTime}</span>
              </div>
              <div className="flex justify-between text-[#A1A1A1]">
                <span>Customer</span>
                <span className="font-semibold text-white">{order.userName}</span>
              </div>
              <div className="flex justify-between text-[#A1A1A1]">
                <span>Email</span>
                <span className="font-semibold text-white truncate max-w-[180px]">{order.userEmail}</span>
              </div>
              <div className="flex justify-between text-[#A1A1A1]">
                <span>Payment</span>
                <span className="font-semibold text-white">
                  {order.paymentMethod === 'COUNTER' ? 'Pay at Counter' : order.paymentMethod}
                  <span className={`ml-1 text-[10px] font-bold ${order.paymentStatus === 'PAID' ? 'text-emerald-400' : 'text-[#FF9D2E]'}`}>
                    ({order.paymentStatus})
                  </span>
                </span>
              </div>
            </div>

            {/* Line Items */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-[#A1A1A1] mb-2">
                Items Ordered
              </p>
              <div className="space-y-2">
                {(order.items || []).map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs">
                    <span className="text-stone-200 font-medium">
                      {item.name} <span className="text-stone-400 font-mono-token">× {item.quantity}</span>
                    </span>
                    <span className="font-mono-token font-bold text-white">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Subtotal, Discount & Total */}
            <div className="border-t border-dashed border-white/10 pt-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-[#A1A1A1]">
                <span>Subtotal</span>
                <span className="font-mono-token font-semibold text-white">₹{order.subtotal}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-400 font-medium">
                  <span>Coupon Discount</span>
                  <span className="font-mono-token">-₹{order.discount}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-white pt-2 border-t border-white/10">
                <span>Total Amount</span>
                <span className="font-mono-token text-[#FF6A00]">₹{order.total}</span>
              </div>
            </div>

            {/* Verified badge */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#A1A1A1] font-medium pt-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified SVCE Canteen Digital Bill</span>
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-4 bg-[#0D0D0D] border-t border-white/8 flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#FF6A00] hover:bg-[#FF7A00] text-black font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md glow-orange-sm active:scale-[0.98] transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PRINT RECEIPT</span>
            </button>
            <button
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl border border-white/10 bg-[#1A1A1A] text-white font-bold text-xs hover:bg-[#252525] cursor-pointer transition-colors"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
