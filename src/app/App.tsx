import { useState, useCallback } from "react";
import {
  HomeScreen,
  SelectPackScreen,
  SelectCategoryScreen,
  GameScreen,
  ResultsScreen,
  HowToPlayScreen,
  Sidebar,
} from "./screens";
import type { Category, Pack, GameEndResult } from "./types/game";
import { useLayout, LAYOUT_CONFIG } from "./hooks/useLayout";

export type Screen = "home" | "pack" | "category" | "game" | "results" | "howto";

export default function App() {
  const layout = useLayout();
  const config = LAYOUT_CONFIG[layout];

  const [screen, setScreen] = useState<Screen>("home");
  const [pack, setPack] = useState<Pack | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [result, setResult] = useState<GameEndResult | null>(null);
  const [gameKey, setGameKey] = useState(0);

  const handlePlayAgain = useCallback(() => {
    setGameKey(k => k + 1);
    setScreen("game");
  }, []);

  const showSidebar = screen !== "game" && screen !== "results" && config.navType !== "none";

  return (
    <div
      style={{
        paddingTop: "var(--safe-top)",
        paddingBottom: "var(--safe-bottom)",
        paddingLeft: "var(--safe-left)",
        paddingRight: "var(--safe-right)",
        minHeight: "100dvh",
        width: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: config.navType === "sidebar-icon" || config.navType === "sidebar-full" ? "row" : "column",
        position: "relative",
      }}
    >
      {showSidebar && (
        <Sidebar
          layout={layout}
          currentScreen={screen}
          setScreen={setScreen}
        />
      )}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100%",
          marginLeft: showSidebar && (config.navType === "sidebar-icon" || config.navType === "sidebar-full") ? config.sidebarWidth : 0,
          paddingBottom: showSidebar && config.navType === "bottom" ? "64px" : 0,
        }}
      >
        {screen === "home" && (
          <HomeScreen
            layout={layout}
            onStart={() => setScreen("pack")}
            onHowToPlay={() => setScreen("howto")}
          />
        )}
        {screen === "howto" && (
          <HowToPlayScreen
            layout={layout}
            onBack={() => setScreen("home")}
          />
        )}
        {screen === "pack" && (
          <SelectPackScreen
            layout={layout}
            onBack={() => setScreen("home")}
            onNext={(p) => {
              setPack(p);
              setScreen("category");
            }}
          />
        )}
        {screen === "category" && (
          <SelectCategoryScreen
            layout={layout}
            pack={pack}
            onBack={() => setScreen("pack")}
            onStart={(c) => {
              setCategory(c);
              setGameKey(k => k + 1);
              setScreen("game");
            }}
          />
        )}
        {screen === "game" && category && (
          <GameScreen
            key={gameKey}
            layout={layout}
            category={category}
            onEnd={(r) => {
              setResult(r);
              setScreen("results");
            }}
          />
        )}
        {screen === "results" && result && (
          <ResultsScreen
            layout={layout}
            result={result}
            onPlayAgain={handlePlayAgain}
            onHome={() => {
              setScreen("home");
              setResult(null);
            }}
          />
        )}
      </main>
    </div>
  );
}