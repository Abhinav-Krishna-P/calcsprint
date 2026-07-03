import type { Question } from "./types";

// Helper to generate a random number in range [min, max] inclusive
function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 1-digit + 1-digit and 1-digit - 1-digit
export const generate1DigitAddSub = (): Question => {
  const isAddition = Math.random() > 0.5;
  const a = getRandomInt(0, 9);
  const b = getRandomInt(0, 9);

  if (isAddition) {
    return {
      question: `${a} + ${b}`,
      answer: a + b
    };
  } else {
    // Subtraction - ensure non-negative
    const high = Math.max(a, b);
    const low = Math.min(a, b);
    return {
      question: `${high} - ${low}`,
      answer: high - low
    };
  }
};

// 2-digit + 2-digit and 2-digit - 2-digit
export const generate2DigitAddSub = (): Question => {
  const isAddition = Math.random() > 0.5;
  const a = getRandomInt(10, 99);
  const b = getRandomInt(10, 99);

  if (isAddition) {
    return {
      question: `${a} + ${b}`,
      answer: a + b
    };
  } else {
    // Subtraction - ensure non-negative
    const high = Math.max(a, b);
    const low = Math.min(a, b);
    return {
      question: `${high} - ${low}`,
      answer: high - low
    };
  }
};

// 3-digit + 2-digit and 3-digit - 2-digit
export const generate3Digit2DigitAddSub = (): Question => {
  const isAddition = Math.random() > 0.5;
  const a = getRandomInt(100, 999);
  const b = getRandomInt(10, 99);

  if (isAddition) {
    return {
      question: `${a} + ${b}`,
      answer: a + b
    };
  } else {
    // Subtraction - since a is 3-digit and b is 2-digit, a - b is always non-negative
    return {
      question: `${a} - ${b}`,
      answer: a - b
    };
  }
};
