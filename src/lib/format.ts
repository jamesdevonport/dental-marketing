const CURRENCY = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

const CURRENCY_PRECISE = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 2,
});

const NUMBER = new Intl.NumberFormat("en-GB");

const DATE = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const TIME = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function gbp(n: number, precise = false) {
  return (precise ? CURRENCY_PRECISE : CURRENCY).format(n);
}

export function num(n: number) {
  return NUMBER.format(n);
}

export function pct(n: number, digits = 1) {
  return `${n.toFixed(digits)}%`;
}

export function dateShort(iso: string) {
  return DATE.format(new Date(iso));
}

export function timeHHMM(iso: string) {
  return TIME.format(new Date(iso));
}

const FROZEN_NOW = new Date("2026-04-15T10:00:00Z");

export function relativeTime(iso: string) {
  const then = new Date(iso).getTime();
  const diffMs = FROZEN_NOW.getTime() - then;
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  return dateShort(iso);
}
