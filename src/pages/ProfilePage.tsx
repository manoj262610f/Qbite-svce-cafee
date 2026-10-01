import React, { useState } from 'react';
import {
  User,
  Mail,
  Clock,
  Heart,
  FileText,
  Bell,
  HelpCircle,
  Info,
  Shield,
  LogOut,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  ChefHat
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCanteen } from '../context/CanteenContext';

interface ProfilePageProps {
  onNavigate: (route: string) => void;
  onLogout: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate, onLogout }) => {
  const { userProfile, role } = useAuth();
  const { myOrders, favorites } = useCanteen();
  const [modalContent, setModalContent] = useState<{ title: string; body: string } | null>(null);
  const [imageError, setImageError] = useState(false);

  const isAdminUser = ['manojreddy8022@gmail.com', 'the.team.alpha.ece2026@gmail.com'].includes(
    (userProfile?.email || '').toLowerCase().trim()
  );

  // Dynamic menu sections based on verified user role
  const campusItems = [];
  if (role === 'admin' || role === 'staff') {
    campusItems.push({
      label: 'Kitchen Staff Terminal',
      icon: ChefHat,
      onClick: () => onNavigate('/staff')
    });
  }
  if (role === 'admin') {
    campusItems.push({
      label: 'Canteen Admin Hub',
      icon: Shield,
      onClick: () => onNavigate('/admin')
    });
  }
  campusItems.push({
    label: 'Canteen TV Display Screen',
    icon: ExternalLink,
    onClick: () => onNavigate('/display')
  });

  const menuSections = [
    {
      label: 'Activity',
      items: [
        {
          label: 'My Orders',
          icon: Clock,
          badge: `${myOrders.length}`,
          onClick: () => onNavigate('/orders')
        },
        {
          label: 'Favorites',
          icon: Heart,
          badge: `${favorites.length}`,
          onClick: () => onNavigate('/favorites')
        },
        {
          label: 'Notifications',
          icon: Bell,
          onClick: () => onNavigate('/notifications')
        }
      ]
    },
    {
      label: 'Campus Staff & Display',
      items: campusItems
    },
    {
      label: 'About & Information',
      items: [
        {
          label: 'Help & Campus Support',
          icon: HelpCircle,
          onClick: () =>
            setModalContent({
              title: 'Help & Canteen Support',
              body: 'Need assistance with your food order? Visit SVCE Central Canteen Helpdesk at Counter 1 or reach out to cafe-support@svce.ac.in. Canteen operating hours: 7:30 AM – 5:30 PM.'
            })
        },
        {
          label: 'About QBite – SVCE Cafe',
          icon: Info,
          onClick: () =>
            setModalContent({
              title: 'About QBite',
              body: 'QBite is a smart college canteen remote ordering and queue-management application designed for Sri Venkateswara College of Engineering. Our motto: "Order Smart. Skip the Queue." Order ahead from anywhere on campus, track your live token, and pick up hot food without standing in line.'
            })
        },
        {
          label: 'Privacy Policy',
          icon: Shield,
          onClick: () =>
            setModalContent({
              title: 'Privacy Policy',
              body: 'QBite values student privacy. Authentication uses official Google Sign-In with Firebase Authentication. We never collect or store mobile phone numbers, passwords, USNs, or banking credentials. Food order history is securely stored on Google Cloud Firestore.'
            })
        },
        {
          label: 'Terms of Service',
          icon: FileText,
          onClick: () =>
            setModalContent({
              title: 'Terms of Service',
              body: 'Tokens are issued sequentially each day. Please collect your food within 15 minutes of your order status turning READY at the pickup counter. Uncollected orders may be forfeited.'
            })
        }
      ]
    }
  ];

  return (
    <div className="pb-24 pt-3 px-4 max-w-md mx-auto space-y-4">
      <div>
        <h2 className="text-xl font-black text-white tracking-tight">
          User Profile
        </h2>
        <p className="text-xs text-[#A1A1A1]">Authenticated Google account and settings</p>
      </div>

      {/* User Card: Authenticated Google Profile */}
      <div className="bg-[#141414] rounded-3xl p-5 border border-white/8 shadow-xl flex items-center gap-4">
        {/* Profile Avatar: Google Photo or Fallback Initial */}
        <div className="relative shrink-0">
          {userProfile?.photoURL && !imageError ? (
            <img
              src={userProfile.photoURL}
              alt={userProfile.name || 'User'}
              onError={() => setImageError(true)}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-[#FF6A00] shadow-md glow-orange-sm"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF6A00] to-[#FF9D2E] flex items-center justify-center text-black font-black text-xl shadow-lg glow-orange-sm">
              {userProfile?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
          {/* Google Indicator Dot */}
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#1F1F1F] border border-white/10 shadow-sm flex items-center justify-center">
            <svg className="w-3 h-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
            </svg>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="font-black text-base text-white truncate">
              {userProfile?.name || 'SVCE Student'}
            </h3>
            <span title="Google Authenticated" className="shrink-0 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xs text-[#A1A1A1] truncate flex items-center gap-1.5 mt-0.5">
            <Mail className="w-3.5 h-3.5 text-stone-500 shrink-0" />
            <span>{userProfile?.email || 'student@svce.ac.in'}</span>
          </p>
          <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#FF7A00] bg-[#FF6A00]/15 border border-[#FF6A00]/30 px-2 py-0.5 rounded-full">
              {role}
            </span>
            <span className="text-[10px] text-stone-500">· SVCE Campus</span>
            {userProfile?.id && (
              <span className="text-[9px] font-mono text-stone-400 bg-white/5 px-1.5 py-0.5 rounded">
                UID: {userProfile.id.slice(0, 8)}...
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Menu Links */}
      <div className="space-y-4">
        {menuSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-[#A1A1A1] px-1 mb-1">
              {section.label}
            </h4>
            <div className="bg-[#141414] rounded-2xl border border-white/8 shadow-sm divide-y divide-white/5 overflow-hidden">
              {section.items.map((item, itemIdx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={itemIdx}
                    onClick={item.onClick}
                    className="w-full px-4 py-3.5 flex items-center justify-between text-xs font-bold text-stone-200 hover:bg-[#1A1A1A] cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-[#FF6A00]" />
                      <span>{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <span className="font-mono-token text-[11px] text-stone-400 font-bold">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-stone-600" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Logout Button */}
      <div className="pt-2">
        <button
          onClick={onLogout}
          className="w-full py-3 px-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-md active:scale-[0.99]"
        >
          <LogOut className="w-4 h-4" />
          <span>LOGOUT FROM QBITE</span>
        </button>
      </div>

      {/* Modal for About, Help, Privacy, Terms */}
      {modalContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#141414] rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-white/10 space-y-4">
            <h3 className="font-black text-base text-white">
              {modalContent.title}
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed">
              {modalContent.body}
            </p>
            <button
              onClick={() => setModalContent(null)}
              className="w-full py-2.5 bg-[#FF6A00] text-black font-black text-xs rounded-xl cursor-pointer hover:bg-[#FF7A00] transition-colors glow-orange-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
