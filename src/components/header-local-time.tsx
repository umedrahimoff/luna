"use client";

import { useEffect, useState } from "react";

function formatGmtOffset(d: Date): string {
  const offMin = -d.getTimezoneOffset();
  const sign = offMin >= 0 ? "+" : "-";
  const abs = Math.abs(offMin);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  if (m === 0) return `GMT${sign}${h}`;
  return `GMT${sign}${h}:${String(m).padStart(2, "0")}`;
}

export function HeaderLocalTime() {
  const [label, setLabel] = useState("");

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const time = d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      setLabel(`${time} ${formatGmtOffset(d)}`);
    };
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  if (!label) return null;

  return (
    <span className="text-muted-foreground hidden text-xs tabular-nums sm:inline">
      {label}
    </span>
  );
}
