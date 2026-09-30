import React, { Component, ErrorInfo, ReactNode } from 'react';
import { UtensilsCrossed, RefreshCw, AlertTriangle, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isClearingCache: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    isClearingCache: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      isClearingCache: false,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[qBite ErrorBoundary] Uncaught runtime error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleClearCacheAndReload = async () => {
    this.setState({ isClearingCache: true });
    try {
      // 1. Unregister any service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.unregister();
        }
      }

      // 2. Clear caches storage
      if ('caches' in window) {
        const keys = await caches.keys();
        for (const key of keys) {
          await caches.delete(key);
        }
      }

      // 3. Clear session storage items
      try {
        sessionStorage.clear();
      } catch {
        // ignore
      }

      console.log('[qBite] Cache cleaned. Reloading...');
      window.location.href = '/home';
    } catch (err) {
      console.warn('[qBite] Error during cache clear:', err);
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#080808] text-white flex flex-col items-center justify-center p-6 text-center select-none">
          {/* Ambient Glow */}
          <div className="absolute w-72 h-72 rounded-full bg-[#FF6A00]/10 blur-[90px] pointer-events-none" />

          <div className="relative z-10 max-w-sm w-full mx-auto space-y-5">
            {/* Logo Badge */}
            <div className="w-16 h-16 rounded-3xl bg-[#141414] border border-[#FF6A00]/30 text-[#FF6A00] flex items-center justify-center mx-auto shadow-2xl glow-orange-sm">
              <UtensilsCrossed className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div className="space-y-1.5">
              <h1 className="text-xl font-black text-white tracking-tight">
                qBite couldn't load
              </h1>
              <p className="text-xs text-[#A1A1A1] leading-relaxed max-w-xs mx-auto">
                A display or connection issue prevented the app from loading properly. Your orders and account remain safe.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#FF6A00] hover:bg-[#FF7A00] active:scale-[0.98] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg glow-orange-sm transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 stroke-[2.5]" />
                <span>Reload App</span>
              </button>

              <button
                onClick={this.handleClearCacheAndReload}
                disabled={this.state.isClearingCache}
                className="w-full py-3 px-4 rounded-2xl bg-[#141414] hover:bg-[#1E1E1E] active:scale-[0.98] text-stone-300 hover:text-white border border-white/10 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-stone-400" />
                <span>{this.state.isClearingCache ? 'Clearing...' : 'Clear Cache & Restart'}</span>
              </button>
            </div>

            {/* Error detail for diagnosis */}
            {this.state.error && (
              <details className="mt-4 text-left bg-black/40 rounded-xl border border-white/5 p-3 text-[10px] text-stone-400 overflow-hidden">
                <summary className="font-bold text-stone-300 cursor-pointer flex items-center gap-1.5 select-none">
                  <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                  <span>Technical Diagnostics</span>
                </summary>
                <pre className="mt-2 text-rose-300/80 font-mono text-[9px] overflow-x-auto whitespace-pre-wrap">
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
