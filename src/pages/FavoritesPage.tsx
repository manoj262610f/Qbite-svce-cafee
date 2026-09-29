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
    <div className="pb-24 pt-3 px-4 max-w-md mx-auto space-y-4">
      {/* Top Bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-xl bg-[#141414] hover:bg-[#1E1E1E] border border-white/8 flex items-center justify-center text-stone-300 hover:text-white cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">
            My Favorites
          </h2>
          <p className="text-xs text-[#A1A1A1]">
            {favoriteFoods.length} saved {favoriteFoods.length === 1 ? 'item' : 'items'} for fast repeat ordering
          </p>
        </div>
      </div>

      {favoriteFoods.length === 0 ? (
        <div className="bg-[#141414] rounded-3xl p-8 text-center border border-white/8 shadow-md">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-3">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-sm">No favorites yet</h3>
          <p className="text-xs text-[#A1A1A1] mt-1 max-w-xs mx-auto">
            Tap the heart icon on any dish card to save it here for fast ordering.
          </p>
          <button
            onClick={onBrowseMenu}
            className="mt-4 px-5 py-2.5 bg-[#FF6A00] hover:bg-[#FF7A00] text-black font-black text-xs rounded-xl cursor-pointer shadow-md glow-orange-sm transition-all active:scale-95"
          >
            BROWSE MENU
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {favoriteFoods.map((food) => (
            <FoodCard key={food.id} food={food} />
          ))}
        </div>
      )}
    </div>
  );
};
