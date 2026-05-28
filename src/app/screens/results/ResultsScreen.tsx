import { Confetti } from "./Confetti";
import type { GameEndResult } from "../../types/game";
import { LayoutType, LAYOUT_CONFIG } from "../../hooks/useLayout";

interface ResultsScreenProps {
  layout: LayoutType;
  result: GameEndResult;
  onPlayAgain: () => void;
  onHome: () => void;
}

const T = {
  dark: "#0F172A",
  surface: "#1E293B",
  green: "#22C55E",
  red: "#EF4444",
  gray: "#94A3B8",
};

export function ResultsScreen({ layout, result, onPlayAgain, onHome }: ResultsScreenProps) {
  const { score, skipped, bestStreak, history } = result;
  const total = score + skipped;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const config = LAYOUT_CONFIG[layout];

  const accuracyColor = pct >= 60 ? T.green : pct >= 40 ? "#F59E0B" : T.red;
  const headline = pct >= 80 ? "Amazing!" : pct >= 60 ? "Great Job!" : pct >= 40 ? "Nice Try!" : "Keep Practicing!";

  if (layout === "mobile-landscape") {
    // 2-panel layout — left panel has score + emoji, right panel has stat grid + buttons; confetti behind both panels; no vertical scroll
    return (
      <div
        style={{
          height: "100%",
          minHeight: "100dvh",
          background: T.dark,
          display: "flex",
          flexDirection: "row",
          fontFamily: "'Nunito', system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
          alignItems: "center",
          padding: "16px 24px",
          boxSizing: "border-box",
          gap: 24,
        }}
      >
        <Confetti />

        {/* Left panel: emoji, heading, score */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div style={{ fontSize: "64px", marginBottom: 8 }}>🎉</div>
          <h2 style={{ color: "white", fontWeight: 900, fontSize: "28px", margin: 0, lineHeight: 1 }}>
            {headline}
          </h2>
          <p style={{ color: T.gray, fontSize: "14px", margin: "8px 0 0" }}>
            Guessed <strong style={{ color: "white" }}>{score}</strong> / <strong style={{ color: "white" }}>{total}</strong> words
          </p>
        </div>

        {/* Right panel: stats grid, accuracy bar, side-by-side buttons */}
        <div
          style={{
            flex: 1.2,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 12,
            position: "relative",
            zIndex: 1,
            height: "100%",
          }}
        >
          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {[
              { icon: "✅", val: score, label: "Correct" },
              { icon: "🔥", val: bestStreak, label: "Streak" },
              { icon: "⏭️", val: skipped, label: "Skipped" },
            ].map(s => (
              <div
                key={s.label}
                style={{
                  background: T.surface,
                  borderRadius: 12,
                  padding: "8px 4px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "18px", marginBottom: 2 }}>{s.icon}</div>
                <div style={{ color: "white", fontWeight: 900, fontSize: "18px", lineHeight: 1 }}>{s.val}</div>
                <div style={{ color: T.gray, fontSize: "9px", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Accuracy bar */}
          <div style={{ width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ color: T.gray, fontSize: "11px", fontWeight: 700 }}>Accuracy</span>
              <span style={{ color: "white", fontWeight: 800, fontSize: "11px" }}>{pct}%</span>
            </div>
            <div style={{ height: 6, background: T.surface, borderRadius: 10 }}>
              <div
                style={{
                  height: "100%",
                  borderRadius: 10,
                  background: accuracyColor,
                  width: `${pct}%`,
                  transition: "width 1s ease",
                }}
              />
            </div>
          </div>

          {/* Side-by-side buttons */}
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button className="play-btn" onClick={onPlayAgain} style={{ padding: "12px", borderRadius: 50, fontSize: "14px", flex: 1 }}>
              ▶ Play Again
            </button>
            <button
              className="end-btn"
              onClick={onHome}
              style={{
                padding: "12px",
                borderRadius: 50,
                fontSize: "14px",
                flex: 1,
                margin: 0,
                color: "white",
                borderColor: "#2563EB",
                background: "rgba(37, 99, 235, 0.1)",
              }}
            >
              🏠 Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isLarge = layout === "desktop" || layout === "tablet";
  const containerMaxWidth = config.resultCardMax;
  const isStackBtn = config.btnLayout === "stack";

  return (
    <div
      style={{
        height: "100%",
        minHeight: "100dvh",
        background: T.dark,
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Nunito', system-ui, sans-serif",
        position: "relative",
        overflow: "hidden",
        alignItems: "center",
        boxSizing: "border-box",
        padding: config.hPadding,
      }}
    >
      <Confetti />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: containerMaxWidth,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
          padding: isLarge ? "32px" : "0px",
          background: isLarge ? T.surface : "transparent",
          borderRadius: isLarge ? "24px" : "0px",
          boxShadow: isLarge ? "0 20px 40px rgba(0,0,0,0.3)" : "none",
        }}
      >
        {/* Badge */}
        <div style={{ fontSize: "72px" }} className="pop">
          🎉
        </div>

        <div className="fade-up" style={{ animationDelay: "0.2s", textAlign: "center" }}>
          <h2
            style={{
              color: "white",
              fontWeight: 900,
              fontSize: "36px",
              margin: 0,
              lineHeight: 1,
            }}
          >
            {headline}
          </h2>
          <p style={{ color: T.gray, fontSize: "16px", margin: "8px 0 0" }}>
            You guessed <strong style={{ color: "white" }}>{score}</strong> out of{" "}
            <strong style={{ color: "white" }}>{total}</strong> words
          </p>
        </div>

        {/* Stats row */}
        <div
          className="fade-up"
          style={{
            animationDelay: "0.35s",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
            width: "100%",
          }}
        >
          {[
            { icon: "✅", val: score, label: "Correct" },
            { icon: "🔥", val: bestStreak, label: "Best Streak" },
            { icon: "⏭️", val: skipped, label: "Skipped" },
          ].map(s => (
            <div
              key={s.label}
              style={{
                background: isLarge ? T.dark : T.surface,
                borderRadius: 20,
                padding: "16px 8px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "28px", marginBottom: 4 }}>{s.icon}</div>
              <div style={{ color: "white", fontWeight: 900, fontSize: "32px", lineHeight: 1 }}>
                {s.val}
              </div>
              <div style={{ color: T.gray, fontSize: "12px", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Accuracy bar */}
        <div className="fade-up" style={{ width: "100%", animationDelay: "0.5s" }}>
          <div style={{ display: "flex", justifySelf: "stretch", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ color: T.gray, fontSize: "13px", fontWeight: 700 }}>Accuracy</span>
            <span style={{ color: "white", fontWeight: 800, fontSize: "13px" }}>{pct}%</span>
          </div>
          <div style={{ height: 10, background: isLarge ? T.dark : T.surface, borderRadius: 10 }}>
            <div
              style={{
                height: "100%",
                borderRadius: 10,
                background: accuracyColor,
                width: `${pct}%`,
                transition: "width 1s ease",
              }}
            />
          </div>
        </div>

        {/* Word history */}
        {history.length > 0 && (
          <div className="fade-up" style={{ width: "100%", animationDelay: "0.6s" }}>
            <p
              style={{
                color: T.gray,
                fontSize: "12px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                margin: "0 0 10px",
              }}
            >
              Round history
            </p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                maxHeight: isLarge ? "150px" : "none",
                overflowY: isLarge ? "auto" : "visible",
                paddingRight: isLarge ? "4px" : "0px",
              }}
            >
              {history.map((h, i) => (
                <span
                  key={i}
                  style={{
                    padding: "4px 12px",
                    borderRadius: 50,
                    fontSize: "12px",
                    fontWeight: 700,
                    background: h.correct ? "#16503020" : "#EF444420",
                    color: h.correct ? T.green : T.red,
                    border: `1px solid ${h.correct ? T.green : T.red}40`,
                  }}
                >
                  {h.correct ? "✓" : "✗"} {h.word}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div
          className="fade-up"
          style={{
            width: "100%",
            animationDelay: "0.7s",
            display: "flex",
            flexDirection: isStackBtn ? "column" : "row",
            gap: isStackBtn ? 0 : 12,
            marginTop: 8,
          }}
        >
          <button className="play-btn" onClick={onPlayAgain} style={{ flex: 1 }}>
            ▶ Play Again
          </button>
          <button
            className="end-btn"
            onClick={onHome}
            style={{
              flex: 1,
              marginTop: isStackBtn ? "10px" : "0px",
            }}
          >
            🏠 Home
          </button>
        </div>
      </div>
    </div>
  );
}
