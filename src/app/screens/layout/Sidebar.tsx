import type { Screen } from "../../App";

interface SidebarProps {
  currentScreen: Screen;
  setScreen: (screen: Screen) => void;
}

export function Sidebar({ currentScreen, setScreen }: SidebarProps) {
  const tabs = [
    { id: "home", label: "Home", icon: "🏠", target: "home" as const },
    { id: "packs", label: "Packs", icon: "📦", target: "pack" as const },
    { id: "howto", label: "How to Play", icon: "❓", target: "howto" as const },
  ];

  // Helper to check if a tab is active
  const isActive = (tabId: string) => {
    if (tabId === "home") return currentScreen === "home";
    if (tabId === "packs") return currentScreen === "pack" || currentScreen === "category";
    if (tabId === "howto") return currentScreen === "howto";
    return false;
  };

  return (
    <aside className="sidebar-container">
      <div className="sidebar-logo">
        <span className="logo-spark">✨</span>
        <span className="logo-text">HeadsUp!</span>
      </div>
      <nav className="sidebar-nav">
        {tabs.map(tab => {
          const active = isActive(tab.id);
          return (
            <button
              key={tab.id}
              onClick={() => setScreen(tab.target)}
              className={`sidebar-tab${active ? " active" : ""}`}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
