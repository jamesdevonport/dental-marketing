import Link from "next/link";

export const metadata = { title: "Google — Connecting…" };

export default function GoogleCallbackPage() {
  return (
    <div className="space-y-4 rounded-lg border bg-card p-6 shadow-sm text-center">
      <div className="mx-auto h-8 w-8 animate-pulse rounded-full bg-primary/20" />
      <h1 className="text-base font-semibold">Connecting Google Ads…</h1>
      <p className="text-sm text-muted-foreground">
        OAuth callback handler. The real app exchanges the code and redirects
        to the client workspace.
      </p>
      <Link href="/dashboard" className="text-sm underline underline-offset-4">
        Back to dashboard
      </Link>
    </div>
  );
}
