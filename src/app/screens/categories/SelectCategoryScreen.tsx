import { useState } from "react";
import type { Category, Pack } from "../../types/game";
import { getCategoriesForPack, mergeCategories } from "../../data/data";
import { LayoutType, LAYOUT_CONFIG } from "../../hooks/useLayout";

interface SelectCategoryScreenProps {
  layout: LayoutType;
  pack: Pack | null;
  onBack: () => void;
  onStart: (category: Category) => void;
}

const T = {
  blue: "#2563EB",
  gray: "#94A3B8",
};

export function SelectCategoryScreen({ layout, pack, onBack, onStart }: SelectCategoryScreenProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(["all"]));
  const [search, setSearch] = useState("");
  const availCats = pack ? getCategoriesForPack(pack) : [];
  const filtered = availCats.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  const config = LAYOUT_CONFIG[layout];

  const toggle = (id: string) => {
    setSelected(prev => {
      const nextSet = new Set(prev);
      if (id === "all") {
        nextSet.clear();
        nextSet.add("all");
      } else {
        nextSet.delete("all");
        if (nextSet.has(id)) {
          nextSet.delete(id);
        } else {
          nextSet.add(id);
        }
      }
      return nextSet;
    });
  };

  const selectedCount = selected.has("all") ? availCats.length : selected.size;
  const isDisabled = selectedCount === 0;

  const handleStart = () => {
    let catsToMerge: Category[] = [];
    if (selected.has("all")) {
      catsToMerge = availCats;
    } else {
      catsToMerge = availCats.filter(c => selected.has(c.id));
    }

    if (catsToMerge.length === 0) return;

    const { words, hints, name } = mergeCategories(catsToMerge);
    const firstCat = catsToMerge[0];

    const pooledCat: Category = {
      id: "pooled_" + catsToMerge.map(c => c.id).join("_"),
      name: selected.has("all") ? "All Categories" : name,
      icon: selected.has("all") ? "🌐" : firstCat?.icon || "🌟",
      color: selected.has("all") ? "#2563EB" : firstCat?.color || "#10B981",
      words,
      hints,
    };

    onStart(pooledCat);
  };

  const gridCols =
    layout === "mobile-portrait" || layout === "phablet"
      ? 2
      : layout === "tablet"
      ? 3
      : 4;

  if (layout === "mobile-landscape") {
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
        }}
      >
        {/* Sticky top row for mobile-landscape */}
        <div
          style={{
            position: "sticky",
            top: 0,
            background: "white",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "8px 12px",
            borderBottom: "1.5px solid #E2E8F0",
          }}
        >
          <button
            onClick={onBack}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 16,
              color: T.blue,
              fontWeight: 700,
              fontFamily: "inherit",
              whiteSpace: "nowrap",
            }}
          >
            ‹ Back
          </button>

          <input
            className="search-input"
            placeholder="🔍 Search categories…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              margin: 0,
              flex: 1,
              padding: "8px 12px",
              fontSize: "14px",
              borderRadius: "10px",
            }}
          />

          <button
            onClick={handleStart}
            disabled={isDisabled}
            style={{
              margin: 0,
              width: "auto",
              padding: "8px 16px",
              borderRadius: "50px",
              border: "none",
              color: "white",
              fontWeight: 800,
              fontSize: "13px",
              background: isDisabled ? T.gray : T.blue,
              opacity: isDisabled ? 0.5 : 1,
              cursor: isDisabled ? "not-allowed" : "pointer",
              whiteSpace: "nowrap",
              fontFamily: "inherit",
            }}
          >
            Start ({selectedCount})
          </button>
        </div>

        {/* Scrollable grid area */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
              gap: 10,
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            {!search && (
              <div
                className={`cat-row${selected.has("all") ? " sel" : ""}`}
                onClick={() => toggle("all")}
                style={{
                  gridColumn: "1 / -1",
                  background: selected.has("all") ? "#EFF6FF" : "white",
                  padding: "10px 14px",
                  borderRadius: "10px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 20 }}>🌐</span>
                  <div>
                    <div style={{ fontWeight: 800, color: "#0F172A", fontSize: "14px" }}>
                      All Categories
                    </div>
                    <div style={{ color: T.gray, fontSize: "11px" }}>
                      Random category each round
                    </div>
                  </div>
                </div>
                {selected.has("all") && (
                  <span style={{ color: T.blue, fontSize: 16, fontWeight: 900 }}>✓</span>
                )}
              </div>
            )}

            {filtered.map(c => (
              <div
                key={c.id}
                className={`cat-row${selected.has(c.id) ? " sel" : ""}`}
                onClick={() => toggle(c.id)}
                style={{ padding: "8px 12px", borderRadius: "10px" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: `${c.color}20`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                    }}
                  >
                    {c.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, color: "#0F172A", fontSize: "12px" }}>
                      {c.name}
                    </div>
                    <div style={{ color: T.gray, fontSize: "10px" }}>{c.words.length} words</div>
                  </div>
                </div>
                {selected.has(c.id) && <span style={{ color: T.blue, fontWeight: 900, fontSize: "12px" }}>✓</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          Select Category
          {selectedCount > 0 && (
            <span
              style={{
                background: T.blue,
                color: "white",
                borderRadius: "12px",
                padding: "2px 8px",
                fontSize: "12px",
                fontWeight: 800,
              }}
            >
              {selectedCount}
            </span>
          )}
        </h2>
        <div style={{ width: 60 }} />
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: `${config.hPadding} 0` }}>
        <div style={{ width: "100%", boxSizing: "border-box", padding: `0 ${config.hPadding}` }}>
          <input
            className="search-input"
            placeholder="🔍  Search categories…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%",
              maxWidth: 1200,
              margin: "0 auto 16px",
              display: "block",
            }}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
            gap: 16,
            width: "100%",
            maxWidth: 1200,
            margin: "0 auto",
            boxSizing: "border-box",
            padding: `0 ${config.hPadding}`,
          }}
        >
          {!search && (
            <div
              className={`cat-row${selected.has("all") ? " sel" : ""}`}
              onClick={() => toggle("all")}
              style={{ gridColumn: "1/-1", background: selected.has("all") ? "#EFF6FF" : "white" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 22 }}>🌐</span>
                <div>
                  <div style={{ fontWeight: 800, color: "#0F172A", fontSize: "15px" }}>
                    All Categories
                  </div>
                  <div style={{ color: T.gray, fontSize: "12px" }}>
                    Random category each round
                  </div>
                </div>
              </div>
              {selected.has("all") && (
                <span style={{ color: T.blue, fontSize: 18, fontWeight: 900 }}>✓</span>
              )}
            </div>
          )}

          {filtered.map(c => (
            <div
              key={c.id}
              className={`cat-row${selected.has(c.id) ? " sel" : ""}`}
              onClick={() => toggle(c.id)}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: `${c.color}20`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                  }}
                >
                  {c.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: "#0F172A", fontSize: "14px" }}>
                    {c.name}
                  </div>
                  <div style={{ color: T.gray, fontSize: "11px" }}>{c.words.length} words</div>
                </div>
              </div>
              {selected.has(c.id) && <span style={{ color: T.blue, fontWeight: 900 }}>✓</span>}
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: `16px ${config.hPadding}`, borderTop: "1.5px solid #E2E8F0" }}>
        {selectedCount > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12, maxHeight: 100, overflowY: "auto" }}>
            {selected.has("all") ? (
              <span style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 12px",
                background: "#EFF6FF",
                border: "1.5px solid #3B82F6",
                borderRadius: 50,
                fontSize: "12px",
                fontWeight: 700,
                color: "#1E40AF",
              }}>
                🌐 All Categories
              </span>
            ) : (
              availCats.filter(c => selected.has(c.id)).map(c => (
                <span
                  key={c.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 12px",
                    background: `${c.color}20`,
                    border: `1.5px solid ${c.color}40`,
                    borderRadius: 50,
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#1E293B",
                  }}
                >
                  {c.icon} {c.name}
                </span>
              ))
            )}
          </div>
        )}

        <button
          className="next-btn"
          onClick={handleStart}
          disabled={isDisabled}
          style={{
            opacity: isDisabled ? 0.5 : 1,
            cursor: isDisabled ? "not-allowed" : "pointer",
            background: isDisabled ? T.gray : T.blue,
          }}
        >
          Start Game
        </button>
      </div>
    </div>
  );
}
