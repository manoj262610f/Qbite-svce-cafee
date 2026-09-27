import React, { useState } from 'react';
import {
  User,
  Mail,
  Clock,
  Heart,
  FileText,
  Bell,
  Settings,
  HelpCircle,
  Info,
  Shield,
  LogOut,
  ChevronRight,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCanteen } from '../context/CanteenContext';

interface ProfilePageProps {
  onNavigate: (route: string) => void;
  onLogout: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate, onLogout }) => {
  const { userProfile, role, switchRole } = useAuth();
  const { myOrders, favorites } = useCanteen();
  const [modalContent, setModalContent] = useState<{ title: string; body: string } | null>(null);

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
      items: [
        {
          label: 'Kitchen Staff Interface',
          icon: User,
          onClick: async () => {
            await switchRole('staff');
            onNavigate('/staff');
          }
        },
        {
          label: 'Canteen Admin Hub',
          icon: Shield,
          onClick: async () => {
            await switchRole('admin');
            onNavigate('/admin');
          }
        },
        {
          label: 'Canteen TV Display Screen',
          icon: ExternalLink,
          onClick: () => onNavigate('/display')
        }
      ]
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
              body: 'QBite is a smart college canteen remote ordering and queue-management application designed for Sri Venkateswara College of Engineering. Our motto: "Be Smart. Leave the Queue." Order ahead from anywhere on campus, track your live token, and pick up hot food without standing in line.'
            })
        },
        {
          label: 'Privacy Policy',
          icon: Shield,
          onClick: () =>
            setModalContent({
              title: 'Privacy Policy',
              body: 'QBite values student privacy. Authentication uses passwordless email only. We never collect or store mobile phone numbers, USNs, department details, or unnecessary personal data. Food order history is securely stored on Google Cloud Firestore.'
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
        <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">
          Student Profile
        </h2>
        <p className="text-xs text-stone-500">Account details and canteen preferences</p>
      </div>

      {/* User Card: Name + Email ONLY (Strict Requirement 30: Never ask for mobile number) */}
      <div className="bg-white rounded-3xl p-5 border border-stone-100 shadow-sm flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white font-extrabold text-xl shadow-md shadow-orange-500/20">
          {userProfile?.name?.charAt(0).toUpperCase() || 'S'}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-extrabold text-base text-stone-900 truncate">
            {userProfile?.name || 'SVCE Student'}
          </h3>
          <p className="text-xs text-stone-500 truncate flex items-center gap-1.5 mt-0.5">
            <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span>{userProfile?.email || 'student@svce.ac.in'}</span>
          </p>
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
              {role}
            </span>
            <span className="text-[10px] text-stone-400">· SVCE Campus</span>
          </div>
        </div>
      </div>

      {/* Menu Links */}
      <div className="space-y-4">
        {menuSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-400 px-1 mb-1">
              {section.label}
            </h4>
            <div className="bg-white rounded-2xl border border-stone-100 shadow-xs divide-y divide-stone-50 overflow-hidden">
              {section.items.map((item, itemIdx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={itemIdx}
                    onClick={item.onClick}
                    className="w-full px-4 py-3.5 flex items-center justify-between text-xs font-semibold text-stone-800 hover:bg-stone-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-stone-500" />
                      <span>{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <span className="font-mono-token text-[11px] text-stone-400 font-bold">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-stone-300" />
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
          className="w-full py-3 px-4 rounded-2xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>LOGOUT FROM QBITE</span>
        </button>
      </div>

      {/* Modal for About, Help, Privacy, Terms */}
      {modalContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <h3 className="font-extrabold text-base text-stone-900">
              {modalContent.title}
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              {modalContent.body}
            </p>
            <button
              onClick={() => setModalContent(null)}
              className="w-full py-2.5 bg-stone-900 text-white font-bold text-xs rounded-xl cursor-pointer hover:bg-stone-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
