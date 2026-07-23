import { ErrorBoundary as ReactErrorBoundary, FallbackProps } from 'react-error-boundary'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { Button } from './ui/button'

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <div className="w-full max-w-md">
        <Alert variant="destructive">
          <AlertTitle className="text-lg font-semibold mb-2">
            Something went wrong
          </AlertTitle>
          <AlertDescription className="space-y-4">
            <p className="text-sm">{String(error)}</p>
            <div className="flex gap-2">
              <Button
                onClick={resetErrorBoundary}
                variant="outline"
                size="sm"
              >
                Try again
              </Button>
              <Button
                onClick={() => window.location.href = '/'}
                variant="ghost"
                size="sm"
              >
                Go home
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}

interface ErrorBoundaryProps {
  children: React.ReactNode
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        // Log to error reporting service
        console.error('Error caught by boundary:', error, errorInfo)
      }}
      onReset={() => {
        // Reset app state here if needed
        window.location.href = '/'
      }}
    >
      {children}
    </ReactErrorBoundary>
  )
}
