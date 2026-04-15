"use client";

import { useState } from "react";
import { Bell, Mail, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Channel = "inApp" | "email" | "slack" | "whatsapp";

const CHANNELS: { key: Channel; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "inApp", label: "In-app", icon: Bell },
  { key: "email", label: "Email", icon: Mail },
  { key: "slack", label: "Slack", icon: MessageSquare },
  { key: "whatsapp", label: "WhatsApp", icon: Send },
];

const EVENTS: { key: string; label: string; description: string }[] = [
  { key: "proposal", label: "Agent proposal", description: "The agent proposes an action (pause, launch, refresh)." },
  { key: "creative_review", label: "Creative ready for review", description: "A batch lands in the inbox waiting for approval." },
  { key: "creative_live", label: "Creative went live", description: "An approved creative starts serving impressions." },
  { key: "client_approved", label: "Client approved a creative", description: "A practice signed off in the portal." },
  { key: "weekly_digest", label: "Weekly digest", description: "Per-client performance summary every Monday." },
  { key: "connection_broken", label: "Connection broken", description: "A pixel stopped firing or an OAuth token expired." },
];

type Matrix = Record<string, Record<Channel, boolean>>;

const DEFAULTS: Matrix = {
  proposal: { inApp: true, email: false, slack: true, whatsapp: false },
  creative_review: { inApp: true, email: true, slack: true, whatsapp: false },
  creative_live: { inApp: true, email: false, slack: false, whatsapp: false },
  client_approved: { inApp: true, email: true, slack: true, whatsapp: false },
  weekly_digest: { inApp: false, email: true, slack: false, whatsapp: false },
  connection_broken: { inApp: true, email: true, slack: true, whatsapp: true },
};

export default function NotificationsSettingsPage() {
  const [matrix, setMatrix] = useState<Matrix>(DEFAULTS);

  const toggle = (eventKey: string, channel: Channel) => {
    setMatrix((m) => ({
      ...m,
      [eventKey]: { ...m[eventKey], [channel]: !m[eventKey][channel] },
    }));
  };

  const save = () => toast.success("Notification preferences saved.");

  return (
    <div className="space-y-4 p-4 md:p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Notification routing</CardTitle>
          <p className="text-xs text-muted-foreground">
            For each event, pick which channels receive an alert. Default
            channels apply to all clients; individual clients can override on
            their settings page.
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-2 font-medium">Event</th>
                  {CHANNELS.map((c) => {
                    const Icon = c.icon;
                    return (
                      <th key={c.key} className="px-3 py-2 text-center font-medium">
                        <div className="inline-flex items-center gap-1.5">
                          <Icon className="h-3.5 w-3.5" />
                          {c.label}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {EVENTS.map((e) => (
                  <tr key={e.key} className="border-b last:border-b-0">
                    <td className="px-4 py-3">
                      <div className="font-medium">{e.label}</div>
                      <div className="text-xs text-muted-foreground max-w-md">{e.description}</div>
                    </td>
                    {CHANNELS.map((c) => (
                      <td key={c.key} className="px-3 py-3 text-center">
                        <label className="inline-flex cursor-pointer">
                          <input
                            type="checkbox"
                            checked={matrix[e.key][c.key]}
                            onChange={() => toggle(e.key, c.key)}
                            className="sr-only"
                          />
                          <span
                            className={cn(
                              "grid h-5 w-5 place-items-center rounded-md border transition-colors",
                              matrix[e.key][c.key]
                                ? "bg-primary border-primary text-primary-foreground"
                                : "hover:bg-muted",
                            )}
                          >
                            {matrix[e.key][c.key] ? (
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                                <path d="M2 6.5l2.5 2.5L10 3" stroke="currentColor" strokeWidth="2" fill="none" />
                              </svg>
                            ) : null}
                          </span>
                        </label>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button size="sm" onClick={save}>Save</Button>
      </div>
    </div>
  );
}
