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
          className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-700 hover:bg-stone-50 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">
            My Favorites
          </h2>
          <p className="text-xs text-stone-500">
            {favoriteFoods.length} saved {favoriteFoods.length === 1 ? 'item' : 'items'} for fast repeat ordering
          </p>
        </div>
      </div>

      {favoriteFoods.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-stone-100">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-3">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-stone-800 text-sm">No favorites yet</h3>
          <p className="text-xs text-stone-400 mt-1 max-w-xs mx-auto">
            Tap the heart icon on any dish card to save it here for 1-tap ordering.
          </p>
          <button
            onClick={onBrowseMenu}
            className="mt-4 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl cursor-pointer"
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
