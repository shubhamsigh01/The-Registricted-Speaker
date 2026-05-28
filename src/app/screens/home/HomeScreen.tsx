interface HomeScreenProps {
  onStart: () => void;
  onHowToPlay: () => void;
}

const T = {
  blue: "#2563EB",
  gray: "#94A3B8",
};

export function HomeScreen({ onStart, onHowToPlay }: HomeScreenProps) {
  return (
    <div
      style={{
        minHeight: "100%",
        background: "white",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Nunito', system-ui, sans-serif",
      }}
    >
      {/* Hero */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "clamp(24px, 6vw, 80px) clamp(20px, 5vw, 60px)",
          textAlign: "center",
          gap: "clamp(8px, 2vw, 16px)",
        }}
      >
        {/* Logo */}
        <div style={{ position: "relative", marginBottom: "clamp(8px, 2vw, 16px)" }}>
          {["◈", "✦", "✧", "◆"].map((s, i) => (
            <span
              key={i}
              style={{
                position: "absolute",
                fontSize: "clamp(10px, 2vw, 16px)",
                color: T.blue,
                animation: `sparkle 1.5s ${i * 0.3}s infinite`,
                top: ["-20px", "10px", "-10px", "20px"][i],
                left: ["-10px", "50px", "-30px", "40px"][i],
              }}
            >
              {s}
            </span>
          ))}
          <h1
            style={{
              fontSize: "clamp(42px, 10vw, 96px)",
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: "-2px",
              margin: 0,
              color: "#0F172A",
            }}
          >
            Heads<span style={{ color: T.blue }}>Up</span>
            <span style={{ color: T.blue, fontSize: "0.7em" }}>!</span>
          </h1>
        </div>
        <p
          style={{
            color: T.gray,
            fontSize: "clamp(13px, 2.5vw, 18px)",
            margin: 0,
            maxWidth: 360,
            lineHeight: 1.5,
          }}
        >
          Hold your phone up and let your friends guess!
        </p>

        {/* How to play steps */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "clamp(8px, 2vw, 16px)",
            width: "100%",
            maxWidth: 680,
            marginTop: "clamp(8px, 2vw, 24px)",
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
                padding: "clamp(12px, 3vw, 20px)",
                border: "1.5px solid #E2E8F0",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "clamp(24px, 5vw, 36px)", marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontWeight: 800, fontSize: "clamp(12px, 2vw, 14px)", color: "#0F172A", marginBottom: 4 }}>
                {s.title}
              </div>
              <div style={{ color: T.gray, fontSize: "clamp(10px, 1.8vw, 12px)", lineHeight: 1.4 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Menu */}
      <div
        style={{
          padding: "clamp(16px, 4vw, 40px)",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          maxWidth: 640,
          margin: "0 auto",
          width: "100%",
        }}
      >
        {[
          { icon: "📦", label: "Word Packs", sub: "8 Categories", action: onStart },
          { icon: "❓", label: "How to Play", sub: "Quick guide", action: onHowToPlay },
        ].map(m => (
          <div key={m.label} className="menu-row" onClick={m.action}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 24 }}>{m.icon}</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: "clamp(14px, 2.5vw, 16px)", color: "#0F172A" }}>
                  {m.label}
                </div>
                <div style={{ color: T.gray, fontSize: "clamp(11px, 2vw, 13px)" }}>{m.sub}</div>
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
