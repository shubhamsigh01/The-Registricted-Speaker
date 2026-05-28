import type { Screen } from "../../App";
import { LayoutType, LAYOUT_CONFIG } from "../../hooks/useLayout";

interface SidebarProps {
  layout: LayoutType;
  currentScreen: Screen;
  setScreen: (screen: Screen) => void;
}

export function Sidebar({ layout, currentScreen, setScreen }: SidebarProps) {
  const config = LAYOUT_CONFIG[layout];

  if (config.navType === "none") return null;

  const tabs = [
    { id: "home", label: "Home", icon: "🏠", target: "home" as const },
    { id: "packs", label: currentScreen === "category" ? "Category" : "Packs", icon: "📦", target: "pack" as const },
    { id: "howto", label: "How to Play", icon: "❓", target: "howto" as const },
  ];

  const isActive = (tabId: string) => {
    if (tabId === "home") return currentScreen === "home";
    if (tabId === "packs") return currentScreen === "pack" || currentScreen === "category";
    if (tabId === "howto") return currentScreen === "howto";
    return false;
  };

  const isBottom = config.navType === "bottom";
  const isIcon = config.navType === "sidebar-icon";
  const isFull = config.navType === "sidebar-full";

  const containerStyle: React.CSSProperties = isBottom ? {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    height: "64px",
    display: "flex",
    flexDirection: "row",
    borderTop: "1.5px solid #E2E8F0",
    background: "#ffffff",
    boxSizing: "border-box",
    zIndex: 100,
  } : {
    position: "fixed",
    left: 0,
    top: 0,
    bottom: 0,
    width: config.sidebarWidth,
    display: "flex",
    flexDirection: "column",
    alignItems: isIcon ? "center" : "stretch",
    borderRight: "1.5px solid #E2E8F0",
    padding: isIcon ? "16px 0" : "24px 16px",
    background: "#ffffff",
    boxSizing: "border-box",
    zIndex: 100,
  };

  const navStyle: React.CSSProperties = isBottom ? {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    height: "100%",
  } : {
    display: "flex",
    flexDirection: "column",
    alignItems: isIcon ? "center" : "stretch",
    gap: isIcon ? "16px" : "8px",
    width: "100%",
  };

  return (
    <aside style={containerStyle}>
      {!isBottom && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          justifyContent: isIcon ? "center" : "flex-start",
          paddingLeft: isFull ? "12px" : "0px",
          marginBottom: isIcon ? "24px" : "32px",
        }}>
          <span style={{ fontSize: "22px" }}>✨</span>
          {isFull && <span style={{ fontWeight: 900, color: "#0F172A", fontSize: "20px" }}>HeadsUp!</span>}
        </div>
      )}
      <nav style={navStyle}>
        {tabs.map(tab => {
          const active = isActive(tab.id);
          
          const tabStyle: React.CSSProperties = isBottom ? {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            height: "100%",
            gap: "4px",
            background: active ? "#EFF6FF" : "none",
            borderTop: active ? "3px solid #2563EB" : "none",
            borderLeft: "none",
            borderRight: "none",
            borderBottom: "none",
            cursor: "pointer",
            fontFamily: "'Nunito', system-ui, sans-serif",
            color: active ? "#2563EB" : "#64748B",
            fontWeight: active ? 800 : 400,
          } : isIcon ? {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            background: active ? "#EFF6FF" : "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "'Nunito', system-ui, sans-serif",
            color: active ? "#2563EB" : "#64748B",
            fontWeight: active ? 800 : 400,
          } : {
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "12px",
            padding: "12px 16px",
            borderRadius: "12px",
            width: "100%",
            background: active ? "#EFF6FF" : "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "'Nunito', system-ui, sans-serif",
            color: active ? "#2563EB" : "#64748B",
            fontWeight: active ? 800 : 700,
            textAlign: "left",
          };

          return (
            <button
              key={tab.id}
              onClick={() => setScreen(tab.target)}
              style={tabStyle}
            >
              <span style={{ fontSize: isBottom ? "18px" : "20px" }}>{tab.icon}</span>
              {(!isIcon) && <span style={{ fontSize: isBottom ? "10px" : "15px" }}>{tab.label}</span>}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
