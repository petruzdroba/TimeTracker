export interface FaqNode{
  id: string;
  question: string;
  answer: string| null;
  keywords?: string[];
  children: string[];
}
