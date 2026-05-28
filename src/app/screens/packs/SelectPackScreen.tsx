import { useState } from "react";
import { categories, packs, getCategoriesForPack } from "../../data/data";
import type { Pack } from "../../types/game";
import { LayoutType, LAYOUT_CONFIG } from "../../hooks/useLayout";

interface SelectPackScreenProps {
  layout: LayoutType;
  onBack: () => void;
  onNext: (pack: Pack) => void;
}

const T = {
  blue: "#2563EB",
  gray: "#94A3B8",
};

export function SelectPackScreen({ layout, onBack, onNext }: SelectPackScreenProps) {
  const [selected, setSelected] = useState("everything");
  const pack = packs.find(p => p.id === selected);
  const config = LAYOUT_CONFIG[layout];

  const cardHeight =
    layout === "mobile-landscape"
      ? "110px"
      : layout === "mobile-portrait" || layout === "phablet"
      ? "140px"
      : layout === "tablet"
      ? "160px"
      : "180px";

  const gridCols =
    layout === "mobile-portrait" || layout === "phablet"
      ? 2
      : layout === "desktop"
      ? 4
      : 3;

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
      {/* Top bar */}
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
            fontSize: "20px",
            fontWeight: 900,
            color: "#0F172A",
          }}
        >
          Select Pack
        </h2>
        <div style={{ width: 60 }} />
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: config.hPadding }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
            gap: 16,
            width: "100%",
            maxWidth: 1200,
            margin: "0 auto",
            boxSizing: "border-box",
          }}
        >
          {packs.map(p => {
            const wc = getCategoriesForPack(p).reduce((sum, cat) => sum + cat.words.length, 0);
            const isSelected = selected === p.id;
            return (
              <div
                key={p.id}
                className={`pack-card${isSelected ? " sel" : ""}`}
                style={{
                  background: p.color,
                  height: cardHeight,
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onClick={() => setSelected(p.id)}
              >
                {isSelected && (
                  <div
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      width: 24,
                      height: 24,
                      background: "white",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: T.blue,
                      fontSize: 12,
                      fontWeight: 900,
                    }}
                  >
                    ✓
                  </div>
                )}
                <div style={{ fontSize: layout === "mobile-landscape" ? "24px" : "32px", marginBottom: 4, textAlign: "center" }}>
                  {p.icon}
                </div>
                <div
                  style={{
                    color: "white",
                    fontWeight: 900,
                    fontSize: layout === "mobile-landscape" ? "13px" : "15px",
                    textAlign: "center",
                    lineHeight: 1.2,
                    marginBottom: 2,
                  }}
                >
                  {p.name}
                </div>
                <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "11px", textAlign: "center" }}>
                  {wc} words
                </div>
                {layout !== "mobile-landscape" && (
                  <div
                    style={{
                      color: "rgba(255,255,255,0.7)",
                      fontSize: "10px",
                      textAlign: "center",
                      marginTop: 3,
                      opacity: 0.9,
                    }}
                  >
                    {p.description}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Preview categories */}
        {pack && (
          <div style={{ marginTop: 24, maxWidth: 1200, margin: "24px auto 0" }}>
            <p
              style={{
                color: T.gray,
                fontSize: "12px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 12,
              }}
            >
              Included categories ({pack.categoryIds.length})
            </p>
            
            {layout === "mobile-landscape" ? (
              <div
                style={{
                  display: "flex",
                  overflowX: "auto",
                  gap: 8,
                  paddingBottom: 8,
                  whiteSpace: "nowrap",
                  width: "100%",
                }}
              >
                {getCategoriesForPack(pack).map(cat => (
                  <span
                    key={cat.id}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 14px",
                      background: `${cat.color}20`,
                      border: `1.5px solid ${cat.color}40`,
                      borderRadius: 50,
                      fontSize: "12px",
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {cat.icon} {cat.name}
                  </span>
                ))}
              </div>
            ) : (
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
                      fontSize: layout === "desktop" ? "13px" : "12px",
                      fontWeight: 700,
                    }}
                  >
                    {cat.icon} {cat.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ padding: `16px ${config.hPadding}`, borderTop: "1.5px solid #E2E8F0" }}>
        <button
          className="next-btn"
          onClick={() => {
            const p = packs.find(pk => pk.id === selected);
            if (p) onNext(p);
          }}
        >
          Next ›
        </button>
      </div>
    </div>
  );
}
