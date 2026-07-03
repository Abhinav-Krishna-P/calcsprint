import type { Question } from "./types";

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 1-digit x 1-digit
export const generate1DigitMult = (): Question => {
  const a = getRandomInt(1, 9);
  const b = getRandomInt(1, 9);
  return {
    question: `${a} × ${b}`,
    answer: a * b
  };
};

// 2-digit x 2-digit
export const generate2DigitMult = (): Question => {
  const a = getRandomInt(10, 99);
  const b = getRandomInt(10, 99);
  return {
    question: `${a} × ${b}`,
    answer: a * b
  };
};

// 3-digit x 3-digit
export const generate3DigitMult = (): Question => {
  const a = getRandomInt(100, 999);
  const b = getRandomInt(100, 999);
  return {
    question: `${a} × ${b}`,
    answer: a * b
  };
};
