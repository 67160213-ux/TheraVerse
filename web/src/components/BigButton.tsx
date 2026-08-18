import { ButtonHTMLAttributes } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'gold' | 'danger' | 'ghost'
  full?: boolean
}

const variants: Record<string, string> = {
  primary: 'bg-pine-700 text-white hover:bg-pine-900 active:bg-pine-900',
  gold: 'bg-gold-400 text-ink hover:bg-gold-600 active:bg-gold-600',
  danger: 'bg-vital-danger text-white hover:brightness-95',
  ghost: 'bg-white text-pine-700 border-2 border-pine-300 hover:bg-pine-50',
}

export default function BigButton({ variant = 'primary', full = true, className = '', children, ...rest }: Props) {
  return (
    <button
      {...rest}
      className={`min-h-[80px] min-w-[80px] rounded-2xl font-display font-semibold text-lg px-6 shadow-card transition
        disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]} ${full ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  )
}
