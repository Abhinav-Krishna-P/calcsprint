import type { ModeConfig } from "./types";
import { generateLetterToNumber, generateMirrorLetter } from "./alphabet";
import { generate1DigitAddSub, generate2DigitAddSub, generate3Digit2DigitAddSub, generateAddSubSequence } from "./arithmetic";
import { generate1DigitMult, generate2DigitMult, generate3DigitMult } from "./multiplication";
import { generate2DigitDiv1Digit, generate4DigitDiv2Digit } from "./division";
import { 
  generateSquare1Digit, 
  generateSquare2Digit, 
  generateSquare3Digit, 
  generateCube1Digit, 
  generateCube2Digit, 
  generateCube3Digit,
  generateSqrt2Digit,
  generateSqrt3Digit,
  generateSqrt4Digit,
  generateSqrt5Digit
} from "./powers";
import { generateDivisibility } from "./divisibility";

export * from "./types";

export const GAME_MODES: ModeConfig[] = [
  // A. Alphabet Modes
  {
    id: "letter_to_num",
    name: "Letter → Number",
    category: "Alphabet",
    description: "Identify the numeric position of letters A–Z (A=1 ... Z=26).",
    generate: generateLetterToNumber,
    inputType: "numeric"
  },
  {
    id: "mirror_letter",
    name: "Mirror Letter",
    category: "Alphabet",
    description: "Identify the mirror letter of A–Z (A↔Z, B↔Y, C↔X, etc.).",
    generate: generateMirrorLetter,
    inputType: "text"
  },

  // B. Addition / Subtraction
  {
    id: "1_digit_add_sub",
    name: "1-Digit Add / Sub",
    category: "Arithmetic",
    description: "Mixed addition and subtraction of single-digit numbers.",
    generate: generate1DigitAddSub,
    inputType: "numeric"
  },
  {
    id: "2_digit_add_sub",
    name: "2-Digit Add / Sub",
    category: "Arithmetic",
    description: "Mixed addition and subtraction of two-digit numbers.",
    generate: generate2DigitAddSub,
    inputType: "numeric"
  },
  {
    id: "3_digit_2_digit_add_sub",
    name: "3-Digit & 2-Digit Add / Sub",
    category: "Arithmetic",
    description: "Addition and subtraction mixing 3-digit and 2-digit numbers.",
    generate: generate3Digit2DigitAddSub,
    inputType: "numeric"
  },
  {
    id: "add_sub_sequence",
    name: "Add & Sub Sequence",
    category: "Arithmetic",
    description: "Calculate sequences of 3 to 5 numbers with addition and subtraction.",
    generate: generateAddSubSequence,
    inputType: "numeric"
  },

  // C. Multiplication
  {
    id: "1_digit_mult",
    name: "1-Digit Multiplication",
    category: "Multiplication",
    description: "Multiply two single-digit numbers (1x1).",
    generate: generate1DigitMult,
    inputType: "numeric"
  },
  {
    id: "2_digit_mult",
    name: "2-Digit Multiplication",
    category: "Multiplication",
    description: "Multiply two double-digit numbers (2x2).",
    generate: generate2DigitMult,
    inputType: "numeric"
  },
  {
    id: "3_digit_mult",
    name: "3-Digit Multiplication",
    category: "Multiplication",
    description: "Multiply two triple-digit numbers (3x3).",
    generate: generate3DigitMult,
    inputType: "numeric"
  },

  // D. Division
  {
    id: "2_digit_div_1_digit",
    name: "2-Digit ÷ 1-Digit",
    category: "Division",
    description: "Exact division of a 2-digit number by a 1-digit number.",
    generate: generate2DigitDiv1Digit,
    inputType: "numeric"
  },
  {
    id: "4_digit_div_2_digit",
    name: "4-Digit ÷ 2-Digit",
    category: "Division",
    description: "Exact division of a 4-digit number by a 2-digit number.",
    generate: generate4DigitDiv2Digit,
    inputType: "numeric"
  },

  // E. Squares
  {
    id: "square_1_digit",
    name: "Square of 1-Digit",
    category: "Powers",
    description: "Calculate the square of a single-digit number.",
    generate: generateSquare1Digit,
    inputType: "numeric"
  },
  {
    id: "square_2_digit",
    name: "Square of 2-Digit",
    category: "Powers",
    description: "Calculate the square of a two-digit number.",
    generate: generateSquare2Digit,
    inputType: "numeric"
  },
  {
    id: "square_3_digit",
    name: "Square of 3-Digit",
    category: "Powers",
    description: "Calculate the square of a three-digit number.",
    generate: generateSquare3Digit,
    inputType: "numeric"
  },

  // F. Cubes
  {
    id: "cube_1_digit",
    name: "Cube of 1-Digit",
    category: "Powers",
    description: "Calculate the cube of a single-digit number.",
    generate: generateCube1Digit,
    inputType: "numeric"
  },
  {
    id: "cube_2_digit",
    name: "Cube of 2-Digit",
    category: "Powers",
    description: "Calculate the cube of a two-digit number.",
    generate: generateCube2Digit,
    inputType: "numeric"
  },
  {
    id: "cube_3_digit",
    name: "Cube of 3-Digit",
    category: "Powers",
    description: "Calculate the cube of a three-digit number.",
    generate: generateCube3Digit,
    inputType: "numeric"
  },

  // G. Square Roots
  {
    id: "sqrt_2_digit",
    name: "Square Root of 2-Digit Square",
    category: "Powers",
    description: "Find the square root of a 2-digit perfect square.",
    generate: generateSqrt2Digit,
    inputType: "numeric"
  },
  {
    id: "sqrt_3_digit",
    name: "Square Root of 3-Digit Square",
    category: "Powers",
    description: "Find the square root of a 3-digit perfect square.",
    generate: generateSqrt3Digit,
    inputType: "numeric"
  },
  {
    id: "sqrt_4_digit",
    name: "Square Root of 4-Digit Square",
    category: "Powers",
    description: "Find the square root of a 4-digit perfect square.",
    generate: generateSqrt4Digit,
    inputType: "numeric"
  },
  {
    id: "sqrt_5_digit",
    name: "Square Root of 5-Digit Square",
    category: "Powers",
    description: "Find the square root of a 5-digit perfect square.",
    generate: generateSqrt5Digit,
    inputType: "numeric"
  },

  // H. Divisibility
  {
    id: "divisibility",
    name: "Divisibility Questions",
    category: "Divisibility",
    description: "Answer Yes/No whether a number is divisible by a given divisor.",
    generate: generateDivisibility,
    inputType: "text"
  }
];

export const getModeById = (id: string): ModeConfig | undefined => {
  return GAME_MODES.find(m => m.id === id);
};
