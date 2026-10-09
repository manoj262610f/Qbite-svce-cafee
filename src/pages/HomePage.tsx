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
  Sparkles,
  CalendarClock
} from 'lucide-react';
import { useCanteen } from '../context/CanteenContext';
import { useAuth } from '../context/AuthContext';
import { LiveQueueCard } from '../components/LiveQueueCard';
import { FoodCard } from '../components/FoodCard';
import { FoodCardSkeleton } from '../components/Skeletons';
import { ScheduleOrderBanner } from '../components/ScheduleOrderBanner';
import { ScheduleSelectorModal } from '../components/ScheduleSelectorModal';

interface HomePageProps {
  onNavigate: (route: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { foods, categories, loading, settings, setOrderingMode } = useCanteen();
  const { userProfile } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);

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
    <div className="pb-24 pt-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Canteen Operational Alerts */}
      {settings.status === 'CLOSED' && (
        <div className="bg-[#1C1111] border border-rose-500/30 rounded-2xl p-4 text-xs text-rose-300 flex items-start gap-3 shadow-md">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold text-white text-sm">Canteen is Currently Closed</strong>
            <p className="mt-0.5 text-stone-400 leading-relaxed">
              Kitchen is closed right now ({settings.operatingHours || '7:30 AM – 5:30 PM'}). You can browse the menu for later orders.
            </p>
          </div>
        </div>
      )}

      {settings.status === 'PAUSED' && (
        <div className="bg-[#1C170E] border border-amber-500/30 rounded-2xl p-4 text-xs text-amber-300 flex items-start gap-3 shadow-md">
          <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold text-white text-sm">Ordering Temporarily Paused</strong>
            <p className="mt-0.5 text-stone-400 leading-relaxed">
              Kitchen is currently fulfilling peak orders. New orders will reopen shortly!
            </p>
          </div>
        </div>
      )}

      {/* Campus Announcement Banner */}
      {settings.announcement && (
        <div className="bg-[#141414] rounded-2xl p-3.5 border border-white/8 text-xs text-stone-300 flex items-center gap-3 shadow-sm">
          <Volume2 className="w-4 h-4 text-[#FF6A00] shrink-0" />
          <p className="line-clamp-2 leading-relaxed text-[#A1A1A1]">
            <span className="font-black text-white mr-1.5">Campus Notice:</span>
            {settings.announcement}
          </p>
        </div>
      )}

      {/* Top Section: Hero Banner & Live Queue Display (2-column on desktop, stacked on mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-7 relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#1C1C1C] via-[#141414] to-[#0A0A0A] border border-white/10 shadow-2xl overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute -right-10 -bottom-10 w-56 h-56 rounded-full bg-[#FF6A00]/15 blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6A00]/15 border border-[#FF6A00]/30 text-[#FF7A00] text-[11px] font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#FF6A00]" />
              <span>SVCE Campus Dining</span>
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                Hungry? <span className="text-[#FF7A00]">Skip the queue.</span>
              </h1>
              <p className="text-sm text-[#A1A1A1] mt-2 max-w-lg leading-relaxed">
                Order directly from classrooms or campus hostels. Track your real-time token and pick up freshly prepared food at the counter.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setOrderingMode('instant');
                  onNavigate('/menu');
                }}
                className="py-3 px-5 bg-[#FF6A00] hover:bg-[#FF7A00] text-black font-black text-xs sm:text-sm rounded-xl shadow-md glow-orange-sm flex items-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <span>Order Now</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
              <button
                onClick={() => setShowScheduleModal(true)}
                className="py-3 px-5 bg-[#1F1F1F] hover:bg-[#282828] text-white font-bold text-xs sm:text-sm rounded-xl border border-white/10 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <CalendarClock className="w-4 h-4 text-[#FF6A00]" />
                <span>Schedule Your Order</span>
              </button>
              <button
                onClick={() => onNavigate('/menu')}
                className="py-3 px-4 text-[#A1A1A1] hover:text-white font-bold text-xs sm:text-sm cursor-pointer transition-colors"
              >
                Explore Menu
              </button>
            </div>
          </div>
        </motion.div>

        {/* Live Queue & Active Order Card */}
        <div className="lg:col-span-5 flex flex-col">
          <LiveQueueCard onTrackQueue={() => onNavigate('/queue')} />
        </div>
      </div>

      {/* Two Ordering Options Interactive Banner */}
      <ScheduleOrderBanner />

      {/* Search Input Bar & Category Filters */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-xl">
            <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes, breakfast, meals, snacks and drinks..."
              className="w-full pl-10 pr-16 py-3 bg-[#141414] border border-white/8 rounded-2xl text-xs sm:text-sm font-medium text-white placeholder:text-stone-500 focus:outline-none focus:border-[#FF6A00]/60 focus:ring-1 focus:ring-[#FF6A00]/30 shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400 hover:text-white cursor-pointer px-1 py-0.5"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => onNavigate('/menu')}
              className="text-xs font-black text-[#FF6A00] hover:text-[#FF7A00] flex items-center gap-1 cursor-pointer bg-white/5 hover:bg-white/10 px-3 py-2 rounded-xl border border-white/8"
            >
              <span>View Full Menu</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Horizontal / Wrapped Food Categories Bar */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1.5">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap cursor-pointer transition-all active:scale-95 ${
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

      {/* Campus Favorites Section (Multi-column responsive grid) */}
      {selectedCategory === 'All' && !searchQuery && popularFoods.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#FF6A00] fill-[#FF6A00]" />
            <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
              Campus Favorites
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
            {popularFoods.slice(0, 4).map((food) => (
              <FoodCard key={food.id} food={food} />
            ))}
          </div>
        </div>
      )}

      {/* Filtered Food Grid (Responsive 2 to 4 columns) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
            {selectedCategory === 'All' ? 'All Dishes & Beverages' : selectedCategory}
            <span className="ml-2 text-xs font-mono-token font-normal text-[#A1A1A1]">
              ({filteredFoods.length} items)
            </span>
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <FoodCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredFoods.length === 0 ? (
          <div className="bg-[#141414] rounded-3xl p-8 text-center border border-white/8 shadow-md max-w-md mx-auto">
            <AlertCircle className="w-10 h-10 text-stone-500 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white">No food items found</h3>
            <p className="text-xs text-[#A1A1A1] mt-1 leading-relaxed">
              We couldn't find matches for "{searchQuery}". Try searching for another item or reset filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="mt-4 px-4 py-2 bg-[#FF6A00] text-black font-bold text-xs rounded-xl cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
            {filteredFoods.map((food) => (
              <FoodCard key={food.id} food={food} />
            ))}
          </div>
        )}
      </div>

      <ScheduleSelectorModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onConfirmSchedule={() => {
          onNavigate('/menu');
        }}
      />
    </div>
  );
};
