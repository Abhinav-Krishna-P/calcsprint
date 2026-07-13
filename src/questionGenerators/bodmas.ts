import type { Question } from "./types";

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const generateBodmasQuestion = (): Question => {
  const templateType = getRandomInt(1, 5);

  switch (templateType) {
    case 1: {
      // Template 1: A + B * C - D
      const b = getRandomInt(2, 10);
      const c = getRandomInt(2, 10);
      const a = getRandomInt(5, 50);
      const d = getRandomInt(2, a + b * c - 1);
      return {
        question: `${a} + ${b} × ${c} - ${d}`,
        answer: a + b * c - d
      };
    }
    case 2: {
      // Template 2: A * B + C / D
      const d = getRandomInt(2, 9);
      const q = getRandomInt(2, 10); // Q = C / D
      const c = d * q;
      const a = getRandomInt(2, 12);
      const b = getRandomInt(2, 10);
      return {
        question: `${a} × ${b} + ${c} ÷ ${d}`,
        answer: a * b + q
      };
    }
    case 3: {
      // Template 3: (A + B) * C - D
      const a = getRandomInt(2, 10);
      const b = getRandomInt(2, 10);
      const c = getRandomInt(2, 6);
      const d = getRandomInt(1, (a + b) * c - 1);
      return {
        question: `(${a} + ${b}) × ${c} - ${d}`,
        answer: (a + b) * c - d
      };
    }
    case 4: {
      // Template 4: A * (B - C) / D
      const d = getRandomInt(2, 9);
      const q = getRandomInt(2, 8); // Q = (A * (B - C)) / D
      const product = d * q;
      
      // Find all factors of product
      const factors: number[] = [];
      for (let i = 1; i <= product; i++) {
        if (product % i === 0) {
          factors.push(i);
        }
      }
      
      // Select a random factor for A
      const a = factors[getRandomInt(0, factors.length - 1)];
      const diff = product / a; // diff = B - C
      
      const c = getRandomInt(1, 10);
      const b = c + diff;
      
      return {
        question: `${a} × (${b} - ${c}) ÷ ${d}`,
        answer: q
      };
    }
    case 5:
    default: {
      // Template 5: (A - B) / C + D
      const c = getRandomInt(2, 9);
      const q = getRandomInt(2, 10); // Q = (A - B) / C
      const diff = c * q; // diff = A - B
      const b = getRandomInt(1, 20);
      const a = b + diff;
      const d = getRandomInt(1, 20);
      
      return {
        question: `(${a} - ${b}) ÷ ${c} + ${d}`,
        answer: q + d
      };
    }
  }
};
