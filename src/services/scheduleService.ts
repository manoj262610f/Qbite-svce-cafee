import { CanteenSettings, Order, TimeSlot, ScheduleSelection } from '../types';

export const DEFAULT_SCHEDULING_CONFIG = {
  schedulingEnabled: true,
  operatingDays: [1, 2, 3, 4, 5, 6], // Mon-Sat
  slotStartTime: '08:00',
  slotEndTime: '17:00',
  slotIntervalMinutes: 15,
  maxOrdersPerSlot: 10,
  minNoticeMinutes: 30,
  maxAdvanceDays: 3,
  cancelCutoffMinutes: 30,
  kitchenLeadTimeMinutes: 25
};

/**
 * Get current time in Asia/Kolkata (IST)
 */
export const getISTNow = (): Date => {
  // Returns Date object anchored to current UTC, but helper functions format with Asia/Kolkata
  return new Date();
};

/**
 * Format date in Asia/Kolkata as YYYY-MM-DD
 */
export const formatISTDateKey = (date: Date): string => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(date);
};

/**
 * Format IST parts for a given Date
 */
export const getISTParts = (date: Date = new Date()) => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false
  });
  const parts = formatter.formatToParts(date);
  const partMap: Record<string, string> = {};
  for (const p of parts) {
    partMap[p.type] = p.value;
  }

  const year = parseInt(partMap.year, 10);
  const month = parseInt(partMap.month, 10);
  const day = parseInt(partMap.day, 10);
  const hour = parseInt(partMap.hour, 10);
  const minute = parseInt(partMap.minute, 10);

  // Day of week in IST
  // en-US weekday: 'Sun', 'Mon', etc.
  const dayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6
  };
  const dayOfWeek = dayMap[partMap.weekday] ?? 1;

  return { year, month, day, hour, minute, dayOfWeek, weekdayStr: partMap.weekday };
};

export interface DateOption {
  dateKey: string; // YYYY-MM-DD
  dayLabel: string; // "Today", "Tomorrow", "Mon, Oct 12"
  fullLabel: string; // "Friday, Oct 10"
  isToday: boolean;
  isOpen: boolean;
  dayOfWeek: number;
  reason?: string;
}

/**
 * Generate eligible dates (Today + next N days) according to operating days and canteen status
 */
export const getAvailableDates = (
  settings: CanteenSettings
): DateOption[] => {
  const maxDays = settings.maxAdvanceDays ?? DEFAULT_SCHEDULING_CONFIG.maxAdvanceDays;
  const operatingDays = settings.operatingDays ?? DEFAULT_SCHEDULING_CONFIG.operatingDays;

  const now = new Date();
  const options: DateOption[] = [];

  for (let i = 0; i <= maxDays; i++) {
    // Add i days
    const d = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
    const dateKey = formatISTDateKey(d);
    const istParts = getISTParts(d);

    const isToday = i === 0;
    const isTomorrow = i === 1;

    const fullFormatter = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    const fullDateStr = fullFormatter.format(d);

    let dayLabel = fullDateStr;
    if (isToday) dayLabel = `Today (${fullDateStr})`;
    else if (isTomorrow) dayLabel = `Tomorrow (${fullDateStr})`;

    const isDayOpen = operatingDays.includes(istParts.dayOfWeek);
    let reason: string | undefined = undefined;

    if (!isDayOpen) {
      reason = istParts.dayOfWeek === 0 ? 'Closed on Sundays' : 'Canteen closed on this day';
    }

    // If today is closed by master switch
    if (isToday && settings.status === 'CLOSED') {
      // Still show, but can flag if canteen is closed
    }

    options.push({
      dateKey,
      dayLabel,
      fullLabel: fullDateStr,
      isToday,
      isOpen: isDayOpen,
      dayOfWeek: istParts.dayOfWeek,
      reason
    });
  }

  return options;
};

/**
 * Format 24-hr time 'HH:mm' to 12-hr string 'hh:mm AM/PM'
 */
export const format12Hour = (hours: number, minutes: number): string => {
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const displayMinutes = String(minutes).padStart(2, '0');
  return `${displayHours}:${displayMinutes} ${period}`;
};

/**
 * Generate available time slots for a specified dateKey in Asia/Kolkata
 */
export const generateTimeSlotsForDate = (
  targetDateKey: string,
  settings: CanteenSettings,
  existingOrders: Order[] = []
): TimeSlot[] => {
  const isEnabled = settings.schedulingEnabled ?? DEFAULT_SCHEDULING_CONFIG.schedulingEnabled;
  if (!isEnabled) return [];

  const startStr = settings.slotStartTime || DEFAULT_SCHEDULING_CONFIG.slotStartTime; // "08:00"
  const endStr = settings.slotEndTime || DEFAULT_SCHEDULING_CONFIG.slotEndTime;     // "17:00"
  const intervalMin = settings.slotIntervalMinutes || DEFAULT_SCHEDULING_CONFIG.slotIntervalMinutes; // 15
  const maxCapacity = settings.maxOrdersPerSlot || DEFAULT_SCHEDULING_CONFIG.maxOrdersPerSlot; // 10
  const minNoticeMin = settings.minNoticeMinutes || DEFAULT_SCHEDULING_CONFIG.minNoticeMinutes; // 30

  const [startH, startM] = startStr.split(':').map(Number);
  const [endH, endM] = endStr.split(':').map(Number);

  const startTotalMinutes = startH * 60 + startM;
  const endTotalMinutes = endH * 60 + endM;

  const currentIST = getISTParts(new Date());
  const todayKey = formatISTDateKey(new Date());
  const isToday = targetDateKey === todayKey;
  const currentTotalMinutes = currentIST.hour * 60 + currentIST.minute;
  const earliestAllowedMinutesToday = currentTotalMinutes + minNoticeMin;

  const slots: TimeSlot[] = [];

  // Parse target date components
  const [targetYear, targetMonth, targetDay] = targetDateKey.split('-').map(Number);

  for (let min = startTotalMinutes; min < endTotalMinutes; min += intervalMin) {
    const slotStartH = Math.floor(min / 60);
    const slotStartM = min % 60;

    const nextMin = min + intervalMin;
    const slotEndH = Math.floor(nextMin / 60);
    const slotEndM = nextMin % 60;

    const startTimeFormatted = format12Hour(slotStartH, slotStartM);
    const endTimeFormatted = format12Hour(slotEndH, slotEndM);
    const displayLabel = `${startTimeFormatted} – ${endTimeFormatted}`;
    const slotId = `${targetDateKey}_${String(slotStartH).padStart(2, '0')}${String(slotStartM).padStart(2, '0')}`;

    // Construct valid UTC Date for this IST time (UTC = IST - 5:30)
    // IST is UTC+5:30. In minutes, +330.
    const slotUtcTimestamp = Date.UTC(targetYear, targetMonth - 1, targetDay, slotStartH, slotStartM) - (5.5 * 60 * 60 * 1000);
    const isoPickupTime = new Date(slotUtcTimestamp).toISOString();

    // Check if slot has already passed or violates minimum notice
    let isAvailable = true;
    let reason: string | undefined = undefined;

    if (isToday) {
      if (min < currentTotalMinutes) {
        isAvailable = false;
        reason = 'Past time slot';
      } else if (min < earliestAllowedMinutesToday) {
        isAvailable = false;
        reason = `Requires min ${minNoticeMin}m advance notice`;
      }
    }

    // Calculate actual booked count from Firestore active orders
    const bookedCount = existingOrders.filter((order) => {
      // Must be scheduled for this date and time slot
      if (order.status === 'CANCELLED' || order.status === 'REJECTED') {
        return false;
      }
      if (order.orderType !== 'scheduled') {
        return false;
      }
      const matchDate = order.scheduledDate === targetDateKey ||
        (order.scheduledPickupAt && formatISTDateKey(new Date(order.scheduledPickupAt)) === targetDateKey);
      const matchSlot = order.scheduledTimeSlot === displayLabel ||
        (order.scheduledPickupAt && new Date(order.scheduledPickupAt).toISOString() === isoPickupTime);
      return Boolean(matchDate && matchSlot);
    }).length;

    if (bookedCount >= maxCapacity) {
      isAvailable = false;
      reason = `Fully booked (${bookedCount}/${maxCapacity} slots filled)`;
    }

    slots.push({
      id: slotId,
      time: startTimeFormatted,
      endTime: endTimeFormatted,
      displayLabel,
      isoPickupTime,
      bookedCount,
      maxCapacity,
      isAvailable,
      reason
    });
  }

  return slots;
};

/**
 * Format time remaining until pickup
 */
export const getTimeRemainingUntilPickup = (
  scheduledPickupAt?: string | null,
  leadTimeMinutes = 25
): {
  minutes: number;
  label: string;
  isUrgent: boolean;
  isPast: boolean;
  formattedTime: string;
} => {
  if (!scheduledPickupAt) {
    return {
      minutes: 0,
      label: 'Immediate fulfillment',
      isUrgent: false,
      isPast: false,
      formattedTime: 'Instant'
    };
  }

  const pickupTime = new Date(scheduledPickupAt).getTime();
  const now = Date.now();
  const diffMs = pickupTime - now;
  const minutes = Math.round(diffMs / (60 * 1000));

  const pickupDate = new Date(scheduledPickupAt);
  const timeFormatted = pickupDate.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  const dateFormatted = pickupDate.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    month: 'short',
    day: 'numeric'
  });

  if (minutes < 0) {
    const passedMin = Math.abs(minutes);
    return {
      minutes,
      label: passedMin < 60 ? `Pickup time passed ${passedMin}m ago` : 'Scheduled pickup time passed',
      isUrgent: false,
      isPast: true,
      formattedTime: `${dateFormatted}, ${timeFormatted}`
    };
  }

  const isUrgent = minutes <= leadTimeMinutes;

  if (minutes < 60) {
    return {
      minutes,
      label: `Pickup in ${minutes}m`,
      isUrgent,
      isPast: false,
      formattedTime: `${dateFormatted}, ${timeFormatted}`
    };
  }

  const hours = Math.floor(minutes / 60);
  const remMinutes = minutes % 60;

  if (hours < 24) {
    return {
      minutes,
      label: `Pickup in ${hours}h ${remMinutes > 0 ? `${remMinutes}m` : ''}`,
      isUrgent,
      isPast: false,
      formattedTime: `${dateFormatted}, ${timeFormatted}`
    };
  }

  const days = Math.floor(hours / 24);
  return {
    minutes,
    label: `Pickup in ${days} day${days > 1 ? 's' : ''} (${timeFormatted})`,
    isUrgent: false,
    isPast: false,
    formattedTime: `${dateFormatted}, ${timeFormatted}`
  };
};

/**
 * Check whether a student can reschedule or cancel a scheduled order
 */
export const canRescheduleOrCancel = (
  order: Order,
  cutoffMinutes = 30
): { allowed: boolean; reason?: string } => {
  // Can only cancel or reschedule while status is PLACED
  if (order.status !== 'PLACED') {
    return {
      allowed: false,
      reason: `Order is already in "${order.status}" status. Kitchen preparation has started and it cannot be altered.`
    };
  }

  if (order.orderType === 'scheduled' && order.scheduledPickupAt) {
    const pickupTime = new Date(order.scheduledPickupAt).getTime();
    const now = Date.now();
    const remainingMinutes = (pickupTime - now) / (60 * 1000);

    if (remainingMinutes < cutoffMinutes) {
      return {
        allowed: false,
        reason: `Orders can only be modified or cancelled up to ${cutoffMinutes} minutes before the scheduled pickup time (${Math.max(0, Math.round(remainingMinutes))} mins remaining).`
      };
    }
  }

  return { allowed: true };
};
