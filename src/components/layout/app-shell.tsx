import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { MobileNav } from "@/components/layout/mobile-nav"

export function AppShell({
  children,
  footer = true,
}: Readonly<{ children: React.ReactNode; footer?: boolean }>) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-surface-strong focus:px-4 focus:py-2 focus:text-sm focus:shadow-md"
      >
        Pular para o conteúdo
      </a>
      <SiteHeader />
      <main id="main-content" className="pb-16 md:pb-0">
        {children}
      </main>
      {footer ? <SiteFooter /> : null}
      <MobileNav />
    </>
  )
}
