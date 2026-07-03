import type { Question } from "./types";

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Squares of 1-digit
export const generateSquare1Digit = (): Question => {
  const n = getRandomInt(1, 9);
  return {
    question: `${n}²`,
    answer: n * n
  };
};

// Squares of 2-digit
export const generateSquare2Digit = (): Question => {
  const n = getRandomInt(10, 99);
  return {
    question: `${n}²`,
    answer: n * n
  };
};

// Squares of 3-digit
export const generateSquare3Digit = (): Question => {
  const n = getRandomInt(100, 999);
  return {
    question: `${n}²`,
    answer: n * n
  };
};

// Cubes of 1-digit
export const generateCube1Digit = (): Question => {
  const n = getRandomInt(1, 9);
  return {
    question: `${n}³`,
    answer: n * n * n
  };
};

// Cubes of 2-digit
export const generateCube2Digit = (): Question => {
  const n = getRandomInt(10, 99);
  return {
    question: `${n}³`,
    answer: n * n * n
  };
};

// Cubes of 3-digit
export const generateCube3Digit = (): Question => {
  const n = getRandomInt(100, 999);
  return {
    question: `${n}³`,
    answer: n * n * n
  };
};

// Square root of 2-digit perfect square (roots: 4 to 9)
export const generateSqrt2Digit = (): Question => {
  const r = getRandomInt(4, 9);
  const s = r * r;
  return {
    question: `√${s}`,
    answer: r
  };
};

// Square root of 3-digit perfect square (roots: 10 to 31)
export const generateSqrt3Digit = (): Question => {
  const r = getRandomInt(10, 31);
  const s = r * r;
  return {
    question: `√${s}`,
    answer: r
  };
};

// Square root of 4-digit perfect square (roots: 32 to 99)
export const generateSqrt4Digit = (): Question => {
  const r = getRandomInt(32, 99);
  const s = r * r;
  return {
    question: `√${s}`,
    answer: r
  };
};

// Square root of 5-digit perfect square (roots: 100 to 316)
export const generateSqrt5Digit = (): Question => {
  const r = getRandomInt(100, 316);
  const s = r * r;
  return {
    question: `√${s}`,
    answer: r
  };
};
