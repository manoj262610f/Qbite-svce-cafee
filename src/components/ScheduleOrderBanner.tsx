import React, { useState } from 'react';
import {
  CalendarClock,
  Zap,
  Clock,
  Calendar,
  ChevronRight,
  Edit3,
  CheckCircle2,
  Sparkles,
  AlertCircle
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

  if (compact) {
    return (
      <>
        <div
          className={`rounded-2xl border transition-all ${
            isScheduled
              ? 'bg-gradient-to-r from-[#1C160F] via-[#141414] to-[#17120D] border-[#FF6A00]/40 shadow-lg'
              : 'bg-[#141414] border-white/8 hover:border-white/15'
          } p-3.5`}
        >
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  isScheduled
                    ? 'bg-[#FF6A00] text-black font-black'
                    : 'bg-[#1F1F1F] text-[#FF6A00] border border-white/10'
                }`}
              >
                {isScheduled ? (
                  <CalendarClock className="w-4 h-4 stroke-[2.4]" />
                ) : (
                  <Zap className="w-4 h-4 fill-current stroke-[2]" />
                )}
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
                  {isScheduled ? 'Scheduled Order' : 'Order Now (Instant)'}
                </span>
                {isScheduled ? (
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="text-[#FF9D2E]">{selectedSchedule.displayDate}</span>
                    <span className="text-stone-500">·</span>
                    <span className="font-mono-token text-white">{selectedSchedule.timeSlot}</span>
                  </span>
                ) : (
                  <span className="text-xs text-stone-300">Earliest kitchen queue</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isScheduled ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#261E14] border border-[#FF6A00]/40 text-[#FF9D2E] hover:text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Change</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderingMode('instant')}
                    className="px-2.5 py-1.5 rounded-lg bg-stone-900 border border-white/10 text-stone-400 hover:text-white font-medium text-[11px] cursor-pointer"
                  >
                    Order Now
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-[#FF6A00] hover:bg-[#FF7A00] text-black font-black text-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                >
                  <CalendarClock className="w-3.5 h-3.5" />
                  <span>Schedule</span>
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
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1C160F] via-[#141414] to-black border border-[#FF6A00]/25 p-5 sm:p-6 shadow-xl glow-orange-sm">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-52 h-52 bg-[#FF6A00]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header with Specified Copy */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6A00]/15 border border-[#FF6A00]/30 text-[#FF9D2E] text-[11px] font-black uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-[#FF6A00] animate-pulse" />
              <span>Smart SVCE Dining</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Your Time. Your Order.</span>
              <Sparkles className="w-5 h-5 text-[#FF6A00]" />
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 mt-1 max-w-xl font-medium">
              Schedule ahead, skip the queue, and pick up your food on time.
            </p>
          </div>

          {/* Current Selection summary if scheduled */}
          {isScheduled && (
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-[#261E14] border border-[#FF6A00]/40 text-[#FF9D2E]">
              <Clock className="w-4 h-4 text-[#FF6A00] shrink-0" />
              <div className="text-xs">
                <span className="text-stone-400 block font-medium">Pickup Reserved:</span>
                <span className="font-bold text-white">
                  {selectedSchedule.displayDate} @ {selectedSchedule.timeSlot}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="p-1.5 rounded-lg hover:bg-[#FF6A00]/20 text-[#FF6A00] transition-colors ml-1 cursor-pointer"
                title="Change Slot"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* The Two Ordering Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
          {/* Option 1: Order Now */}
          <div
            onClick={() => {
              setOrderingMode('instant');
            }}
            role="button"
            tabIndex={0}
            className={`group relative p-4 sm:p-5 rounded-2xl text-left border cursor-pointer transition-all duration-200 ${
              orderingMode === 'instant'
                ? 'bg-gradient-to-b from-[#1F1710] to-[#141414] border-[#FF6A00] shadow-lg shadow-[#FF6A00]/10 ring-1 ring-[#FF6A00]'
                : 'bg-[#141414]/90 border-white/8 hover:border-white/20 hover:bg-[#1A1A1A]'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors ${
                    orderingMode === 'instant'
                      ? 'bg-[#FF6A00] text-black font-black shadow-md glow-orange-sm'
                      : 'bg-[#1F1F1F] text-stone-400 group-hover:text-[#FF6A00]'
                  }`}
                >
                  <Zap className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-white text-base tracking-tight">
                      Option 1: Order Now
                    </span>
                    {orderingMode === 'instant' && (
                      <span className="px-2 py-0.5 rounded-full bg-[#FF6A00]/20 text-[#FF9D2E] text-[10px] font-black border border-[#FF6A00]/30">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-stone-400 block mt-0.5 font-medium">
                    Earliest available preparation
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-stone-400 mt-3 leading-relaxed">
              Order now for immediate kitchen queuing. Follow the standard token flow and pick up at Counter 1 or 2 when your token is called.
            </p>

            <div className="mt-3 pt-3 border-t border-white/6 flex items-center justify-between text-xs">
              <span className="text-stone-500 font-mono-token">Prep time: ~12–18 mins</span>
              <span
                className={`font-bold flex items-center gap-1 ${
                  orderingMode === 'instant' ? 'text-[#FF9D2E]' : 'text-stone-400'
                }`}
              >
                <span>{orderingMode === 'instant' ? 'Selected' : 'Select'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Option 2: Schedule Your Order */}
          <div
            onClick={() => {
              if (orderingMode !== 'scheduled' || !selectedSchedule) {
                setIsModalOpen(true);
              }
            }}
            role="button"
            tabIndex={0}
            className={`group relative p-4 sm:p-5 rounded-2xl text-left border cursor-pointer transition-all duration-200 ${
              orderingMode === 'scheduled'
                ? 'bg-gradient-to-b from-[#1F1710] to-[#141414] border-[#FF6A00] shadow-lg shadow-[#FF6A00]/10 ring-1 ring-[#FF6A00]'
                : 'bg-[#141414]/90 border-white/8 hover:border-white/20 hover:bg-[#1A1A1A]'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors ${
                    orderingMode === 'scheduled'
                      ? 'bg-[#FF6A00] text-black font-black shadow-md glow-orange-sm'
                      : 'bg-[#1F1F1F] text-stone-400 group-hover:text-[#FF6A00]'
                  }`}
                >
                  <CalendarClock className="w-5 h-5 stroke-[2.3]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-white text-base tracking-tight">
                      Option 2: Schedule Your Order
                    </span>
                    {orderingMode === 'scheduled' && (
                      <span className="px-2 py-0.5 rounded-full bg-[#FF6A00]/20 text-[#FF9D2E] text-[10px] font-black border border-[#FF6A00]/30">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-stone-400 block mt-0.5 font-medium">
                    Select future date & pickup time slot
                  </span>
                </div>
              </div>
            </div>

            {orderingMode === 'scheduled' && selectedSchedule ? (
              <div className="mt-3 p-3 rounded-xl bg-[#261E14] border border-[#FF6A00]/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-white font-bold">
                  <Calendar className="w-3.5 h-3.5 text-[#FF6A00]" />
                  <span>{selectedSchedule.displayDate}</span>
                  <span className="text-stone-500">·</span>
                  <Clock className="w-3.5 h-3.5 text-[#FF9D2E]" />
                  <span className="font-mono-token text-[#FF9D2E]">{selectedSchedule.timeSlot}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsModalOpen(true);
                  }}
                  className="px-2 py-1 rounded-lg bg-[#FF6A00]/20 hover:bg-[#FF6A00]/30 text-[#FF9D2E] font-black text-[11px] cursor-pointer"
                >
                  Edit
                </button>
              </div>
            ) : (
              <p className="text-xs text-stone-400 mt-3 leading-relaxed">
                Choose a break period or class gap. Add your favorite dishes and pick up hot food exactly when your slot begins!
              </p>
            )}

            <div className="mt-3 pt-3 border-t border-white/6 flex items-center justify-between text-xs">
              <span className="text-stone-500 font-mono-token">
                {orderingMode === 'scheduled' && selectedSchedule ? 'Slot Reserved' : 'Slots available today & ahead'}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsModalOpen(true);
                }}
                className="text-[#FF9D2E] font-bold flex items-center gap-1 hover:text-white"
              >
                <span>{selectedSchedule ? 'Change Slot' : 'Pick Time Slot'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Warning if student switched to scheduled but hasn't picked a slot yet */}
        {orderingMode === 'scheduled' && !selectedSchedule && (
          <div className="mt-4 p-3.5 rounded-2xl bg-[#FF6A00]/15 border border-[#FF6A00]/30 flex items-center justify-between gap-3 text-xs text-[#FF9D2E]">
            <div className="flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-[#FF6A00] shrink-0" />
              <span>You selected Schedule Your Order. Please choose your pickup date and time.</span>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-[#FF6A00] text-black font-black text-xs hover:bg-[#FF7A00] cursor-pointer transition-colors shrink-0"
            >
              Choose Slot Now
            </button>
          </div>
        )}
      </div>

      <ScheduleSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
