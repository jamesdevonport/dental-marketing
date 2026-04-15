import Link from "next/link";
import { clientById } from "@/lib/fixtures";
import { CURRENT_PORTAL_CLIENT_ID } from "@/lib/portal";

export default function ClientPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // In the real build, the practice signed-in via magic link determines branding.
  // Wireframe hardcodes via src/lib/portal.ts — swap there to preview another practice.
  const client = clientById[CURRENT_PORTAL_CLIENT_ID];

  const navItems: { href: string; label: string }[] = [
    { href: "/portal", label: "Home" },
    { href: "/portal/creatives", label: "Creatives" },
    { href: "/portal/performance", label: "Performance" },
    { href: "/portal/approvals", label: "Approvals" },
  ];

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 md:px-6">
          <Link href="/portal" className="flex items-center gap-2">
            <div
              className="grid h-7 w-7 place-items-center rounded-md text-xs font-semibold text-white"
              style={{ backgroundColor: client.brand.primary }}
            >
              {client.logoInitials}
            </div>
            <span className="text-sm font-semibold tracking-tight">{client.name}</span>
          </Link>
          <Link
            href="/dashboard"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Back to agency view
          </Link>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-5 px-4 md:px-6 text-sm">
          {navItems.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="border-b-2 border-transparent py-2.5 text-muted-foreground hover:text-foreground hover:border-muted-foreground"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6 md:px-6 md:py-10">{children}</main>
    </div>
  );
}
