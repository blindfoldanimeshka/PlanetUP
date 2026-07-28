import type { SiteSettings } from '@/types/cms'

export function Footer({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="bg-cosmic-bg px-4 py-10 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-lg font-bold">
            Планета <span className="text-cosmic-accent-2">UP</span>
          </p>
          <p className="mt-1 text-sm text-white/70">{settings.address}</p>
          <p className="mt-1 text-sm text-white/70">{settings.phone}</p>
        </div>
        <div className="flex gap-4 text-sm">
          <a
            href={settings.social.vk}
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-cosmic-accent-2"
          >
            VK
          </a>
          <a
            href={settings.social.telegram}
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-cosmic-accent-2"
          >
            Telegram
          </a>
          <a
            href={settings.social.whatsapp}
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-cosmic-accent-2"
          >
            WhatsApp
          </a>
          <a href="/privacy" className="text-white/70 transition-colors hover:text-cosmic-accent-2">
            Политика
          </a>
        </div>
      </div>
    </footer>
  )
}
