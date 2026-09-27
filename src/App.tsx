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
import { testFirestoreConnection } from './firebase/connectionTest';
import { safeSessionStorage } from './services/safeStorage';

function MainAppContent() {
  const { currentUser, loading: authLoading, logout } = useAuth();
  const { activeOrder } = useCanteen();

  const [hasShownSplash, setHasShownSplash] = useState<boolean>(() => {
    return safeSessionStorage.getItem('qbite_splash_done') === 'true';
  });
  const [currentRoute, setCurrentRoute] = useState<string>('/home');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

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
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  // Handle URL hash or path initialization (e.g. /display)
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/display') {
      setCurrentRoute('/display');
    }
  }, []);

  // 1. Splash Screen Display (Requirement 1: First 3 seconds)
  if (!hasShownSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  // 2. Authentication Gate: If not logged in and not on public TV display, show Welcome/Login Screen
  if (!currentUser && currentRoute !== '/display') {
    return <WelcomePage onLoginSuccess={() => setCurrentRoute('/home')} />;
  }

  // 3. Public TV Canteen Display (/display)
  if (currentRoute === '/display') {
    return <PublicDisplayPage onBack={() => setCurrentRoute('/home')} />;
  }

  // 4. Kitchen Staff Interface (/staff)
  if (currentRoute === '/staff') {
    return <StaffPage onBackToHome={() => setCurrentRoute('/home')} />;
  }

  // 5. Admin Interface (/admin)
  if (currentRoute === '/admin') {
    return <AdminPage onBackToHome={() => setCurrentRoute('/home')} />;
  }

  // Standard Student App Experience with Header & Bottom Navigation
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col justify-between">
      {/* Top Navbar */}
      <Navbar
        onOpenNotifications={() => setCurrentRoute('/notifications')}
        onNavigate={(route) => setCurrentRoute(route)}
        currentRoute={currentRoute}
      />

      {/* Main Page Routing */}
      <main className="flex-1">
        {currentRoute === '/home' && (
          <HomePage onNavigate={(route) => setCurrentRoute(route)} />
        )}

        {currentRoute === '/menu' && (
          <MenuPage />
        )}

        {currentRoute === '/cart' && (
          <CartPage
            onProceedToCheckout={() => setCurrentRoute('/checkout')}
            onBrowseMenu={() => setCurrentRoute('/menu')}
          />
        )}

        {currentRoute === '/checkout' && (
          <CheckoutPage
            onBack={() => setCurrentRoute('/cart')}
            onOrderSuccess={(order) => {
              setSelectedOrderId(order.id);
              setCurrentRoute('/queue');
            }}
          />
        )}

        {currentRoute === '/orders' && (
          <OrdersPage
            onSelectOrder={(id) => {
              setSelectedOrderId(id);
              setCurrentRoute('/queue');
            }}
            onBrowseMenu={() => setCurrentRoute('/menu')}
          />
        )}

        {currentRoute === '/queue' && (
          <TokenDetailPage
            orderId={selectedOrderId}
            onBack={() => setCurrentRoute('/home')}
            onBrowseMenu={() => setCurrentRoute('/menu')}
          />
        )}

        {currentRoute === '/favorites' && (
          <FavoritesPage
            onBack={() => setCurrentRoute('/home')}
            onBrowseMenu={() => setCurrentRoute('/menu')}
          />
        )}

        {currentRoute === '/notifications' && (
          <NotificationsPage
            onBack={() => setCurrentRoute('/home')}
            onSelectOrder={(id) => {
              setSelectedOrderId(id);
              setCurrentRoute('/queue');
            }}
          />
        )}

        {currentRoute === '/profile' && (
          <ProfilePage
            onNavigate={(route) => setCurrentRoute(route)}
            onLogout={async () => {
              await logout();
              setCurrentRoute('/home');
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
            setCurrentRoute(route);
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
