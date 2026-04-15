import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <div className="space-y-6 rounded-lg border bg-card p-6 shadow-sm">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold tracking-tight">Log in</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back to Dental Marketing.
        </p>
      </div>
      <form className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@agency.co.uk" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" />
        </div>
        <Button className="w-full" type="button" asChild>
          <Link href="/dashboard">Log in</Link>
        </Button>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
          <span className="bg-card px-2 text-muted-foreground">or</span>
        </div>
      </div>
      <Button variant="outline" className="w-full" type="button" asChild>
        <Link href="/dashboard">Continue with Google</Link>
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Agency access only. Dental practice clients are invited by email.
      </p>
    </div>
  );
}
