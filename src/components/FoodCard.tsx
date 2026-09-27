import React from 'react';
import { motion } from 'motion/react';
import { Clock, Heart, Plus, Minus, Star } from 'lucide-react';
import { FoodItem } from '../types';
import { useCanteen } from '../context/CanteenContext';

interface FoodCardProps {
  food: FoodItem;
  onSelect?: (food: FoodItem) => void;
}

export const FoodCard: React.FC<FoodCardProps> = ({ food, onSelect }) => {
  const { cart, addToCart, updateCartQuantity, favorites, toggleFavorite } = useCanteen();

  const cartItem = cart.find((i) => i.foodId === food.id);
  const isFav = favorites.includes(food.id);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl p-3 border border-stone-100 shadow-sm flex flex-col justify-between transition-all hover:shadow-md ${
        !food.isAvailable ? 'opacity-60 grayscale-[40%]' : ''
      }`}
    >
      <div>
        {/* Food Image with Veg Indicator & Favorite Button */}
        <div className="relative w-full h-32 md:h-36 rounded-xl overflow-hidden bg-stone-100 mb-2.5">
          <img
            src={food.imageUrl}
            alt={food.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            loading="lazy"
          />

          {/* Veg Indicator */}
          <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm p-1 rounded-md shadow-xs flex items-center justify-center">
            <span className="w-3.5 h-3.5 border-2 border-emerald-600 rounded-xs flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            </span>
          </div>

          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(food.id);
            }}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-xs flex items-center justify-center cursor-pointer transition-transform active:scale-90"
            aria-label="Add to favorites"
          >
            <Heart
              className={`w-4 h-4 ${isFav ? 'text-rose-500 fill-rose-500' : 'text-stone-400'}`}
            />
          </button>

          {/* Prep Time pill-free label */}
          <div className="absolute bottom-2 left-2 bg-stone-900/80 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
            <Clock className="w-2.5 h-2.5 text-orange-400" />
            <span>{food.prepTimeMinutes} min</span>
          </div>

          {/* Rating */}
          {food.rating && (
            <div className="absolute bottom-2 right-2 bg-amber-500/90 text-stone-950 font-bold text-[10px] px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
              <Star className="w-2.5 h-2.5 fill-current" />
              <span>{food.rating}</span>
            </div>
          )}
        </div>

        {/* Item Title & Description */}
        <div className="mb-2">
          <div className="flex items-start justify-between gap-1">
            <h3 className="font-bold text-sm text-stone-900 leading-tight">
              {food.name}
            </h3>
          </div>
          <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed">
            {food.description}
          </p>
        </div>
      </div>

      {/* Price & Action Button */}
      <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
        <div>
          <span className="text-xs text-stone-400 font-medium">Price</span>
          <p className="text-base font-extrabold text-stone-900">₹{food.price}</p>
        </div>

        {food.isAvailable ? (
          cartItem ? (
            <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl p-1">
              <button
                onClick={() => updateCartQuantity(food.id, cartItem.quantity - 1)}
                className="w-7 h-7 rounded-lg bg-white text-orange-600 font-bold shadow-xs flex items-center justify-center cursor-pointer active:scale-95"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-sm font-bold text-stone-900 px-1 min-w-[18px] text-center">
                {cartItem.quantity}
              </span>
              <button
                onClick={() => updateCartQuantity(food.id, cartItem.quantity + 1)}
                className="w-7 h-7 rounded-lg bg-orange-600 text-white font-bold shadow-xs flex items-center justify-center cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => addToCart(food)}
              className="py-2 px-3.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1 cursor-pointer transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ADD</span>
            </button>
          )
        ) : (
          <span className="text-xs font-medium text-stone-400 bg-stone-100 px-2 py-1 rounded-lg">
            Sold Out
          </span>
        )}
      </div>
    </motion.div>
  );
};
