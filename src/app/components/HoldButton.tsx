import { useState, useEffect, useRef, useCallback } from "react";

interface HoldButtonProps {
  label: string;
  subLabel: string;
  color: string;
  onHold: () => void;
  icon: string;
  holdDuration?: number;
}

export function HoldButton({ label, subLabel, color, onHold, icon, holdDuration = 700 }: HoldButtonProps) {
  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const end = useCallback(() => {
    setHolding(false);
    setProgress(0);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (progRef.current) clearInterval(progRef.current);
  }, []);

  const start = useCallback(() => {
    setHolding(true);
    const t0 = Date.now();
    progRef.current = setInterval(() => {
      setProgress(Math.min(((Date.now() - t0) / holdDuration) * 100, 100));
    }, 16);
    timerRef.current = setTimeout(() => {
      onHold();
      end();
    }, holdDuration);
  }, [holdDuration, onHold, end]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progRef.current) clearInterval(progRef.current);
    };
  }, []);

  const r = 45;
  const circ = 2 * Math.PI * r;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, userSelect: "none" }}>
      <button
        onMouseDown={start}
        onMouseUp={end}
        onMouseLeave={end}
        onTouchStart={(e) => { e.preventDefault(); start(); }}
        onTouchEnd={end}
        style={{
          position: "relative",
          width: "clamp(56px, 14vw, 88px)",
          height: "clamp(56px, 14vw, 88px)",
          borderRadius: "50%",
          background: color,
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: holding ? "scale(0.9)" : "scale(1)",
          transition: "transform 0.1s",
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: "clamp(20px, 5vw, 30px)", color: "white", fontWeight: 900, lineHeight: 1 }}>
          {icon}
        </span>
        {holding && (
          <svg
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", transform: "rotate(-90deg)" }}
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke="white"
              strokeWidth="5"
              strokeDasharray={`${(progress / 100) * circ} ${circ}`}
              strokeLinecap="round"
              opacity="0.6"
            />
          </svg>
        )}
      </button>
      <span style={{
        color: "white",
        fontSize: "clamp(9px, 2vw, 12px)",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        textAlign: "center",
      }}>
        {label}
      </span>
      <span style={{
        color: "#94A3B8",
        fontSize: "clamp(8px, 1.8vw, 11px)",
        textAlign: "center",
        lineHeight: 1.2,
      }}>
        {subLabel}
      </span>
    </div>
  );
}
