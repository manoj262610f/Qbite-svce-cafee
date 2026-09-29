import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Search,
  Flame,
  ChevronRight,
  AlertTriangle,
  AlertCircle,
  Clock,
  Volume2,
  ArrowRight,
  UtensilsCrossed,
  Sparkles
} from 'lucide-react';
import { useCanteen } from '../context/CanteenContext';
import { useAuth } from '../context/AuthContext';
import { LiveQueueCard } from '../components/LiveQueueCard';
import { FoodCard } from '../components/FoodCard';
import { FoodCardSkeleton } from '../components/Skeletons';

interface HomePageProps {
  onNavigate: (route: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { foods, categories, loading, settings } = useCanteen();
  const { userProfile } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredFoods = foods.filter((food) => {
    const matchesCategory =
      selectedCategory === 'All' || food.category === selectedCategory;
    const matchesSearch =
      food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      food.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      food.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const popularFoods = foods.filter((f) => f.isPopular);

  return (
    <div className="pb-24 pt-2 px-4 max-w-md mx-auto space-y-4">
      {/* Canteen Operational Alerts */}
      {settings.status === 'CLOSED' && (
        <div className="bg-[#1C1111] border border-rose-500/30 rounded-2xl p-3.5 text-xs text-rose-300 flex items-start gap-2.5 shadow-md">
          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold text-white">Canteen is Currently Closed</strong>
            <p className="mt-0.5 text-stone-400 leading-relaxed">
              Kitchen is closed right now ({settings.operatingHours || '7:30 AM – 5:30 PM'}). You can browse the menu for later.
            </p>
          </div>
        </div>
      )}

      {settings.status === 'PAUSED' && (
        <div className="bg-[#1C170E] border border-amber-500/30 rounded-2xl p-3.5 text-xs text-amber-300 flex items-start gap-2.5 shadow-md">
          <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold text-white">Ordering Temporarily Paused</strong>
            <p className="mt-0.5 text-stone-400 leading-relaxed">
              Kitchen is currently fulfilling peak orders. New orders will reopen shortly!
            </p>
          </div>
        </div>
      )}

      {/* Campus Announcement Banner */}
      {settings.announcement && (
        <div className="bg-[#141414] rounded-2xl p-3 border border-white/8 text-xs text-stone-300 flex items-center gap-2.5 shadow-sm">
          <Volume2 className="w-4 h-4 text-[#FF6A00] shrink-0" />
          <p className="line-clamp-2 leading-relaxed text-[#A1A1A1]">
            <span className="font-black text-white mr-1">Notice:</span>
            {settings.announcement}
          </p>
        </div>
      )}

      {/* Hero Card: Hungry? Skip the queue */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl p-5 bg-gradient-to-br from-[#1C1C1C] via-[#141414] to-[#0A0A0A] border border-white/10 shadow-2xl overflow-hidden"
      >
        <div className="absolute -right-6 -bottom-6 w-36 h-36 rounded-full bg-[#FF6A00]/15 blur-2xl pointer-events-none" />
        
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FF6A00]/15 border border-[#FF6A00]/30 text-[#FF7A00] text-[10px] font-black uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-[#FF6A00]" />
            <span>Fast Campus Dining</span>
          </div>

          <div>
            <h1 className="text-2xl font-black text-white tracking-tight leading-tight">
              Hungry? <span className="text-[#FF7A00]">Skip the queue.</span>
            </h1>
            <p className="text-xs text-[#A1A1A1] mt-1 leading-relaxed">
              Order from campus. Pick up when ready.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => onNavigate('/menu')}
              className="py-2.5 px-4 bg-[#FF6A00] hover:bg-[#FF7A00] text-black font-black text-xs rounded-xl shadow-md glow-orange-sm flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
            >
              <span>Order Now</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
            <button
              onClick={() => onNavigate('/menu')}
              className="py-2.5 px-4 bg-[#1F1F1F] hover:bg-[#282828] text-white font-bold text-xs rounded-xl border border-white/8 cursor-pointer transition-colors"
            >
              View Menu
            </button>
          </div>
        </div>
      </motion.div>

      {/* Live Queue & Active Order Card */}
      <LiveQueueCard onTrackQueue={() => onNavigate('/queue')} />

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search food, snacks and drinks..."
          className="w-full pl-10 pr-4 py-3 bg-[#141414] border border-white/8 rounded-2xl text-xs font-medium text-white placeholder:text-stone-500 focus:outline-none focus:border-[#FF6A00]/60 focus:ring-1 focus:ring-[#FF6A00]/30 shadow-inner"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400 hover:text-white cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* Horizontal Food Categories Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[11px] font-black uppercase tracking-wider text-[#A1A1A1]">
            Categories
          </h3>
          <button
            onClick={() => onNavigate('/menu')}
            className="text-xs font-black text-[#FF6A00] hover:text-[#FF7A00] flex items-center gap-0.5 cursor-pointer"
          >
            <span>Full Menu</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap cursor-pointer transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-[#FF6A00] text-black shadow-md glow-orange-sm'
                    : 'bg-[#141414] text-[#A1A1A1] hover:text-white border border-white/8 hover:bg-[#1A1A1A]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Campus Favorites Section */}
      {selectedCategory === 'All' && !searchQuery && popularFoods.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-[#FF6A00] fill-[#FF6A00]" />
            <h3 className="text-sm font-black text-white tracking-tight">
              Campus Favorites
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {popularFoods.slice(0, 4).map((food) => (
              <FoodCard key={food.id} food={food} />
            ))}
          </div>
        </div>
      )}

      {/* Filtered Food Grid */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-white tracking-tight">
            {selectedCategory === 'All' ? 'All Dishes & Beverages' : selectedCategory}
            <span className="ml-1.5 text-xs font-mono-token font-normal text-[#A1A1A1]">
              ({filteredFoods.length})
            </span>
          </h3>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <FoodCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredFoods.length === 0 ? (
          <div className="bg-[#141414] rounded-2xl p-6 text-center border border-white/8 shadow-md">
            <AlertCircle className="w-8 h-8 text-stone-500 mx-auto mb-2" />
            <p className="text-xs font-bold text-white">No food items found</p>
            <p className="text-[11px] text-[#A1A1A1] mt-0.5">Try searching for something else or reset filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredFoods.map((food) => (
              <FoodCard key={food.id} food={food} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
