import { ButtonHTMLAttributes } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'gold' | 'action' | 'lime' | 'cyan' | 'danger' | 'ghost'
  full?: boolean
}

const variants: Record<string, string> = {
  primary: 'bg-medical-700 text-white hover:bg-medical-500 active:bg-medical-900 shadow-card',
  gold: 'bg-action-orange text-white hover:bg-action-600 active:bg-action-600 shadow-neon-orange',
  action: 'bg-action-orange text-white hover:bg-action-600 active:bg-action-600 shadow-neon-orange',
  lime: 'bg-action-lime text-navy-900 font-bold hover:brightness-105 active:brightness-95 shadow-neon-cyan',
  cyan: 'bg-cyan-400 text-navy-900 font-bold hover:bg-cyan-500 active:bg-cyan-500 shadow-neon-cyan',
  danger: 'bg-magenta-500 text-white hover:bg-magenta-600 active:bg-magenta-600 shadow-neon-pink',
  ghost: 'bg-white text-medical-700 border-2 border-medical-300 hover:bg-medical-50',
}

export default function BigButton({ variant = 'primary', full = true, className = '', children, ...rest }: Props) {
  return (
    <button
      {...rest}
      className={`min-h-[64px] rounded-2xl font-display font-semibold text-lg px-6 transition duration-150 transform active:scale-[0.98]
        disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant] || variants.primary} ${full ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  )
}

