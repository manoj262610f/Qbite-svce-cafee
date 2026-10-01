import React from 'react';
import { Home, UtensilsCrossed, ShoppingBag, Clock, User } from 'lucide-react';
import { useCanteen } from '../context/CanteenContext';

interface BottomNavProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentRoute, onNavigate }) => {
  const { cartCount, activeOrder } = useCanteen();

  const navItems = [
    { id: '/home', label: 'Home', icon: Home },
    { id: '/menu', label: 'Menu', icon: UtensilsCrossed },
    { id: '/cart', label: 'Cart', icon: ShoppingBag, badge: cartCount },
    { id: '/orders', label: 'Orders', icon: Clock, hasDot: !!activeOrder },
    { id: '/profile', label: 'Profile', icon: User }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#080808]/95 backdrop-blur-xl border-t border-white/8 shadow-[0_-4px_24px_rgba(0,0,0,0.6)]">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentRoute === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 cursor-pointer transition-all active:scale-95 ${
                isActive ? 'text-[#FF6A00] font-black' : 'text-[#737373] hover:text-[#A1A1A1] font-semibold'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4] filter drop-shadow-[0_0_8px_rgba(255,106,0,0.5)]' : 'stroke-[1.8]'}`} />
                {/* Cart Count Badge */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-[#FF6A00] text-black font-mono-token text-[10px] font-black px-1.5 py-0.2 rounded-full min-w-[16px] text-center shadow-md glow-orange-sm">
                    {item.badge}
                  </span>
                )}
                {/* Active Order Ping Indicator */}
                {item.hasDot && !item.badge && (
                  <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#FF6A00] glow-orange-sm" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
