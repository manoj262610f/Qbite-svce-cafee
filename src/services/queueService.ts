import {
  doc,
  getDoc,
  setDoc,
  runTransaction,
  collection,
  query,
  where,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { QueueState, Order } from '../types';
import { safeLocalStorage } from './safeStorage';

export const getTodayDateKey = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatTokenNumber = (tokenNum: number): string => {
  return `#${String(tokenNum).padStart(3, '0')}`;
};

export const formatOrderNumber = (tokenNum: number): string => {
  const year = new Date().getFullYear();
  return `QB-${year}-${String(tokenNum).padStart(4, '0')}`;
};

/**
 * Atomically generates next daily token using a Firestore transaction
 */
export const getNextDailyToken = async (): Promise<{ tokenNumber: number; tokenString: string; orderNumber: string; dateKey: string }> => {
  const dateKey = getTodayDateKey();
  const queueDocRef = doc(db, 'queue', dateKey);

  try {
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
        // First token of the day!
        const newQueueState: QueueState = {
          id: dateKey,
          dateKey,
          lastToken: 1,
          currentServingToken: 1,
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
  } catch (err) {
    console.warn('Transaction fallback for local dev mode:', err);
    // Safe sequential fallback using safeLocalStorage if Firestore rule transaction encounters restriction
    const localKey = `qbite_token_${dateKey}`;
    const current = parseInt(safeLocalStorage.getItem(localKey) || '42', 10);
    const next = current + 1;
    safeLocalStorage.setItem(localKey, String(next));
    
    // Attempt non-transactional write to update Firestore queue
    try {
      await setDoc(queueDocRef, {
        dateKey,
        lastToken: next,
        currentServingToken: Math.max(1, next - 4),
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch {
      // Ignored in offline
    }

    return {
      tokenNumber: next,
      tokenString: formatTokenNumber(next),
      orderNumber: formatOrderNumber(next),
      dateKey
    };
  }
};

/**
 * Calculate queue statistics for a given student's token
 */
export const calculateQueueStats = (
  studentToken: number,
  currentServingToken: number,
  activeOrders: Order[]
) => {
  // Orders ahead are active orders with tokenNumber between currentServingToken and studentToken
  const ordersAhead = activeOrders.filter(
    (o) =>
      o.tokenNumber >= currentServingToken &&
      o.tokenNumber < studentToken &&
      ['PLACED', 'ACCEPTED', 'PREPARING'].includes(o.status)
  ).length;

  // Average preparation time per order ~ 3 minutes when parallelized in kitchen
  const estimatedWaitMin = Math.max(2, ordersAhead * 2 + 3);

  const preparingCount = activeOrders.filter((o) => o.status === 'PREPARING').length;
  const readyCount = activeOrders.filter((o) => o.status === 'READY').length;

  return {
    ordersAhead,
    estimatedWaitMin,
    preparingCount,
    readyCount
  };
};
