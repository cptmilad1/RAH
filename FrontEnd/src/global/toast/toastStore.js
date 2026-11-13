import { create } from 'zustand'

let nextToastId = 0

const addToast = (type, message, options = {}) => {
  const toast = {
    id: ++nextToastId,
    type,
    message,
    values: options.values || {},
    duration: options.duration || 5000,
  }

  useToastStore.setState((state) => ({
    toasts: [...state.toasts.slice(-3), toast],
  }))

  return toast.id
}

export const useToastStore = create(() => ({ toasts: [] }))

export const dismissToast = (id) => {
  useToastStore.setState((state) => ({
    toasts: state.toasts.filter((toast) => toast.id !== id),
  }))
}

export const toast = {
  success: (message, options) => addToast('success', message, options),
  error: (message, options) => addToast('error', message, options),
  info: (message, options) => addToast('info', message, options),
  warning: (message, options) => addToast('warning', message, options),
}
