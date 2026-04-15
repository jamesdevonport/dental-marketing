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
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/95 backdrop-blur px-4 md:px-6">
      <div className="flex flex-1 items-center gap-3 md:max-w-lg">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients, campaigns, creatives…"
            className="h-9 pl-8 bg-muted/40 border-transparent focus-visible:border-input focus-visible:bg-background"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ClientSwitcher />
        <AgentPill />
        <button
          type="button"
          className="grid h-8 w-8 place-items-center rounded-full border hover:bg-accent"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>
        <Link
          href="/settings/account"
          className="grid h-8 w-8 place-items-center rounded-full"
          aria-label="Account"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-[11px] font-medium">
              {owner.avatarInitials}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  );
}
