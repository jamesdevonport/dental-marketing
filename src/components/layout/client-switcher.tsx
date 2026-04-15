"use client";

import { startTransition } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { clients } from "@/lib/fixtures";

export function ClientSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const match = pathname.match(/^\/clients\/([^/]+)/);
  const activeClientId = match?.[1];
  const activeClient = clients.find((c) => c.id === activeClientId);
  const label = activeClient ? activeClient.name : "All clients";

  const navigate = (href: string) => {
    startTransition(() => {
      router.push(href);
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-[200px] justify-between text-sm font-medium"
        >
          <span className="truncate">{label}</span>
          <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[240px]" align="start">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Scope
          </DropdownMenuLabel>
          <DropdownMenuItem onClick={() => navigate("/dashboard")}>
            <span className="flex w-full items-center justify-between">
              <span>All clients</span>
              {!activeClient ? <Check className="h-4 w-4" /> : null}
            </span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Clients
          </DropdownMenuLabel>
          {clients.map((c) => (
            <DropdownMenuItem
              key={c.id}
              onClick={() => navigate(`/clients/${c.id}/overview`)}
            >
              <span className="flex w-full items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="grid h-5 w-5 place-items-center rounded-sm bg-muted text-[10px] font-semibold">
                    {c.logoInitials}
                  </span>
                  <span className="truncate">{c.name}</span>
                </span>
                {activeClient?.id === c.id ? (
                  <Check className="h-4 w-4" />
                ) : null}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/clients/new")}>
          + New client
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
