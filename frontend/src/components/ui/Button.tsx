interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'ghost'
  onClick?: () => void
  className?: string
}

export default function Button({ children, variant = 'primary', onClick, className = '' }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        font-sans font-semibold rounded-md transition-all duration-200
        ${variant === 'primary'
          ? 'bg-gold text-canvas px-7 py-3 hover:opacity-90'
          : 'bg-transparent text-body border border-border px-6 py-3 hover:border-muted hover:text-white'
        }
        ${className}
      `}
    >
      {children}
    </button>
  )
}