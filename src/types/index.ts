export type UserRole = 'student' | 'staff' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface FoodItem {
  id: string;
  name: string;
  category: string;
  price: number;
  prepTimeMinutes: number;
  isAvailable: boolean;
  description: string;
  imageUrl: string;
  isVeg: boolean;
  rating?: number;
  isPopular?: boolean;
}

export type OrderStatus = 'PLACED' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';

export interface OrderItem {
  foodId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  isVeg?: boolean;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. QB-2026-0047
  tokenNumber: number; // e.g. 47
  tokenString: string; // e.g. #047
  dateKey: string;     // e.g. 2026-09-27
  userId: string;
  userName: string;
  userEmail: string;
  items: OrderItem[];
  status: OrderStatus;
  paymentMethod: 'COUNTER' | 'UPI' | 'ONLINE';
  paymentStatus: 'PENDING' | 'PAID';
  subtotal: number;
  discount: number;
  total: number;
  couponCode?: string;
  createdAt: string;
  acceptedAt?: string;
  preparingAt?: string;
  readyAt?: string;
  completedAt?: string;
  estimatedWaitMin: number;
  notes?: string;
}

export interface QueueState {
  id: string;
  dateKey: string;
  lastToken: number;
  currentServingToken: number;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  orderId?: string;
  tokenString?: string;
  title: string;
  message: string;
  type: 'STATUS_UPDATE' | 'READY_ALERT' | 'QUEUE_ALERT' | 'INFO';
  read: boolean;
  createdAt: string;
}

export interface FavoriteItem {
  id: string;
  userId: string;
  foodId: string;
  createdAt: string;
}

export interface CouponItem {
  id: string;
  code: string;
  discountPercentage?: number;
  discountAmount?: number;
  minOrderValue: number;
  isActive: boolean;
  description: string;
}

export interface CanteenSettings {
  isOpen: boolean;
  announcement: string;
  prepDelayOffset: number; // in minutes
  closingNotice: string;
  operatingHours: string;
}
