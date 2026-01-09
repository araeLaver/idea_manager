import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';

interface Props {
  children: ReactNode;
  routeKey?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Route-level ErrorBoundary that isolates errors to individual routes.
 * Automatically resets when the routeKey changes (navigation).
 */
export class RouteErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('Route Error:', error);
      console.error('Component Stack:', errorInfo.componentStack);
    }
  }

  componentDidUpdate(prevProps: Props) {
    // Reset error state when route changes
    if (prevProps.routeKey !== this.props.routeKey && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleGoBack = () => {
    window.history.back();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex-1 flex items-center justify-center p-6"
          style={{ backgroundColor: 'var(--bg-base)' }}
        >
          <div
            className="max-w-md w-full p-8 rounded-xl text-center"
            style={{
              backgroundColor: 'var(--bg-surface)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div
              className="w-14 h-14 mx-auto mb-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-error-50)' }}
            >
              <AlertTriangle
                className="w-7 h-7"
                style={{ color: 'var(--color-error-500)' }}
              />
            </div>

            <h2
              className="text-xl font-semibold mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              페이지를 표시할 수 없습니다
            </h2>

            <p
              className="text-sm mb-6"
              style={{ color: 'var(--text-secondary)' }}
            >
              이 페이지에서 오류가 발생했습니다. 다시 시도하거나 이전 페이지로 돌아가주세요.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <div
                className="mb-6 p-3 rounded-lg text-left"
                style={{
                  backgroundColor: 'var(--color-error-50)',
                  border: '1px solid var(--color-error-200)'
                }}
              >
                <p
                  className="text-xs font-mono break-all"
                  style={{ color: 'var(--color-error-700)' }}
                >
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleGoBack}
                className="btn btn-secondary flex items-center gap-2"
                style={{ padding: 'var(--space-3) var(--space-4)' }}
              >
                <ArrowLeft className="w-4 h-4" />
                이전으로
              </button>

              <button
                onClick={this.handleRetry}
                className="btn btn-primary flex items-center gap-2"
                style={{ padding: 'var(--space-3) var(--space-4)' }}
              >
                <RefreshCw className="w-4 h-4" />
                다시 시도
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC to wrap a component with RouteErrorBoundary
 */
export function withRouteErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function WithRouteErrorBoundary(props: P) {
    return (
      <RouteErrorBoundary>
        <WrappedComponent {...props} />
      </RouteErrorBoundary>
    );
  };
}
