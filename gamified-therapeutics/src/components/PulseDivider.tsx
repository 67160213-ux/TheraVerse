interface Props {
  color?: string
  className?: string
}

/**
 * Signature element: a heartbeat trace used as a section divider across the app.
 * It's not decoration — it's the same shape the safety system watches, appearing
 * quietly everywhere the app wants to remind the user this is a medical product
 * wearing a game's clothes, not the other way around.
 */
export default function PulseDivider({ color = '#0F5C56', className = '' }: Props) {
  return (
    <svg
      viewBox="0 0 400 24"
      className={`pulse-divider w-full h-6 ${className}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M0 12 H150 L165 2 L180 22 L195 6 L205 18 L220 12 H400"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-pulseLine"
      />
    </svg>
  )
}
