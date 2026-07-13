import type { Question } from "./types";

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const generateQuadraticQuestion = (): Question => {
  let p = 0;
  let q = 0;
  
  // Get two non-zero roots between -10 and 10
  while (p === 0) p = getRandomInt(-10, 10);
  while (q === 0) q = getRandomInt(-10, 10);

  const B = -(p + q);
  const C = p * q;

  let bStr = "";
  if (B > 0) {
    bStr = B === 1 ? " + x" : ` + ${B}x`;
  } else if (B < 0) {
    bStr = B === -1 ? " - x" : ` - ${Math.abs(B)}x`;
  }

  let cStr = "";
  if (C > 0) {
    cStr = ` + ${C}`;
  } else if (C < 0) {
    cStr = ` - ${Math.abs(C)}`;
  }

  const questionText = `x²${bStr}${cStr} = 0`;
  
  // Format the canonical answer sorted
  const roots = [p, q].sort((a, b) => a - b);
  const answerText = roots[0] === roots[1] ? `${roots[0]}` : `${roots[0]}, ${roots[1]}`;

  return {
    question: questionText,
    answer: answerText
  };
};
