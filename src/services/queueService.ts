import {
  doc,
  runTransaction
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { QueueState, Order } from '../types';

/**
 * Returns today's business date key in Asia/Kolkata timezone (YYYY-MM-DD)
 */
export const getTodayDateKey = (): string => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(new Date()); // Formats as YYYY-MM-DD
};

/**
 * Formats integer token into standard token string, e.g. 7 -> "#007", 83 -> "#083"
 */
export const formatTokenNumber = (tokenNum: number): string => {
  if (!tokenNum || tokenNum < 1) return '#---';
  return `#${String(tokenNum).padStart(3, '0')}`;
};

/**
 * Formats persistent order number, e.g. QB-2026-0083
 */
export const formatOrderNumber = (tokenNum: number): string => {
  const year = new Date().getFullYear();
  return `QB-${year}-${String(tokenNum).padStart(4, '0')}`;
};

/**
 * Atomically generates the next daily token using a Firestore transaction.
 * No local fallback, no fake numbers.
 */
export const getNextDailyToken = async (): Promise<{
  tokenNumber: number;
  tokenString: string;
  orderNumber: string;
  dateKey: string;
}> => {
  const dateKey = getTodayDateKey();
  const queueDocRef = doc(db, 'queue', dateKey);

  const tokenNumber = await runTransaction(db, async (transaction) => {
    const queueDoc = await transaction.get(queueDocRef);
    let nextToken = 1;

    if (queueDoc.exists()) {
      const data = queueDoc.data() as QueueState;
      nextToken = (data.lastToken || 0) + 1;
      transaction.update(queueDocRef, {
        lastToken: nextToken,
        updatedAt: new Date().toISOString()
      });
    } else {
      // First token of the business day
      const newQueueState: QueueState = {
        id: dateKey,
        dateKey,
        lastToken: 1,
        updatedAt: new Date().toISOString()
      };
      transaction.set(queueDocRef, newQueueState);
      nextToken = 1;
    }

    return nextToken;
  });

  return {
    tokenNumber,
    tokenString: formatTokenNumber(tokenNumber),
    orderNumber: formatOrderNumber(tokenNumber),
    dateKey
  };
};

/**
 * Deterministically estimates preparation wait range based on active kitchen load.
 * No machine learning or fake precision.
 */
export const calculateEstimatedWaitRange = (
  activeOrders: Order[],
  maxItemPrepTime = 8
): { minMin: number; maxMin: number; displayRange: string } => {
  const preparingCount = activeOrders.filter((o) => o.status === 'PREPARING').length;
  const placedCount = activeOrders.filter((o) => o.status === 'PLACED' || o.status === 'ACCEPTED').length;

  // Each waiting order adds roughly 2-3 mins when cooking parallelized across 2 counters
  const basePrep = Math.max(5, maxItemPrepTime);
  const queueLoadMin = Math.round(placedCount * 2 + preparingCount * 1.5);

  const minMin = Math.max(5, basePrep + Math.floor(queueLoadMin * 0.7));
  const maxMin = minMin + Math.max(4, Math.ceil(basePrep * 0.4));

  return {
    minMin,
    maxMin,
    displayRange: `${minMin}–${maxMin} min`
  };
};

/**
 * Calculates current real queue position ahead of a given order based on active Firestore queue.
 * Zero means ready for pickup immediately.
 */
export const calculateQueuePosition = (order: Order, allOrders: Order[]): number => {
  if (order.status === 'READY') return 0;
  if (['COMPLETED', 'CANCELLED', 'REJECTED'].includes(order.status)) return 0;

  const ahead = allOrders.filter(
    (o) =>
      o.id !== order.id &&
      o.dateKey === order.dateKey &&
      ['PLACED', 'ACCEPTED', 'PREPARING'].includes(o.status) &&
      (new Date(o.createdAt).getTime() < new Date(order.createdAt).getTime() ||
        (new Date(o.createdAt).getTime() === new Date(order.createdAt).getTime() && o.tokenNumber < order.tokenNumber))
  );

  return ahead.length + 1;
};
