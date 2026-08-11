import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface NavLink {
  href: string
  label: string
}

interface NavItem {
  label: string
  href?: string
  links?: NavLink[]
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Главная', href: '#hero' },
  {
    label: 'Услуги',
    links: [
      { href: '#adults', label: 'Взрослым' },
      { href: '#kids', label: 'Детям' },
      { href: '#subscriptions', label: 'Абонементы' },
    ],
  },
  {
    label: 'Студия',
    links: [
      { href: '#team', label: 'Команда' },
      { href: '#gallery', label: 'Галерея' },
      { href: '#life', label: 'Жизнь' },
    ],
  },
  {
    label: 'Инфо',
    links: [
      { href: '#reviews', label: 'Отзывы' },
      { href: '#faq', label: 'FAQ' },
      { href: '#contacts', label: 'Контакты' },
    ],
  },
]

export function CardNav() {
  const reduced = useReducedMotion()

  const transition = reduced
    ? { duration: 0 }
    : { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] as const }

  return (
    <nav className="hidden gap-1 md:flex">
      {NAV_ITEMS.map((item) => {
        // Simple link (no dropdown)
        if (!item.links) {
          return (
            <a
              key={item.label}
              href={item.href}
              className="rounded-xl px-4 py-2 text-sm font-medium text-min-muted transition-colors hover:bg-white/5 hover:text-min-text"
            >
              {item.label}
            </a>
          )
        }

        // Dropdown group
        return (
          <DropdownMenu.Root key={item.label}>
            <DropdownMenu.Trigger asChild>
              <button
                className="flex items-center gap-1 rounded-xl px-4 py-2 text-sm font-medium text-min-muted transition-colors hover:bg-white/5 hover:text-min-text"
              >
                {item.label}
                <span className="text-xs">▾</span>
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="glass-surface z-[60] min-w-[180px] rounded-2xl p-2 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
                sideOffset={8}
                align="start"
                onCloseAutoFocus={(e) => e.preventDefault()}
              >
                <motion.div
                  initial={reduced ? undefined : { opacity: 0, y: -6, scale: 0.96 }}
                  animate={reduced ? undefined : { opacity: 1, y: 0, scale: 1 }}
                  transition={transition}
                >
                  {item.links.map((link) => (
                    <DropdownMenu.Item key={link.href} asChild>
                      <a
                        href={link.href}
                        className="block rounded-xl px-4 py-2.5 text-sm text-min-muted transition-colors hover:bg-white/5 hover:text-min-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-min-accent"
                      >
                        {link.label}
                      </a>
                    </DropdownMenu.Item>
                  ))}
                </motion.div>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        )
      })}
    </nav>
  )
}
