import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export function AppShell({
  children,
  footer = true
}: Readonly<{ children: React.ReactNode; footer?: boolean }>) {
  return (
    <>
      <SiteHeader />
      {children}
      {footer ? <SiteFooter /> : null}
    </>
  );
}
