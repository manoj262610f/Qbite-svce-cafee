import React, { useState } from 'react';
import { Search, SlidersHorizontal, Check } from 'lucide-react';
import { useCanteen } from '../context/CanteenContext';
import { FoodCard } from '../components/FoodCard';

export const MenuPage: React.FC = () => {
  const { foods, categories } = useCanteen();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyVeg, setOnlyVeg] = useState<boolean>(false);

  const filteredFoods = foods.filter((food) => {
    const matchesCategory = selectedCategory === 'All' || food.category === selectedCategory;
    const matchesVeg = !onlyVeg || food.isVeg;
    const matchesSearch =
      food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      food.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      food.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesVeg && matchesSearch;
  });

  return (
    <div className="pb-24 pt-3 px-4 max-w-md mx-auto space-y-4">
      <div>
        <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">
          SVCE Cafe Menu
        </h2>
        <p className="text-xs text-stone-500 mt-0.5">
          Browse all {foods.length} items freshly cooked at the college canteen
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search dosas, snacks, meals, drinks..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-2xl text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 shadow-xs"
        />
      </div>

      {/* Categories Horizontal Scroll */}
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

      {/* Count & Veg toggle */}
      <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
        <span>Showing <strong>{filteredFoods.length}</strong> items</span>
        <button
          onClick={() => setOnlyVeg(!onlyVeg)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-colors ${
            onlyVeg ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-white border-stone-200 text-stone-600'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full border border-emerald-600 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
          </span>
          <span>Pure Veg</span>
        </button>
      </div>

      {/* Food Items Grid */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        {filteredFoods.map((food) => (
          <FoodCard key={food.id} food={food} />
        ))}
      </div>
    </div>
  );
};
