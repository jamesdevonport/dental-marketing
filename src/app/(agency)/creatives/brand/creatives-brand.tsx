"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BrandEditor } from "@/components/creative/brand-editor";
import { clients, clientById } from "@/lib/fixtures";

export function CreativesBrand() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const paramId = sp.get("client");
  const selectedId =
    paramId && clientById[paramId] ? paramId : clients[0]?.id ?? "";
  const client = clientById[selectedId];

  const setClient = (id: string) => {
    const next = new URLSearchParams(sp.toString());
    if (id === clients[0]?.id) next.delete("client");
    else next.set("client", id);
    router.replace(next.toString() ? `${pathname}?${next.toString()}` : pathname);
  };

  return (
    <>
      <div className="flex items-center justify-between gap-3 border-b bg-background px-4 py-3 md:px-6">
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">Editing brand for</span>
          <Select
            value={selectedId}
            onValueChange={(v: string | null) => { if (v) setClient(v); }}
          >
            <SelectTrigger className="h-8 w-[240px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  <span className="flex items-center gap-2">
                    <span
                      className="grid h-4 w-4 place-items-center rounded-sm text-[9px] font-semibold text-white"
                      style={{ backgroundColor: c.brand.primary }}
                    >
                      {c.logoInitials}
                    </span>
                    <span>{c.name}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <span className="text-xs text-muted-foreground">
          Brand kits feed the matrix generator — colours, fonts, tone, and
          library images flow through to every generated ad.
        </span>
      </div>
      {client ? <BrandEditor key={client.id} client={client} /> : null}
    </>
  );
}
