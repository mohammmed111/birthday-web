import React from 'react'

/**
 * SearchInput — rounded-full search field matching brand identity
 */
export default function SearchInput({
  value,
  onChange,
  placeholder = 'ابحث...',
  className = '',
  id,
  ...props
}) {
  return (
    <div className={`relative flex items-center ${className}`}>
      {/* Search icon */}
      <span className="absolute end-4 text-tertiary/50 pointer-events-none" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </span>
      <input
        id={id}
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={[
          'w-full pe-12 ps-5 py-3',
          'bg-primary-950/60 backdrop-blur-sm',
          'border border-primary-700/40',
          'text-tertiary placeholder:text-tertiary/40',
          'font-label text-sm',
          'rounded-full',
          'focus:outline-none focus:border-secondary/60 focus:ring-1 focus:ring-secondary/30',
          'transition-all duration-200',
        ].join(' ')}
        {...props}
      />
    </div>
  )
}
