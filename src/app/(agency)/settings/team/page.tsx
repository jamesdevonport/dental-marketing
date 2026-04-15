import { MoreHorizontal, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { team, type TeamMember } from "@/lib/fixtures";
import { cn } from "@/lib/utils";

export const metadata = { title: "Team" };

export default function TeamSettingsPage() {
  return (
    <div className="space-y-4 p-4 md:p-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {team.length} people have access to this workspace.
        </p>
        <Button size="sm">
          <Plus className="h-3.5 w-3.5" /> Invite member
        </Button>
      </div>

      <Card className="p-0">
        <CardContent className="p-0">
          <ul className="divide-y">
            {team.map((m) => (
              <li key={m.id} className="flex items-center gap-3 p-3.5">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground text-[11px] font-semibold">
                  {m.avatarInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{m.name}</div>
                  <div className="text-xs text-muted-foreground">{m.email}</div>
                </div>
                <RolePill role={m.role} />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm" aria-label="Member actions">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Change role</DropdownMenuItem>
                    <DropdownMenuItem>Resend invite</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive">Remove from workspace</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Role permissions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5 text-xs text-muted-foreground">
          <div><b className="text-foreground">Owner</b> — billing, delete workspace, everything admins can do.</div>
          <div><b className="text-foreground">Admin</b> — invite members, manage clients, connect integrations.</div>
          <div><b className="text-foreground">Editor</b> — create/edit creatives, campaigns, approve agent proposals.</div>
          <div><b className="text-foreground">Viewer</b> — read-only access.</div>
          <div><b className="text-foreground">Client</b> — portal-only access, scoped to a single dental practice.</div>
        </CardContent>
      </Card>
    </div>
  );
}

function RolePill({ role }: { role: TeamMember["role"] }) {
  const map: Record<TeamMember["role"], string> = {
    owner: "bg-primary/15 text-primary border-primary/20",
    admin: "bg-accent text-accent-foreground border-accent",
    editor: "bg-muted text-muted-foreground border-border",
    viewer: "bg-muted text-muted-foreground border-border",
    client: "bg-warning/20 text-warning-foreground border-warning/40",
  };
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-full border px-1.5 text-[11px] font-medium capitalize",
        map[role],
      )}
    >
      {role}
    </span>
  );
}
