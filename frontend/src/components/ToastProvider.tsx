import React, { createContext, useContext, useState, useCallback } from 'react'

type ToastVariant = 'success' | 'error' | 'info'

export type Toast = {
  id: number
  message: string
  variant: ToastVariant
}

type ToastContextValue = {
  showToast: (message: string, variant?: ToastVariant) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

type ToastProviderProps = {
  children: React.ReactNode
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback(
    (message: string, variant: ToastVariant = 'info') => {
      setToasts((current) => {
        const next: Toast = {
          id: Date.now(),
          message,
          variant,
        }
        return [...current, next]
      })

      // Auto-dismiss after 3 seconds
      setTimeout(() => {
        setToasts((current) => current.slice(1))
      }, 3000)
    },
    [],
  )

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed inset-x-0 top-4 z-50 flex justify-center px-4 pointer-events-none">
        <div className="w-full max-w-sm space-y-2">
          {toasts.map((toast) => {
            const base =
              'pointer-events-auto rounded-lg border px-4 py-2 text-xs shadow-lg backdrop-blur'
            const variantClass =
              toast.variant === 'success'
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100'
                : toast.variant === 'error'
                  ? 'border-red-500/40 bg-red-500/10 text-red-100'
                  : 'border-slate-500/40 bg-slate-800/80 text-slate-100'

            return (
              <div key={toast.id} className={`${base} ${variantClass}`}>
                {toast.message}
              </div>
            )
          })}
        </div>
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return ctx
}
