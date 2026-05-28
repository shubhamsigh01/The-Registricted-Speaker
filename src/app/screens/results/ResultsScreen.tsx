import { Confetti } from "./Confetti";
import type { GameEndResult } from "../../types/game";

interface ResultsScreenProps {
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

export function ResultsScreen({ result, onPlayAgain, onHome }: ResultsScreenProps) {
  const { score, skipped, bestStreak, history } = result;
  const total = score + skipped;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;

  return (
    <div
      style={{
        minHeight: "100%",
        background: T.dark,
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Nunito', system-ui, sans-serif",
        position: "relative",
        overflow: "hidden",
        alignItems: "center",
      }}
    >
      <Confetti />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 640,
          padding: "clamp(24px, 5vw, 48px) clamp(16px, 4vw, 40px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "clamp(16px, 3vw, 28px)",
        }}
      >
        {/* Badge */}
        <div style={{ fontSize: "clamp(48px, 12vw, 88px)" }} className="pop">
          🎉
        </div>

        <div className="fade-up" style={{ animationDelay: "0.2s", textAlign: "center" }}>
          <h2
            style={{
              color: "white",
              fontWeight: 900,
              fontSize: "clamp(26px, 6vw, 48px)",
              margin: 0,
              lineHeight: 1,
            }}
          >
            {pct >= 80 ? "Amazing!" : pct >= 60 ? "Great Job!" : pct >= 40 ? "Nice Try!" : "Keep Practicing!"}
          </h2>
          <p style={{ color: T.gray, fontSize: "clamp(13px, 2.5vw, 16px)", margin: "6px 0 0" }}>
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
            gap: "clamp(8px, 2vw, 16px)",
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
                background: T.surface,
                borderRadius: 20,
                padding: "clamp(12px, 3vw, 20px)",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "clamp(20px, 5vw, 32px)", marginBottom: 4 }}>{s.icon}</div>
              <div style={{ color: "white", fontWeight: 900, fontSize: "clamp(22px, 5vw, 40px)", lineHeight: 1 }}>
                {s.val}
              </div>
              <div style={{ color: T.gray, fontSize: "clamp(10px, 2vw, 13px)", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Accuracy bar */}
        <div className="fade-up" style={{ width: "100%", animationDelay: "0.5s" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ color: T.gray, fontSize: "clamp(11px, 2vw, 13px)", fontWeight: 700 }}>Accuracy</span>
            <span style={{ color: "white", fontWeight: 800, fontSize: "clamp(11px, 2vw, 13px)" }}>{pct}%</span>
          </div>
          <div style={{ height: 10, background: T.surface, borderRadius: 10 }}>
            <div
              style={{
                height: "100%",
                borderRadius: 10,
                background: pct >= 60 ? T.green : pct >= 40 ? "#F59E0B" : T.red,
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
                fontSize: "clamp(10px, 2vw, 12px)",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                margin: "0 0 10px",
              }}
            >
              Round history
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {history.map((h, i) => (
                <span
                  key={i}
                  style={{
                    padding: "4px 12px",
                    borderRadius: 50,
                    fontSize: "clamp(10px, 1.8vw, 12px)",
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
        <div className="fade-up" style={{ width: "100%", animationDelay: "0.7s" }}>
          <button className="play-btn" onClick={onPlayAgain}>
            ▶ Play Again
          </button>
          <button className="end-btn" onClick={onHome}>
            🏠 Home
          </button>
        </div>
      </div>
    </div>
  );
}
