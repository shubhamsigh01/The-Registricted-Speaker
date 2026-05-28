export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  words: string[];
  hints: Record<string, string>;
}

export interface GameResult {
  word: string;
  correct: boolean;
}

export interface GameEndResult {
  score: number;
  skipped: number;
  bestStreak: number;
  history: GameResult[];
  categoryName: string;
}

export interface Pack {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  categoryIds: string[];
}
