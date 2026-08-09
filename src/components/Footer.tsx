import type { SiteSettings } from '@/types/cms'

export function Footer({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="neu-raised rounded-t-3xl px-4 py-12 text-min-muted">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-lg font-bold text-min-text">
            Планета UP
          </p>
          <p className="mt-1 text-sm">{settings.address}</p>
          <p className="mt-1 text-sm">{settings.phone}</p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <a
            href={settings.social.vk}
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-min-accent"
          >
            VK
          </a>
          <a
            href={settings.social.telegram}
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-min-accent"
          >
            Telegram
          </a>
          <a
            href={settings.social.whatsapp}
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-min-accent"
          >
            WhatsApp
          </a>
          <a href="/privacy" className="transition-colors hover:text-min-accent">
            Политика
          </a>
        </div>
      </div>
    </footer>
  )
}
