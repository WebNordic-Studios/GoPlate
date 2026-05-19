import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from './Button'

type Props = { children: ReactNode }
type State = { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('GoPlate error boundary:', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="gp-container flex min-h-[50vh] flex-col items-center justify-center py-16 text-center">
          <div className="font-display text-2xl font-semibold">Something went wrong</div>
          <p className="mt-2 max-w-md text-sm text-gp-charcoal/70">
            {this.state.error.message || 'An unexpected error occurred.'}
          </p>
          <Button
            variant="primary"
            className="mt-6"
            onClick={() => {
              this.setState({ error: null })
              window.location.href = '/'
            }}
          >
            Back to home
          </Button>
        </div>
      )
    }
    return this.props.children
  }
}
