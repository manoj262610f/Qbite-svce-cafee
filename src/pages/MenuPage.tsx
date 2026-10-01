import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Filter,
  Check,
  X,
  Clock,
  Star,
  Plus,
  Minus,
  Sparkles,
  ShoppingBag,
  SlidersHorizontal,
  AlertCircle
} from 'lucide-react';
import { useCanteen } from '../context/CanteenContext';
import { FoodCard } from '../components/FoodCard';
import { FoodItem } from '../types';

export const MenuPage: React.FC = () => {
  const { foods, categories, addToCart, cart, updateCartQuantity } = useCanteen();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyVeg, setOnlyVeg] = useState<boolean>(false);
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);

  const filteredFoods = foods.filter((food) => {
    const matchesCategory = selectedCategory === 'All' || food.category === selectedCategory;
    const matchesVeg = !onlyVeg || food.isVeg;
    const matchesAvailable = !onlyAvailable || food.isAvailable;
    const matchesSearch =
      food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      food.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      food.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesVeg && matchesAvailable && matchesSearch;
  });

  const cartItemForDetail = selectedFood ? cart.find((i) => i.foodId === selectedFood.id) : null;

  return (
    <div className="pb-24 pt-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-white/8 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Today's Fresh Menu
          </h1>
          <p className="text-xs sm:text-sm text-[#A1A1A1] mt-1">
            Order ahead from SVCE Cafe counters. Fresh. Fast. Ready when you arrive.
          </p>
        </div>
        <div className="text-xs font-mono-token text-[#A1A1A1] self-start sm:self-auto bg-white/5 px-3 py-1.5 rounded-xl border border-white/8">
          Showing <strong className="text-white">{filteredFoods.length}</strong> of {foods.length} items
        </div>
      </div>

      {/* Search Input Bar & Filter Controls */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-xl">
            <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dosas, meals, snacks, samosas, tea, coffee..."
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

          <div className="flex items-center gap-2">
            <button
              onClick={() => setOnlyVeg(!onlyVeg)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-colors ${
                onlyVeg
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-[#141414] border-white/8 text-[#A1A1A1] hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Pure Veg</span>
            </button>

            <button
              onClick={() => setOnlyAvailable(!onlyAvailable)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-colors ${
                onlyAvailable
                  ? 'bg-[#FF6A00]/20 border-[#FF6A00]/50 text-[#FF7A00]'
                  : 'bg-[#141414] border-white/8 text-[#A1A1A1] hover:text-white'
              }`}
            >
              <span>In Stock Only</span>
            </button>
          </div>
        </div>

        {/* Categories Horizontal Scroll / Wrap */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap cursor-pointer transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-[#FF6A00] text-black shadow-md glow-orange-sm'
                    : 'bg-[#141414] text-[#A1A1A1] hover:text-white border border-white/8 hover:bg-[#1C1C1C]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Food Items Responsive Grid */}
      {filteredFoods.length === 0 ? (
        <div className="bg-[#141414] rounded-3xl p-10 text-center border border-white/8 shadow-md max-w-md mx-auto my-8">
          <AlertCircle className="w-10 h-10 text-stone-500 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white">No food matches your filters</h3>
          <p className="text-xs text-[#A1A1A1] mt-1 leading-relaxed">
            Try adjusting your search query or clear the dietary filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setOnlyVeg(false);
              setOnlyAvailable(false);
            }}
            className="mt-4 px-4 py-2 bg-[#FF6A00] text-black font-bold text-xs rounded-xl cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          {filteredFoods.map((food) => (
            <FoodCard
              key={food.id}
              food={food}
              onSelect={(item) => setSelectedFood(item)}
            />
          ))}
        </div>
      )}

      {/* Food Detail Modal / Bottom Sheet */}
      <AnimatePresence>
        {selectedFood && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="bg-[#141414] border-t sm:border border-white/10 rounded-t-3xl sm:rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedFood(null)}
                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white flex items-center justify-center cursor-pointer hover:bg-black/90 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Large Image */}
              <div className="relative w-full h-52 bg-[#1A1A1A]">
                <img
                  src={selectedFood.imageUrl}
                  alt={selectedFood.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
                
                {/* Veg / Non-veg Tag */}
                <div className="absolute bottom-3 left-4 flex items-center gap-2">
                  <span
                    className={`w-4 h-4 border-2 rounded-xs flex items-center justify-center bg-black/80 ${
                      selectedFood.isVeg ? 'border-emerald-500' : 'border-rose-500'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        selectedFood.isVeg ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    />
                  </span>
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-xs">
                    {selectedFood.category}
                  </span>
                </div>
              </div>

              {/* Details Content */}
              <div className="p-6 space-y-4">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xl font-black text-white leading-tight">
                      {selectedFood.name}
                    </h3>
                    <span className="text-2xl font-black font-mono-token text-[#FF6A00]">
                      ₹{selectedFood.price}
                    </span>
                  </div>
                  <p className="text-xs text-[#A1A1A1] mt-2 leading-relaxed">
                    {selectedFood.description || 'Prepared fresh with high quality campus ingredients.'}
                  </p>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="bg-[#1C1C1C] rounded-xl p-3 border border-white/5">
                    <span className="text-[10px] text-[#A1A1A1] uppercase font-bold block mb-0.5">
                      Prep Time
                    </span>
                    <span className="font-mono-token font-bold text-white flex items-center justify-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#FF7A00]" />
                      ~{selectedFood.prepTimeMinutes} mins
                    </span>
                  </div>

                  <div className="bg-[#1C1C1C] rounded-xl p-3 border border-white/5">
                    <span className="text-[10px] text-[#A1A1A1] uppercase font-bold block mb-0.5">
                      Availability
                    </span>
                    <span className={`font-bold ${selectedFood.isAvailable ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {selectedFood.isAvailable ? '● Fresh in Stock' : '○ Sold Out'}
                    </span>
                  </div>
                </div>

                {/* Add to Cart Actions */}
                <div className="pt-2 border-t border-white/8">
                  {selectedFood.isAvailable ? (
                    cartItemForDetail ? (
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 bg-[#1C1C1C] border border-white/10 rounded-2xl p-1.5">
                          <button
                            onClick={() => updateCartQuantity(selectedFood.id, cartItemForDetail.quantity - 1)}
                            className="w-8 h-8 rounded-xl bg-[#262626] text-white flex items-center justify-center cursor-pointer active:scale-95"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-base font-mono-token font-black text-white px-3">
                            {cartItemForDetail.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(selectedFood.id, cartItemForDetail.quantity + 1)}
                            className="w-8 h-8 rounded-xl bg-[#FF6A00] text-black font-black flex items-center justify-center cursor-pointer active:scale-95 glow-orange-sm"
                          >
                            <Plus className="w-4 h-4 stroke-[2.5]" />
                          </button>
                        </div>

                        <button
                          onClick={() => setSelectedFood(null)}
                          className="flex-1 py-3 px-4 bg-[#FF6A00] text-black font-black text-xs rounded-2xl cursor-pointer glow-orange-sm shadow-md"
                        >
                          View in Cart (₹{selectedFood.price * cartItemForDetail.quantity})
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          addToCart(selectedFood);
                        }}
                        className="w-full py-3.5 px-4 bg-[#FF6A00] hover:bg-[#FF7A00] text-black font-black text-sm rounded-2xl shadow-lg glow-orange-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                      >
                        <Plus className="w-4 h-4 stroke-[3]" />
                        <span>ADD TO CART · ₹{selectedFood.price}</span>
                      </button>
                    )
                  ) : (
                    <div className="py-3 px-4 bg-white/5 border border-white/5 rounded-2xl text-center text-xs font-bold text-stone-400">
                      Currently Sold Out in Canteen
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
