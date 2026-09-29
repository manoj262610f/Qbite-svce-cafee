import React, { useState } from 'react';
import { Search, Flame, ChevronRight, AlertTriangle, AlertCircle, Clock, Volume2 } from 'lucide-react';
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
      {/* Canteen Status Alerts */}
      {settings.status === 'CLOSED' && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 text-xs text-rose-800 flex items-start gap-2.5 shadow-2xs">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold">Canteen is Currently Closed</strong>
            <p className="mt-0.5 leading-relaxed">
              The kitchen is closed right now ({settings.operatingHours || '7:30 AM – 5:30 PM'}). You can browse the menu for later.
            </p>
          </div>
        </div>
      )}

      {settings.status === 'PAUSED' && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5 shadow-2xs">
          <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold">Ordering Temporarily Paused</strong>
            <p className="mt-0.5 leading-relaxed">
              Kitchen is currently fulfilling existing peak orders. New orders will reopen shortly!
            </p>
          </div>
        </div>
      )}

      {settings.status === 'BUSY' && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3 text-xs text-orange-900 flex items-center gap-2 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping shrink-0" />
          <span>Kitchen is experiencing high rush — preparation may take a few extra minutes.</span>
        </div>
      )}

      {/* Campus Announcement Banner */}
      {settings.announcement && (
        <div className="bg-white rounded-2xl p-3 border border-stone-200 text-xs text-stone-700 flex items-center gap-2.5 shadow-2xs">
          <Volume2 className="w-4 h-4 text-orange-600 shrink-0" />
          <p className="line-clamp-2 leading-relaxed">
            <span className="font-bold text-stone-900 mr-1">Notice:</span>
            {settings.announcement}
          </p>
        </div>
      )}

      {/* Greeting & Headline */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider">
            {userProfile?.name ? `Hello, ${userProfile.name.split(' ')[0]}` : 'Welcome to SVCE Cafe'}
          </p>
          <h2 className="text-xl font-extrabold text-stone-900 tracking-tight mt-0.5">
            Order Smart. Skip the Queue.
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Official SVCE Cafe remote ordering & live token tracking
          </p>
        </div>
      </div>

      {/* Live Queue Card - High priority */}
      <LiveQueueCard onTrackQueue={() => onNavigate('/queue')} />

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search food, snacks and drinks..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-2xl text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 shadow-xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400 hover:text-stone-600 cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* Horizontal Food Categories Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
            Categories
          </h3>
          <button
            onClick={() => onNavigate('/menu')}
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-0.5 cursor-pointer"
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
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Popular Today Section */}
      {selectedCategory === 'All' && !searchQuery && popularFoods.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2.5">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
            <h3 className="text-sm font-extrabold text-stone-900">
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
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-sm font-extrabold text-stone-900">
            {selectedCategory === 'All' ? 'All Dishes & Beverages' : selectedCategory}
            <span className="ml-1.5 text-xs font-semibold text-stone-400">
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
          <div className="bg-white rounded-2xl p-6 text-center border border-stone-200">
            <AlertCircle className="w-8 h-8 text-stone-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-stone-700">No food items found</p>
            <p className="text-[11px] text-stone-400 mt-0.5">Try searching for something else</p>
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
