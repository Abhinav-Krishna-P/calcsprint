import type { Question } from "./types";

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 2-digit / 1-digit (always exact)
export const generate2DigitDiv1Digit = (): Question => {
  // Divisor between 2 and 9
  const b = getRandomInt(2, 9);
  
  // Quotient must result in a 2-digit dividend (10 to 99)
  const minC = Math.ceil(10 / b);
  const maxC = Math.floor(99 / b);
  const c = getRandomInt(minC, maxC);
  
  const a = b * c;
  
  return {
    question: `${a} ÷ ${b}`,
    answer: c
  };
};

// 4-digit / 2-digit (always exact)
export const generate4DigitDiv2Digit = (): Question => {
  // Divisor between 10 and 99
  const b = getRandomInt(10, 99);
  
  // Quotient must result in a 4-digit dividend (1000 to 9999)
  const minC = Math.ceil(1000 / b);
  const maxC = Math.floor(9999 / b);
  const c = getRandomInt(minC, maxC);
  
  const a = b * c;
  
  return {
    question: `${a} ÷ ${b}`,
    answer: c
  };
};
