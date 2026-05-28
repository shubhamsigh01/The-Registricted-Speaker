import { LayoutType, LAYOUT_CONFIG } from "../../hooks/useLayout";

interface HomeScreenProps {
  layout: LayoutType;
  onStart: () => void;
  onHowToPlay: () => void;
}

const T = {
  blue: "#2563EB",
  gray: "#94A3B8",
};

export function HomeScreen({ layout, onStart, onHowToPlay }: HomeScreenProps) {
  const config = LAYOUT_CONFIG[layout];

  const logoSize =
    layout === "mobile-portrait"
      ? "48px"
      : layout === "mobile-landscape"
      ? "36px"
      : layout === "phablet"
      ? "56px"
      : layout === "tablet"
      ? "64px"
      : "80px";

  const taglineSize =
    layout === "mobile-landscape"
      ? "12px"
      : layout === "mobile-portrait"
      ? "14px"
      : "16px";

  const menuItems = [
    { icon: "📦", label: "Word Packs", sub: "8 Categories", action: onStart },
    { icon: "❓", label: "How to Play", sub: "Quick guide", action: onHowToPlay },
  ];

  if (layout === "mobile-landscape") {
    // 2-column split — logo+tagline left, menu list right; CTA inside right column; no scroll needed
    return (
      <div
        style={{
          height: "100%",
          minHeight: "100dvh",
          background: "white",
          display: "flex",
          flexDirection: "row",
          padding: "12px 24px",
          boxSizing: "border-box",
          gap: 24,
          alignItems: "center",
          fontFamily: "'Nunito', system-ui, sans-serif",
        }}
      >
        {/* Left column */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <div style={{ position: "relative", marginBottom: 12 }}>
            {["◈", "✦", "✧", "◆"].map((s, i) => (
              <span
                key={i}
                style={{
                  position: "absolute",
                  fontSize: "12px",
                  color: T.blue,
                  animation: `sparkle 1.5s ${i * 0.3}s infinite`,
                  top: ["-15px", "5px", "-5px", "15px"][i],
                  left: ["-10px", "40px", "-25px", "30px"][i],
                }}
              >
                {s}
              </span>
            ))}
            <h1 style={{ fontSize: logoSize, fontWeight: 900, lineHeight: 1, letterSpacing: "-1px", margin: 0, color: "#0F172A" }}>
              Heads<span style={{ color: T.blue }}>Up</span>!
            </h1>
          </div>
          <p style={{ color: T.gray, fontSize: taglineSize, margin: 0, maxWidth: 280, lineHeight: 1.4 }}>
            Hold your phone up and let your friends guess!
          </p>
        </div>

        {/* Right column */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            justifyContent: "center",
          }}
        >
          {menuItems.map(m => (
            <div
              key={m.label}
              className="menu-row"
              onClick={m.action}
              style={{ padding: "10px 14px", borderRadius: 12 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 20 }}>{m.icon}</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: "14px", color: "#0F172A" }}>{m.label}</div>
                  <div style={{ color: T.gray, fontSize: "11px" }}>{m.sub}</div>
                </div>
              </div>
              <span style={{ color: T.gray, fontSize: 16 }}>›</span>
            </div>
          ))}
          <button className="start-btn" onClick={onStart} style={{ padding: "14px", borderRadius: 12 }}>
            <span style={{ fontSize: 18 }}>▶</span> Start Game
          </button>
        </div>
      </div>
    );
  }

  const maxWidth = layout === "tablet" ? "600px" : layout === "desktop" ? "900px" : "100%";

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
        padding: config.hPadding,
        maxWidth: maxWidth,
        margin: "0 auto",
        width: "100%",
      }}
    >
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        {/* Hero */}
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{ position: "relative" }}>
            {["◈", "✦", "✧", "◆"].map((s, i) => (
              <span
                key={i}
                style={{
                  position: "absolute",
                  fontSize: "14px",
                  color: T.blue,
                  animation: `sparkle 1.5s ${i * 0.3}s infinite`,
                  top: ["-20px", "10px", "-10px", "20px"][i],
                  left: ["-10px", "50px", "-30px", "40px"][i],
                }}
              >
                {s}
              </span>
            ))}
            <h1 style={{ fontSize: logoSize, fontWeight: 900, lineHeight: 1, letterSpacing: "-2px", margin: 0, color: "#0F172A" }}>
              Heads<span style={{ color: T.blue }}>Up</span>!
            </h1>
          </div>
          <p style={{ color: T.gray, fontSize: taglineSize, margin: 0, maxWidth: 360, lineHeight: 1.5 }}>
            Hold your phone up and let your friends guess!
          </p>

          {/* How to play steps */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: layout === "desktop" ? "repeat(3, 1fr)" : "repeat(auto-fit, minmax(140px, 1fr))",
              gap: 16,
              width: "100%",
              marginTop: 24,
            }}
          >
            {[
              { n: "1", icon: "📱", title: "Hold it up", desc: "Phone on your forehead so friends can see" },
              { n: "2", icon: "💬", title: "Get clues", desc: "Friends give hints without saying the word" },
              { n: "3", icon: "✅", title: "Guess & win", desc: "Tap CORRECT to score or SKIP to pass" },
            ].map(s => (
              <div
                key={s.n}
                style={{
                  background: "#F8FAFC",
                  borderRadius: 16,
                  padding: "16px 12px",
                  border: "1.5px solid #E2E8F0",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "30px", marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontWeight: 800, fontSize: "14px", color: "#0F172A", marginBottom: 4 }}>
                  {s.title}
                </div>
                <div style={{ color: T.gray, fontSize: "12px", lineHeight: 1.4 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Menu / CTA Area */}
      <div
        style={{
          marginTop: 24,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          width: "100%",
          paddingBottom: layout === "mobile-portrait" || layout === "phablet" ? "20px" : "0px",
        }}
      >
        {menuItems.map(m => (
          <div key={m.label} className="menu-row" onClick={m.action}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 24 }}>{m.icon}</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: "16px", color: "#0F172A" }}>{m.label}</div>
                <div style={{ color: T.gray, fontSize: "13px" }}>{m.sub}</div>
              </div>
            </div>
            <span style={{ color: T.gray, fontSize: 20, fontWeight: 300 }}>›</span>
          </div>
        ))}
        <button className="start-btn" onClick={onStart}>
          <span style={{ fontSize: 20 }}>▶</span> Start Game
        </button>
      </div>
    </div>
  );
}
