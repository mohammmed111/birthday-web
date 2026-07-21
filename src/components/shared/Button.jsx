import React from 'react'

const variants = {
  primary: [
    'btn-primary font-semibold',
  ],
  secondary: [
    'bg-surface text-textMain font-medium',
    'hover:bg-surface/80 active:scale-95',
    'shadow-md',
    'border border-muted',
  ],
  inverted: [
    'bg-surface/50 text-textMain font-medium',
    'hover:bg-surface active:scale-95',
    'border border-muted',
  ],
  outlined: [
    'bg-transparent text-secondary font-medium',
    'hover:bg-secondary/10 active:scale-95',
    'border border-secondary',
  ],
  danger: [
    'bg-red-800/30 text-red-300 font-medium',
    'hover:bg-red-700/40 active:scale-95',
    'border border-red-500/40',
  ],
}

const sizes = {
  sm: 'px-4 py-2 text-sm rounded-xl gap-1.5',
  md: 'px-6 py-3 text-base rounded-2xl gap-2',
  lg: 'px-8 py-4 text-lg rounded-2xl gap-2.5',
}

/**
 * Button component with 5 variants: primary, secondary, inverted, outlined, danger
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconEnd,
  disabled = false,
  loading = false,
  className = '',
  'aria-label': ariaLabel,
  ...props
}) {
  const variantClasses = (variants[variant] || variants.secondary).join(' ')
  const sizeClasses = sizes[size] || sizes.md

  return (
    <button
      aria-label={ariaLabel}
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center',
        'transition-all duration-200 ease-out',
        'cursor-pointer select-none',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        disabled || loading ? 'opacity-50 cursor-not-allowed pointer-events-none' : '',
        variantClasses,
        sizeClasses,
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin w-4 h-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none" viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon ? (
        <span className="flex-shrink-0 flex items-center" aria-hidden="true">{icon}</span>
      ) : null}

      {children && <span>{children}</span>}

      {iconEnd && !loading && (
        <span className="flex-shrink-0 flex items-center rtl:rotate-180" aria-hidden="true">{iconEnd}</span>
      )}
    </button>
  )
}
