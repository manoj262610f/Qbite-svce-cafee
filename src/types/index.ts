export type UserRole = 'student' | 'staff' | 'admin';
export type AccountStatus = 'ACTIVE' | 'SUSPENDED';

export interface UserProfile {
  id: string; // Firebase UID
  name: string;
  email: string;
  role: UserRole;
  accountStatus: AccountStatus;
  createdAt: string;
  photoURL?: string | null;
  lastLoginAt?: string;
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
  createdAt?: string;
  updatedAt?: string;
}

export type OrderStatus =
  | 'PLACED'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'READY'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED';

export type PaymentMethod = 'COUNTER' | 'UPI' | 'ONLINE';
export type PaymentStatus = 'PENDING' | 'PAID';

export interface OrderItem {
  foodId: string;
  menuItemId?: string;
  name: string;
  price: number; // Snapshot of unit price at order time
  quantity: number;
  imageUrl?: string;
  isVeg?: boolean;
}

export type OrderType = 'instant' | 'scheduled';

export interface TimeSlot {
  id: string;
  time: string;
  endTime: string;
  displayLabel: string;
  isoPickupTime: string;
  bookedCount: number;
  maxCapacity: number;
  isAvailable: boolean;
  reason?: string;
}

export interface ScheduleSelection {
  date: string;           // YYYY-MM-DD in Asia/Kolkata
  displayDate: string;    // e.g. "Today, Oct 10" or "Fri, Oct 10"
  timeSlot: string;       // e.g. "12:30 PM – 12:45 PM"
  isoPickupTime: string;  // ISO timestamp for pickup
  estimatedPrepMin?: number;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. QB-2026-0047
  tokenNumber: number; // e.g. 47
  tokenString: string; // e.g. #047
  dateKey: string;     // e.g. 2026-09-28 (Asia/Kolkata)
  userId: string;      // Firebase UID
  studentUid?: string; // Firebase UID alias
  userName: string;
  userEmail: string;
  items: OrderItem[];
  status: OrderStatus;
  orderStatus?: string; // 'pending' | 'placed' | etc.
  orderType?: OrderType; // 'instant' | 'scheduled'
  scheduledPickupAt?: string | null; // ISO 8601 string
  scheduledDate?: string | null;     // YYYY-MM-DD
  scheduledTimeSlot?: string | null; // e.g. "12:30 PM – 12:45 PM"
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  pickupLocation?: string;
  subtotal: number;
  discount: number;
  total: number;
  totalAmount?: number; // Total alias
  createdAt: string;
  acceptedAt?: string | null;
  preparingAt?: string | null;
  readyAt?: string | null;
  completedAt?: string | null;
  lastStatusChangedAt?: string | null;
  lastStatusChangedBy?: string | null;
  estimatedWaitMin: number;
  notes?: string;
  rejectionReason?: string;
}

export interface QueueState {
  id: string;
  dateKey: string;
  lastToken: number;
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

export type CanteenStatus = 'OPEN' | 'BUSY' | 'PAUSED' | 'CLOSED';

export interface CanteenSettings {
  status: CanteenStatus;
  announcement: string;
  operatingHours: string;
  schedulingEnabled?: boolean;
  operatingDays?: number[]; // 0=Sun, 1=Mon, ..., 6=Sat (Default: [1,2,3,4,5,6])
  slotStartTime?: string; // e.g. "08:00"
  slotEndTime?: string; // e.g. "17:00"
  slotIntervalMinutes?: number; // e.g. 15
  maxOrdersPerSlot?: number; // e.g. 10
  minNoticeMinutes?: number; // e.g. 30
  maxAdvanceDays?: number; // e.g. 3
  cancelCutoffMinutes?: number; // e.g. 30
  kitchenLeadTimeMinutes?: number; // e.g. 25
  updatedAt?: string;
  updatedBy?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  actorUid: string;
  actorRole: string;
  targetType: string;
  targetId: string;
  createdAt: string;
  metadata?: Record<string, any>;
}
