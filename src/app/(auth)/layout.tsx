import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4 py-10">
        <Link href="/dashboard" className="mb-8 flex items-center gap-2 self-start">
          <div className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground text-xs font-semibold">
            DM
          </div>
          <span className="text-sm font-semibold tracking-tight">Dental Marketing</span>
        </Link>
        {children}
      </div>
    </div>
  );
}
