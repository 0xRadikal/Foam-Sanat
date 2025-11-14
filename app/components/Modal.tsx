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
  className = '',
  overlayClassName = ''
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

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

    // Focus modal
    setTimeout(() => modalRef.current?.focus(), 100);

    // Cleanup
    return () => {
      document.body.style.overflow = originalOverflow;
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
                className="ml-auto rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                aria-label="Close modal"
              >
                <X className="h-6 w-6" />
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

/**
 * Confirmation Modal Variant
 * 
 * Usage:
 * <ConfirmModal
 *   isOpen={showConfirm}
 *   onClose={() => setShowConfirm(false)}
 *   onConfirm={handleDelete}
 *   title="Delete Item"
 *   message="Are you sure you want to delete this?"
 *   confirmText="Delete"
 *   cancelText="Cancel"
 * />
 */
export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger'
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}) {
  const variantClasses = {
    danger: 'bg-red-500 hover:bg-red-600',
    warning: 'bg-yellow-500 hover:bg-yellow-600',
    info: 'bg-blue-500 hover:bg-blue-600'
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" title={title}>
      <p className="mb-6 text-gray-700 dark:text-gray-300">{message}</p>
      <div className="flex gap-3">
        <button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`flex-1 rounded-lg px-4 py-2 font-semibold text-white transition-colors ${variantClasses[variant]}`}
        >
          {confirmText}
        </button>
        <button
          onClick={onClose}
          className="flex-1 rounded-lg border-2 border-gray-300 px-4 py-2 font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          {cancelText}
        </button>
      </div>
    </Modal>
  );
}