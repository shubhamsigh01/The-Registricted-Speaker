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

export type Screen = "home" | "pack" | "category" | "game" | "results" | "howto";

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [pack, setPack] = useState<Pack | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [result, setResult] = useState<GameEndResult | null>(null);
  const [gameKey, setGameKey] = useState(0);

  const handlePlayAgain = useCallback(() => {
    setGameKey(k => k + 1);
    setScreen("game");
  }, []);

  const showSidebar = screen !== "game" && screen !== "results";

  return (
    <div className={`app-layout${showSidebar ? " with-sidebar" : ""}`}>
      {showSidebar && <Sidebar currentScreen={screen} setScreen={setScreen} />}
      <main className="main-content">
        {screen === "home" && (
          <HomeScreen
            onStart={() => setScreen("pack")}
            onHowToPlay={() => setScreen("howto")}
          />
        )}
        {screen === "howto" && (
          <HowToPlayScreen onBack={() => setScreen("home")} />
        )}
        {screen === "pack" && (
          <SelectPackScreen
            onBack={() => setScreen("home")}
            onNext={(p) => {
              setPack(p);
              setScreen("category");
            }}
          />
        )}
        {screen === "category" && (
          <SelectCategoryScreen
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
            category={category}
            onEnd={(r) => {
              setResult(r);
              setScreen("results");
            }}
          />
        )}
        {screen === "results" && result && (
          <ResultsScreen
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