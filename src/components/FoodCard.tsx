import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Clock, Heart, Plus, Minus, Star, Check } from 'lucide-react';
import { FoodItem } from '../types';
import { useCanteen } from '../context/CanteenContext';

interface FoodCardProps {
  food: FoodItem;
  onSelect?: (food: FoodItem) => void;
}

export const FoodCard: React.FC<FoodCardProps> = ({ food, onSelect }) => {
  const { cart, addToCart, updateCartQuantity, favorites, toggleFavorite } = useCanteen();
  const [justAdded, setJustAdded] = useState(false);

  const cartItem = cart.find((i) => i.foodId === food.id);
  const isFav = favorites.includes(food.id);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(food);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 900);
  };

  return (
    <motion.div
      layout
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      onClick={() => onSelect?.(food)}
      className={`group relative bg-[#141414] hover:bg-[#181818] rounded-2xl p-3 border border-white/8 hover:border-[#FF6A00]/40 shadow-lg hover:shadow-[#FF6A00]/5 flex flex-col justify-between transition-all cursor-pointer overflow-hidden ${
        !food.isAvailable ? 'opacity-50 grayscale' : ''
      }`}
    >
      <div>
        {/* Food Image with Veg Indicator & Favorite Button */}
        <div className="relative w-full h-32 sm:h-36 rounded-xl overflow-hidden bg-[#1E1E1E] mb-2.5">
          <img
            src={food.imageUrl}
            alt={food.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              // Graceful fallback to default food placeholder
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80';
            }}
          />

          {/* Veg / Non-Veg Indicator */}
          <div className="absolute top-2 left-2 bg-[#0A0A0A]/85 backdrop-blur-md p-1 rounded-md border border-white/10 flex items-center justify-center">
            <span
              className={`w-3.5 h-3.5 border-2 rounded-xs flex items-center justify-center ${
                food.isVeg ? 'border-emerald-500' : 'border-rose-500'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  food.isVeg ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
            </span>
          </div>

          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(food.id);
            }}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#0A0A0A]/80 backdrop-blur-md border border-white/10 shadow-md flex items-center justify-center cursor-pointer transition-transform active:scale-90"
            aria-label="Toggle favorite"
          >
            <Heart
              className={`w-3.5 h-3.5 transition-colors ${
                isFav ? 'text-rose-500 fill-rose-500' : 'text-stone-400 hover:text-white'
              }`}
            />
          </button>

          {/* Prep Time pill-free label */}
          <div className="absolute bottom-2 left-2 bg-[#0A0A0A]/85 backdrop-blur-md text-stone-200 text-[10px] font-bold px-2 py-0.5 rounded-md border border-white/10 flex items-center gap-1">
            <Clock className="w-2.5 h-2.5 text-[#FF7A00]" />
            <span className="font-mono-token">{food.prepTimeMinutes}m</span>
          </div>

          {/* Rating */}
          {food.rating && (
            <div className="absolute bottom-2 right-2 bg-[#FF9D2E] text-black font-mono-token font-black text-[10px] px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-sm">
              <Star className="w-2.5 h-2.5 fill-current" />
              <span>{food.rating}</span>
            </div>
          )}
        </div>

        {/* Item Title & Category / Description */}
        <div className="mb-2">
          <div className="flex items-center justify-between gap-1">
            <h3 className="font-black text-sm text-white group-hover:text-[#FF7A00] transition-colors leading-tight truncate">
              {food.name}
            </h3>
          </div>
          <p className="text-[11px] text-[#A1A1A1] line-clamp-1 mt-0.5 leading-relaxed">
            {food.description || food.category}
          </p>
        </div>
      </div>

      {/* Price & Action Button */}
      <div className="pt-2 border-t border-white/8 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-[#737373] tracking-wider block">Price</span>
          <p className="text-base font-black font-mono-token text-white">₹{food.price}</p>
        </div>

        {food.isAvailable ? (
          cartItem ? (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 bg-[#1C1C1C] border border-white/10 rounded-xl p-1"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateCartQuantity(food.id, cartItem.quantity - 1);
                }}
                className="w-6 h-6 rounded-lg bg-[#262626] hover:bg-[#333333] text-stone-200 font-bold flex items-center justify-center cursor-pointer active:scale-95 transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-xs font-mono-token font-bold text-white px-1 min-w-[16px] text-center">
                {cartItem.quantity}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateCartQuantity(food.id, cartItem.quantity + 1);
                }}
                className="w-6 h-6 rounded-lg bg-[#FF6A00] hover:bg-[#FF7A00] text-black font-bold flex items-center justify-center cursor-pointer active:scale-95 transition-colors glow-orange-sm"
                aria-label="Increase quantity"
              >
                <Plus className="w-3 h-3 stroke-[2.5]" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              className={`py-1.5 px-3 rounded-xl text-xs font-extrabold flex items-center gap-1 cursor-pointer transition-all active:scale-95 ${
                justAdded
                  ? 'bg-emerald-500 text-black glow-emerald-sm'
                  : 'bg-[#FF6A00] hover:bg-[#FF7A00] text-black hover:glow-orange-sm shadow-md'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>ADDED</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>ADD</span>
                </>
              )}
            </button>
          )
        ) : (
          <span className="text-[10px] font-bold uppercase text-stone-500 bg-white/5 border border-white/5 px-2 py-1 rounded-lg">
            Sold Out
          </span>
        )}
      </div>
    </motion.div>
  );
};
