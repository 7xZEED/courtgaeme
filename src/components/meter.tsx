type Tone = "danger" | "warn" | "ok" | "neutral";

function toneVar(t: Tone) {
  switch (t) {
    case "danger": return "var(--verdict)";
    case "warn": return "var(--gavel)";
    case "ok": return "var(--cat-group-chat)";
    default: return "var(--cat-friend)";
  }
}

export function Meter({
  label,
  value,
  tone = "neutral",
  suffix = "/100",
}: {
  label: string;
  value: number;
  tone?: Tone;
  suffix?: string;
}) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between text-xs">
        <span className="font-medium uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
        <span className="font-mono text-sm font-bold text-foreground">
          {v}
          <span className="text-muted-foreground">{suffix}</span>
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
        <div
          className="animate-meter h-full rounded-full"
          style={{
            width: `${v}%`,
            background: `linear-gradient(90deg, ${toneVar(tone)}, color-mix(in oklab, ${toneVar(tone)} 60%, white))`,
            boxShadow: `0 0 18px -4px ${toneVar(tone)}`,
          }}
        />
      </div>
    </div>
  );
}