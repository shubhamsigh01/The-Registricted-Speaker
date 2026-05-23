/**
 * The Restricted Speaker — Indian Word Bank & Categories
 * 12 desi-themed categories with culturally rich words.
 * Export signatures unchanged — drop-in replacement.
 */
export const CATEGORIES = window.WORD_BANK || {};

/**
 * Returns a random word from the specified category, ensuring it wasn't used yet if possible.
 */
export function getRandomWord(category, customWords = null, usedWords = []) {
  let list = [];

  if (customWords && customWords.length > 0) {
    list = customWords;
  } else if (CATEGORIES[category]) {
    list = CATEGORIES[category];
  } else {
    // Fallback: merge all standard words
    list = Object.values(CATEGORIES).flat();
  }

  // Filter out already used words
  let available = list.filter(w => !usedWords.includes(w.toLowerCase()));

  // If all words are used, reset/reshuffle by clearing them from usedWords
  if (available.length === 0) {
    const listLower = list.map(w => w.toLowerCase());
    for (let i = usedWords.length - 1; i >= 0; i--) {
      if (listLower.includes(usedWords[i])) {
        usedWords.splice(i, 1);
      }
    }
    available = list;
  }

  const randIndex = Math.floor(Math.random() * available.length);
  return available[randIndex];
}

/**
 * Gets a random category from the selected list of categories.
 */
export function getRandomCategory(selectedCategories) {
  if (!selectedCategories || selectedCategories.length === 0) {
    selectedCategories = Object.keys(CATEGORIES);
  }
  const randIndex = Math.floor(Math.random() * selectedCategories.length);
  return selectedCategories[randIndex];
}

/**
 * Parses uploaded text file of custom words.
 * Expects one word per line.
 */
export function parseCustomWords(fileText) {
  if (!fileText) return [];
  return fileText
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith("#"));
}
