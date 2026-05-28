import { LayoutType, LAYOUT_CONFIG } from "../../hooks/useLayout";

interface HowToPlayScreenProps {
  layout: LayoutType;
  onBack: () => void;
}

const T = {
  blue: "#2563EB",
  green: "#22C55E",
  purple: "#7C3AED",
};

export function HowToPlayScreen({ layout, onBack }: HowToPlayScreenProps) {
  const config = LAYOUT_CONFIG[layout];

  return (
    <div
      style={{
        height: "100%",
        minHeight: "100dvh",
        background: "white",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Nunito', system-ui, sans-serif",
        boxSizing: "border-box",
        paddingBottom: layout === "mobile-portrait" || layout === "phablet" ? "20px" : "0px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: `16px ${config.hPadding}`,
          borderBottom: "1.5px solid #E2E8F0",
          gap: 16,
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 18,
            color: T.blue,
            fontWeight: 700,
            fontFamily: "inherit",
          }}
        >
          ‹ Back
        </button>
        <h2
          style={{
            flex: 1,
            textAlign: "center",
            margin: 0,
            fontSize: "20px",
            fontWeight: 900,
            color: "#0F172A",
          }}
        >
          How to Play
        </h2>
        <div style={{ width: 60 }} />
      </div>

      <div style={{ flex: 1, padding: config.hPadding, overflowY: "auto" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
          {[
            {
              n: "01",
              icon: "📱",
              title: "Hold it up",
              bg: "#EFF6FF",
              accent: T.blue,
              desc: "Place your phone on your forehead so the screen faces outward. Your friends can see the word but you can't!",
            },
            {
              n: "02",
              icon: "💬",
              title: "Get clues",
              bg: "#F0FDF4",
              accent: T.green,
              desc: "Your friends give you verbal hints, act it out, or describe the word — but they can't say the word itself!",
            },
            {
              n: "03",
              icon: "⚡",
              title: "Tap to score",
              bg: "#FFF7ED",
              accent: "#F59E0B",
              desc: "Tapping CORRECT or SKIP is instant, single-tap, no hold required. Score points for correct guesses and build streaks!",
            },
            {
              n: "04",
              icon: "🏆",
              title: "Score big",
              bg: "#FDF4FF",
              accent: T.purple,
              desc: "You have 60 seconds per round. Build streaks for bonus fun! The more you guess, the higher your score.",
            },
          ].map(s => (
            <div
              key={s.n}
              style={{
                background: s.bg,
                borderRadius: 20,
                padding: "16px",
                display: "flex",
                gap: 16,
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: s.accent,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  flexShrink: 0,
                }}
              >
                {s.icon}
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 900,
                    fontSize: "16px",
                    color: "#0F172A",
                    marginBottom: 6,
                  }}
                >
                  {s.title}
                </div>
                <div style={{ color: "#475569", fontSize: "14px", lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
