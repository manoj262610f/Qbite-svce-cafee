import React, { useState } from 'react';
import {
  CalendarClock,
  Zap,
  Clock,
  Calendar,
  ChevronRight,
  Edit3,
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
          className={`rounded-2xl border transition-colors ${
            isScheduled
              ? 'bg-[#151515] border-[#FF6B00]'
              : 'bg-[#151515] border-white/10 hover:border-white/20'
          } p-3.5`}
        >
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  isScheduled
                    ? 'bg-[#FF6B00] text-black font-black'
                    : 'bg-[#000000] text-[#FF6B00] border border-white/10'
                }`}
              >
                {isScheduled ? (
                  <CalendarClock className="w-4 h-4 stroke-[2.4]" />
                ) : (
                  <Zap className="w-4 h-4 fill-current stroke-[2]" />
                )}
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#D9D9D9] block">
                  {isScheduled ? 'Scheduled Order' : 'Order Now (Instant)'}
                </span>
                {isScheduled ? (
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="text-[#FF6B00]">{selectedSchedule.displayDate}</span>
                    <span className="text-white/40">·</span>
                    <span className="font-mono-token text-white">{selectedSchedule.timeSlot}</span>
                  </span>
                ) : (
                  <span className="text-xs text-[#D9D9D9]">Earliest kitchen queue</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isScheduled ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#000000] border border-[#FF6B00] text-[#FF6B00] hover:text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Change</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderingMode('instant')}
                    className="px-2.5 py-1.5 rounded-lg bg-[#000000] border border-white/10 text-[#D9D9D9] hover:text-white font-medium text-[11px] cursor-pointer transition-colors"
                  >
                    Order Now
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-[#FF6B00] hover:bg-[#e05e00] text-black font-black text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
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
      <div className="rounded-3xl bg-[#151515] border border-white/10 p-5 sm:p-6 shadow-xl">
        {/* Header with Specified Copy & Tagline */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#000000] border border-[#FF6B00] text-[#FF6B00] text-[11px] font-black uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-[#FF6B00]" />
              <span>Smart SVCE Dining</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Your Time. Your Order.
            </h2>
            <p className="text-xs sm:text-sm text-[#D9D9D9] mt-1 max-w-xl font-medium">
              Be Smart. Leave the Queue. Schedule ahead and pick up your hot food on time.
            </p>
          </div>

          {/* Current Selection summary if scheduled */}
          {isScheduled && (
            <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#000000] border border-[#FF6B00] text-[#FF6B00]">
              <Clock className="w-4 h-4 text-[#FF6B00] shrink-0" />
              <div className="text-xs">
                <span className="text-[#D9D9D9] block font-medium">Pickup Reserved:</span>
                <span className="font-bold text-white">
                  {selectedSchedule.displayDate} @ {selectedSchedule.timeSlot}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-[#FF6B00] transition-colors ml-1 cursor-pointer"
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
            className={`p-4 sm:p-5 rounded-2xl text-left border cursor-pointer transition-colors ${
              orderingMode === 'instant'
                ? 'bg-[#000000] border-[#FF6B00] shadow-md'
                : 'bg-[#000000] border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors ${
                    orderingMode === 'instant'
                      ? 'bg-[#FF6B00] text-black font-black'
                      : 'bg-[#151515] text-[#D9D9D9]'
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
                      <span className="px-2 py-0.5 rounded-full bg-[#FF6B00] text-black text-[10px] font-black">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[#D9D9D9] block mt-0.5 font-medium">
                    Earliest live preparation
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-[#D9D9D9] mt-3 leading-relaxed">
              Order now for immediate kitchen queuing. Follow the standard token flow and pick up at Counter 1 or 2 when your token is called.
            </p>

            <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-[#D9D9D9] font-mono-token">Prep time: ~12–18 mins</span>
              <span
                className={`font-bold flex items-center gap-1 ${
                  orderingMode === 'instant' ? 'text-[#FF6B00]' : 'text-[#D9D9D9]'
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
            className={`p-4 sm:p-5 rounded-2xl text-left border cursor-pointer transition-colors ${
              orderingMode === 'scheduled'
                ? 'bg-[#000000] border-[#FF6B00] shadow-md'
                : 'bg-[#000000] border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors ${
                    orderingMode === 'scheduled'
                      ? 'bg-[#FF6B00] text-black font-black'
                      : 'bg-[#151515] text-[#D9D9D9]'
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
                      <span className="px-2 py-0.5 rounded-full bg-[#FF6B00] text-black text-[10px] font-black">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[#D9D9D9] block mt-0.5 font-medium">
                    Select future date & pickup slot
                  </span>
                </div>
              </div>
            </div>

            {orderingMode === 'scheduled' && selectedSchedule ? (
              <div className="mt-3 p-3 rounded-xl bg-[#151515] border border-[#FF6B00] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-white font-bold">
                  <Calendar className="w-3.5 h-3.5 text-[#FF6B00]" />
                  <span>{selectedSchedule.displayDate}</span>
                  <span className="text-white/40">·</span>
                  <Clock className="w-3.5 h-3.5 text-[#FF6B00]" />
                  <span className="font-mono-token text-[#FF6B00]">{selectedSchedule.timeSlot}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsModalOpen(true);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#FF6B00] text-black font-black text-[11px] cursor-pointer"
                >
                  Edit
                </button>
              </div>
            ) : (
              <p className="text-xs text-[#D9D9D9] mt-3 leading-relaxed">
                Choose a break period or class gap. Add your food items and pick up hot meals exactly when your slot begins.
              </p>
            )}

            <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-[#D9D9D9] font-mono-token">
                {orderingMode === 'scheduled' && selectedSchedule ? 'Slot Reserved' : 'Slots available today & ahead'}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsModalOpen(true);
                }}
                className="text-[#FF6B00] font-bold flex items-center gap-1 hover:text-white transition-colors"
              >
                <span>{selectedSchedule ? 'Change Slot' : 'Pick Time Slot'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Warning if student switched to scheduled but hasn't picked a slot yet */}
        {orderingMode === 'scheduled' && !selectedSchedule && (
          <div className="mt-4 p-3.5 rounded-2xl bg-[#000000] border border-[#FF6B00] flex items-center justify-between gap-3 text-xs text-[#FF6B00]">
            <div className="flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-[#FF6B00] shrink-0" />
              <span>You selected Schedule Your Order. Please choose your pickup date and time.</span>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#FF6B00] text-black font-black text-xs hover:bg-[#e05e00] cursor-pointer transition-colors shrink-0"
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
