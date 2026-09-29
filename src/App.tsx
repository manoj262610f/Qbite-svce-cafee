import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CanteenProvider, useCanteen } from './context/CanteenContext';
import { SplashScreen } from './components/SplashScreen';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { WelcomePage } from './pages/WelcomePage';
import { HomePage } from './pages/HomePage';
import { MenuPage } from './pages/MenuPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrdersPage } from './pages/OrdersPage';
import { TokenDetailPage } from './pages/TokenDetailPage';
import { PublicDisplayPage } from './pages/PublicDisplayPage';
import { StaffPage } from './pages/StaffPage';
import { AdminPage } from './pages/AdminPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AuthBridgePage } from './pages/AuthBridgePage';
import { testFirestoreConnection } from './firebase/connectionTest';
import { safeSessionStorage } from './services/safeStorage';
import { UtensilsCrossed, ChefHat, Shield } from 'lucide-react';

function MainAppContent() {
  // If navigating directly to auth bridge gateway, render immediately
  if (typeof window !== 'undefined' && window.location.pathname === '/auth-bridge') {
    return <AuthBridgePage />;
  }

  const { currentUser, role, loading: authLoading, logout } = useAuth();
  const { activeOrder } = useCanteen();

  const [hasShownSplash, setHasShownSplash] = useState<boolean>(() => {
    return safeSessionStorage.getItem('qbite_splash_done') === 'true';
  });

  const getInitialRoute = () => {
    const validRoutes = ['/home', '/menu', '/cart', '/checkout', '/orders', '/queue', '/favorites', '/notifications', '/profile', '/display', '/staff', '/admin'];
    const path = window.location.pathname;
    return validRoutes.includes(path) ? path : '/home';
  };

  const [currentRoute, setCurrentRoute] = useState<string>(getInitialRoute);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const navigate = React.useCallback((route: string) => {
    setCurrentRoute(route);
    if (window.location.pathname !== route) {
      window.history.pushState(null, '', route);
    }
  }, []);

  const handleSplashComplete = React.useCallback(() => {
    safeSessionStorage.setItem('qbite_splash_done', 'true');
    setHasShownSplash(true);
  }, []);

  // Validate Firestore connection on boot (Skill Requirement)
  useEffect(() => {
    testFirestoreConnection();
  }, []);

  // Register service worker if available (PWA Requirement)
  useEffect(() => {
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  // Handle browser back/forward and direct path initialization
  useEffect(() => {
    const handlePopState = () => {
      const validRoutes = ['/home', '/menu', '/cart', '/checkout', '/orders', '/queue', '/favorites', '/notifications', '/profile', '/display', '/staff', '/admin'];
      const path = window.location.pathname;
      if (validRoutes.includes(path)) {
        setCurrentRoute(path);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // 1. Splash Screen Display (Requirement 1: First 3 seconds)
  if (!hasShownSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  // 2. Auth Loading state while checking persistent session
  if (authLoading && !currentUser) {
    return (
      <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="w-12 h-12 rounded-2xl bg-[#FF6A00] flex items-center justify-center text-black shadow-lg glow-orange-sm mb-3 animate-pulse">
          <UtensilsCrossed className="w-6 h-6 stroke-[2.5]" />
        </div>
        <p className="font-black text-sm text-white tracking-tight">qBite · SVCE Cafe</p>
        <p className="text-[11px] text-[#A1A1A1] mt-1">Connecting to campus session...</p>
      </div>
    );
  }

  // 3. Authentication Gate: If not logged in and not on public TV display, show Welcome/Google Login Screen
  if (!currentUser && currentRoute !== '/display') {
    return (
      <WelcomePage
        onLoginSuccess={() => navigate('/home')}
        onNavigateToDisplay={() => navigate('/display')}
      />
    );
  }

  // 3. Public TV Canteen Display (/display)
  if (currentRoute === '/display') {
    return <PublicDisplayPage onBack={() => navigate('/home')} />;
  }

  // 4. Kitchen Staff Interface (/staff)
  if (currentRoute === '/staff') {
    if (role !== 'staff' && role !== 'admin') {
      return (
        <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center p-6 text-center text-white">
          <div className="w-12 h-12 rounded-2xl bg-[#FF6A00]/20 text-[#FF7A00] border border-[#FF6A00]/30 flex items-center justify-center mb-3 shadow-md glow-orange-sm">
            <ChefHat className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h2 className="text-lg font-black text-white tracking-tight">Staff Portal Restricted</h2>
          <p className="text-xs text-[#A1A1A1] max-w-xs mt-1 mb-4">
            This kitchen fulfillment terminal is restricted to authorized SVCE canteen staff.
          </p>
          <button
            onClick={() => navigate('/home')}
            className="px-4 py-2 bg-[#FF6A00] hover:bg-[#FF7A00] text-black rounded-xl text-xs font-black cursor-pointer shadow-md glow-orange-sm transition-all"
          >
            Return to Student App
          </button>
        </div>
      );
    }
    return <StaffPage onBackToHome={() => navigate('/home')} />;
  }

  // 5. Admin Interface (/admin)
  if (currentRoute === '/admin') {
    if (role !== 'admin') {
      return (
        <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center p-6 text-center text-white">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center mb-3 shadow-md">
            <Shield className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h2 className="text-lg font-black text-white tracking-tight">Admin Access Required</h2>
          <p className="text-xs text-[#A1A1A1] max-w-xs mt-1 mb-4">
            Only designated canteen administrators can access policy control, pricing, and staff permissions.
          </p>
          <button
            onClick={() => navigate('/home')}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
          >
            Return to Student App
          </button>
        </div>
      );
    }
    return <AdminPage onBackToHome={() => navigate('/home')} />;
  }

  // Standard Student App Experience with Header & Bottom Navigation
  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col justify-between selection:bg-[#FF6A00] selection:text-black">
      {/* Top Navbar */}
      <Navbar
        onOpenNotifications={() => navigate('/notifications')}
        onNavigate={(route) => navigate(route)}
        currentRoute={currentRoute}
      />

      {/* Main Page Routing */}
      <main className="flex-1">
        {currentRoute === '/home' && (
          <HomePage onNavigate={(route) => navigate(route)} />
        )}

        {currentRoute === '/menu' && (
          <MenuPage />
        )}

        {currentRoute === '/cart' && (
          <CartPage
            onProceedToCheckout={() => navigate('/checkout')}
            onBrowseMenu={() => navigate('/menu')}
          />
        )}

        {currentRoute === '/checkout' && (
          <CheckoutPage
            onBack={() => navigate('/cart')}
            onOrderSuccess={(order) => {
              setSelectedOrderId(order.id);
              navigate('/queue');
            }}
          />
        )}

        {currentRoute === '/orders' && (
          <OrdersPage
            onSelectOrder={(id) => {
              setSelectedOrderId(id);
              navigate('/queue');
            }}
            onBrowseMenu={() => navigate('/menu')}
          />
        )}

        {currentRoute === '/queue' && (
          <TokenDetailPage
            orderId={selectedOrderId}
            onBack={() => navigate('/home')}
            onBrowseMenu={() => navigate('/menu')}
          />
        )}

        {currentRoute === '/favorites' && (
          <FavoritesPage
            onBack={() => navigate('/home')}
            onBrowseMenu={() => navigate('/menu')}
          />
        )}

        {currentRoute === '/notifications' && (
          <NotificationsPage
            onBack={() => navigate('/home')}
            onSelectOrder={(id) => {
              setSelectedOrderId(id);
              navigate('/queue');
            }}
          />
        )}

        {currentRoute === '/profile' && (
          <ProfilePage
            onNavigate={(route) => navigate(route)}
            onLogout={async () => {
              await logout();
              navigate('/home');
            }}
          />
        )}
      </main>

      {/* Fixed Bottom Navigation (hidden during checkout) */}
      {currentRoute !== '/checkout' && (
        <BottomNav
          currentRoute={currentRoute}
          onNavigate={(route) => {
            setSelectedOrderId(null);
            navigate(route);
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CanteenProvider>
        <MainAppContent />
      </CanteenProvider>
    </AuthProvider>
  );
}
