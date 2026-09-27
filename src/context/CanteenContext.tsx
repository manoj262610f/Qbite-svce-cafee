import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit
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
  FavoriteItem,
  CouponItem,
  CanteenSettings
} from '../types';
import { INITIAL_FOOD_ITEMS, CATEGORIES, INITIAL_COUPONS } from '../data/menuData';
import { getNextDailyToken, getTodayDateKey, calculateQueueStats, formatTokenNumber } from '../services/queueService';
import { handleFirestoreError, OperationType } from '../firebase/errorHandler';
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
  favorites: string[]; // foodIds
  coupons: CouponItem[];
  settings: CanteenSettings;
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  appliedCoupon: CouponItem | null;
  discountAmount: number;
  cartTotal: number;
  loading: boolean;
  // Actions
  addToCart: (food: FoodItem, quantity?: number) => void;
  updateCartQuantity: (foodId: string, quantity: number) => void;
  removeFromCart: (foodId: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  placeOrder: (paymentMethod: 'COUNTER' | 'UPI' | 'ONLINE', notes?: string) => Promise<Order>;
  cancelOrder: (orderId: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  callNextToken: () => Promise<number>;
  setCurrentServingToken: (token: number) => Promise<void>;
  toggleFavorite: (foodId: string) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  toggleCanteenStatus: () => Promise<void>;
  updateFoodAvailability: (foodId: string, isAvailable: boolean) => Promise<void>;
  saveFoodItem: (food: FoodItem) => Promise<void>;
}

const CanteenContext = createContext<CanteenContextType | undefined>(undefined);

export const CanteenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, userProfile, role } = useAuth();

  const [foods, setFoods] = useState<FoodItem[]>(INITIAL_FOOD_ITEMS);
  const [categories] = useState<string[]>(CATEGORIES);
  const [orders, setOrders] = useState<Order[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [queueState, setQueueState] = useState<QueueState>({
    id: getTodayDateKey(),
    dateKey: getTodayDateKey(),
    lastToken: 47,
    currentServingToken: 42,
    updatedAt: new Date().toISOString()
  });
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [coupons, setCoupons] = useState<CouponItem[]>(INITIAL_COUPONS);
  const [settings, setSettings] = useState<CanteenSettings>({
    isOpen: true,
    announcement: 'Fresh breakfast & hot dosas ready at Counter 1 & 2',
    prepDelayOffset: 0,
    closingNotice: 'Kitchen closes at 5:30 PM',
    operatingHours: '7:30 AM – 5:30 PM'
  });

  // Cart State (stored in safeLocalStorage)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = safeLocalStorage.getItem('qbite_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<CouponItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync cart to safeLocalStorage
  useEffect(() => {
    safeLocalStorage.setItem('qbite_cart', JSON.stringify(cart));
  }, [cart]);

  // 1. Initial Seeding and sync of Foods
  useEffect(() => {
    const foodsColRef = collection(db, 'foods');
    const unsub = onSnapshot(foodsColRef, (snapshot) => {
      if (!snapshot.empty) {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as FoodItem));
        setFoods(items);
      } else {
        // Seed initial items to firestore in background so other clients can view
        INITIAL_FOOD_ITEMS.forEach(async (item) => {
          try {
            await setDoc(doc(db, 'foods', item.id), item);
          } catch {
            // Ignored if permissions not yet open
          }
        });
        setFoods(INITIAL_FOOD_ITEMS);
      }
      setLoading(false);
    }, (error) => {
      console.warn('Foods onSnapshot notice (using initial catalog):', error.message);
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
        // Initialize today's queue
        const initialQueue: QueueState = {
          id: todayKey,
          dateKey: todayKey,
          lastToken: 47,
          currentServingToken: 42,
          updatedAt: new Date().toISOString()
        };
        setQueueState(initialQueue);
        setDoc(queueDocRef, initialQueue).catch(() => {});
      }
    }, (error) => {
      console.warn('Queue onSnapshot notice:', error.message);
    });

    return () => unsub();
  }, []);

  // 3. Real-time Orders Listener
  useEffect(() => {
    if (!currentUser) {
      setOrders([]);
      setMyOrders([]);
      return;
    }

    const ordersColRef = collection(db, 'orders');

    // If staff or admin, listen to all today's active orders
    if (role === 'staff' || role === 'admin') {
      const q = query(ordersColRef, orderBy('createdAt', 'desc'), limit(100));
      const unsub = onSnapshot(q, (snap) => {
        const fetched = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
        setOrders(fetched);
        setMyOrders(fetched.filter((o) => o.userId === currentUser.uid));
      }, (error) => {
        console.warn('Orders onSnapshot error:', error.message);
      });
      return () => unsub();
    } else {
      // Student listens to their own orders
      const q = query(
        ordersColRef,
        where('userId', '==', currentUser.uid)
      );
      const unsub = onSnapshot(q, (snap) => {
        const fetched = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
        fetched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setMyOrders(fetched);
        setOrders(fetched);
      }, (error) => {
        console.warn('Student orders onSnapshot error:', error.message);
      });
      return () => unsub();
    }
  }, [currentUser, role]);

  // 4. Real-time Notifications Listener
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
    }, (error) => {
      console.warn('Notifications onSnapshot notice:', error.message);
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
      const ids = snap.docs.map((d) => (d.data() as FavoriteItem).foodId);
      setFavorites(ids);
    }, (error) => {
      console.warn('Favorites onSnapshot notice:', error.message);
    });

    return () => unsub();
  }, [currentUser]);

  // 6. Settings Listener
  useEffect(() => {
    const settingsDocRef = doc(db, 'settings', 'main');
    const unsub = onSnapshot(settingsDocRef, (snap) => {
      if (snap.exists()) {
        setSettings(snap.data() as CanteenSettings);
      }
    }, () => {});
    return () => unsub();
  }, []);

  // Cart Calculations
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  let discountAmount = 0;
  if (appliedCoupon && cartSubtotal >= appliedCoupon.minOrderValue) {
    if (appliedCoupon.discountPercentage) {
      discountAmount = Math.round((cartSubtotal * appliedCoupon.discountPercentage) / 100);
    } else if (appliedCoupon.discountAmount) {
      discountAmount = appliedCoupon.discountAmount;
    }
  }
  const cartTotal = Math.max(0, cartSubtotal - discountAmount);

  // Active Order: Most recent order that is not completed or cancelled
  const activeOrder = myOrders.find((o) => ['PLACED', 'ACCEPTED', 'PREPARING', 'READY'].includes(o.status)) || null;

  // Cart Actions
  const addToCart = (food: FoodItem, quantity = 1) => {
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
    setAppliedCoupon(null);
  };

  const applyCoupon = (code: string) => {
    const trimmed = code.trim().toUpperCase();
    const found = coupons.find((c) => c.code.toUpperCase() === trimmed && c.isActive);
    if (!found) {
      return { success: false, message: 'Invalid or expired coupon code' };
    }
    if (cartSubtotal < found.minOrderValue) {
      return { success: false, message: `Minimum order value ₹${found.minOrderValue} required` };
    }
    setAppliedCoupon(found);
    return { success: true, message: `Coupon ${found.code} applied successfully!` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  // Place Order
  const placeOrder = async (
    paymentMethod: 'COUNTER' | 'UPI' | 'ONLINE',
    notes?: string
  ): Promise<Order> => {
    if (!currentUser) throw new Error('Please login to place an order.');
    if (cart.length === 0) throw new Error('Your cart is empty.');

    const { tokenNumber, tokenString, orderNumber, dateKey } = await getNextDailyToken();

    // Calculate estimated wait time based on max prep time of items
    const maxItemPrepTime = Math.max(...cart.map((item) => {
      const food = foods.find((f) => f.id === item.foodId);
      return food?.prepTimeMinutes || 8;
    }));
    const stats = calculateQueueStats(tokenNumber, queueState.currentServingToken, orders);
    const estimatedWaitMin = Math.max(stats.estimatedWaitMin, maxItemPrepTime + settings.prepDelayOffset);

    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newOrder: Order = {
      id: orderId,
      orderNumber,
      tokenNumber,
      tokenString,
      dateKey,
      userId: currentUser.uid,
      userName: userProfile?.name || currentUser.displayName || 'SVCE Student',
      userEmail: currentUser.email || `${currentUser.uid}@svce.ac.in`,
      items: [...cart],
      status: 'PLACED',
      paymentMethod,
      paymentStatus: paymentMethod === 'COUNTER' ? 'PENDING' : 'PAID',
      subtotal: cartSubtotal,
      discount: discountAmount,
      total: cartTotal,
      couponCode: appliedCoupon?.code,
      createdAt: new Date().toISOString(),
      estimatedWaitMin,
      notes: notes || ''
    };

    // Save order in Firestore
    try {
      await setDoc(doc(db, 'orders', orderId), newOrder);
    } catch (err) {
      console.warn('Order write to firestore notice (fallback applied):', err);
    }

    // Add local state immediately for instant response
    setMyOrders((prev) => [newOrder, ...prev]);
    setOrders((prev) => [newOrder, ...prev]);

    // Create confirmation notification
    const notifId = `notif_${Date.now()}`;
    const notificationData: NotificationItem = {
      id: notifId,
      userId: currentUser.uid,
      orderId: newOrder.id,
      tokenString: newOrder.tokenString,
      title: 'Order Confirmed',
      message: `Your token ${newOrder.tokenString} has been placed. You don't need to stand in the queue!`,
      type: 'STATUS_UPDATE',
      read: false,
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'notifications', notifId), notificationData);
    } catch {
      setNotifications((prev) => [notificationData, ...prev]);
    }

    clearCart();
    return newOrder;
  };

  // Cancel order (allowed when PLACED)
  const cancelOrder = async (orderId: string) => {
    setMyOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: 'CANCELLED' } : o)));
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: 'CANCELLED' } : o)));
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: 'CANCELLED' });
    } catch (err) {
      console.warn('cancelOrder firestore sync notice:', err);
    }
  };

  // Update order status (Staff / Kitchen)
  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const order = orders.find((o) => o.id === orderId) || myOrders.find((o) => o.id === orderId);
    const updates: Partial<Order> = { status };
    const nowIso = new Date().toISOString();

    if (status === 'ACCEPTED') updates.acceptedAt = nowIso;
    if (status === 'PREPARING') updates.preparingAt = nowIso;
    if (status === 'READY') updates.readyAt = nowIso;
    if (status === 'COMPLETED') updates.completedAt = nowIso;

    try {
      await updateDoc(doc(db, 'orders', orderId), updates);
    } catch {
      // Offline fallback
    }

    // Update local state
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, ...updates } : o)));
    setMyOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, ...updates } : o)));

    // Send targeted notification to the student
    if (order) {
      let notifTitle = '';
      let notifMsg = '';
      let notifType: NotificationItem['type'] = 'STATUS_UPDATE';

      if (status === 'ACCEPTED') {
        notifTitle = `Order Accepted (${order.tokenString})`;
        notifMsg = `The kitchen has accepted your order ${order.tokenString}.`;
      } else if (status === 'PREPARING') {
        notifTitle = `Order Being Prepared (${order.tokenString})`;
        notifMsg = `Chefs are now preparing your order ${order.tokenString}. Estimated time: ${order.estimatedWaitMin} min.`;
      } else if (status === 'READY') {
        notifTitle = `YOUR ORDER IS READY! 🎉`;
        notifMsg = `Please collect token ${order.tokenString} from the QBite pickup counter.`;
        notifType = 'READY_ALERT';
      } else if (status === 'COMPLETED') {
        notifTitle = `Order Completed`;
        notifMsg = `Thank you! Hope you enjoyed your food at SVCE Cafe.`;
      }

      if (notifTitle) {
        const notifId = `notif_${Date.now()}`;
        const notifObj: NotificationItem = {
          id: notifId,
          userId: order.userId,
          orderId: order.id,
          tokenString: order.tokenString,
          title: notifTitle,
          message: notifMsg,
          type: notifType,
          read: false,
          createdAt: nowIso
        };
        try {
          await setDoc(doc(db, 'notifications', notifId), notifObj);
        } catch {
          // Local fallback
          if (currentUser?.uid === order.userId) {
            setNotifications((prev) => [notifObj, ...prev]);
          }
        }
      }
    }
  };

  // Staff calls next token
  const callNextToken = async (): Promise<number> => {
    const todayKey = getTodayDateKey();
    const queueDocRef = doc(db, 'queue', todayKey);
    const nextServing = queueState.currentServingToken + 1;

    try {
      await updateDoc(queueDocRef, {
        currentServingToken: nextServing,
        updatedAt: new Date().toISOString()
      });
      setQueueState((prev) => ({ ...prev, currentServingToken: nextServing }));
    } catch {
      setQueueState((prev) => ({ ...prev, currentServingToken: nextServing }));
    }

    return nextServing;
  };

  const setCurrentServingToken = async (token: number) => {
    const todayKey = getTodayDateKey();
    const queueDocRef = doc(db, 'queue', todayKey);
    try {
      await updateDoc(queueDocRef, {
        currentServingToken: token,
        updatedAt: new Date().toISOString()
      });
      setQueueState((prev) => ({ ...prev, currentServingToken: token }));
    } catch {
      setQueueState((prev) => ({ ...prev, currentServingToken: token }));
    }
  };

  // Favorites
  const toggleFavorite = async (foodId: string) => {
    if (!currentUser) return;
    const isFav = favorites.includes(foodId);
    const favDocId = `${currentUser.uid}_${foodId}`;
    const favRef = doc(db, 'favorites', favDocId);

    if (isFav) {
      setFavorites((prev) => prev.filter((id) => id !== foodId));
      try {
        await deleteDoc(favRef);
      } catch {}
    } else {
      setFavorites((prev) => [...prev, foodId]);
      try {
        await setDoc(favRef, {
          id: favDocId,
          userId: currentUser.uid,
          foodId,
          createdAt: new Date().toISOString()
        });
      } catch {}
    }
  };

  const markNotificationAsRead = async (notifId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
    );
    try {
      await updateDoc(doc(db, 'notifications', notifId), { read: true });
    } catch {}
  };

  const clearAllNotifications = async () => {
    setNotifications([]);
  };

  const toggleCanteenStatus = async () => {
    const nextState = !settings.isOpen;
    const nextSettings = { ...settings, isOpen: nextState };
    setSettings(nextSettings);
    try {
      await setDoc(doc(db, 'settings', 'main'), nextSettings, { merge: true });
    } catch {}
  };

  const updateFoodAvailability = async (foodId: string, isAvailable: boolean) => {
    setFoods((prev) =>
      prev.map((f) => (f.id === foodId ? { ...f, isAvailable } : f))
    );
    try {
      await updateDoc(doc(db, 'foods', foodId), { isAvailable });
    } catch {}
  };

  const saveFoodItem = async (food: FoodItem) => {
    setFoods((prev) => {
      const idx = prev.findIndex((f) => f.id === food.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = food;
        return copy;
      }
      return [...prev, food];
    });
    try {
      await setDoc(doc(db, 'foods', food.id), food, { merge: true });
    } catch {}
  };

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

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
        coupons,
        settings,
        cart,
        cartCount,
        cartSubtotal,
        appliedCoupon,
        discountAmount,
        cartTotal,
        loading,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        placeOrder,
        cancelOrder,
        updateOrderStatus,
        callNextToken,
        setCurrentServingToken,
        toggleFavorite,
        markNotificationAsRead,
        clearAllNotifications,
        toggleCanteenStatus,
        updateFoodAvailability,
        saveFoodItem
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
