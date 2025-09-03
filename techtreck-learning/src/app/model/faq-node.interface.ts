export interface FaqNode{
  id: string;
  question: string;
  topic : "basic"| "timer" | "requests" | "boss";
  answer: string| null;
  children: string[];
}
