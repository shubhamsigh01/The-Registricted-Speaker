import { useState } from "react";
import { categories, packs, getCategoriesForPack } from "../../data/data";
import type { Pack } from "../../types/game";

interface SelectPackScreenProps {
  onBack: () => void;
  onNext: (pack: Pack) => void;
}

const T = {
  blue: "#2563EB",
  gray: "#94A3B8",
};

export function SelectPackScreen({ onBack, onNext }: SelectPackScreenProps) {
  const [selected, setSelected] = useState("everything");
  const pack = packs.find(p => p.id === selected);

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
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "16px clamp(16px, 4vw, 32px)",
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
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          ‹ Back
        </button>
        <h2
          style={{
            flex: 1,
            textAlign: "center",
            margin: 0,
            fontSize: "clamp(16px, 3vw, 22px)",
            fontWeight: 900,
            color: "#0F172A",
          }}
        >
          Select Pack
        </h2>
        <div style={{ width: 60 }} />
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        <div className="responsive-grid">
          {packs.map(p => {
            const wc = getCategoriesForPack(p).reduce((sum, cat) => sum + cat.words.length, 0);
            return (
              <div
                key={p.id}
                className={`pack-card${selected === p.id ? " sel" : ""}`}
                style={{ background: p.color }}
                onClick={() => setSelected(p.id)}
              >
                {selected === p.id && (
                  <div
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      width: 26,
                      height: 26,
                      background: "white",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: T.blue,
                      fontSize: 14,
                      fontWeight: 900,
                    }}
                  >
                    ✓
                  </div>
                )}
                <div style={{ fontSize: "clamp(28px, 6vw, 44px)", marginBottom: 8, textAlign: "center" }}>
                  {p.icon}
                </div>
                <div
                  style={{
                    color: "white",
                    fontWeight: 900,
                    fontSize: "clamp(13px, 2.5vw, 16px)",
                    textAlign: "center",
                    lineHeight: 1.2,
                    marginBottom: 4,
                  }}
                >
                  {p.name}
                </div>
                <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "clamp(10px, 2vw, 12px)", textAlign: "center" }}>
                  {wc} words
                </div>
                <div
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    fontSize: "clamp(9px, 1.8vw, 11px)",
                    textAlign: "center",
                    marginTop: 3,
                  }}
                >
                  {p.description}
                </div>
              </div>
            );
          })}
        </div>

        {/* Preview categories */}
        {pack && (
          <div style={{ marginTop: "clamp(16px, 4vw, 32px)", maxWidth: 900, margin: "clamp(16px, 4vw, 32px) auto 0" }}>
            <p
              style={{
                color: T.gray,
                fontSize: "clamp(11px, 2vw, 14px)",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 12,
              }}
            >
              Included categories ({pack.categoryIds.length})
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {getCategoriesForPack(pack).map(cat => (
                <span
                  key={cat.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 14px",
                    background: `${cat.color}20`,
                    border: `1.5px solid ${cat.color}40`,
                    borderRadius: 50,
                    fontSize: "clamp(11px, 2vw, 13px)",
                    fontWeight: 700,
                  }}
                >
                  {cat.icon} {cat.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: "clamp(12px, 3vw, 24px) clamp(16px, 4vw, 32px)" }}>
        <button className="next-btn" onClick={() => {
          const p = packs.find(pk => pk.id === selected);
          if (p) onNext(p);
        }}>
          Next ›
        </button>
      </div>
    </div>
  );
}
