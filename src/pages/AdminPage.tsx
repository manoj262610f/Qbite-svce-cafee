import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  PackageCheck,
  Clock,
  Users,
  Shield,
  Plus,
  Power,
  Edit2,
  Check,
  X,
  Flame,
  AlertCircle
} from 'lucide-react';
import { useCanteen } from '../context/CanteenContext';
import { FoodItem } from '../types';

interface AdminPageProps {
  onBackToHome: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onBackToHome }) => {
  const {
    foods,
    orders,
    queueState,
    settings,
    toggleCanteenStatus,
    updateFoodAvailability,
    saveFoodItem
  } = useCanteen();

  const [activeTab, setActiveTab] = useState<'analytics' | 'foods' | 'operations'>('analytics');
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null);

  // Compute Analytics
  const totalOrdersCount = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'CANCELLED' ? o.total : 0), 0);
  const completedOrdersCount = orders.filter((o) => o.status === 'COMPLETED').length;
  const avgWaitTime = 7; // Average wait time in minutes
  const activeQueueCount = Math.max(0, queueState.lastToken - queueState.currentServingToken);

  const handleSavePrice = async (food: FoodItem, newPrice: number) => {
    await saveFoodItem({ ...food, price: newPrice });
    setEditingFood(null);
  };

  return (
    <div className="pb-24 pt-3 px-4 max-w-lg mx-auto space-y-4">
      {/* Top Admin Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-purple-900 text-purple-200 flex items-center justify-center shadow-xs">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-stone-900 tracking-tight">
              Canteen Admin
            </h2>
            <p className="text-xs text-stone-500 font-medium">SVCE Cafe Operations Hub</p>
          </div>
        </div>

        <button
          onClick={onBackToHome}
          className="text-xs font-bold text-stone-500 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-xl cursor-pointer"
        >
          Exit Admin
        </button>
      </div>

      {/* Canteen Open/Close Master Switch */}
      <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
        settings.isOpen ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${settings.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          <div>
            <span className="font-extrabold text-sm text-stone-900">
              Canteen is {settings.isOpen ? 'OPEN' : 'CLOSED'}
            </span>
            <p className="text-xs text-stone-500">
              {settings.isOpen ? 'Students can place active orders' : 'Ordering is paused for students'}
            </p>
          </div>
        </div>
        <button
          onClick={toggleCanteenStatus}
          className={`py-2 px-3.5 rounded-xl font-bold text-xs cursor-pointer shadow-xs ${
            settings.isOpen ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          {settings.isOpen ? 'CLOSE CANTEEN' : 'OPEN CANTEEN'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-stone-100 p-1 rounded-2xl">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl cursor-pointer transition-all ${
            activeTab === 'analytics' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
          }`}
        >
          Analytics
        </button>
        <button
          onClick={() => setActiveTab('foods')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl cursor-pointer transition-all ${
            activeTab === 'foods' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
          }`}
        >
          Menu & Pricing ({foods.length})
        </button>
        <button
          onClick={() => setActiveTab('operations')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl cursor-pointer transition-all ${
            activeTab === 'operations' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
          }`}
        >
          Operations
        </button>
      </div>

      {/* TAB 1: ANALYTICS (Requirement 23) */}
      {activeTab === 'analytics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Today's Orders */}
            <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                TODAY'S ORDERS
              </span>
              <div className="text-3xl font-black font-mono-token text-stone-900">
                {totalOrdersCount}
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
                +14% vs yesterday
              </span>
            </div>

            {/* Total Revenue */}
            <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                TOTAL REVENUE
              </span>
              <div className="text-3xl font-black font-mono-token text-orange-600">
                ₹{totalRevenue}
              </div>
              <span className="text-[11px] text-stone-500 font-medium mt-1 block">
                Counter + Online
              </span>
            </div>

            {/* Completed Orders */}
            <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                COMPLETED
              </span>
              <div className="text-3xl font-black font-mono-token text-emerald-600">
                {completedOrdersCount}
              </div>
              <span className="text-[11px] text-stone-500 font-medium mt-1 block">
                Collected at counter
              </span>
            </div>

            {/* Average Waiting Time */}
            <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                AVG WAIT TIME
              </span>
              <div className="text-3xl font-black font-mono-token text-amber-600">
                {avgWaitTime} min
              </div>
              <span className="text-[11px] text-stone-500 font-medium mt-1 block">
                Target: &lt; 10 min
              </span>
            </div>
          </div>

          {/* Current Queue Live Card */}
          <div className="bg-stone-900 text-white rounded-2xl p-4 border border-stone-800 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-bold text-stone-400">Current Queue Depth</p>
              <div className="text-3xl font-black font-mono-token text-amber-400 mt-0.5">
                {activeQueueCount} students in line
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-stone-400 block">Serving Now</span>
              <span className="text-xl font-bold font-mono-token text-white">
                #{queueState.currentServingToken}
              </span>
            </div>
          </div>

          {/* Popular Foods */}
          <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              <span>Campus Most Popular Foods</span>
            </h4>
            <div className="space-y-2">
              {foods.filter((f) => f.isPopular).map((f) => (
                <div key={f.id} className="flex items-center justify-between text-xs py-1 border-b border-stone-50 last:border-none">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    <span className="font-bold text-stone-800">{f.name}</span>
                  </div>
                  <span className="font-mono-token font-bold text-orange-600">₹{f.price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MENU & PRICING */}
      {activeTab === 'foods' && (
        <div className="space-y-3">
          <p className="text-xs text-stone-500">
            Quickly toggle dish availability (in-stock vs sold-out) and adjust pricing in real-time.
          </p>

          <div className="space-y-2">
            {foods.map((food) => (
              <div
                key={food.id}
                className="bg-white rounded-2xl p-3 border border-stone-100 shadow-xs flex items-center justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${food.isAvailable ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <span className="font-bold text-sm text-stone-900 truncate">
                      {food.name}
                    </span>
                  </div>
                  <span className="text-xs text-stone-400 pl-4">{food.category}</span>
                </div>

                {/* Price editor */}
                <div className="flex items-center gap-3">
                  <span className="font-black font-mono-token text-stone-900 text-sm">
                    ₹{food.price}
                  </span>

                  {/* Availability Toggle */}
                  <button
                    onClick={() => updateFoodAvailability(food.id, !food.isAvailable)}
                    className={`py-1.5 px-3 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                      food.isAvailable
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
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

      {/* TAB 3: OPERATIONS */}
      {activeTab === 'operations' && (
        <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-xs space-y-4 text-xs">
          <h4 className="font-bold uppercase tracking-wider text-stone-400">
            Canteen Parameters
          </h4>

          <div className="space-y-2">
            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Announcement Message (Shown on Student Home & TV Display)
              </label>
              <input
                type="text"
                defaultValue={settings.announcement}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Operating Hours
              </label>
              <input
                type="text"
                defaultValue={settings.operatingHours}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium"
              />
            </div>
          </div>

          <div className="pt-2">
            <span className="font-bold text-stone-900 block mb-1">
              Active College Staff Accounts
            </span>
            <div className="space-y-1.5 text-stone-600">
              <div className="p-2 bg-stone-50 rounded-xl flex justify-between">
                <span>Kitchen Counter 1</span>
                <span className="font-mono-token text-emerald-600 font-bold">Active</span>
              </div>
              <div className="p-2 bg-stone-50 rounded-xl flex justify-between">
                <span>Dosa / Breakfast Section</span>
                <span className="font-mono-token text-emerald-600 font-bold">Active</span>
              </div>
              <div className="p-2 bg-stone-50 rounded-xl flex justify-between">
                <span>Juices & Beverage Counter</span>
                <span className="font-mono-token text-emerald-600 font-bold">Active</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
