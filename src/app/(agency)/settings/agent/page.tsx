"use client";

import { useState } from "react";
import { Save, Shield, Timer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { scheduledTasks } from "@/lib/fixtures";
import { cn } from "@/lib/utils";
import { relativeTime } from "@/lib/format";

type ApprovalDefault = "auto" | "approve_everything" | "report_only";

export default function AgentSettingsPage() {
  const [defaultMode, setDefaultMode] = useState<ApprovalDefault>("approve_everything");
  const [pauseThreshold, setPauseThreshold] = useState(15);
  const [ctrDropThreshold, setCtrDropThreshold] = useState(25);
  const [maxSpendChangePct, setMaxSpendChangePct] = useState(20);
  const [maxPausesPerDay, setMaxPausesPerDay] = useState(10);
  const [blackoutHours, setBlackoutHours] = useState({ start: "22:00", end: "07:00" });
  const [tasks, setTasks] = useState(scheduledTasks);

  const save = () => toast.success("Agent config saved.");
  const toggleTask = (id: string) => {
    setTasks((t) =>
      t.map((task) =>
        task.id === id ? { ...task, status: task.status === "active" ? "paused" : "active" } : task,
      ),
    );
  };

  return (
    <div className="space-y-5 p-4 md:p-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Shield className="h-4 w-4" /> Default approval mode
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Applied to newly-onboarded clients. Per-client overrides live on
            their settings page.
          </p>
        </CardHeader>
        <CardContent>
          <Select value={defaultMode} onValueChange={(v: string | null) => { if (v) setDefaultMode(v as ApprovalDefault); }}>
            <SelectTrigger className="w-full sm:w-[360px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto-approve routine actions</SelectItem>
              <SelectItem value="approve_everything">Approve everything</SelectItem>
              <SelectItem value="report_only">Report only</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Per-action thresholds</CardTitle>
          <p className="text-xs text-muted-foreground">
            When auto-approve is on for routine actions, these are the triggers
            the agent uses to decide when to act.
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <ThresholdRow
            label="Auto-pause when a single ad spends"
            suffix="without producing a lead"
            value={pauseThreshold}
            onChange={setPauseThreshold}
            min={5}
            max={100}
            step={1}
            unit="£"
          />
          <ThresholdRow
            label="Flag fatigue when CTR drops by"
            suffix="week-over-week"
            value={ctrDropThreshold}
            onChange={setCtrDropThreshold}
            min={10}
            max={50}
            step={1}
            unit="%"
            suffixUnit
          />
          <ThresholdRow
            label="Max daily spend-change"
            suffix="without your sign-off"
            value={maxSpendChangePct}
            onChange={setMaxSpendChangePct}
            min={0}
            max={50}
            step={5}
            unit="%"
            suffixUnit
          />
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Max ads paused per day per client</Label>
              <span className="text-sm font-medium tabular-nums">{maxPausesPerDay}</span>
            </div>
            <Slider
              min={1}
              max={25}
              value={[maxPausesPerDay]}
              onValueChange={(v: number | readonly number[]) => {
                const first = Array.isArray(v) ? v[0] : v;
                if (typeof first === "number") setMaxPausesPerDay(first);
              }}
            />
          </div>
          <Separator />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Blackout window start</Label>
              <Input
                type="time"
                value={blackoutHours.start}
                onChange={(e) => setBlackoutHours({ ...blackoutHours, start: e.target.value })}
              />
              <p className="text-[11px] text-muted-foreground">No notifications sent during this window.</p>
            </div>
            <div className="space-y-1.5">
              <Label>Blackout window end</Label>
              <Input
                type="time"
                value={blackoutHours.end}
                onChange={(e) => setBlackoutHours({ ...blackoutHours, end: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Timer className="h-4 w-4" /> Scheduled tasks
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Cron-style tasks the agent runs autonomously.
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          {tasks.map((t) => (
            <div key={t.id} className="flex items-start justify-between gap-3 rounded-md border bg-card p-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium">{t.name}</div>
                  <span
                    className={cn(
                      "rounded-full border px-1.5 py-0.5 text-[10px] font-medium capitalize",
                      t.status === "active"
                        ? "bg-success/15 text-success border-success/30"
                        : "bg-muted text-muted-foreground border-border",
                    )}
                  >
                    {t.status}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">{t.description}</div>
                <div className="text-[11px] text-muted-foreground">
                  {t.cron}
                  {t.lastRun ? ` · Last run ${relativeTime(t.lastRun)}` : ""}
                </div>
              </div>
              <Switch
                checked={t.status === "active"}
                onCheckedChange={() => toggleTask(t.id)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button size="sm" onClick={save}>
          <Save className="h-3.5 w-3.5" /> Save
        </Button>
      </div>
    </div>
  );
}

function ThresholdRow({
  label,
  suffix,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  suffixUnit,
}: {
  label: string;
  suffix: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  unit: string;
  suffixUnit?: boolean;
}) {
  const display = suffixUnit ? `${value}${unit}` : `${unit}${value}`;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm">
            {label}{" "}
            <span className="font-semibold text-foreground tabular-nums">{display}</span>{" "}
            {suffix}
          </div>
        </div>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(v: number | readonly number[]) => {
          const first = Array.isArray(v) ? v[0] : v;
          if (typeof first === "number") onChange(first);
        }}
      />
    </div>
  );
}
