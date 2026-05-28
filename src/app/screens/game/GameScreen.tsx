import { useState, useEffect, useRef } from "react";
import { TapButton } from "./TapButton";
import type { Category, GameEndResult, GameResult } from "../../types/game";

interface GameScreenProps {
  category: Category;
  onEnd: (result: GameEndResult) => void;
}

const T = {
  dark: "#0F172A",
  surface: "#1E293B",
  blue: "#2563EB",
  red: "#EF4444",
  green: "#22C55E",
  gray: "#94A3B8",
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function GameScreen({ category, onEnd }: GameScreenProps) {
  const TOTAL_TIME = 60;
  const words = useRef(shuffle(category.words).slice(0, 20));
  const [idx, setIdx] = useState(0);
  const [time, setTime] = useState(TOTAL_TIME);
  const [score, setScore] = useState(0);
  const [skipped, setSkipped] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [history, setHistory] = useState<GameResult[]>([]);
  const [cardAnim, setCardAnim] = useState("");
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (time <= 0) {
      onEnd({ score, skipped, bestStreak, history, category });
      return;
    }
    const t = setInterval(() => setTime(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [time]);

  // Auto-reveal hint after 8 seconds of inactivity on the current word
  useEffect(() => {
    setShowHint(false);
    const timer = setTimeout(() => {
      setShowHint(true);
    }, 8000);
    return () => clearTimeout(timer);
  }, [idx]);


  const next = (correct: boolean) => {
    setCardAnim(correct ? "animRight" : "animLeft");
    const newEntry = { word: words.current[idx], correct };
    setHistory(h => [...h, newEntry]);
    if (correct) {
      const ns = streak + 1;
      setScore(s => s + 1);
      setStreak(ns);
      if (ns > bestStreak) setBestStreak(ns);
    } else {
      setStreak(0);
      setSkipped(s => s + 1);
    }
    setTimeout(() => {
      setShowHint(false);
      setCardAnim("");
      if (idx + 1 >= words.current.length) {
        onEnd({
          score: score + (correct ? 1 : 0),
          skipped: skipped + (correct ? 0 : 1),
          bestStreak,
          history: [...history, newEntry],
          category,
        });
      } else {
        setIdx(i => i + 1);
      }
    }, 300);
  };

  const nextRef = useRef<typeof next | null>(null);
  nextRef.current = next;

  // Keyboard shortcut listener (left = skip, right = correct)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        nextRef.current?.(false);
      } else if (e.key === "ArrowRight") {
        nextRef.current?.(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const progress = (idx / words.current.length) * 100;
  const timeColor = time <= 10 ? T.red : time <= 20 ? "#F59E0B" : "white";

  // Alternate card color
  const cardColor =
    idx % 2 === 0
      ? category.color
      : category.color === "#3B82F6"
        ? "#7C3AED"
        : category.color === "#7C3AED"
          ? "#3B82F6"
          : "#7C3AED";

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
      }}
    >
      {/* Status bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "clamp(12px, 3vw, 20px) clamp(16px, 4vw, 28px)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: T.surface,
            borderRadius: 50,
            padding: "6px 14px",
          }}
        >
          <span style={{ fontSize: "clamp(14px, 3vw, 18px)" }}>{category.icon}</span>
          <span style={{ color: "white", fontWeight: 800, fontSize: "clamp(11px, 2vw, 14px)" }}>
            {category.name}
          </span>
        </div>

        <div
          className={time <= 10 ? "timer-urgent" : ""}
          style={{
            color: timeColor,
            fontWeight: 900,
            fontSize: "clamp(20px, 5vw, 32px)",
            fontVariantNumeric: "tabular-nums",
            transition: "color 0.3s",
          }}
        >
          ⏱ {String(Math.floor(time / 60)).padStart(2, "0")}:{String(time % 60).padStart(2, "0")}
        </div>

        <div style={{ color: T.gray, fontWeight: 700, fontSize: "clamp(12px, 2.5vw, 16px)" }}>
          {idx + 1}
          <span style={{ color: T.surface }}> / </span>
          {words.current.length}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: T.surface, margin: "0 clamp(16px, 4vw, 28px)" }}>
        <div
          style={{
            height: "100%",
            background: T.blue,
            borderRadius: 2,
            width: `${progress}%`,
            transition: "width 0.3s",
          }}
        />
      </div>

      <div
        style={{
          color: T.gray,
          textAlign: "center",
          fontSize: "clamp(11px, 2vw, 14px)",
          padding: "8px 0",
          fontWeight: 600,
        }}
      >
        Category: {category.name}
      </div>

      {/* Game area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "clamp(8px, 2vw, 24px) clamp(16px, 4vw, 32px)",
          gap: "clamp(12px, 3vw, 28px)",
        }}
      >
        {/* Actions + card row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "clamp(10px, 3vw, 32px)",
            width: "100%",
            maxWidth: 900,
          }}
        >
          <TapButton icon="«" label="SKIP" shortcut="←" color={T.red} onClick={() => next(false)} />

          {/* Word card */}
          <div
            className={
              cardAnim === "animRight"
                ? "card-anim-right"
                : cardAnim === "animLeft"
                  ? "card-anim-left"
                  : "card-idle"
            }
            style={{
              flex: 1,
              maxWidth: "clamp(280px, 60vw, 680px)",
              height: "clamp(180px, 30vw, 380px)",
              borderRadius: 24,
              background: cardColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "clamp(16px, 4vw, 40px)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          >
            <h1
              style={{
                color: "white",
                fontWeight: 900,
                textAlign: "center",
                fontSize: "clamp(28px, 7vw, 72px)",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
                textTransform: "uppercase",
                wordBreak: "break-word",
                margin: 0,
              }}
            >
              {words.current[idx]}
            </h1>
          </div>

          <TapButton icon="»" label="CORRECT" shortcut="→" color={T.green} onClick={() => next(true)} />
        </div>

        {/* Hint */}
        <div style={{ textAlign: "center", minHeight: 56 }}>
          {!showHint ? (
            <button
              onClick={() => setShowHint(true)}
              style={{
                background: "none",
                border: "1.5px solid " + T.surface,
                borderRadius: 50,
                color: T.gray,
                padding: "8px 20px",
                cursor: "pointer",
                fontSize: "clamp(12px, 2vw, 14px)",
                fontWeight: 700,
                fontFamily: "inherit",
                transition: "all .15s",
              }}
            >
              💡 Show Hint
            </button>
          ) : (
            <div>
              <div style={{ color: "#FCD34D", fontSize: "clamp(12px, 2vw, 14px)", fontWeight: 700, marginBottom: 4 }}>
                💡 Hint
              </div>
              <div
                style={{
                  color: "white",
                  fontSize: "clamp(12px, 2vw, 15px)",
                  maxWidth: 400,
                  lineHeight: 1.5,
                  opacity: 0.9,
                }}
              >
                {category.hints?.[words.current[idx]] || "No hint available."}
              </div>
            </div>
          )}
        </div>

        {/* Streak */}
        {streak >= 2 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: T.surface,
              borderRadius: 50,
              padding: "6px 18px",
              color: "white",
              fontWeight: 800,
              fontSize: "clamp(12px, 2vw, 15px)",
            }}
          >
            🔥 Streak: {streak}
          </div>
        )}
      </div>

      {/* End game */}
      <div style={{ padding: "clamp(10px, 2vw, 20px) clamp(16px, 4vw, 28px)" }}>
        <button
          onClick={() => onEnd({ score, skipped, bestStreak, history, category })}
          style={{
            width: "100%",
            background: "none",
            border: "1.5px solid " + T.surface,
            color: T.gray,
            borderRadius: 50,
            padding: 12,
            cursor: "pointer",
            fontSize: "clamp(12px, 2vw, 14px)",
            fontWeight: 700,
            fontFamily: "inherit",
            transition: "all .15s",
          }}
        >
          End Game
        </button>
      </div>
    </div>
  );
}
