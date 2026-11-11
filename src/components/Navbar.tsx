import React from 'react';
import {
  Bell,
  Shield,
  ChefHat,
  Monitor,
  ShoppingBag,
  Home,
  UtensilsCrossed,
  Clock,
  Heart,
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCanteen } from '../context/CanteenContext';
import { QbiteLogo } from './QbiteLogo';

interface NavbarProps {
  onOpenNotifications: () => void;
  onNavigate: (route: string) => void;
  currentRoute: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNotifications,
  onNavigate,
  currentRoute
}) => {
  const { userProfile, role } = useAuth();
  const { settings, unreadNotificationCount, cartCount, cartSubtotal, activeOrder } = useCanteen();

  const isCanteenOpen = settings.status === 'OPEN';
  const isCanteenPaused = settings.status === 'PAUSED';

  const desktopNavItems = [
    { id: '/home', label: 'Home', icon: Home },
    { id: '/menu', label: 'Menu', icon: UtensilsCrossed },
    { id: '/orders', label: 'Orders', icon: Clock, hasDot: !!activeOrder },
    { id: '/queue', label: 'Live Queue', icon: Clock },
    { id: '/favorites', label: 'Favorites', icon: Heart }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#000000] border-b border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Canteen Status */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            onClick={() => onNavigate('/home')}
            className="cursor-pointer group flex items-center"
          >
            <QbiteLogo size="sm" showSubtitle={false} />
          </div>

          {/* Canteen Status Indicator */}
          <div className="flex items-center gap-1.5 pl-3 border-l border-white/10">
            <span
              className={`w-2 h-2 rounded-full ${
                isCanteenOpen
                  ? 'bg-emerald-400'
                  : isCanteenPaused
                  ? 'bg-amber-400'
                  : 'bg-rose-500'
              }`}
            />
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#D9D9D9]">
              {isCanteenOpen ? 'OPEN' : isCanteenPaused ? 'BUSY' : 'CLOSED'}
            </span>
          </div>
        </div>

        {/* Center: Desktop Navigation Bar */}
        <nav className="hidden md:flex items-center gap-1 bg-[#151515] p-1 rounded-2xl border border-white/10">
          {desktopNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`relative px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-[#FF6B00] text-black font-black'
                    : 'text-[#D9D9D9] hover:text-white hover:bg-[#202020]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                <span>{item.label}</span>
                {item.hasDot && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Actions, Cart, Role Hubs & Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Desktop Cart Button with Live Total */}
          <button
            onClick={() => onNavigate('/cart')}
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border cursor-pointer transition-colors ${
              currentRoute === '/cart'
                ? 'bg-[#FF6B00] text-black border-[#FF6B00] font-black'
                : 'bg-[#151515] hover:bg-[#202020] text-white border-white/10 hover:border-[#FF6B00]'
            }`}
            title="Open Shopping Cart"
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#FF6B00] text-black text-[9px] font-black rounded-full w-3.5 h-3.5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-xs font-bold">Cart</span>
            {cartCount > 0 && (
              <span className="text-xs font-mono-token font-black pl-1 border-l border-white/20">
                ₹{cartSubtotal}
              </span>
            )}
          </button>

          {/* Public TV Screen Link */}
          <button
            onClick={() => onNavigate('/display')}
            title="Public Canteen TV Display"
            className="w-8 h-8 rounded-xl bg-[#151515] hover:bg-[#202020] border border-white/10 text-[#D9D9D9] hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <Monitor className="w-4 h-4" />
          </button>

          {/* Admin Direct Quick Access */}
          {role === 'admin' && (
            <button
              onClick={() => onNavigate(currentRoute === '/admin' ? '/home' : '/admin')}
              className="px-2.5 py-1.5 rounded-xl bg-[#151515] hover:bg-[#202020] border border-white/10 text-[11px] font-extrabold text-white hover:text-[#FF6B00] flex items-center gap-1 cursor-pointer transition-colors"
              title="Admin Operations Hub"
            >
              <Shield className="w-3.5 h-3.5 text-[#FF6B00]" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}

          {/* Staff Direct Quick Access */}
          {(role === 'staff' || role === 'admin') && currentRoute !== '/staff' && (
            <button
              onClick={() => onNavigate('/staff')}
              className="px-2.5 py-1.5 rounded-xl bg-[#151515] hover:bg-[#202020] border border-white/10 text-[11px] font-extrabold text-[#FF6B00] flex items-center gap-1 cursor-pointer transition-colors"
              title="Kitchen Orders Terminal"
            >
              <ChefHat className="w-3.5 h-3.5 text-[#FF6B00]" />
              <span className="hidden sm:inline">Kitchen</span>
            </button>
          )}

          {/* Notifications Button */}
          <button
            onClick={onOpenNotifications}
            className="relative w-8 h-8 rounded-xl bg-[#151515] hover:bg-[#202020] border border-white/10 text-[#D9D9D9] hover:text-white flex items-center justify-center cursor-pointer transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF6B00] text-black text-[9px] font-black rounded-full flex items-center justify-center">
                {unreadNotificationCount}
              </span>
            )}
          </button>

          {/* Profile Quick Avatar */}
          <button
            onClick={() => onNavigate('/profile')}
            className="w-8 h-8 rounded-xl bg-[#151515] hover:bg-[#202020] border border-white/10 overflow-hidden flex items-center justify-center cursor-pointer transition-colors"
            title="My Profile"
          >
            {userProfile?.photoURL ? (
              <img
                src={userProfile.photoURL}
                alt={userProfile.name || 'User'}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="text-xs font-black text-[#FF6B00]">
                {userProfile?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
