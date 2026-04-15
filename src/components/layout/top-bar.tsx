import Link from "next/link";
import { Bell, Search } from "lucide-react";
import { ClientSwitcher } from "./client-switcher";
import { AgentPill } from "./agent-pill";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { team } from "@/lib/fixtures";

export function TopBar() {
  const owner = team.find((m) => m.role === "owner") ?? team[0];

  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-16 items-center gap-4 px-4 md:px-6">
        <div className="min-w-0 flex flex-1 items-center">
          <div className="relative w-full max-w-xl">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search clients, campaigns, creatives…"
              className="h-10 border-transparent bg-muted/50 pl-8 shadow-none focus-visible:border-input focus-visible:bg-background"
            />
          </div>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <ClientSwitcher />
          <AgentPill />
          <div className="ml-1 flex items-center gap-2 border-l pl-3">
            <button
              type="button"
              className="grid h-9 w-9 place-items-center rounded-full border bg-card transition-colors hover:bg-accent"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
            </button>
            <Link
              href="/settings/account"
              className="grid h-9 w-9 place-items-center rounded-full"
              aria-label="Account"
            >
              <Avatar className="h-9 w-9 shadow-sm">
                <AvatarFallback className="bg-primary text-[11px] font-medium text-primary-foreground">
                  {owner.avatarInitials}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
