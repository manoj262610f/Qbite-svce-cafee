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
    }, () => {
      // Ignored non-fatal notice
    });
    return () => unsub();
  }, []);

  // Real analytics calculated strictly from Firestore
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

  // Average Order-to-Ready Time
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

  // Average Cooking Duration
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

  const handleSaveSettings = async () => {
    try {
      await updateCanteenStatus(canteenStatus, announcementText, hoursText);
      setActionNotice('Canteen operational status updated successfully.');
      setTimeout(() => setActionNotice(null), 3000);
    } catch (e: any) {
      setActionNotice(e?.message || 'Failed to update settings.');
    }
  };

  const handleToggleUserRole = async (user: UserProfile) => {
    const newRole: UserRole = user.role === 'staff' ? 'student' : 'staff';
    try {
      await updateDoc(doc(db, 'users', user.id), { role: newRole });
      setActionNotice(`User ${user.name || user.email} updated to ${newRole}.`);
      setTimeout(() => setActionNotice(null), 3000);
    } catch (e: any) {
      setActionNotice(e?.message || 'Failed to update role.');
    }
  };

  const handleToggleUserStatus = async (user: UserProfile) => {
    const newStatus: AccountStatus = user.accountStatus === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    try {
      await updateDoc(doc(db, 'users', user.id), { accountStatus: newStatus });
      setActionNotice(`User status updated to ${newStatus}.`);
      setTimeout(() => setActionNotice(null), 3000);
    } catch (e: any) {
      setActionNotice(e?.message || 'Failed to update status.');
    }
  };

  const handleCreateFood = async () => {
    if (!newFood.name || !newFood.price) {
      setActionNotice('Please provide item name and price.');
      return;
    }
    const item: FoodItem = {
      id: `food_${Date.now()}`,
      name: newFood.name,
      category: newFood.category || 'Breakfast',
      price: Number(newFood.price),
      prepTimeMinutes: Number(newFood.prepTimeMinutes) || 8,
      isAvailable: newFood.isAvailable ?? true,
      description: newFood.description || '',
      imageUrl: newFood.imageUrl || 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=400&q=80',
      isVeg: newFood.isVeg ?? true
    };
    try {
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
      setActionNotice(`Added "${item.name}" to menu.`);
      setTimeout(() => setActionNotice(null), 3000);
    } catch (e: any) {
      setActionNotice(e?.message || 'Failed to add item.');
    }
  };

  return (
    <div className="pb-28 pt-3 px-4 max-w-3xl mx-auto space-y-4">
      {/* Top Admin Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#FF6A00] text-black flex items-center justify-center shadow-lg glow-orange-sm">
            <Shield className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">
              Canteen Admin Hub
            </h2>
            <p className="text-xs text-[#A1A1A1] font-medium">Operations & Access Control Center</p>
          </div>
        </div>

        <button
          onClick={onBackToHome}
          className="text-xs font-bold text-stone-300 hover:text-white bg-[#141414] hover:bg-[#1E1E1E] border border-white/10 px-3 py-1.5 rounded-xl cursor-pointer transition-colors"
        >
          Exit Admin
        </button>
      </div>

      {actionNotice && (
        <div className="p-3 bg-[#0F291E] border border-emerald-500/30 rounded-2xl text-xs text-emerald-300 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1.5 bg-[#141414] p-1.5 rounded-2xl border border-white/8 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 py-2 px-3 text-xs font-black rounded-xl whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'analytics' ? 'bg-[#FF6A00] text-black shadow-md glow-orange-sm' : 'text-stone-400 hover:text-white'
          }`}
        >
          Analytics & Metrics
        </button>
        <button
          onClick={() => setActiveTab('canteen')}
          className={`flex-1 py-2 px-3 text-xs font-black rounded-xl whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'canteen' ? 'bg-[#FF6A00] text-black shadow-md glow-orange-sm' : 'text-stone-400 hover:text-white'
          }`}
        >
          Canteen Status
        </button>
        <button
          onClick={() => setActiveTab('menu')}
          className={`flex-1 py-2 px-3 text-xs font-black rounded-xl whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'menu' ? 'bg-[#FF6A00] text-black shadow-md glow-orange-sm' : 'text-stone-400 hover:text-white'
          }`}
        >
          Menu & Pricing ({foods.length})
        </button>
        <button
          onClick={() => setActiveTab('staff')}
          className={`flex-1 py-2 px-3 text-xs font-black rounded-xl whitespace-nowrap cursor-pointer transition-all ${
            activeTab === 'staff' ? 'bg-[#FF6A00] text-black shadow-md glow-orange-sm' : 'text-stone-400 hover:text-white'
          }`}
        >
          Staff & Access
        </button>
      </div>

      {/* TAB 1: REAL ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#141414] rounded-3xl p-4 border border-white/8 shadow-xl">
              <span className="text-[10px] uppercase font-black text-[#A1A1A1] block mb-1">
                TODAY'S ORDERS
              </span>
              <div className="text-3xl font-black font-mono-token text-white">
                {totalOrdersCount}
              </div>
              <span className="text-[11px] text-stone-500 font-medium mt-1 block">
                {todayKey}
              </span>
            </div>

            <div className="bg-[#141414] rounded-3xl p-4 border border-white/8 shadow-xl">
              <span className="text-[10px] uppercase font-black text-[#A1A1A1] block mb-1">
                ACTIVE IN QUEUE
              </span>
              <div className="text-3xl font-black font-mono-token text-[#FF6A00]">
                {activeOrdersCount}
              </div>
              <span className="text-[11px] text-[#FF7A00] font-medium mt-1 block">
                {preparingCount} cooking · {readyCount} ready
              </span>
            </div>

            <div className="bg-[#141414] rounded-3xl p-4 border border-white/8 shadow-xl">
              <span className="text-[10px] uppercase font-black text-[#A1A1A1] block mb-1">
                COMPLETED
              </span>
              <div className="text-3xl font-black font-mono-token text-emerald-400">
                {completedCount}
              </div>
              <span className="text-[11px] text-stone-500 font-medium mt-1 block">
                {cancelledCount} cancelled · {rejectedCount} rejected
              </span>
            </div>

            <div className="bg-[#141414] rounded-3xl p-4 border border-white/8 shadow-xl">
              <span className="text-[10px] uppercase font-black text-[#A1A1A1] block mb-1">
                COLLECTED VALUE
              </span>
              <div className="text-3xl font-black font-mono-token text-white">
                ₹{collectedPaidValue}
              </div>
              <span className="text-[11px] text-stone-400 font-medium mt-1 block">
                Order Value: ₹{totalOrderValue}
              </span>
            </div>
          </div>

          {/* Operational Timings Metrics */}
          <div className="bg-[#141414] rounded-3xl p-5 border border-white/8 shadow-xl space-y-3">
            <h3 className="font-black text-sm text-white">
              Kitchen Preparation Performance
            </h3>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-[#1C1C1C] rounded-2xl p-4 border border-white/5">
                <span className="text-[10px] uppercase font-bold text-[#A1A1A1] block">
                  AVG ORDER-TO-READY
                </span>
                <span className="text-3xl font-black font-mono-token text-white block my-1">
                  {avgOrderToReadyMin !== null ? `${avgOrderToReadyMin} min` : '—'}
                </span>
                <span className="text-[10px] text-stone-500">
                  {ordersWithReadyTime.length > 0 ? `From ${ordersWithReadyTime.length} fulfilled orders` : 'No completed orders today yet'}
                </span>
              </div>

              <div className="bg-[#1C1C1C] rounded-2xl p-4 border border-white/5">
                <span className="text-[10px] uppercase font-bold text-[#A1A1A1] block">
                  AVG COOKING DURATION
                </span>
                <span className="text-3xl font-black font-mono-token text-[#FF9D2E] block my-1">
                  {avgPrepMin !== null ? `${avgPrepMin} min` : '—'}
                </span>
                <span className="text-[10px] text-stone-500">
                  {ordersWithPrepTime.length > 0 ? `From ${ordersWithPrepTime.length} prepared orders` : 'Calculated from cooking timestamps'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CANTEEN STATUS & SETTINGS */}
      {activeTab === 'canteen' && (
        <div className="bg-[#141414] rounded-3xl p-5 border border-white/8 shadow-xl space-y-4">
          <h3 className="font-black text-base text-white">
            Canteen Operational State
          </h3>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-[#A1A1A1] block">
              Operational Status
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['OPEN', 'BUSY', 'PAUSED', 'CLOSED'] as CanteenStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => setCanteenStatus(status)}
                  className={`p-3 rounded-2xl font-black text-xs border cursor-pointer transition-all ${
                    canteenStatus === status
                      ? 'bg-[#FF6A00] text-black border-[#FF6A00] shadow-md glow-orange-sm'
                      : 'bg-[#1C1C1C] text-stone-300 border-white/5 hover:bg-[#252525]'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-[#A1A1A1] block">
              Public Campus Announcement
            </label>
            <input
              type="text"
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              placeholder="e.g. Counter 2 is serving hot South Indian meals today..."
              className="w-full p-3 rounded-xl bg-[#1C1C1C] border border-white/8 text-xs font-medium text-white focus:outline-none focus:border-[#FF6A00]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-[#A1A1A1] block">
              Operating Hours
            </label>
            <input
              type="text"
              value={hoursText}
              onChange={(e) => setHoursText(e.target.value)}
              placeholder="7:30 AM – 5:30 PM"
              className="w-full p-3 rounded-xl bg-[#1C1C1C] border border-white/8 text-xs font-medium text-white focus:outline-none focus:border-[#FF6A00]"
            />
          </div>

          <button
            onClick={handleSaveSettings}
            className="w-full py-3 bg-[#FF6A00] hover:bg-[#FF7A00] text-black font-black text-xs rounded-xl shadow-md glow-orange-sm cursor-pointer transition-all"
          >
            Save Canteen Settings
          </button>
        </div>
      )}

      {/* TAB 3: MENU & PRICING */}
      {activeTab === 'menu' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base text-white">
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
                className="py-2 px-3 bg-[#FF6A00] hover:bg-[#FF7A00] text-black text-xs font-black rounded-xl flex items-center gap-1 cursor-pointer shadow-md glow-orange-sm transition-all"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Add Item</span>
              </button>
            </div>
          </div>

          {/* Add Food Form */}
          {isAddingFood && (
            <div className="bg-[#141414] rounded-3xl p-5 border border-white/10 space-y-3">
              <h4 className="font-black text-sm text-white">Create New Menu Item</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <input
                  type="text"
                  placeholder="Food Name"
                  value={newFood.name}
                  onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
                  className="p-2.5 rounded-xl border border-white/8 bg-[#1C1C1C] text-white"
                />
                <input
                  type="number"
                  placeholder="Price (₹)"
                  value={newFood.price}
                  onChange={(e) => setNewFood({ ...newFood, price: Number(e.target.value) })}
                  className="p-2.5 rounded-xl border border-white/8 bg-[#1C1C1C] text-white"
                />
                <input
                  type="text"
                  placeholder="Category (Breakfast, Snacks...)"
                  value={newFood.category}
                  onChange={(e) => setNewFood({ ...newFood, category: e.target.value })}
                  className="p-2.5 rounded-xl border border-white/8 bg-[#1C1C1C] text-white"
                />
                <input
                  type="number"
                  placeholder="Prep time (min)"
                  value={newFood.prepTimeMinutes}
                  onChange={(e) => setNewFood({ ...newFood, prepTimeMinutes: Number(e.target.value) })}
                  className="p-2.5 rounded-xl border border-white/8 bg-[#1C1C1C] text-white"
                />
              </div>
              <input
                type="text"
                placeholder="Description"
                value={newFood.description}
                onChange={(e) => setNewFood({ ...newFood, description: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-white/8 bg-[#1C1C1C] text-white text-xs"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreateFood}
                  className="flex-1 py-2.5 bg-[#FF6A00] text-black font-black text-xs rounded-xl cursor-pointer glow-orange-sm shadow-md"
                >
                  Save Food Item
                </button>
                <button
                  onClick={() => setIsAddingFood(false)}
                  className="py-2.5 px-4 border border-white/10 text-xs font-bold text-stone-300 rounded-xl cursor-pointer"
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
                className="bg-[#141414] rounded-3xl p-4 border border-white/8 shadow-md flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={food.imageUrl}
                    alt={food.name}
                    className="w-12 h-12 rounded-2xl object-cover shrink-0 bg-[#202020]"
                  />
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-white truncate">
                      {food.name}
                    </h4>
                    <p className="text-xs text-[#A1A1A1] font-mono-token">
                      ₹{food.price} · {food.prepTimeMinutes} min
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => updateFoodAvailability(food.id, !food.isAvailable)}
                    className={`py-1.5 px-3 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                      food.isAvailable
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                        : 'bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25'
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
          <div className="bg-[#141414] border border-purple-500/30 rounded-3xl p-4 text-xs text-purple-200 space-y-1">
            <strong className="block font-black text-white">Designated Staff & Role Control</strong>
            <p className="leading-relaxed text-[#A1A1A1]">
              New accounts start as students. As Admin, you can grant verified staff members access to the Kitchen Fulfillment Terminal below.
            </p>
          </div>

          <div className="bg-[#141414] rounded-3xl p-5 border border-white/8 shadow-xl space-y-3">
            <h3 className="font-black text-sm text-white">
              Registered Canteen Users ({usersList.length})
            </h3>

            <div className="divide-y divide-white/5">
              {usersList.map((user) => (
                <div key={user.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-white">{user.name}</p>
                    <p className="text-[11px] text-[#A1A1A1] font-mono-token">{user.email}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        user.role === 'admin'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : user.role === 'staff'
                          ? 'bg-[#FF6A00]/20 text-[#FF7A00] border border-[#FF6A00]/30'
                          : 'bg-white/5 text-stone-400'
                      }`}>
                        {user.role}
                      </span>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        user.accountStatus === 'SUSPENDED'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {user.accountStatus || 'ACTIVE'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => handleToggleUserRole(user)}
                        className="py-1.5 px-3 bg-[#1C1C1C] hover:bg-[#252525] border border-white/10 text-white font-bold rounded-xl cursor-pointer transition-colors"
                      >
                        {user.role === 'staff' ? 'Demote to Student' : 'Promote to Staff'}
                      </button>
                    )}

                    {user.role !== 'admin' && (
                      <button
                        onClick={() => handleToggleUserStatus(user)}
                        className={`py-1.5 px-2.5 rounded-xl font-bold cursor-pointer transition-colors ${
                          user.accountStatus === 'SUSPENDED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
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
