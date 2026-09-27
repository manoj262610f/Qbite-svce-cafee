import React from 'react';
import { Bell, ArrowLeft, Check, Sparkles, CheckCircle2 } from 'lucide-react';
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
    <div className="pb-24 pt-3 px-4 max-w-md mx-auto space-y-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-700 hover:bg-stone-50 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">
              Notifications
            </h2>
            <p className="text-xs text-stone-500">Live order & queue updates</p>
          </div>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={clearAllNotifications}
            className="text-xs font-bold text-stone-400 hover:text-stone-700 cursor-pointer"
          >
            Clear All
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-stone-100">
          <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-2">
            <Bell className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-stone-800 text-sm">No new notifications</h3>
          <p className="text-xs text-stone-400 mt-1">
            When you order, live kitchen status alerts will appear right here.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
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
                  ? 'bg-white border-stone-100 opacity-70'
                  : 'bg-white border-orange-200 shadow-sm ring-1 ring-orange-200/50'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      notif.type === 'READY_ALERT'
                        ? 'bg-emerald-500 animate-ping'
                        : 'bg-orange-500'
                    }`}
                  />
                  <h4 className="font-extrabold text-xs text-stone-900">
                    {notif.title}
                  </h4>
                </div>
                <span className="text-[10px] text-stone-400 font-mono-token">
                  {new Date(notif.createdAt).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-1 pl-4 leading-relaxed">
                {notif.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
