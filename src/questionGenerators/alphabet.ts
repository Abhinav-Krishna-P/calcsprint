import type { Question } from "./types";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// Helper to get random letter
function getRandomLetter(): string {
  return ALPHABET[Math.floor(Math.random() * 26)];
}

// Letter -> Number (A = 1, Z = 26)
export const generateLetterToNumber = (): Question => {
  const letter = getRandomLetter();
  const answer = letter.charCodeAt(0) - 65 + 1;
  return {
    question: `Letter: ${letter}`,
    answer
  };
};

// Mirror Letter (A <-> Z, B <-> Y, etc.)
export const generateMirrorLetter = (): Question => {
  const letter = getRandomLetter();
  const letterVal = letter.charCodeAt(0) - 65; // 0 to 25
  const mirrorVal = 25 - letterVal;
  const answer = ALPHABET[mirrorVal];
  return {
    question: `Mirror of ${letter}`,
    answer
  };
};
