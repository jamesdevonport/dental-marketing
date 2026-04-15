import type { ReactNode } from "react";
import { Breadcrumbs } from "./breadcrumbs";

export function PageHeader({
  title,
  description,
  actions,
  breadcrumbs = true,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  breadcrumbs?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 border-b bg-background px-4 pt-4 pb-4 md:px-6">
      {breadcrumbs ? <Breadcrumbs /> : null}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
