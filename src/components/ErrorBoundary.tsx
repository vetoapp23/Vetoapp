import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-8">
          <div className="max-w-2xl bg-white p-8 rounded-lg shadow-lg border border-red-200">
            <h1 className="text-2xl font-bold text-red-800 mb-4">
              🚨 Erreur dans l'application
            </h1>
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-red-700 mb-2">Erreur :</h2>
                <pre className="bg-red-100 p-4 rounded text-sm text-red-800 overflow-auto">
                  {this.state.error?.toString()}
                </pre>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold text-red-700 mb-2">Stack Trace :</h2>
                <pre className="bg-gray-100 p-4 rounded text-sm text-gray-800 overflow-auto max-h-64">
                  {this.state.errorInfo?.componentStack}
                </pre>
              </div>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => window.location.reload()} 
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Recharger la page
                </button>
                <button 
                  onClick={() => window.history.back()} 
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                  Retour
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
