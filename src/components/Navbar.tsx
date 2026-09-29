import React from 'react';
import {
  Bell,
  Shield,
  ChefHat,
  Monitor
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
  const { settings, unreadNotificationCount } = useCanteen();

  const isCanteenOpen = settings.status === 'OPEN';
  const isCanteenPaused = settings.status === 'PAUSED';

  return (
    <header className="sticky top-0 z-40 bg-[#080808]/90 backdrop-blur-md border-b border-white/8 transition-all">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left: Brand & Canteen Status */}
        <div
          onClick={() => onNavigate('/home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <QbiteLogo size="sm" showSubtitle={false} />
          
          {/* Canteen Status Indicator */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-white/10">
            <span
              className={`w-2 h-2 rounded-full ${
                isCanteenOpen
                  ? 'bg-emerald-400 animate-pulse'
                  : isCanteenPaused
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-rose-500'
              }`}
            />
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#A1A1A1]">
              {isCanteenOpen ? 'OPEN' : isCanteenPaused ? 'BUSY' : 'CLOSED'}
            </span>
          </div>
        </div>

        {/* Right: TV Display Link, Role Hubs & Notifications */}
        <div className="flex items-center gap-2">
          {/* Public TV Screen Link */}
          <button
            onClick={() => onNavigate('/display')}
            title="Public Canteen TV Display"
            className="w-8 h-8 rounded-xl bg-[#141414] hover:bg-[#1C1C1C] border border-white/8 text-stone-300 flex items-center justify-center cursor-pointer transition-colors"
          >
            <Monitor className="w-4 h-4" />
          </button>

          {/* Admin Direct Quick Access */}
          {role === 'admin' && (
            <button
              onClick={() => onNavigate(currentRoute === '/admin' ? '/home' : '/admin')}
              className="px-2 py-1 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-[11px] font-extrabold text-purple-300 flex items-center gap-1 cursor-pointer transition-colors"
              title="Admin Operations Hub"
            >
              <Shield className="w-3 h-3 text-purple-400" />
              <span>Admin</span>
            </button>
          )}

          {/* Staff Direct Quick Access */}
          {(role === 'staff' || role === 'admin') && currentRoute !== '/staff' && (
            <button
              onClick={() => onNavigate('/staff')}
              className="px-2 py-1 rounded-xl bg-[#FF6A00]/15 hover:bg-[#FF6A00]/25 border border-[#FF6A00]/30 text-[11px] font-extrabold text-[#FF7A00] flex items-center gap-1 cursor-pointer transition-colors"
              title="Kitchen Orders Terminal"
            >
              <ChefHat className="w-3 h-3 text-[#FF6A00]" />
              <span>Kitchen</span>
            </button>
          )}

          {/* Notifications Button */}
          <button
            onClick={onOpenNotifications}
            className="relative w-8 h-8 rounded-xl bg-[#141414] hover:bg-[#1C1C1C] border border-white/8 text-stone-300 flex items-center justify-center cursor-pointer transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF6A00] text-black text-[9px] font-black rounded-full flex items-center justify-center shadow-md glow-orange-sm">
                {unreadNotificationCount}
              </span>
            )}
          </button>

          {/* Profile Quick Avatar */}
          <button
            onClick={() => onNavigate('/profile')}
            className="w-8 h-8 rounded-xl bg-[#141414] hover:bg-[#1C1C1C] border border-white/8 overflow-hidden flex items-center justify-center cursor-pointer transition-colors"
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
              <span className="text-xs font-black text-[#FF6A00]">
                {userProfile?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
