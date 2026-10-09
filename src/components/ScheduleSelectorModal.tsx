import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  Clock,
  Check,
  X,
  AlertCircle,
  Zap,
  CalendarClock,
  Sparkles,
  ChevronRight,
  Info,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { useCanteen } from '../context/CanteenContext';
import {
  getAvailableDates,
  generateTimeSlotsForDate,
  DateOption,
  formatISTDateKey
} from '../services/scheduleService';
import { ScheduleSelection, TimeSlot, OrderType } from '../types';

interface ScheduleSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  // If provided, used for rescheduling a specific order
  orderIdToReschedule?: string | null;
  onConfirmSchedule?: (schedule: ScheduleSelection) => Promise<void> | void;
  initialMode?: OrderType;
  title?: string;
  subtitle?: string;
}

export const ScheduleSelectorModal: React.FC<ScheduleSelectorModalProps> = ({
  isOpen,
  onClose,
  orderIdToReschedule,
  onConfirmSchedule,
  initialMode,
  title,
  subtitle
}) => {
  const {
    settings,
    orders,
    orderingMode,
    setOrderingMode,
    selectedSchedule,
    setSelectedSchedule,
    rescheduleOrder
  } = useCanteen();

  const [activeMode, setActiveMode] = useState<OrderType>(
    initialMode || (orderIdToReschedule ? 'scheduled' : orderingMode)
  );

  const availableDates: DateOption[] = useMemo(() => {
    return getAvailableDates(settings);
  }, [settings]);

  // Default to first open date
  const [selectedDateKey, setSelectedDateKey] = useState<string>(() => {
    if (selectedSchedule?.date) {
      return selectedSchedule.date;
    }
    const firstOpen = availableDates.find((d) => d.isOpen);
    return firstOpen ? firstOpen.dateKey : formatISTDateKey(new Date());
  });

  // Keep date selection valid
  useEffect(() => {
    if (!availableDates.some((d) => d.dateKey === selectedDateKey && d.isOpen)) {
      const firstOpen = availableDates.find((d) => d.isOpen);
      if (firstOpen) {
        setSelectedDateKey(firstOpen.dateKey);
      }
    }
  }, [availableDates, selectedDateKey]);

  // Generate slots for selected date
  const timeSlots: TimeSlot[] = useMemo(() => {
    return generateTimeSlotsForDate(selectedDateKey, settings, orders);
  }, [selectedDateKey, settings, orders]);

  // Selected Slot
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(() => {
    if (selectedSchedule && selectedSchedule.date === selectedDateKey) {
      return timeSlots.find((s) => s.displayLabel === selectedSchedule.timeSlot) || null;
    }
    return null;
  });

  // Reset selected slot if date changes
  useEffect(() => {
    if (selectedSlot && !timeSlots.some((s) => s.id === selectedSlot.id)) {
      setSelectedSlot(null);
    }
  }, [selectedDateKey, timeSlots, selectedSlot]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const selectedDateObj = availableDates.find((d) => d.dateKey === selectedDateKey);

  const handleApply = async () => {
    setErrorNotice(null);

    if (activeMode === 'instant') {
      if (!orderIdToReschedule) {
        setOrderingMode('instant');
        setSelectedSchedule(null);
      }
      onClose();
      return;
    }

    if (!selectedSlot) {
      setErrorNotice('Please select an available pickup time slot.');
      return;
    }

    if (!selectedDateObj || !selectedDateObj.isOpen) {
      setErrorNotice('Canteen is closed on the selected date. Please pick an open operating day.');
      return;
    }

    const scheduleData: ScheduleSelection = {
      date: selectedDateKey,
      displayDate: selectedDateObj.dayLabel,
      timeSlot: selectedSlot.displayLabel,
      isoPickupTime: selectedSlot.isoPickupTime,
      estimatedPrepMin: 15
    };

    setIsSubmitting(true);
    try {
      if (orderIdToReschedule) {
        await rescheduleOrder(orderIdToReschedule, scheduleData);
      } else if (onConfirmSchedule) {
        await onConfirmSchedule(scheduleData);
      } else {
        setOrderingMode('scheduled');
        setSelectedSchedule(scheduleData);
      }
      onClose();
    } catch (err: any) {
      setErrorNotice(err?.message || 'Failed to update schedule. Please try another slot.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2 }}
          className="bg-[#121212] border border-white/10 rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-white"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-white/8 relative bg-gradient-to-b from-[#1A1A1A] to-[#121212]">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="absolute right-5 top-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF6A00]/15 border border-[#FF6A00]/30 text-[#FF7A00] text-[10px] font-black uppercase tracking-wider mb-2">
              <CalendarClock className="w-3.5 h-3.5 text-[#FF6A00]" />
              <span>SVCE Cafe Schedule</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {title || 'Your Time. Your Order.'}
            </h2>
            <p className="text-xs sm:text-sm text-[#A1A1A1] mt-1 leading-relaxed">
              {subtitle || 'Schedule ahead, skip the queue, and pick up your food on time.'}
            </p>

            {/* Mode Selector Tabs (Hidden if rescheduling an existing order) */}
            {!orderIdToReschedule && (
              <div className="grid grid-cols-2 gap-2 mt-4 bg-[#0A0A0A] p-1.5 rounded-2xl border border-white/8">
                <button
                  type="button"
                  onClick={() => {
                    setActiveMode('instant');
                    setErrorNotice(null);
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeMode === 'instant'
                      ? 'bg-[#FF6A00] text-black shadow-md glow-orange-sm'
                      : 'text-[#A1A1A1] hover:text-white'
                  }`}
                >
                  <Zap className="w-4 h-4 fill-current stroke-[2]" />
                  <span>Order Now</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMode('scheduled');
                    setErrorNotice(null);
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeMode === 'scheduled'
                      ? 'bg-[#FF6A00] text-black shadow-md glow-orange-sm'
                      : 'text-[#A1A1A1] hover:text-white'
                  }`}
                >
                  <CalendarClock className="w-4 h-4 stroke-[2.2]" />
                  <span>Schedule Order</span>
                </button>
              </div>
            )}
          </div>

          {/* Scrollable Body */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
            {errorNotice && (
              <div className="p-3.5 rounded-2xl bg-[#1C1111] border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <strong className="block font-bold text-white">Scheduling Notice</strong>
                  <p className="mt-0.5 leading-relaxed">{errorNotice}</p>
                </div>
              </div>
            )}

            {activeMode === 'instant' ? (
              <div className="space-y-4 py-2">
                <div className="bg-[#181818] rounded-2xl p-5 border border-white/8 space-y-3">
                  <div className="flex items-center gap-2 text-stone-200 font-bold">
                    <Zap className="w-5 h-5 text-[#FF6A00]" />
                    <span>Instant Preparation</span>
                  </div>
                  <p className="text-xs text-[#A1A1A1] leading-relaxed">
                    Your order will be prepared immediately upon placement by the canteen kitchen. A live queue token will be assigned with real-time tracking on your screen.
                  </p>
                  <div className="flex items-center gap-2 text-[11px] font-mono-token text-stone-400 pt-2 border-t border-white/5">
                    <Clock className="w-3.5 h-3.5 text-[#FF6A00]" />
                    <span>Estimated kitchen preparation time: ~12-18 minutes</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {/* 1. Date Picker Cards */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-[#A1A1A1] flex items-center justify-between mb-2.5">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#FF6A00]" />
                      <span>1. Select Pickup Date (IST)</span>
                    </span>
                    <span className="text-stone-400 normal-case">Operating: Mon–Sat</span>
                  </label>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {availableDates.map((dateOpt) => {
                      const isSelected = selectedDateKey === dateOpt.dateKey;
                      const isDisabled = !dateOpt.isOpen;

                      return (
                        <button
                          key={dateOpt.dateKey}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => {
                            setSelectedDateKey(dateOpt.dateKey);
                            setErrorNotice(null);
                          }}
                          className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                            isDisabled
                              ? 'bg-[#141414]/50 border-white/5 opacity-40 cursor-not-allowed'
                              : isSelected
                              ? 'bg-[#1F1914] border-[#FF6A00] shadow-md glow-orange-sm text-white'
                              : 'bg-[#161616] border-white/8 hover:border-white/20 text-stone-300'
                          }`}
                        >
                          <div>
                            <span
                              className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded-md inline-block mb-1 ${
                                dateOpt.isToday
                                  ? 'bg-[#FF6A00]/20 text-[#FF7A00]'
                                  : 'bg-white/5 text-stone-400'
                              }`}
                            >
                              {dateOpt.isToday ? 'Today' : dateOpt.fullLabel.split(',')[0]}
                            </span>
                            <div className="font-black text-xs sm:text-sm text-white truncate">
                              {dateOpt.fullLabel.split(',')[1]?.trim() || dateOpt.fullLabel}
                            </div>
                          </div>

                          <div className="mt-2 text-[10px] text-[#A1A1A1]">
                            {isDisabled ? (
                              <span className="text-rose-400 font-bold">Closed</span>
                            ) : isSelected ? (
                              <span className="text-[#FF7A00] font-bold flex items-center gap-1">
                                <Check className="w-3 h-3 stroke-[3]" /> Selected
                              </span>
                            ) : (
                              <span>Open</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Pickup Time Slot Selector */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-[#A1A1A1] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#FF6A00]" />
                      <span>2. Select Pickup Time Slot</span>
                    </label>
                    <span className="text-[11px] text-[#A1A1A1]">
                      {settings.operatingHours || '7:30 AM – 5:30 PM'}
                    </span>
                  </div>

                  {timeSlots.length === 0 ? (
                    <div className="p-6 rounded-2xl bg-[#161616] border border-white/8 text-center text-xs text-[#A1A1A1]">
                      <Clock className="w-8 h-8 text-stone-600 mx-auto mb-2" />
                      <p className="font-bold text-white">No available time slots for this date</p>
                      <p className="mt-1 text-stone-400">
                        Operating hours have concluded or all advance booking slots have passed.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                      {timeSlots.map((slot) => {
                        const isSelected = selectedSlot?.id === slot.id;
                        const isAvailable = slot.isAvailable;
                        const capacityLeft = slot.maxCapacity - slot.bookedCount;

                        return (
                          <button
                            key={slot.id}
                            type="button"
                            disabled={!isAvailable}
                            onClick={() => {
                              setSelectedSlot(slot);
                              setErrorNotice(null);
                            }}
                            className={`p-2.5 rounded-xl border text-left transition-all relative ${
                              !isAvailable
                                ? 'bg-[#141414] border-white/5 opacity-40 cursor-not-allowed'
                                : isSelected
                                ? 'bg-[#241A12] border-[#FF6A00] shadow-md glow-orange-sm text-white'
                                : 'bg-[#181818] border-white/8 hover:border-white/20 text-stone-200 cursor-pointer'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-black text-xs text-white">
                                {slot.time}
                              </span>
                              {isSelected && (
                                <span className="w-4 h-4 rounded-full bg-[#FF6A00] text-black flex items-center justify-center shrink-0">
                                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                                </span>
                              )}
                            </div>

                            <p className="text-[10px] text-stone-400 mt-0.5 truncate">
                              until {slot.endTime}
                            </p>

                            <div className="mt-1.5 flex items-center justify-between text-[9px]">
                              {!isAvailable ? (
                                <span className="text-stone-500 font-bold truncate">
                                  {slot.reason || 'Unavailable'}
                                </span>
                              ) : isSelected ? (
                                <span className="text-[#FF7A00] font-black">Selected</span>
                              ) : (
                                <span className="text-emerald-400 font-bold">
                                  {capacityLeft} slot{capacityLeft === 1 ? '' : 's'} open
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 3. Selected Schedule Summary Confirmation Card */}
                {selectedSlot && selectedDateObj && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-[#1A1815] border border-[#FF6A00]/40 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-black tracking-wider text-[#FF7A00] flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirmed Pickup Schedule</span>
                      </span>
                      <span className="text-[10px] font-mono-token text-stone-400">
                        Counter 1 & 2
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <p className="font-black text-sm text-white">
                          {selectedDateObj.dayLabel}
                        </p>
                        <p className="text-xs text-[#FF6A00] font-mono-token font-bold">
                          {selectedSlot.displayLabel}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-stone-400 block">Lead Time</span>
                        <span className="text-xs font-bold text-stone-200">
                          {settings.kitchenLeadTimeMinutes || 25} min prep notice
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-[#A1A1A1] pt-1 border-t border-white/5">
                      Food will be freshly prepared to be hot & ready at Counter 1 & 2 during this window.
                    </p>
                  </motion.div>
                )}
              </div>
            )}
          </div>

          {/* Footer Action */}
          <div className="p-4 sm:p-5 border-t border-white/8 bg-[#0D0D0D] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-3 rounded-xl bg-[#1C1C1C] hover:bg-[#252525] text-stone-300 hover:text-white font-bold text-xs cursor-pointer transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleApply}
              disabled={isSubmitting || (activeMode === 'scheduled' && !selectedSlot)}
              className="flex-1 py-3 px-5 bg-[#FF6A00] hover:bg-[#FF7A00] text-black font-black text-xs sm:text-sm rounded-xl shadow-lg glow-orange-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : activeMode === 'instant' ? (
                <>
                  <span>CONFIRM ORDER NOW</span>
                  <Zap className="w-4 h-4 fill-current stroke-[2]" />
                </>
              ) : (
                <>
                  <span>CONFIRM SCHEDULED PICKUP</span>
                  <CalendarClock className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
