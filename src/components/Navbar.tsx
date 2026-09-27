import React, { useState } from 'react';
import {
  Bell,
  UtensilsCrossed,
  Shield,
  ChefHat,
  Monitor,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCanteen } from '../context/CanteenContext';
import { UserRole } from '../types';

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
  const { userProfile, role, switchRole } = useAuth();
  const { settings, unreadNotificationCount } = useCanteen();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const handleRoleChange = async (newRole: UserRole) => {
    await switchRole(newRole);
    setShowRoleMenu(false);
    if (newRole === 'staff') {
      onNavigate('/staff');
    } else if (newRole === 'admin') {
      onNavigate('/admin');
    } else {
      onNavigate('/home');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-100 transition-all">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left: Brand & Canteen Status */}
        <div
          onClick={() => onNavigate('/home')}
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-xs">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-extrabold text-base tracking-tight text-stone-900">
                QBite
              </span>
              <span className="text-[10px] text-stone-400 font-semibold">·</span>
              <span className="text-xs font-semibold text-orange-600">SVCE Cafe</span>
            </div>
            {/* Canteen Status Indicator */}
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  settings.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                }`}
              />
              <span className="text-[10px] font-bold text-stone-500">
                {settings.isOpen ? 'CANTEEN OPEN' : 'CANTEEN CLOSED'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: TV Display Link, Role Switcher & Notifications */}
        <div className="flex items-center gap-2">
          {/* Public TV Screen Link */}
          <button
            onClick={() => onNavigate('/display')}
            title="Public Canteen TV Display"
            className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center cursor-pointer transition-colors"
          >
            <Monitor className="w-4 h-4" />
          </button>

          {/* Role Mode Quick Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-[11px] font-bold text-stone-700 flex items-center gap-1 cursor-pointer transition-colors"
            >
              {role === 'admin' && <Shield className="w-3 h-3 text-purple-600" />}
              {role === 'staff' && <ChefHat className="w-3 h-3 text-orange-600" />}
              <span className="capitalize">{role}</span>
              <ChevronDown className="w-3 h-3 text-stone-400" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-lg border border-stone-100 py-1 z-50 text-xs">
                <div className="px-3 py-1 text-[10px] font-bold text-stone-400 uppercase">
                  Switch Interface
                </div>
                <button
                  onClick={() => handleRoleChange('student')}
                  className={`w-full text-left px-3 py-1.5 hover:bg-stone-50 flex items-center justify-between cursor-pointer ${
                    role === 'student' ? 'font-bold text-orange-600' : 'text-stone-700'
                  }`}
                >
                  <span>Student View</span>
                  {role === 'student' && <span>✓</span>}
                </button>
                <button
                  onClick={() => handleRoleChange('staff')}
                  className={`w-full text-left px-3 py-1.5 hover:bg-stone-50 flex items-center justify-between cursor-pointer ${
                    role === 'staff' ? 'font-bold text-orange-600' : 'text-stone-700'
                  }`}
                >
                  <span>Kitchen Staff</span>
                  {role === 'staff' && <span>✓</span>}
                </button>
                <button
                  onClick={() => handleRoleChange('admin')}
                  className={`w-full text-left px-3 py-1.5 hover:bg-stone-50 flex items-center justify-between cursor-pointer ${
                    role === 'admin' ? 'font-bold text-orange-600' : 'text-stone-700'
                  }`}
                >
                  <span>Canteen Admin</span>
                  {role === 'admin' && <span>✓</span>}
                </button>
              </div>
            )}
          </div>

          {/* Notifications Button */}
          <button
            onClick={onOpenNotifications}
            className="relative w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center cursor-pointer transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-xs">
                {unreadNotificationCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
