import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log sanitized error diagnostic to console without exposing secrets
    console.error('[ErrorBoundary caught error]', error.name, error.message, errorInfo.componentStack);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.href = (import.meta as any).env?.BASE_URL || '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[70vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-paper-400 shadow-editorial space-y-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase text-stone-500 tracking-wider">
                RUNTIME EXCEPTION
              </span>
              <h2 className="text-2xl font-display font-bold text-ink-900">
                Temporary Display Issue
              </h2>
              <p className="text-xs text-ink-600 font-sans leading-relaxed">
                An unexpected component rendering state occurred. No portfolio data was compromised.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-paper-100 hover:bg-paper-200 border border-paper-300 text-ink-900 text-xs font-sans font-semibold uppercase tracking-wider transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>

              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-ink-900 hover:bg-ink-800 text-paper-100 text-xs font-sans font-semibold uppercase tracking-wider transition-all"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
