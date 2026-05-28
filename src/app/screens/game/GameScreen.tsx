import { useState, useEffect, useRef } from "react";
import { TapButton } from "./TapButton";
import type { Category, GameEndResult, GameResult } from "../../types/game";
import { LayoutType, LAYOUT_CONFIG } from "../../hooks/useLayout";

interface GameScreenProps {
  layout: LayoutType;
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

export function GameScreen({ layout, category, onEnd }: GameScreenProps) {
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

  const config = LAYOUT_CONFIG[layout];

  const [fsActive, setFsActive] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setFsActive(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setFsActive(false)).catch(() => {});
      }
    }
  };

  useEffect(() => {
    const onFsChange = () => setFsActive(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const [isLandscape, setIsLandscape] = useState(
    () => window.innerWidth > window.innerHeight
  );

  useEffect(() => {
    const check = () => setIsLandscape(window.innerWidth > window.innerHeight);
    window.addEventListener("resize", check);
    window.addEventListener("orientationchange", check);
    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("orientationchange", check);
    };
  }, []);

  useEffect(() => {
    if (isLandscape && layout === "mobile-landscape") {
      const el = document.documentElement;
      if (el.requestFullscreen && !document.fullscreenElement) {
        el.requestFullscreen().catch(() => {}); // silent fail on iOS
      }
    } else {
      if (!isLandscape && layout !== "mobile-landscape" && document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }, [isLandscape, layout]);

  const [showOrientToast, setShowOrientToast] = useState(false);
  useEffect(() => {
    if (isLandscape) {
      setShowOrientToast(true);
      const t = setTimeout(() => setShowOrientToast(false), 2000);
      return () => clearTimeout(t);
    }
  }, [isLandscape]);

  useEffect(() => {
    if (time <= 0) {
      onEnd({ score, skipped, bestStreak, history, categoryName: category.name });
      return;
    }
    const t = setInterval(() => setTime(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [time]);

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
          bestStreak: correct && streak + 1 > bestStreak ? streak + 1 : bestStreak,
          history: [...history, newEntry],
          categoryName: category.name,
        });
      } else {
        setIdx(i => i + 1);
      }
    }, 300);
  };

  const nextRef = useRef<typeof next | null>(null);
  nextRef.current = next;

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

  const cardColor =
    idx % 2 === 0
      ? category.color
      : category.color === "#3B82F6"
        ? "#7C3AED"
        : category.color === "#7C3AED"
          ? "#3B82F6"
          : "#7C3AED";

  const currentWord = words.current[idx] || "";
  const currentHint = category.hints?.[currentWord] || "No hint available.";

  if (isLandscape) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "#0F172A",
          display: "flex",
          flexDirection: "column",
          zIndex: 9999,
          overflow: "hidden",
        }}
      >
        {showOrientToast && (
          <div
            style={{
              position: "fixed",
              top: "12px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "#1E293B",
              color: "white",
              padding: "8px 20px",
              borderRadius: "50px",
              fontSize: "13px",
              fontWeight: 700,
              zIndex: 99999,
              animation: "fadeUp 0.3s ease",
              whiteSpace: "nowrap",
            }}
          >
            📺 Landscape mode — full screen!
          </div>
        )}

        {/* Top bar, 48px tall */}
        <div
          style={{
            height: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: `calc(var(--safe-top) + 8px) calc(var(--safe-right) + 16px) 8px calc(var(--safe-left) + 16px)`,
            borderBottom: "1px solid #334155",
            boxSizing: "border-box",
          }}
        >
          {/* Category Badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: T.surface, borderRadius: 50, padding: "4px 10px" }}>
            <span style={{ fontSize: "14px" }}>{category.icon}</span>
            <span style={{ color: "white", fontWeight: 800, fontSize: "11px" }}>{category.name}</span>
          </div>

          {/* Timer */}
          <div
            className={time <= 10 ? "timer-urgent" : ""}
            style={{
              color: timeColor,
              fontWeight: 900,
              fontSize: "18px",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            ⏱ {String(Math.floor(time / 60)).padStart(2, "0")}:{String(time % 60).padStart(2, "0")}
          </div>

          {/* Right Section */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ color: T.gray, fontWeight: 700, fontSize: "12px" }}>
              {idx + 1} / {words.current.length}
            </span>
            <button
              onClick={toggleFullscreen}
              style={{
                background: "none",
                border: "1.5px solid #334155",
                color: "#94A3B8",
                borderRadius: "8px",
                padding: "5px 10px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 700,
                fontFamily: "inherit",
                display: layout === "desktop" || layout === "tablet" ? "flex" : "none",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {fsActive ? "✕ Exit" : "⛶ Full Screen"}
            </button>
          </div>
        </div>

        {/* Center row (card + buttons) */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: "clamp(12px, 3vw, 40px)",
            padding: `8px calc(var(--safe-right) + 12px) 8px calc(var(--safe-left) + 12px)`,
            overflow: "hidden",
            boxSizing: "border-box",
          }}
        >
          <TapButton
            icon="«"
            label="SKIP"
            color={T.red}
            onClick={() => next(false)}
            btnSize={config.actionBtnSize}
            iconSize={config.actionIconSize}
          />

          {/* Word card in landscape */}
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
              maxWidth: "min(55vw, 640px)",
              height: "min(70vh, 320px)",
              borderRadius: "20px",
              background: cardColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "clamp(16px, 3vw, 32px)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
              boxSizing: "border-box",
            }}
          >
            <h1
              style={{
                fontSize: "clamp(32px, 6vw, 72px)",
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "-0.02em",
                textAlign: "center",
                color: "white",
                margin: 0,
                wordBreak: "break-word",
              }}
            >
              {currentWord}
            </h1>
          </div>

          <TapButton
            icon="»"
            label="CORRECT"
            color={T.green}
            onClick={() => next(true)}
            btnSize={config.actionBtnSize}
            iconSize={config.actionIconSize}
          />
        </div>

        {/* Hint bar (bottom strip) */}
        <div
          style={{
            height: "52px",
            background: "#1E293B",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: `0 calc(var(--safe-right) + 16px) calc(var(--safe-bottom) + 0px) calc(var(--safe-left) + 16px)`,
            gap: "8px",
            fontSize: "clamp(12px, 2vw, 15px)",
            color: "#94A3B8",
            borderTop: "1px solid #334155",
            boxSizing: "border-box",
          }}
        >
          {showHint ? (
            <>
              <span>💡</span>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {currentHint}
              </span>
            </>
          ) : (
            <span>💡 Hint auto-reveals in 8s...</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100%",
        height: "100dvh",
        background: T.dark,
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Nunito', system-ui, sans-serif",
        position: "relative",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      {/* Status bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: `calc(var(--safe-top) + 12px) ${config.hPadding} 12px`,
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
          <span style={{ fontSize: "16px" }}>{category.icon}</span>
          <span style={{ color: "white", fontWeight: 800, fontSize: "13px" }}>
            {category.name}
          </span>
        </div>

        <div
          className={time <= 10 ? "timer-urgent" : ""}
          style={{
            color: timeColor,
            fontWeight: 900,
            fontSize: config.timerFontSize,
            fontVariantNumeric: "tabular-nums",
            transition: "color 0.3s",
          }}
        >
          ⏱ {String(Math.floor(time / 60)).padStart(2, "0")}:{String(time % 60).padStart(2, "0")}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ color: T.gray, fontWeight: 700, fontSize: "14px" }}>
            {idx + 1}
            <span style={{ color: T.surface }}> / </span>
            {words.current.length}
          </span>
          <button
            onClick={toggleFullscreen}
            style={{
              background: "none",
              border: "1.5px solid #334155",
              color: "#94A3B8",
              borderRadius: "8px",
              padding: "5px 10px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 700,
              fontFamily: "inherit",
              display: layout === "desktop" || layout === "tablet" ? "flex" : "none",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {fsActive ? "✕ Exit" : "⛶ Full Screen"}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: T.surface, margin: `0 ${config.hPadding}` }}>
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

      {/* Game area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: `16px ${config.hPadding}`,
          gap: 20,
        }}
      >
        {/* Actions + card row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 20,
            width: "100%",
            maxWidth: "900px",
          }}
        >
          <TapButton
            icon="«"
            label="SKIP"
            shortcut={config.showKeyboardHint ? "←" : undefined}
            color={T.red}
            onClick={() => next(false)}
            btnSize={config.actionBtnSize}
            iconSize={config.actionIconSize}
          />

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
              maxWidth: config.cardMaxWidth,
              height: config.cardHeight,
              borderRadius: 24,
              background: cardColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "24px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
              boxSizing: "border-box",
            }}
          >
            <h1
              style={{
                color: "white",
                fontWeight: 900,
                textAlign: "center",
                fontSize: config.wordFontSize,
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
                textTransform: "uppercase",
                wordBreak: "break-word",
                margin: 0,
              }}
            >
              {currentWord}
            </h1>
          </div>

          <TapButton
            icon="»"
            label="CORRECT"
            shortcut={config.showKeyboardHint ? "→" : undefined}
            color={T.green}
            onClick={() => next(true)}
            btnSize={config.actionBtnSize}
            iconSize={config.actionIconSize}
          />
        </div>

        {/* Hint */}
        <div style={{ textAlign: "center", minHeight: 64, maxWidth: "480px" }}>
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
                fontSize: "14px",
                fontWeight: 700,
                fontFamily: "inherit",
                transition: "all .15s",
              }}
            >
              💡 Show Hint
            </button>
          ) : (
            <div>
              <div style={{ color: "#FCD34D", fontSize: "14px", fontWeight: 700, marginBottom: 4 }}>
                💡 Hint
              </div>
              <div
                style={{
                  color: "white",
                  fontSize: "15px",
                  lineHeight: 1.5,
                  opacity: 0.9,
                }}
              >
                {currentHint}
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
              fontSize: "14px",
            }}
          >
            🔥 Streak: {streak}
          </div>
        )}
      </div>

      {/* End game */}
      <div style={{ padding: `12px ${config.hPadding} calc(var(--safe-bottom) + 12px)` }}>
        <button
          onClick={() => onEnd({ score, skipped, bestStreak, history, categoryName: category.name })}
          style={{
            width: "100%",
            background: "none",
            border: "1.5px solid " + T.surface,
            color: T.gray,
            borderRadius: 50,
            padding: 12,
            cursor: "pointer",
            fontSize: "14px",
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
