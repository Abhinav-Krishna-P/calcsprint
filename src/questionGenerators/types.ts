export interface Question {
  question: string;
  answer: number | string;
}

export type ModeCategory = 
  | "Alphabet" 
  | "Arithmetic" 
  | "Multiplication" 
  | "Division" 
  | "Powers" 
  | "Divisibility"
  | "Algebra";

export interface ModeConfig {
  id: string;
  name: string;
  category: ModeCategory;
  description: string;
  generate: () => Question;
  inputType: "numeric" | "text";
}
