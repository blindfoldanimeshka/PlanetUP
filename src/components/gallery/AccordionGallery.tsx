import { useState, useRef, useCallback, type ReactNode } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface AccordionItem {
  image: string
  label: string
  link?: string
}

interface AccordionGalleryProps {
  items: AccordionItem[]
  defaultIndex?: number
  expandRatio?: number
  trigger?: 'hover' | 'click'
  accentColor?: string
  overlayColor?: string
  textColor?: string
  grayscale?: boolean
  showLabels?: boolean
  duration?: number
  ease?: string
  parallax?: number
  tilt?: number
  stagger?: number
  height?: number
  gap?: number
  radius?: number
  orientation?: 'horizontal' | 'vertical'
  /** Called when a panel is clicked (click trigger) or tapped. Use for custom actions like lightbox. */
  onSelect?: (index: number) => void
  children?: ReactNode
}

const easeMap: Record<string, [number, number, number, number]> = {
  'power3.out': [0.22, 1, 0.36, 1],
  'power2.out': [0.25, 0.1, 0.25, 1],
  'easeOut': [0, 0, 0.58, 1],
  'linear': [0, 0, 1, 1],
}

function parseEase(ease: string): [number, number, number, number] {
  return easeMap[ease] ?? [0.22, 1, 0.36, 1]
}

export function AccordionGallery({
  items,
  defaultIndex = 0,
  expandRatio = 0.5,
  trigger = 'hover',
  accentColor = '#A855F7',
  overlayColor = 'rgba(10, 0, 16, 0.45)',
  textColor = '#ffffff',
  grayscale = true,
  showLabels = true,
  duration = 0.6,
  ease = 'power3.out',
  parallax = 0.5,
  tilt = 8,
  stagger = 0.06,
  height = 460,
  gap = 10,
  radius = 16,
  orientation = 'horizontal',
  onSelect,
}: AccordionGalleryProps) {
  const reduced = useReducedMotion()
  const [activeIndex, setActiveIndex] = useState(defaultIndex)
  const containerRef = useRef<HTMLDivElement>(null)

  const durationSec = reduced ? 0 : duration
  const bezier = parseEase(ease)

  const handleEnter = useCallback(
    (index: number) => {
      if (trigger === 'hover') setActiveIndex(index)
    },
    [trigger],
  )

  const handleClick = useCallback(
    (index: number, link?: string) => {
      if (trigger === 'click') {
        setActiveIndex(index)
      }
      // Prefer custom handler, fall back to link navigation
      if (onSelect) {
        onSelect(index)
      } else if (link) {
        window.open(link, '_blank', 'noopener')
      }
    },
    [trigger, onSelect],
  )

  const isActive = (index: number) => index === activeIndex

  return (
    <div
      ref={containerRef}
      className="flex w-full"
      style={{
        height,
        gap,
        flexDirection: orientation === 'vertical' ? 'column' : 'row',
      }}
    >
      {items.map((item, index) => (
        <AccordionPanel
          key={index}
          item={item}
          index={index}
          isActive={isActive(index)}
          onEnter={() => handleEnter(index)}
          onClick={() => handleClick(index, item.link)}
          accentColor={accentColor}
          overlayColor={overlayColor}
          textColor={textColor}
          grayscale={grayscale}
          showLabel={showLabels}
          duration={durationSec}
          bezier={bezier}
          parallax={parallax}
          tilt={tilt}
          stagger={stagger}
          radius={radius}
          expandRatio={expandRatio}
        />
      ))}
    </div>
  )
}

interface AccordionPanelProps {
  item: AccordionItem
  index: number
  isActive: boolean
  onEnter: () => void
  onClick: () => void
  accentColor: string
  overlayColor: string
  textColor: string
  grayscale: boolean
  showLabel: boolean
  duration: number
  bezier: [number, number, number, number]
  parallax: number
  tilt: number
  stagger: number
  radius: number
  expandRatio: number
}

function AccordionPanel({
  item,
  index,
  isActive,
  onEnter,
  onClick,
  accentColor,
  overlayColor,
  textColor,
  grayscale,
  showLabel,
  duration,
  bezier,
  parallax,
  tilt,
  stagger,
  radius,
  expandRatio,
}: AccordionPanelProps) {
  const ref = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [tilt, -tilt]), {
    stiffness: 300,
    damping: 30,
  })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-tilt, tilt]), {
    stiffness: 300,
    damping: 30,
  })

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    mouseX.set(x)
    mouseY.set(y)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  const flexGrow = isActive ? Math.round(1 + expandRatio * 4) : 1

  return (
    <motion.div
      ref={ref}
      className="relative cursor-pointer overflow-hidden"
      style={{
        flexGrow,
        flexBasis: 0,
        borderRadius: radius,
        rotateX: isActive ? rotateX : 0,
        rotateY: isActive ? rotateY : 0,
        transformStyle: 'preserve-3d',
        transition: `flex-grow ${duration}s cubic-bezier(${bezier.join(',')})`,
      }}
      onMouseEnter={onEnter}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      role="button"
      tabIndex={0}
      aria-label={item.label}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
    >
      {/* Image layer with parallax */}
      <motion.div
        className="absolute inset-0"
        style={{
          scale: isActive ? 1 + parallax * 0.05 : 1,
          transition: `transform ${duration}s cubic-bezier(${bezier.join(',')})`,
        }}
      >
        <img
          src={item.image}
          alt={item.label}
          className="h-full w-full object-cover"
          style={{
            filter: grayscale && !isActive ? 'grayscale(80%)' : 'grayscale(0%)',
            transition: `filter ${duration}s ease`,
          }}
          loading="lazy"
        />
      </motion.div>

      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: overlayColor,
          opacity: isActive ? 0.3 : 0.6,
          transition: `opacity ${duration}s ease`,
        }}
      />

      {/* Label */}
      {showLabel && (
        <div
          className="absolute inset-0 flex items-end p-5"
          style={{ color: textColor }}
        >
          <motion.span
            className="text-lg font-semibold tracking-wide"
            initial={false}
            animate={{
              opacity: isActive ? 1 : 0.7,
              y: isActive ? 0 : 4,
            }}
            transition={{ duration: duration * 0.6, delay: isActive ? stagger * index : 0 }}
          >
            {item.label}
          </motion.span>
        </div>
      )}

      {/* Active accent border */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{
          border: `2px solid ${accentColor}`,
          opacity: isActive ? 1 : 0,
          transition: `opacity ${duration}s ease`,
        }}
      />
    </motion.div>
  )
}
