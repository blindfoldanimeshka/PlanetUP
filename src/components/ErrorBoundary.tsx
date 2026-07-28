import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="min-h-screen flex items-center justify-center bg-cosmic-bg text-white p-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Что-то пошло не так</h1>
              <p className="text-light-muted mb-6">
                Пожалуйста, обновите страницу или вернитесь позже.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-cosmic-accent-2 text-white rounded-md transition-colors hover:bg-cosmic-accent"
              >
                Обновить страницу
              </button>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}
