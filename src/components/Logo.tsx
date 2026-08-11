import { cn } from '@/lib/cn'

type LogoProps = {
  className?: string
  showWordmark?: boolean
  size?: number
}

export function Logo({ className, showWordmark = true, size = 48 }: LogoProps) {
  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden="true"
        className="text-min-accent"
      >
        {/* Planet */}
        <circle
          cx="24"
          cy="24"
          r="14"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        {/* Ring */}
        <ellipse
          cx="24"
          cy="24"
          rx="22"
          ry="8"
          stroke="currentColor"
          strokeWidth="1"
          transform="rotate(-20 24 24)"
        />
        {/* Small accent star */}
        <circle cx="38" cy="10" r="2" fill="currentColor" />
      </svg>
      {showWordmark && (
        <span className="font-display text-xl font-bold tracking-tight text-min-text md:text-2xl">
          Планета UP
        </span>
      )}
    </div>
  )
}
