import React from 'react';
import { Home, Search, ShoppingBag, Clock, User } from 'lucide-react';
import { useCanteen } from '../context/CanteenContext';

interface BottomNavProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentRoute, onNavigate }) => {
  const { cartCount, activeOrder } = useCanteen();

  const navItems = [
    { id: '/home', label: 'Home', icon: Home },
    { id: '/menu', label: 'Menu', icon: Search },
    { id: '/cart', label: 'Cart', icon: ShoppingBag, badge: cartCount },
    { id: '/orders', label: 'Orders', icon: Clock, hasDot: !!activeOrder },
    { id: '/profile', label: 'Profile', icon: User }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/80 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentRoute === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 cursor-pointer transition-colors active:scale-95 ${
                isActive ? 'text-orange-600 font-bold' : 'text-stone-400 hover:text-stone-600 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
                {/* Cart Count Badge */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-orange-600 text-white font-mono-token text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[16px] text-center shadow-xs">
                    {item.badge}
                  </span>
                )}
                {/* Active Order Ping Indicator */}
                {item.hasDot && !item.badge && (
                  <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
