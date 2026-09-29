import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  runTransaction
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';
import {
  FoodItem,
  Order,
  OrderItem,
  OrderStatus,
  QueueState,
  NotificationItem,
  CanteenSettings,
  CanteenStatus,
  PaymentStatus
} from '../types';
import { INITIAL_FOOD_ITEMS, CATEGORIES } from '../data/menuData';
import {
  getNextDailyToken,
  getTodayDateKey,
  formatTokenNumber,
  formatOrderNumber,
  calculateEstimatedWaitRange
} from '../services/queueService';
import { safeLocalStorage } from '../services/safeStorage';

interface CartItem extends OrderItem {}

interface CanteenContextType {
  foods: FoodItem[];
  categories: string[];
  orders: Order[];
  myOrders: Order[];
  activeOrder: Order | null;
  queueState: QueueState;
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  favorites: string[];
  settings: CanteenSettings;
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  cartTotal: number;
  loading: boolean;
  // Cart Actions
  addToCart: (food: FoodItem, quantity?: number) => void;
  updateCartQuantity: (foodId: string, quantity: number) => void;
  removeFromCart: (foodId: string) => void;
  clearCart: () => void;
  // Order Lifecycle Actions
  placeOrder: (notes?: string) => Promise<Order>;
  cancelOrder: (orderId: string) => Promise<void>;
  // Staff Kitchen Actions
  acceptOrder: (orderId: string) => Promise<void>;
  startPreparingOrder: (orderId: string) => Promise<void>;
  markOrderReady: (orderId: string) => Promise<void>;
  markPaymentPaid: (orderId: string) => Promise<void>;
  completePickup: (orderId: string) => Promise<void>;
  rejectOrder: (orderId: string, reason: string) => Promise<void>;
  // Admin Operations
  updateFoodAvailability: (foodId: string, isAvailable: boolean) => Promise<void>;
  saveFoodItem: (food: FoodItem) => Promise<void>;
  updateCanteenStatus: (status: CanteenStatus, announcement?: string, operatingHours?: string) => Promise<void>;
  seedMenuCatalog: () => Promise<void>;
  // User Actions
  toggleFavorite: (foodId: string) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
}

const CanteenContext = createContext<CanteenContextType | undefined>(undefined);

export const CanteenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, userProfile, role } = useAuth();

  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [categories] = useState<string[]>(CATEGORIES);
  const [orders, setOrders] = useState<Order[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [queueState, setQueueState] = useState<QueueState>({
    id: getTodayDateKey(),
    dateKey: getTodayDateKey(),
    lastToken: 0,
    updatedAt: new Date().toISOString()
  });
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [settings, setSettings] = useState<CanteenSettings>({
    status: 'OPEN',
    announcement: 'Fresh breakfast & hot meals available at Counters 1 & 2',
    operatingHours: '7:30 AM – 5:30 PM'
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = safeLocalStorage.getItem('qbite_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState<boolean>(true);
  const isPlacingOrderRef = useRef<boolean>(false);

  // Sync cart to safeLocalStorage
  useEffect(() => {
    safeLocalStorage.setItem('qbite_cart', JSON.stringify(cart));
  }, [cart]);

  // 1. Real-time Foods Listener
  useEffect(() => {
    const foodsColRef = collection(db, 'foods');
    const unsub = onSnapshot(foodsColRef, (snapshot) => {
      if (!snapshot.empty) {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as FoodItem));
        setFoods(items);
      } else {
        // If foods collection in Firestore is empty, provide fallback catalog in memory until admin seeds
        setFoods(INITIAL_FOOD_ITEMS);
      }
      setLoading(false);
    }, () => {
      setFoods(INITIAL_FOOD_ITEMS);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // 2. Real-time Daily Queue Listener
  useEffect(() => {
    const todayKey = getTodayDateKey();
    const queueDocRef = doc(db, 'queue', todayKey);
    const unsub = onSnapshot(queueDocRef, (snap) => {
      if (snap.exists()) {
        setQueueState(snap.data() as QueueState);
      } else {
        setQueueState({
          id: todayKey,
          dateKey: todayKey,
          lastToken: 0,
          updatedAt: new Date().toISOString()
        });
      }
    }, () => {
      // Ignored non-fatal notice
    });

    return () => unsub();
  }, []);

  // 3. Real-time Orders Listener (Role-segregated)
  useEffect(() => {
    const ordersColRef = collection(db, 'orders');

    if (!currentUser) {
      // Public TV display or unauthenticated view: listen to active queue orders
      const q = query(
        ordersColRef,
        where('status', 'in', ['READY', 'PREPARING', 'ACCEPTED']),
        limit(50)
      );
      const unsub = onSnapshot(q, (snap) => {
        const fetched = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
        setOrders(fetched);
        setMyOrders([]);
      }, () => {
        // Ignored non-fatal notice
      });
      return () => unsub();
    }

    if (role === 'staff' || role === 'admin') {
      // Staff / Admin: Listen to today's active & recent orders
      const q = query(ordersColRef, orderBy('createdAt', 'desc'), limit(150));
      const unsub = onSnapshot(q, (snap) => {
        const fetched = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
        setOrders(fetched);
        setMyOrders(fetched.filter((o) => o.userId === currentUser.uid));
      }, () => {
        // Ignored non-fatal notice
      });
      return () => unsub();
    } else {
      // Student: Listen to own orders
      const q = query(
        ordersColRef,
        where('userId', '==', currentUser.uid)
      );
      const unsub = onSnapshot(q, (snap) => {
        const fetched = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
        fetched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setMyOrders(fetched);
        setOrders(fetched);
      }, () => {
        // Ignored non-fatal notice
      });
      return () => unsub();
    }
  }, [currentUser, role]);

  // 4. Real-time Notifications Listener (Own notifications only)
  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      return;
    }

    const notifsRef = collection(db, 'notifications');
    const q = query(
      notifsRef,
      where('userId', '==', currentUser.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as NotificationItem));
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setNotifications(items);
    }, () => {
      // Ignored non-fatal notice
    });

    return () => unsub();
  }, [currentUser]);

  // 5. Real-time Favorites Listener
  useEffect(() => {
    if (!currentUser) {
      setFavorites([]);
      return;
    }

    const favsRef = collection(db, 'favorites');
    const q = query(favsRef, where('userId', '==', currentUser.uid));

    const unsub = onSnapshot(q, (snap) => {
      const ids = snap.docs.map((d) => (d.data() as { foodId: string }).foodId);
      setFavorites(ids);
    }, () => {
      // Ignored non-fatal notice
    });

    return () => unsub();
  }, [currentUser]);

  // 6. Real-time Canteen Settings Listener
  useEffect(() => {
    const settingsDocRef = doc(db, 'settings', 'main');
    const unsub = onSnapshot(settingsDocRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setSettings({
          status: (data.status as CanteenStatus) || 'OPEN',
          announcement: data.announcement || 'Fresh breakfast & hot meals available at Counters 1 & 2',
          operatingHours: data.operatingHours || '7:30 AM – 5:30 PM',
          updatedAt: data.updatedAt,
          updatedBy: data.updatedBy
        });
      }
    }, () => {});
    return () => unsub();
  }, []);

  // Cart Totals
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartTotal = cartSubtotal; // Stage 1: No coupon manipulation, pure subtotal

  // Active Order: Most recent order in non-terminal state
  const activeOrder = myOrders.find((o) => ['PLACED', 'ACCEPTED', 'PREPARING', 'READY'].includes(o.status)) || null;

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  // Cart Operations
  const addToCart = (food: FoodItem, quantity = 1) => {
    if (!food.isAvailable) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.foodId === food.id);
      if (existing) {
        return prev.map((item) =>
          item.foodId === food.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [
        ...prev,
        {
          foodId: food.id,
          name: food.name,
          price: food.price,
          quantity,
          imageUrl: food.imageUrl,
          isVeg: food.isVeg
        }
      ];
    });
  };

  const updateCartQuantity = (foodId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(foodId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.foodId === foodId ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = (foodId: string) => {
    setCart((prev) => prev.filter((item) => item.foodId !== foodId));
  };

  const clearCart = () => {
    setCart([]);
  };

  /**
   * ATOMIC ORDER CREATION (Requirement 15 & 16)
   * Validates:
   * 1. Canteen status not CLOSED or PAUSED
   * 2. Every food document in Firestore (availability & authoritative unit price)
   * 3. Allocates sequential daily token atomically
   * 4. Writes order document to Firestore
   * 5. No fake local order on error
   */
  const placeOrder = async (notes?: string): Promise<Order> => {
    if (!currentUser) {
      throw new Error('Please sign in with your Google account to place an order.');
    }
    if (cart.length === 0) {
      throw new Error('Your cart is empty.');
    }
    if (isPlacingOrderRef.current) {
      throw new Error('An order submission is already in progress.');
    }

    isPlacingOrderRef.current = true;

    try {
      const dateKey = getTodayDateKey();

      // 1. Verify Canteen Settings
      const settingsSnap = await getDoc(doc(db, 'settings', 'main'));
      if (settingsSnap.exists()) {
        const currentCanteenStatus = (settingsSnap.data().status as CanteenStatus) || 'OPEN';
        if (currentCanteenStatus === 'CLOSED') {
          throw new Error('The canteen is currently closed. Orders cannot be placed at this time.');
        }
        if (currentCanteenStatus === 'PAUSED') {
          throw new Error('Ordering is temporarily paused while the kitchen fulfills active orders. Please try again shortly.');
        }
      }

      // 2. Authoritative Re-validation of Cart Items in Firestore
      const verifiedItems: OrderItem[] = [];
      let authoritativeSubtotal = 0;
      let maxItemPrepTime = 8;

      for (const item of cart) {
        const foodDocRef = doc(db, 'foods', item.foodId);
        const foodSnap = await getDoc(foodDocRef);

        if (!foodSnap.exists()) {
          // If foods collection wasn't seeded yet, fallback to static item check
          const fallbackItem = INITIAL_FOOD_ITEMS.find((f) => f.id === item.foodId);
          if (!fallbackItem || !fallbackItem.isAvailable) {
            throw new Error(`"${item.name}" is no longer available. Please remove it from your cart.`);
          }
          verifiedItems.push({
            foodId: fallbackItem.id,
            name: fallbackItem.name,
            price: fallbackItem.price,
            quantity: item.quantity,
            imageUrl: fallbackItem.imageUrl,
            isVeg: fallbackItem.isVeg
          });
          authoritativeSubtotal += fallbackItem.price * item.quantity;
          maxItemPrepTime = Math.max(maxItemPrepTime, fallbackItem.prepTimeMinutes || 8);
        } else {
          const foodData = foodSnap.data() as FoodItem;
          if (!foodData.isAvailable) {
            throw new Error(`"${foodData.name}" was just marked sold out! Please remove it from your cart.`);
          }
          verifiedItems.push({
            foodId: foodData.id,
            name: foodData.name,
            price: foodData.price, // Authoritative price snapshot
            quantity: item.quantity,
            imageUrl: foodData.imageUrl,
            isVeg: foodData.isVeg
          });
          authoritativeSubtotal += foodData.price * item.quantity;
          maxItemPrepTime = Math.max(maxItemPrepTime, foodData.prepTimeMinutes || 8);
        }
      }

      // 3. Deterministic wait estimate based on active kitchen load
      const waitRange = calculateEstimatedWaitRange(orders, maxItemPrepTime);
      const estimatedWaitMin = waitRange.minMin;

      // 4. Atomic Firestore Transaction for Token Allocation & Order Creation
      const queueDocRef = doc(db, 'queue', dateKey);
      const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const orderDocRef = doc(db, 'orders', orderId);

      const confirmedOrder = await runTransaction(db, async (transaction) => {
        const queueDoc = await transaction.get(queueDocRef);
        let nextToken = 1;

        if (queueDoc.exists()) {
          const qData = queueDoc.data() as QueueState;
          nextToken = (qData.lastToken || 0) + 1;
          transaction.update(queueDocRef, {
            lastToken: nextToken,
            updatedAt: new Date().toISOString()
          });
        } else {
          transaction.set(queueDocRef, {
            id: dateKey,
            dateKey,
            lastToken: 1,
            updatedAt: new Date().toISOString()
          });
          nextToken = 1;
        }

        const tokenString = formatTokenNumber(nextToken);
        const orderNumber = formatOrderNumber(nextToken);

        const newOrder: Order = {
          id: orderId,
          orderNumber,
          tokenNumber: nextToken,
          tokenString,
          dateKey,
          userId: currentUser.uid,
          userName: userProfile?.name || currentUser.displayName || 'SVCE Student',
          userEmail: currentUser.email || `${currentUser.uid}@svce.ac.in`,
          items: verifiedItems,
          status: 'PLACED',
          paymentMethod: 'COUNTER',
          paymentStatus: 'PENDING',
          subtotal: authoritativeSubtotal,
          discount: 0,
          total: authoritativeSubtotal,
          createdAt: new Date().toISOString(),
          acceptedAt: null,
          preparingAt: null,
          readyAt: null,
          completedAt: null,
          lastStatusChangedAt: new Date().toISOString(),
          lastStatusChangedBy: currentUser.uid,
          estimatedWaitMin,
          notes: notes ? notes.trim() : ''
        };

        transaction.set(orderDocRef, newOrder);
        return newOrder;
      });

      // 5. In-App Notification for Student
      const notifId = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
      const notif: NotificationItem = {
        id: notifId,
        userId: currentUser.uid,
        orderId: confirmedOrder.id,
        tokenString: confirmedOrder.tokenString,
        title: 'Order Confirmed',
        message: `Your token ${confirmedOrder.tokenString} (${confirmedOrder.orderNumber}) has been placed. Pay ₹${confirmedOrder.total} at counter on pickup.`,
        type: 'STATUS_UPDATE',
        read: false,
        createdAt: new Date().toISOString()
      };
      setDoc(doc(db, 'notifications', notifId), notif).catch(() => {});

      // Clear local cart ONLY upon confirmed creation
      clearCart();
      return confirmedOrder;
    } catch (err: any) {
      console.error('Order creation failed:', err);
      const friendlyMessage = err?.message || 'Order could not be confirmed. Please check your connection and try again.';
      throw new Error(friendlyMessage);
    } finally {
      isPlacingOrderRef.current = false;
    }
  };

  /**
   * CANCEL ORDER (Allowed ONLY when status is PLACED)
   */
  const cancelOrder = async (orderId: string) => {
    if (!currentUser) throw new Error('Not authenticated');

    const orderRef = doc(db, 'orders', orderId);
    const snap = await getDoc(orderRef);
    if (!snap.exists()) throw new Error('Order not found');

    const orderData = snap.data() as Order;
    if (orderData.userId !== currentUser.uid && role !== 'admin') {
      throw new Error('You do not have permission to cancel this order.');
    }

    if (orderData.status !== 'PLACED') {
      throw new Error('This order cannot be cancelled as kitchen preparation has already started.');
    }

    const nowIso = new Date().toISOString();
    await updateDoc(orderRef, {
      status: 'CANCELLED',
      lastStatusChangedAt: nowIso,
      lastStatusChangedBy: currentUser.uid
    });

    // Send cancellation notification
    const notifId = `notif_${Date.now()}`;
    await setDoc(doc(db, 'notifications', notifId), {
      id: notifId,
      userId: orderData.userId,
      orderId,
      tokenString: orderData.tokenString,
      title: 'Order Cancelled',
      message: `Your order ${orderData.tokenString} has been cancelled.`,
      type: 'STATUS_UPDATE',
      read: false,
      createdAt: nowIso
    });
  };

  /**
   * STAFF WORKFLOW TRANSITIONS
   * Validates allowed transitions and sends in-app notifications
   */
  const acceptOrder = async (orderId: string) => {
    const orderRef = doc(db, 'orders', orderId);
    const snap = await getDoc(orderRef);
    if (!snap.exists()) throw new Error('Order not found');
    const order = snap.data() as Order;

    if (order.status !== 'PLACED') {
      throw new Error(`Cannot accept order with status "${order.status}".`);
    }

    const nowIso = new Date().toISOString();
    await updateDoc(orderRef, {
      status: 'ACCEPTED',
      acceptedAt: nowIso,
      lastStatusChangedAt: nowIso,
      lastStatusChangedBy: currentUser?.uid || 'staff'
    });

    // Notify student
    const notifId = `notif_${Date.now()}`;
    await setDoc(doc(db, 'notifications', notifId), {
      id: notifId,
      userId: order.userId,
      orderId: order.id,
      tokenString: order.tokenString,
      title: `Order Accepted (${order.tokenString})`,
      message: `The kitchen has accepted your order ${order.tokenString}.`,
      type: 'STATUS_UPDATE',
      read: false,
      createdAt: nowIso
    });
  };

  const startPreparingOrder = async (orderId: string) => {
    const orderRef = doc(db, 'orders', orderId);
    const snap = await getDoc(orderRef);
    if (!snap.exists()) throw new Error('Order not found');
    const order = snap.data() as Order;

    if (order.status !== 'ACCEPTED' && order.status !== 'PLACED') {
      throw new Error(`Cannot start preparing order with status "${order.status}".`);
    }

    const nowIso = new Date().toISOString();
    await updateDoc(orderRef, {
      status: 'PREPARING',
      preparingAt: nowIso,
      lastStatusChangedAt: nowIso,
      lastStatusChangedBy: currentUser?.uid || 'staff'
    });

    const notifId = `notif_${Date.now()}`;
    await setDoc(doc(db, 'notifications', notifId), {
      id: notifId,
      userId: order.userId,
      orderId: order.id,
      tokenString: order.tokenString,
      title: `Preparing Your Food (${order.tokenString})`,
      message: `Chefs are now preparing your fresh food for token ${order.tokenString}.`,
      type: 'STATUS_UPDATE',
      read: false,
      createdAt: nowIso
    });
  };

  const markOrderReady = async (orderId: string) => {
    const orderRef = doc(db, 'orders', orderId);
    const snap = await getDoc(orderRef);
    if (!snap.exists()) throw new Error('Order not found');
    const order = snap.data() as Order;

    if (order.status !== 'PREPARING' && order.status !== 'ACCEPTED') {
      throw new Error(`Cannot mark ready an order with status "${order.status}".`);
    }

    const nowIso = new Date().toISOString();
    await updateDoc(orderRef, {
      status: 'READY',
      readyAt: nowIso,
      lastStatusChangedAt: nowIso,
      lastStatusChangedBy: currentUser?.uid || 'staff'
    });

    // High priority READY alert notification
    const notifId = `notif_${Date.now()}`;
    await setDoc(doc(db, 'notifications', notifId), {
      id: notifId,
      userId: order.userId,
      orderId: order.id,
      tokenString: order.tokenString,
      title: 'YOUR ORDER IS READY! 🎉',
      message: `Please collect token ${order.tokenString} from SVCE Cafe Counter 1 or 2.`,
      type: 'READY_ALERT',
      read: false,
      createdAt: nowIso
    });
  };

  const markPaymentPaid = async (orderId: string) => {
    const orderRef = doc(db, 'orders', orderId);
    const nowIso = new Date().toISOString();
    await updateDoc(orderRef, {
      paymentStatus: 'PAID',
      lastStatusChangedAt: nowIso,
      lastStatusChangedBy: currentUser?.uid || 'staff'
    });
  };

  const completePickup = async (orderId: string) => {
    const orderRef = doc(db, 'orders', orderId);
    const snap = await getDoc(orderRef);
    if (!snap.exists()) throw new Error('Order not found');
    const order = snap.data() as Order;

    if (order.status !== 'READY') {
      throw new Error(`Cannot complete order with status "${order.status}". Only READY orders can be completed.`);
    }

    const nowIso = new Date().toISOString();
    await updateDoc(orderRef, {
      status: 'COMPLETED',
      paymentStatus: 'PAID', // Complete pickup ensures payment was collected
      completedAt: nowIso,
      lastStatusChangedAt: nowIso,
      lastStatusChangedBy: currentUser?.uid || 'staff'
    });

    const notifId = `notif_${Date.now()}`;
    await setDoc(doc(db, 'notifications', notifId), {
      id: notifId,
      userId: order.userId,
      orderId: order.id,
      tokenString: order.tokenString,
      title: 'Order Picked Up',
      message: `Your order ${order.tokenString} has been completed. Enjoy your meal at SVCE!`,
      type: 'STATUS_UPDATE',
      read: false,
      createdAt: nowIso
    });
  };

  const rejectOrder = async (orderId: string, reason: string) => {
    const orderRef = doc(db, 'orders', orderId);
    const snap = await getDoc(orderRef);
    if (!snap.exists()) throw new Error('Order not found');
    const order = snap.data() as Order;

    if (order.status !== 'PLACED') {
      throw new Error('Only newly placed orders can be rejected.');
    }

    const nowIso = new Date().toISOString();
    await updateDoc(orderRef, {
      status: 'REJECTED',
      rejectionReason: reason || 'Item unavailable or kitchen capacity reached',
      lastStatusChangedAt: nowIso,
      lastStatusChangedBy: currentUser?.uid || 'staff'
    });

    const notifId = `notif_${Date.now()}`;
    await setDoc(doc(db, 'notifications', notifId), {
      id: notifId,
      userId: order.userId,
      orderId: order.id,
      tokenString: order.tokenString,
      title: 'Order Unable to be Prepared',
      message: `Order ${order.tokenString} was rejected by kitchen: ${reason}. Please order an alternate item.`,
      type: 'STATUS_UPDATE',
      read: false,
      createdAt: nowIso
    });
  };

  // ADMIN OPERATIONS
  const updateFoodAvailability = async (foodId: string, isAvailable: boolean) => {
    const foodRef = doc(db, 'foods', foodId);
    const nowIso = new Date().toISOString();
    await setDoc(foodRef, { isAvailable, updatedAt: nowIso }, { merge: true });
  };

  const saveFoodItem = async (food: FoodItem) => {
    const foodRef = doc(db, 'foods', food.id);
    const nowIso = new Date().toISOString();
    await setDoc(foodRef, { ...food, updatedAt: nowIso }, { merge: true });
  };

  const updateCanteenStatus = async (
    status: CanteenStatus,
    announcement?: string,
    operatingHours?: string
  ) => {
    const settingsRef = doc(db, 'settings', 'main');
    const nowIso = new Date().toISOString();
    const payload: Partial<CanteenSettings> = {
      status,
      updatedAt: nowIso,
      updatedBy: currentUser?.uid || 'admin'
    };
    if (announcement !== undefined) payload.announcement = announcement;
    if (operatingHours !== undefined) payload.operatingHours = operatingHours;

    await setDoc(settingsRef, payload, { merge: true });
  };

  const seedMenuCatalog = async () => {
    for (const item of INITIAL_FOOD_ITEMS) {
      await setDoc(doc(db, 'foods', item.id), item);
    }
    await setDoc(doc(db, 'settings', 'main'), {
      status: 'OPEN',
      announcement: 'Fresh breakfast & hot meals available at Counters 1 & 2',
      operatingHours: '7:30 AM – 5:30 PM',
      updatedAt: new Date().toISOString()
    }, { merge: true });
  };

  // User Actions
  const toggleFavorite = async (foodId: string) => {
    if (!currentUser) return;
    const favId = `${currentUser.uid}_${foodId}`;
    const favRef = doc(db, 'favorites', favId);

    if (favorites.includes(foodId)) {
      setFavorites((prev) => prev.filter((id) => id !== foodId));
      try {
        await deleteDoc(favRef);
      } catch {
        // Ignored
      }
    } else {
      setFavorites((prev) => [...prev, foodId]);
      try {
        await setDoc(favRef, {
          id: favId,
          userId: currentUser.uid,
          foodId,
          createdAt: new Date().toISOString()
        });
      } catch {
        // Ignored
      }
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
    try {
      await updateDoc(doc(db, 'notifications', notificationId), { read: true });
    } catch {
      // Ignored
    }
  };

  const clearAllNotifications = async () => {
    const unread = notifications.filter((n) => !n.read);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    for (const notif of unread) {
      updateDoc(doc(db, 'notifications', notif.id), { read: true }).catch(() => {});
    }
  };

  return (
    <CanteenContext.Provider
      value={{
        foods,
        categories,
        orders,
        myOrders,
        activeOrder,
        queueState,
        notifications,
        unreadNotificationCount,
        favorites,
        settings,
        cart,
        cartCount,
        cartSubtotal,
        cartTotal,
        loading,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        placeOrder,
        cancelOrder,
        acceptOrder,
        startPreparingOrder,
        markOrderReady,
        markPaymentPaid,
        completePickup,
        rejectOrder,
        updateFoodAvailability,
        saveFoodItem,
        updateCanteenStatus,
        seedMenuCatalog,
        toggleFavorite,
        markNotificationAsRead,
        clearAllNotifications
      }}
    >
      {children}
    </CanteenContext.Provider>
  );
};

export const useCanteen = () => {
  const context = useContext(CanteenContext);
  if (!context) {
    throw new Error('useCanteen must be used within a CanteenProvider');
  }
  return context;
};
