import React, { useState } from 'react';
import {
  CalendarClock,
  Zap,
  Clock,
  Calendar,
  ChevronRight,
  Edit3,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useCanteen } from '../context/CanteenContext';
import { ScheduleSelectorModal } from './ScheduleSelectorModal';

interface ScheduleOrderBannerProps {
  compact?: boolean;
}

export const ScheduleOrderBanner: React.FC<ScheduleOrderBannerProps> = ({ compact = false }) => {
  const { orderingMode, setOrderingMode, selectedSchedule } = useCanteen();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isScheduled = orderingMode === 'scheduled' && selectedSchedule;

  return (
    <>
      <div
        className={`rounded-3xl border transition-all ${
          isScheduled
            ? 'bg-gradient-to-r from-[#1C160F] via-[#141414] to-[#17120D] border-[#FF6A00]/40 shadow-xl glow-orange-sm'
            : 'bg-[#141414] border-white/8 hover:border-white/15 shadow-md'
        } p-4 sm:p-5`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left: Mode Badge & Description */}
          <div className="flex items-start sm:items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                isScheduled
                  ? 'bg-[#FF6A00] text-black glow-orange-sm'
                  : 'bg-[#1F1F1F] text-[#FF6A00] border border-white/10'
              }`}
            >
              {isScheduled ? (
                <CalendarClock className="w-5 h-5 stroke-[2.4]" />
              ) : (
                <Zap className="w-5 h-5 fill-current stroke-[2]" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#A1A1A1]">
                  Ordering Mode
                </span>
                <span
                  className={`text-xs font-black uppercase tracking-wider ${
                    isScheduled ? 'text-[#FF7A00]' : 'text-stone-300'
                  }`}
                >
                  {isScheduled ? 'Scheduled Order' : 'Order Now (Instant)'}
                </span>
              </div>

              {isScheduled ? (
                <div className="mt-1 flex items-center gap-2 text-xs sm:text-sm font-bold text-white flex-wrap">
                  <span className="flex items-center gap-1 text-[#FF9D2E]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{selectedSchedule.displayDate}</span>
                  </span>
                  <span className="text-stone-500">·</span>
                  <span className="flex items-center gap-1 font-mono-token text-white">
                    <Clock className="w-3.5 h-3.5 text-[#FF6A00]" />
                    <span>{selectedSchedule.timeSlot}</span>
                  </span>
                </div>
              ) : (
                <p className="mt-1 text-xs text-[#A1A1A1] leading-tight">
                  Earliest available preparation (~12-18 min kitchen pickup).
                </p>
              )}
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 pt-1 sm:pt-0">
            {isScheduled ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#261E14] hover:bg-[#332617] border border-[#FF6A00]/40 text-[#FF9D2E] hover:text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Change Time</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOrderingMode('instant')}
                  className="px-3.5 py-2 rounded-xl bg-[#1A1A1A] hover:bg-[#222222] border border-white/10 text-stone-300 hover:text-white font-bold text-xs cursor-pointer transition-colors"
                >
                  Switch to Order Now
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-[#FF6A00] hover:bg-[#FF7A00] text-black font-black text-xs flex items-center gap-1.5 shadow-md glow-orange-sm cursor-pointer transition-all active:scale-95"
              >
                <CalendarClock className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Schedule Your Order</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <ScheduleSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
