"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { clients } from "@/lib/fixtures";

export function ClientSwitcher() {
  const pathname = usePathname();
  const match = pathname.match(/^\/clients\/([^/]+)/);
  const activeClientId = match?.[1];
  const activeClient = clients.find((c) => c.id === activeClientId);
  const label = activeClient ? activeClient.name : "All clients";

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
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Scope
        </DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="flex items-center justify-between">
            <span>All clients</span>
            {!activeClient ? <Check className="h-4 w-4" /> : null}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Clients
        </DropdownMenuLabel>
        {clients.map((c) => (
          <DropdownMenuItem key={c.id} asChild>
            <Link
              href={`/clients/${c.id}/overview`}
              className="flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <span className="grid h-5 w-5 place-items-center rounded-sm bg-muted text-[10px] font-semibold">
                  {c.logoInitials}
                </span>
                <span className="truncate">{c.name}</span>
              </span>
              {activeClient?.id === c.id ? <Check className="h-4 w-4" /> : null}
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/clients/new" className="text-sm">
            + New client
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
