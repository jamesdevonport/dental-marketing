import Link from "next/link";

export const metadata = { title: "Meta — Connecting…" };

export default function MetaCallbackPage() {
  return (
    <div className="space-y-4 rounded-lg border bg-card p-6 shadow-sm text-center">
      <div className="mx-auto h-8 w-8 animate-pulse rounded-full bg-primary/20" />
      <h1 className="text-base font-semibold">Connecting Meta…</h1>
      <p className="text-sm text-muted-foreground">
        This page handles the OAuth callback. In the real app, we exchange the
        code for tokens and redirect back to the client workspace.
      </p>
      <Link href="/dashboard" className="text-sm underline underline-offset-4">
        Back to dashboard
      </Link>
    </div>
  );
}
