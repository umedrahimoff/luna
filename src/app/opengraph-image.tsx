import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background:
            "linear-gradient(120deg, #1d4ed8 0%, #7c3aed 35%, #e11d48 70%, #22c55e 100%)",
          color: "white",
          fontFamily: "Inter, system-ui, sans-serif",
          overflow: "hidden",
          padding: 56,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -80,
            width: 420,
            height: 420,
            borderRadius: 9999,
            background: "rgba(255,255,255,0.18)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -150,
            left: -110,
            width: 480,
            height: 480,
            borderRadius: 9999,
            background: "rgba(255,255,255,0.12)",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div style={{ fontSize: 40, fontWeight: 700, opacity: 0.96 }}>Luna</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 820 }}>
            <div style={{ fontSize: 66, fontWeight: 700, lineHeight: 1.08 }}>
              Events that look premium
            </div>
            <div style={{ fontSize: 30, opacity: 0.92 }}>
              Discover, create, and grow your event audience with Luna.
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
