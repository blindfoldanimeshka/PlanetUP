import type { SiteSettings } from '@/types/cms'

export function Footer({ settings, tagline = 'Планета UP' }: { settings: SiteSettings; tagline?: string }) {
  return (
    <div className="glass-surface rounded-t-3xl">
      <footer className="px-4 py-12 text-min-muted">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-lg font-bold text-min-text">
            {tagline}
          </p>
          {settings.address && (
            <p className="mt-1 text-sm">{settings.address}</p>
          )}
          {settings.phone && (
            <p className="mt-1 text-sm">{settings.phone}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          {settings.social.vk && (
            <a
              href={settings.social.vk}
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-min-accent"
            >
              VK
            </a>
          )}
          {settings.social.telegram && (
            <a
              href={settings.social.telegram}
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-min-accent"
            >
              Telegram
            </a>
          )}
          {settings.social.whatsapp && (
            <a
              href={settings.social.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-min-accent"
            >
              WhatsApp
            </a>
          )}
          <a href="/privacy" className="transition-colors hover:text-min-accent">
            Политика
          </a>
        </div>
        </div>
      </footer>
    </div>
  )
}
