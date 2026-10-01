import React from 'react';
import { Bell, ArrowLeft, Check, Sparkles } from 'lucide-react';
import { useCanteen } from '../context/CanteenContext';

interface NotificationsPageProps {
  onBack: () => void;
  onSelectOrder?: (orderId: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ onBack, onSelectOrder }) => {
  const {
    notifications,
    markNotificationAsRead,
    clearAllNotifications
  } = useCanteen();

  return (
    <div className="pb-24 pt-4 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-white/8 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-[#141414] hover:bg-[#1E1E1E] border border-white/8 flex items-center justify-center text-stone-300 hover:text-white cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Notifications
            </h1>
            <p className="text-xs sm:text-sm text-[#A1A1A1]">Live order & kitchen queue updates</p>
          </div>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={clearAllNotifications}
            className="text-xs font-bold text-[#A1A1A1] hover:text-white cursor-pointer px-3 py-1.5 rounded-xl border border-white/8 hover:bg-white/5 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-[#141414] rounded-3xl p-10 text-center border border-white/8 shadow-md max-w-md mx-auto my-8">
          <div className="w-14 h-14 rounded-2xl bg-[#FF6A00]/15 border border-[#FF6A00]/30 text-[#FF7A00] flex items-center justify-center mx-auto mb-3">
            <Bell className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-white text-base">No new notifications</h3>
          <p className="text-xs sm:text-sm text-[#A1A1A1] mt-1 max-w-xs mx-auto">
            When you order, live kitchen cooking and ready-for-pickup alerts will appear right here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                markNotificationAsRead(notif.id);
                if (notif.orderId && onSelectOrder) {
                  onSelectOrder(notif.orderId);
                }
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                notif.read
                  ? 'bg-[#141414] border-white/5 opacity-60'
                  : 'bg-[#181818] border-[#FF6A00]/40 shadow-md ring-1 ring-[#FF6A00]/20'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      notif.type === 'READY_ALERT'
                        ? 'bg-emerald-400 animate-ping'
                        : 'bg-[#FF6A00]'
                    }`}
                  />
                  <h4 className="font-black text-sm text-white">
                    {notif.title}
                  </h4>
                </div>
                <span className="text-[11px] text-[#A1A1A1] font-mono-token">
                  {new Date(notif.createdAt).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-300 mt-1.5 pl-5 leading-relaxed">
                {notif.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
