import { ImageResponse } from "next/og";
import { db } from "@/lib/db";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ code: string }> };

function hashString(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) {
    h = (h * 31 + value.charCodeAt(i)) >>> 0;
  }
  return h;
}

function gradients(seed: string): [string, string] {
  const set = [
    ["#2563eb", "#9333ea"],
    ["#0ea5e9", "#22c55e"],
    ["#f43f5e", "#7c3aed"],
    ["#f59e0b", "#ef4444"],
    ["#06b6d4", "#8b5cf6"],
    ["#3b82f6", "#14b8a6"],
  ] as const;
  const idx = hashString(seed) % set.length;
  const pair = set[idx] ?? set[0];
  return [pair[0], pair[1]];
}

export default async function EventOpenGraphImage({ params }: Props) {
  const { code } = await params;
  const event = await db.event.findUnique({
    where: { publicCode: code },
    select: { title: true },
  });

  const [g1, g2] = gradients(code);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          display: "flex",
          background: `linear-gradient(120deg, ${g1} 0%, ${g2} 100%)`,
          color: "white",
          fontFamily: "Inter, system-ui, sans-serif",
          padding: 40,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 8% 12%, rgba(255,255,255,0.2) 0, rgba(255,255,255,0) 34%), radial-gradient(circle at 88% 92%, rgba(255,255,255,0.12) 0, rgba(255,255,255,0) 40%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -80,
            width: 320,
            height: 320,
            borderRadius: 9999,
            background: "rgba(255,255,255,0.14)",
          }}
        />
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 24,
            }}
          >
            <div
              style={{
                fontSize: 34,
                fontWeight: 700,
                opacity: 0.98,
                textShadow: "0 2px 18px rgba(0,0,0,0.25)",
              }}
            >
              Luna
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 20,
              maxWidth: 980,
            }}
          >
            <div
              style={{
                fontSize: 72,
                fontWeight: 700,
                lineHeight: 1.04,
                letterSpacing: "-0.02em",
                textShadow: "0 4px 24px rgba(0,0,0,0.26)",
                whiteSpace: "pre-wrap",
              }}
            >
              {event?.title?.trim() || "Upcoming event"}
            </div>
            <div
              style={{
                fontSize: 28,
                opacity: 0.95,
                textShadow: "0 2px 14px rgba(0,0,0,0.2)",
              }}
            >
              getlunaapp.vercel.app
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              fontSize: 22,
              opacity: 0.9,
            }}
          >
            <div />
            <div>Luna Event</div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
