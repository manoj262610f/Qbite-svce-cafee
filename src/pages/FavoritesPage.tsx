import React from 'react';
import { Heart, ArrowLeft, UtensilsCrossed } from 'lucide-react';
import { useCanteen } from '../context/CanteenContext';
import { FoodCard } from '../components/FoodCard';

interface FavoritesPageProps {
  onBack: () => void;
  onBrowseMenu: () => void;
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({ onBack, onBrowseMenu }) => {
  const { foods, favorites } = useCanteen();

  const favoriteFoods = foods.filter((f) => favorites.includes(f.id));

  return (
    <div className="pb-24 pt-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex items-center gap-3 border-b border-white/8 pb-4">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl bg-[#141414] hover:bg-[#1E1E1E] border border-white/8 flex items-center justify-center text-stone-300 hover:text-white cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            My Favorites
          </h1>
          <p className="text-xs sm:text-sm text-[#A1A1A1]">
            {favoriteFoods.length} saved {favoriteFoods.length === 1 ? 'item' : 'items'} for fast repeat ordering
          </p>
        </div>
      </div>

      {favoriteFoods.length === 0 ? (
        <div className="bg-[#141414] rounded-3xl p-10 text-center border border-white/8 shadow-md max-w-md mx-auto my-8">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-3">
            <Heart className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-white text-base">No favorites saved yet</h3>
          <p className="text-xs sm:text-sm text-[#A1A1A1] mt-1 max-w-xs mx-auto">
            Tap the heart icon on any dish card to save it here for fast one-tap ordering.
          </p>
          <button
            onClick={onBrowseMenu}
            className="mt-5 px-6 py-3 bg-[#FF6A00] hover:bg-[#FF7A00] text-black font-black text-xs rounded-xl cursor-pointer shadow-md glow-orange-sm transition-all active:scale-95 inline-flex items-center gap-2"
          >
            <UtensilsCrossed className="w-4 h-4 stroke-[2.5]" />
            <span>BROWSE MENU</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          {favoriteFoods.map((food) => (
            <FoodCard key={food.id} food={food} />
          ))}
        </div>
      )}
    </div>
  );
};
