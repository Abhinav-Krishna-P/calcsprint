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

// Add & Sub Sequence mode generator (3 to 5 numbers with + and -)
export const generateAddSubSequence = (): Question => {
  let questionStr = "";
  let answer = 0;

  while (true) {
    const count = getRandomInt(3, 5); // 3 to 5 numbers
    const numbers: number[] = [];
    const operators: string[] = [];

    for (let i = 0; i < count; i++) {
      const is2Digit = Math.random() > 0.3;
      numbers.push(is2Digit ? getRandomInt(10, 99) : getRandomInt(1, 9));
    }

    for (let i = 0; i < count - 1; i++) {
      operators.push(Math.random() > 0.5 ? "+" : "-");
    }

    let currentAnswer = numbers[0];
    let tempStr = `${numbers[0]}`;

    for (let i = 0; i < count - 1; i++) {
      const op = operators[i];
      const num = numbers[i + 1];
      tempStr += ` ${op} ${num}`;
      if (op === "+") {
        currentAnswer += num;
      } else {
        currentAnswer -= num;
      }
    }

    if (currentAnswer >= 0) {
      questionStr = tempStr;
      answer = currentAnswer;
      break;
    }
  }

  return {
    question: questionStr,
    answer: answer
  };
};

