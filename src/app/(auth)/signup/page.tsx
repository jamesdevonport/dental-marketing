import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata = { title: "Sign up" };

export default function SignupPage() {
  return (
    <div className="space-y-6 rounded-lg border bg-card p-6 shadow-sm">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold tracking-tight">Create account</h1>
        <p className="text-sm text-muted-foreground">
          Agency signup is invite-only during the Meta App Review period.
        </p>
      </div>
      <form className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="invite">Invite code</Label>
          <Input id="invite" placeholder="Paste your invite code" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" />
        </div>
        <Button className="w-full" type="button" asChild>
          <Link href="/dashboard">Continue</Link>
        </Button>
      </form>
      <p className="text-center text-xs text-muted-foreground">
        Already have an account? <Link href="/login" className="text-foreground underline underline-offset-4">Log in</Link>.
      </p>
    </div>
  );
}
