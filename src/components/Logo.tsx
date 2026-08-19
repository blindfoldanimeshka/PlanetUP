import { cn } from '@/lib/cn'

type LogoProps = {
  className?: string
  showWordmark?: boolean
  size?: number
  /** Использовать оригинальный растровый логотип вместо SVG-планеты (для тёмного фона) */
  src?: string
}

export function Logo({ className, showWordmark = true, size = 48, src }: LogoProps) {
  if (src) {
    return (
      <div className={cn('flex flex-col items-center gap-2', className)}>
        <img
          src={src}
          alt="Планета UP — студия акробатики"
          className="w-auto select-none object-contain"
          style={{ height: size }}
        />
        {showWordmark && (
          <span className="font-display text-xl font-bold tracking-tight text-min-text md:text-2xl">
            Планета UP
          </span>
        )}
      </div>
    )
  }

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
