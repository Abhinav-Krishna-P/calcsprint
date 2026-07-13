import type { Question } from "./types";

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const FACTORIALS = [1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880];

export const generateFactorialQuestion = (): Question => {
  const templateType = getRandomInt(1, 3);

  switch (templateType) {
    case 1: {
      // Simple Factorials: n! (n between 0 and 8)
      const n = getRandomInt(0, 8);
      return {
        question: `${n}!`,
        answer: FACTORIALS[n]
      };
    }
    case 2: {
      // Factorial Division: n! ÷ d!
      // Ensure the result is simple to calculate (e.g., n between 3 and 10, d is n-1 or n-2 or n-3)
      const n = getRandomInt(3, 9);
      const diff = getRandomInt(1, 3);
      const d = n - diff;
      
      let answer = 1;
      for (let i = d + 1; i <= n; i++) {
        answer *= i;
      }

      return {
        question: `${n}! ÷ ${d}!`,
        answer: answer
      };
    }
    case 3:
    default: {
      // Permutations and Combinations: nPr or nCr
      const isCombination = Math.random() > 0.5;
      const n = getRandomInt(3, 8);
      const r = getRandomInt(2, Math.min(n - 1, 4));

      if (isCombination) {
        // nCr = n! / (r! * (n-r)!)
        let numerator = 1;
        for (let i = n - r + 1; i <= n; i++) {
          numerator *= i;
        }
        let denominator = 1;
        for (let i = 2; i <= r; i++) {
          denominator *= i;
        }
        const answer = numerator / denominator;

        return {
          question: `${n}C${r}`,
          answer: answer
        };
      } else {
        // nPr = n! / (n-r)!
        let answer = 1;
        for (let i = n - r + 1; i <= n; i++) {
          answer *= i;
        }

        return {
          question: `${n}P${r}`,
          answer: answer
        };
      }
    }
  }
};
