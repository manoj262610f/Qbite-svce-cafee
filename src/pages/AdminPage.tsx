import React, { useState, useEffect } from 'react';
import {
  Shield,
  Clock,
  Plus,
  Edit2,
  Check,
  X,
  AlertCircle,
  Users,
  UtensilsCrossed,
  Volume2,
  DollarSign,
  TrendingUp,
  UserCheck,
  UserX,
  Power
} from 'lucide-react';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  setDoc,
  query,
  limit
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useCanteen } from '../context/CanteenContext';
import { FoodItem, UserProfile, UserRole, AccountStatus, CanteenStatus } from '../types';
import { getTodayDateKey } from '../services/queueService';

interface AdminPageProps {
  onBackToHome: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onBackToHome }) => {
  const {
    foods,
    orders,
    settings,
    updateFoodAvailability,
    saveFoodItem,
    updateCanteenStatus,
    seedMenuCatalog
  } = useCanteen();

  const [activeTab, setActiveTab] = useState<'analytics' | 'menu' | 'canteen' | 'staff'>('analytics');
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null);
  const [isAddingFood, setIsAddingFood] = useState(false);
  const [newFood, setNewFood] = useState<Partial<FoodItem>>({
    name: '',
    category: 'Breakfast',
    price: 40,
    prepTimeMinutes: 8,
    isAvailable: true,
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=400&q=80',
    isVeg: true
  });

  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Settings form state
  const [canteenStatus, setCanteenStatus] = useState<CanteenStatus>(settings.status);
  const [announcementText, setAnnouncementText] = useState(settings.announcement);
  const [hoursText, setHoursText] = useState(settings.operatingHours);

  useEffect(() => {
    setCanteenStatus(settings.status);
    setAnnouncementText(settings.announcement);
    setHoursText(settings.operatingHours);
  }, [settings]);

  // Real-time Users Listener for Staff Access Management
  useEffect(() => {
    const usersCol = collection(db, 'users');
    const unsub = onSnapshot(query(usersCol, limit(50)), (snap) => {
      const uList = snap.docs.map((d) => ({ id: d.id, ...d.data() } as UserProfile));
      setUsersList(uList);
    }, (err) => {
      console.warn('Users onSnapshot notice:', err);
    });
    return () => unsub();
  }, []);

  // REAL ANALYTICS CALCULATIONS (Section 28 & 47)
  const todayKey = getTodayDateKey();
  const todayOrders = orders.filter((o) => o.dateKey === todayKey);

  const totalOrdersCount = todayOrders.length;
  const activeOrdersCount = todayOrders.filter((o) =>
    ['PLACED', 'ACCEPTED', 'PREPARING', 'READY'].includes(o.status)
  ).length;
  const preparingCount = todayOrders.filter((o) => o.status === 'PREPARING').length;
  const readyCount = todayOrders.filter((o) => o.status === 'READY').length;
  const completedCount = todayOrders.filter((o) => o.status === 'COMPLETED').length;
  const cancelledCount = todayOrders.filter((o) => o.status === 'CANCELLED').length;
  const rejectedCount = todayOrders.filter((o) => o.status === 'REJECTED').length;

  const totalOrderValue = todayOrders
    .filter((o) => o.status !== 'CANCELLED' && o.status !== 'REJECTED')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const collectedPaidValue = todayOrders
    .filter((o) => o.paymentStatus === 'PAID')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  // Average Order-to-Ready Time: average(readyAt - createdAt)
  const ordersWithReadyTime = todayOrders.filter(
    (o) => o.readyAt && o.createdAt && new Date(o.readyAt).getTime() > new Date(o.createdAt).getTime()
  );
  const avgOrderToReadyMin =
    ordersWithReadyTime.length > 0
      ? Math.round(
          ordersWithReadyTime.reduce(
            (sum, o) => sum + (new Date(o.readyAt!).getTime() - new Date(o.createdAt).getTime()) / 60000,
            0
          ) / ordersWithReadyTime.length
        )
      : null;

  // Average Preparation Time: average(readyAt - preparingAt)
  const ordersWithPrepTime = todayOrders.filter(
    (o) => o.readyAt && o.preparingAt && new Date(o.readyAt).getTime() > new Date(o.preparingAt).getTime()
  );
  const avgPrepMin =
    ordersWithPrepTime.length > 0
      ? Math.round(
          ordersWithPrepTime.reduce(
            (sum, o) => sum + (new Date(o.readyAt!).getTime() - new Date(o.preparingAt!).getTime()) / 60000,
            0
          ) / ordersWithPrepTime.length
        )
      : null;

  // Handlers
  const handleSaveSettings = async () => {
    try {
      await updateCanteenStatus(canteenStatus, announcementText, hoursText);
      setActionNotice('Canteen status updated successfully!');
      setTimeout(() => setActionNotice(null), 3000);
    } catch (e: any) {
      setActionNotice('Error: ' + e.message);
    }
  };

  const handleToggleUserRole = async (user: UserProfile) => {
    const nextRole: UserRole = user.role === 'staff' ? 'student' : 'staff';
    try {
      await updateDoc(doc(db, 'users', user.id), { role: nextRole });
      setActionNotice(`Updated ${user.name}'s role to ${nextRole}`);
      setTimeout(() => setActionNotice(null), 3000);
    } catch (e: any) {
      setActionNotice('Failed: ' + e.message);
    }
  };

  const handleToggleUserStatus = async (user: UserProfile) => {
    const nextStatus: AccountStatus = user.accountStatus === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    try {
      await updateDoc(doc(db, 'users', user.id), { accountStatus: nextStatus });
      setActionNotice(`User account set to ${nextStatus}`);
      setTimeout(() => setActionNotice(null), 3000);
    } catch (e: any) {
      setActionNotice('Failed: ' + e.message);
    }
  };

  const handleCreateFood = async () => {
    if (!newFood.name || !newFood.price) return;
    const foodId = `food_${Date.now()}`;
    const item: FoodItem = {
      id: foodId,
      name: newFood.name,
      category: newFood.category || 'Snacks',
      price: Number(newFood.price),
      prepTimeMinutes: Number(newFood.prepTimeMinutes) || 8,
      isAvailable: newFood.isAvailable !== false,
      description: newFood.description || '',
      imageUrl: newFood.imageUrl || 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=400&q=80',
      isVeg: newFood.isVeg !== false
    };
    await saveFoodItem(item);
    setIsAddingFood(false);
    setNewFood({
      name: '',
      category: 'Breakfast',
      price: 40,
      prepTimeMinutes: 8,
      isAvailable: true,
      description: '',
      imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=400&q=80',
      isVeg: true
    });
  };

  return (
    <div className="pb-24 pt-3 px-4 max-w-3xl mx-auto space-y-4">
      {/* Top Admin Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-purple-900 text-purple-200 flex items-center justify-center shadow-xs">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-stone-900 tracking-tight">
              Canteen Admin Hub
            </h2>
            <p className="text-xs text-stone-500 font-medium">SVCE Cafe Operations & Policy Control</p>
          </div>
        </div>

        <button
          onClick={onBackToHome}
          className="text-xs font-bold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-xl cursor-pointer"
        >
          Exit Admin
        </button>
      </div>

      {actionNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1.5 bg-stone-100 p-1 rounded-2xl overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'analytics' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
          }`}
        >
          Analytics & Metrics
        </button>
        <button
          onClick={() => setActiveTab('canteen')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'canteen' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
          }`}
        >
          Canteen Status
        </button>
        <button
          onClick={() => setActiveTab('menu')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'menu' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
          }`}
        >
          Menu & Pricing ({foods.length})
        </button>
        <button
          onClick={() => setActiveTab('staff')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'staff' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
          }`}
        >
          Staff & Access
        </button>
      </div>

      {/* TAB 1: REAL ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-3xl p-4 border border-stone-200/80 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                TODAY'S ORDERS
              </span>
              <div className="text-3xl font-black font-mono-token text-stone-900">
                {totalOrdersCount}
              </div>
              <span className="text-[11px] text-stone-400 font-medium mt-1 block">
                {todayKey}
              </span>
            </div>

            <div className="bg-white rounded-3xl p-4 border border-stone-200/80 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                ACTIVE IN QUEUE
              </span>
              <div className="text-3xl font-black font-mono-token text-orange-600">
                {activeOrdersCount}
              </div>
              <span className="text-[11px] text-orange-600 font-medium mt-1 block">
                {preparingCount} cooking · {readyCount} ready
              </span>
            </div>

            <div className="bg-white rounded-3xl p-4 border border-stone-200/80 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                COMPLETED
              </span>
              <div className="text-3xl font-black font-mono-token text-emerald-600">
                {completedCount}
              </div>
              <span className="text-[11px] text-stone-400 font-medium mt-1 block">
                {cancelledCount} cancelled · {rejectedCount} rejected
              </span>
            </div>

            <div className="bg-white rounded-3xl p-4 border border-stone-200/80 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                COLLECTED CASH/UPI
              </span>
              <div className="text-3xl font-black font-mono-token text-stone-900">
                ₹{collectedPaidValue}
              </div>
              <span className="text-[11px] text-stone-500 font-medium mt-1 block">
                Order Value: ₹{totalOrderValue}
              </span>
            </div>
          </div>

          {/* Operational Timings Metrics */}
          <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-3">
            <h3 className="font-extrabold text-sm text-stone-900">
              Kitchen Preparation Performance
            </h3>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">
                  AVG ORDER-TO-READY
                </span>
                <span className="text-3xl font-black font-mono-token text-stone-900 block my-1">
                  {avgOrderToReadyMin !== null ? `${avgOrderToReadyMin} min` : '—'}
                </span>
                <span className="text-[10px] text-stone-400">
                  {ordersWithReadyTime.length > 0 ? `From ${ordersWithReadyTime.length} fulfilled orders` : 'No completed orders today yet'}
                </span>
              </div>

              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">
                  AVG COOKING DURATION
                </span>
                <span className="text-3xl font-black font-mono-token text-stone-900 block my-1">
                  {avgPrepMin !== null ? `${avgPrepMin} min` : '—'}
                </span>
                <span className="text-[10px] text-stone-400">
                  {ordersWithPrepTime.length > 0 ? `From ${ordersWithPrepTime.length} prepared orders` : 'Calculated when timestamps exist'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CANTEEN STATUS & SETTINGS */}
      {activeTab === 'canteen' && (
        <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-4">
          <h3 className="font-extrabold text-base text-stone-900">
            Canteen Operational State
          </h3>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-400 block">
              Operational Status
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['OPEN', 'BUSY', 'PAUSED', 'CLOSED'] as CanteenStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => setCanteenStatus(status)}
                  className={`p-3 rounded-2xl font-bold text-xs border cursor-pointer transition-all ${
                    canteenStatus === status
                      ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                      : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-400 block">
              Public Campus Announcement
            </label>
            <input
              type="text"
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              placeholder="e.g. Counter 2 is serving South Indian meals today..."
              className="w-full p-3 rounded-xl border border-stone-200 text-xs font-medium focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-400 block">
              Operating Hours
            </label>
            <input
              type="text"
              value={hoursText}
              onChange={(e) => setHoursText(e.target.value)}
              placeholder="7:30 AM – 5:30 PM"
              className="w-full p-3 rounded-xl border border-stone-200 text-xs font-medium focus:outline-none focus:border-orange-500"
            />
          </div>

          <button
            onClick={handleSaveSettings}
            className="w-full py-3 bg-purple-900 hover:bg-purple-950 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer transition-all"
          >
            Save Canteen Settings
          </button>
        </div>
      )}

      {/* TAB 3: MENU & PRICING */}
      {activeTab === 'menu' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-stone-900">
              Menu Catalog ({foods.length})
            </h3>
            <div className="flex gap-2">
              {foods.length === 0 && (
                <button
                  onClick={seedMenuCatalog}
                  className="py-2 px-3 bg-amber-600 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Seed Default Menu
                </button>
              )}
              <button
                onClick={() => setIsAddingFood(true)}
                className="py-2 px-3 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item</span>
              </button>
            </div>
          </div>

          {/* Add Food Modal / Form */}
          {isAddingFood && (
            <div className="bg-stone-50 rounded-3xl p-5 border border-stone-200 space-y-3">
              <h4 className="font-bold text-sm text-stone-900">Create New Menu Item</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <input
                  type="text"
                  placeholder="Food Name"
                  value={newFood.name}
                  onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
                  className="p-2.5 rounded-xl border border-stone-200 bg-white"
                />
                <input
                  type="number"
                  placeholder="Price (₹)"
                  value={newFood.price}
                  onChange={(e) => setNewFood({ ...newFood, price: Number(e.target.value) })}
                  className="p-2.5 rounded-xl border border-stone-200 bg-white"
                />
                <input
                  type="text"
                  placeholder="Category (Breakfast, Snacks...)"
                  value={newFood.category}
                  onChange={(e) => setNewFood({ ...newFood, category: e.target.value })}
                  className="p-2.5 rounded-xl border border-stone-200 bg-white"
                />
                <input
                  type="number"
                  placeholder="Prep time (min)"
                  value={newFood.prepTimeMinutes}
                  onChange={(e) => setNewFood({ ...newFood, prepTimeMinutes: Number(e.target.value) })}
                  className="p-2.5 rounded-xl border border-stone-200 bg-white"
                />
              </div>
              <input
                type="text"
                placeholder="Description"
                value={newFood.description}
                onChange={(e) => setNewFood({ ...newFood, description: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-stone-200 bg-white text-xs"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreateFood}
                  className="flex-1 py-2 bg-orange-600 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Save Food Item
                </button>
                <button
                  onClick={() => setIsAddingFood(false)}
                  className="py-2 px-4 border border-stone-300 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Food List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {foods.map((food) => (
              <div
                key={food.id}
                className="bg-white rounded-3xl p-4 border border-stone-200/80 shadow-xs flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={food.imageUrl}
                    alt={food.name}
                    className="w-12 h-12 rounded-2xl object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-sm text-stone-900 truncate">
                      {food.name}
                    </h4>
                    <p className="text-xs text-stone-500 font-mono-token">
                      ₹{food.price} · {food.prepTimeMinutes} min
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => updateFoodAvailability(food.id, !food.isAvailable)}
                    className={`py-1.5 px-3 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                      food.isAvailable
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                        : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    {food.isAvailable ? 'In Stock' : 'Sold Out'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: STAFF & USER ACCESS */}
      {activeTab === 'staff' && (
        <div className="space-y-4">
          <div className="bg-purple-50 border border-purple-200 rounded-3xl p-4 text-xs text-purple-900 space-y-1">
            <strong className="block font-bold">First-Admin & Staff Access Control</strong>
            <p className="leading-relaxed">
              New accounts start as students. As Admin, you can promote verified staff members below to grant access to the Kitchen Portal.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-3">
            <h3 className="font-extrabold text-sm text-stone-900">
              Registered Canteen Users ({usersList.length})
            </h3>

            <div className="divide-y divide-stone-100">
              {usersList.map((user) => (
                <div key={user.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-stone-900">{user.name}</p>
                    <p className="text-[11px] text-stone-400 font-mono-token">{user.email}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : user.role === 'staff'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-stone-100 text-stone-600'
                      }`}>
                        {user.role}
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        user.accountStatus === 'SUSPENDED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {user.accountStatus || 'ACTIVE'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => handleToggleUserRole(user)}
                        className="py-1.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl cursor-pointer"
                      >
                        {user.role === 'staff' ? 'Demote to Student' : 'Promote to Staff'}
                      </button>
                    )}

                    {user.role !== 'admin' && (
                      <button
                        onClick={() => handleToggleUserStatus(user)}
                        className={`py-1.5 px-2.5 rounded-xl font-bold cursor-pointer ${
                          user.accountStatus === 'SUSPENDED'
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                        }`}
                      >
                        {user.accountStatus === 'SUSPENDED' ? 'Activate' : 'Suspend'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
