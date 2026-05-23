/**
 * The Restricted Speaker — Constraints Library
 * Contains validation rules for hint submission.
 */
export const CONSTRAINTS = [
  {
    id: "vowel_less",
    label: "The Vowel-Less",
    icon: "🚫",
    description: "No words containing the letter 'E' (case-insensitive)",
    validate: (hint) => {
      // Split by words (removing punctuation)
      const words = hint.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "").trim().split(/\s+/);
      if (words.length === 0 || (words.length === 1 && words[0] === "")) return true;
      return !words.some(w => w.toLowerCase().includes('e'));
    },
    errorMsg: "Oops! One of your words contains the letter 'E'."
  },
  {
    id: "one_word",
    label: "The One-Word Wonder",
    icon: "☝️",
    description: "Your entire hint must be exactly ONE word — no spaces allowed",
    validate: (hint) => {
      const clean = hint.trim();
      if (clean === "") return false;
      return clean.split(/\s+/).length === 1;
    },
    errorMsg: "Only ONE word allowed (no spaces)!"
  },
  {
    id: "spooky_story",
    label: "The Narrative",
    icon: "👻",
    description: "Your hint must be written as part of a spooky horror story (min 10 chars)",
    validate: (hint) => hint.trim().length >= 10,
    errorMsg: "Write it as a spooky story (at least 10 characters)!"
  },
  {
    id: "questions_only",
    label: "The Interrogator",
    icon: "❓",
    description: "Your hint must be phrased as a question ending with '?'",
    validate: (hint) => hint.trim().endsWith('?'),
    errorMsg: "Your hint must be a question ending with '?'"
  },
  {
    id: "rhyme_time",
    label: "The Rhymer",
    icon: "🎵",
    description: "Your hint must end with a word that rhymes with the target word's last syllable (honor system — just try!)",
    validate: (hint) => hint.trim().length >= 5,
    errorMsg: "Hint is too short! (Must be at least 5 characters)"
  },
  {
    id: "no_nouns",
    label: "The Abstract",
    icon: "🌀",
    description: "You cannot use any nouns — describe feelings and actions only (honor system!)",
    validate: (hint) => hint.trim().length >= 3,
    errorMsg: "No nouns allowed — describe feelings and actions only! (min 3 characters)"
  },
  {
    id: "alliteration",
    label: "The Alliterator",
    icon: "🔤",
    description: "Every word in your hint must start with the same letter",
    validate: (hint) => {
      // Remove punctuation and clean up spaces
      const words = hint.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "").trim().split(/\s+/);
      const filtered = words.filter(w => w.length > 0);
      if (filtered.length < 2) return true;
      const firstLetter = filtered[0][0].toLowerCase();
      return filtered.every(w => w[0].toLowerCase() === firstLetter);
    },
    errorMsg: "Every word must start with the same letter!"
  },
  {
    id: "emoji_banned",
    label: "The Purist",
    icon: "📵",
    description: "No emojis allowed — pure text only",
    validate: (hint) => {
      // Regular expression matching typical emoji ranges, including extended pictographs
      const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{1F1E6}-\u{1F1FF}]/gu;
      return !emojiRegex.test(hint);
    },
    errorMsg: "No emojis! Pure words only."
  }
];

/**
 * Validates a hint text against a specific constraint by ID.
 * Returns { valid: boolean, errorMsg: string }
 */
export function validateHint(hintText, constraintId) {
  const constraint = CONSTRAINTS.find(c => c.id === constraintId);
  if (!constraint) return { valid: true, errorMsg: "" };
  
  const isValid = constraint.validate(hintText);
  return {
    valid: isValid,
    errorMsg: isValid ? "" : constraint.errorMsg
  };
}
