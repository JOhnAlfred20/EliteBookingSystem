import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface Props { children: ReactNode; fallback?: ReactNode }
interface State { hasError: boolean; error?: Error }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen bg-surface flex items-center justify-center p-4">
          <div className="border border-ghost-border p-6 bg-black text-center max-w-md !py-16">
            <span className="material-symbols-outlined text-6xl text-error/50 block mb-4">error</span>
            <h1 className="text-2xl font-black font-headline text-on-surface mb-2">حدث خطأ غير متوقع</h1>
            <p className="text-on-surface-variant mb-6">
              عذراً، حدث خطأ أثناء تحميل الصفحة. يرجى المحاولة مرة أخرى.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => this.setState({ hasError: false })}
                className="btn-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">refresh</span>
                إعادة المحاولة
              </button>
              <a href="/dashboard" className="btn-secondary flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">home</span>
                الرئيسية
              </a>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <pre className="mt-6 text-xs text-error bg-error/5 p-4 rounded-2xl text-left overflow-x-auto">
                {this.state.error.message}
              </pre>
            )}
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
