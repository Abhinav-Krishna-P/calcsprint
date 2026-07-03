import type { Question } from "./types";

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const DIVISORS = [2, 3, 4, 5, 6, 7, 8, 9, 11];

export const generateDivisibility = (): Question => {
  const d = DIVISORS[Math.floor(Math.random() * DIVISORS.length)];
  const isDivisible = Math.random() > 0.5;
  
  // Target range for number: 50 to 1500
  const minM = Math.ceil(50 / d);
  const maxM = Math.floor(1500 / d);
  const m = getRandomInt(minM, maxM);
  
  if (isDivisible) {
    const n = d * m;
    return {
      question: `Is ${n} divisible by ${d}?`,
      answer: "Yes"
    };
  } else {
    const remainder = getRandomInt(1, d - 1);
    const n = d * m + remainder;
    return {
      question: `Is ${n} divisible by ${d}?`,
      answer: "No"
    };
  }
};
