import { useEffect, useCallback } from 'react'

interface ShortcutHandlers {
  onFocusInput?: () => void
  onSubmit?: () => void
  onToggleHistory?: () => void
  onOpenSettings?: () => void
  onCloseModal?: () => void
  onShowHelp?: () => void
  isModalOpen?: boolean
}

export function useKeyboardShortcuts({
  onFocusInput,
  onSubmit,
  onToggleHistory,
  onOpenSettings,
  onCloseModal,
  onShowHelp,
  isModalOpen = false,
}: ShortcutHandlers) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey
      const target = e.target as HTMLElement
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable

      // Escape: close modals
      if (e.key === 'Escape' && isModalOpen) {
        e.preventDefault()
        onCloseModal?.()
        return
      }

      // Don't trigger shortcuts when typing in inputs (except mod combos)
      if (isInput && !isMod) return

      // Ctrl/Cmd + V: Focus URL input
      if (isMod && e.key === 'v' && !isInput) {
        e.preventDefault()
        onFocusInput?.()
        return
      }

      // Ctrl/Cmd + Enter: Submit URL
      if (isMod && e.key === 'Enter') {
        e.preventDefault()
        onSubmit?.()
        return
      }

      // Ctrl/Cmd + H: Toggle history
      if (isMod && e.key === 'h') {
        e.preventDefault()
        onToggleHistory?.()
        return
      }

      // Ctrl/Cmd + ,: Open settings
      if (isMod && e.key === ',') {
        e.preventDefault()
        onOpenSettings?.()
        return
      }

      // ?: Show shortcut help (only when not typing)
      if (e.key === '?' && !isInput) {
        e.preventDefault()
        onShowHelp?.()
        return
      }
    },
    [
      onFocusInput,
      onSubmit,
      onToggleHistory,
      onOpenSettings,
      onCloseModal,
      onShowHelp,
      isModalOpen,
    ]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

export function isMac(): boolean {
  return navigator.platform.startsWith('Mac') || navigator.userAgent.includes('Mac')
}

export function modKey(): string {
  return isMac() ? '⌘' : 'Ctrl'
}
