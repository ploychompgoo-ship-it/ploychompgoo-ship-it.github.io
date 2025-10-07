import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 text-white flex items-center justify-center p-8">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 max-w-lg text-center">
            <h1 className="text-2xl font-bold text-red-400 mb-4">เกิดข้อผิดพลาด</h1>
            <p className="text-gray-300 mb-4">
              Dashboard ไม่สามารถโหลดได้ กรุณาลองรีเฟรชหน้าใหม่
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              รีเฟรชหน้า
            </button>
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm text-gray-400">
                รายละเอียดข้อผิดพลาด
              </summary>
              <pre className="mt-2 text-xs text-red-300 bg-black/20 p-2 rounded overflow-auto">
                {this.state.error?.toString()}
              </pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;