// app/components/Modal.tsx
// ✅ REFACTOR #3: Reusable modal component to eliminate duplication
'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnEscape?: boolean;
  closeOnBackdrop?: boolean;
  closeLabel?: string;
  className?: string;
  overlayClassName?: string;
}

/**
 * Reusable Modal Component
 * 
 * Features:
 * - Focus trap
 * - Escape key to close
 * - Click outside to close
 * - Body scroll lock
 * - Accessibility (ARIA)
 * - Memory leak prevention
 */
export default function Modal({
  isOpen,
  onClose,
  children,
  title,
  size = 'md',
  showCloseButton = true,
  closeOnEscape = true,
  closeOnBackdrop = true,
  closeLabel = 'Close',
  className = '',
  overlayClassName = ''
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  // Size mappings
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full mx-4'
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;

    // Save original overflow
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Cleanup
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedElement.current = document.activeElement as HTMLElement | null;

    const modalElement = modalRef.current;
    if (!modalElement) return;

    const focusable = modalElement.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusable[0] ?? modalElement;
    const lastFocusable = focusable[focusable.length - 1] ?? firstFocusable;

    firstFocusable.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      if (focusable.length === 0) {
        event.preventDefault();
        modalElement.focus();
        return;
      }

      const active = document.activeElement as HTMLElement | null;
      if (event.shiftKey) {
        if (active === firstFocusable || active === modalElement) {
          event.preventDefault();
          lastFocusable.focus();
        }
      } else if (active === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
      }
    };

    modalElement.addEventListener('keydown', handleKeyDown);

    return () => {
      modalElement.removeEventListener('keydown', handleKeyDown);
      previouslyFocusedElement.current?.focus();
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  // Prevent scroll propagation
  const handleModalScroll = (e: React.WheelEvent) => {
    e.stopPropagation();
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 ${overlayClassName}`}
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`relative my-8 w-full ${sizeClasses[size]} rounded-3xl bg-white dark:bg-gray-800 shadow-2xl transition-all ${className}`}
        onClick={(e) => e.stopPropagation()}
        onWheel={handleModalScroll}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            {title && (
              <h2
                id="modal-title"
                className="text-2xl font-bold text-gray-900 dark:text-gray-100"
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="ml-auto inline-flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                aria-label="Close modal"
              >
                <X className="h-6 w-6" />
                <span className="text-sm font-semibold">{closeLabel}</span>
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
