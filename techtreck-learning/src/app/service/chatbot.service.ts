import { computed, Injectable, signal } from '@angular/core';
import { FAQ_GRAPH } from '../data/faq-graph.data';
import { FaqNode } from '../model/faq-node.interface';
import Fuse from 'fuse.js';

@Injectable({
  providedIn: 'root',
})
export class ChatbotService {
  private currentNodeId = signal<string>('0');
  private history: string[] = [];
  private askedQuestions = new Set<string>();

  readonly currentNode = computed(() => FAQ_GRAPH[this.currentNodeId()]);

  readonly availableChoices = computed(() => {
    const node = this.currentNode();

    // Filter out already asked questions from children
    const unaskedChildren = node.children.filter(
      (id) => !this.askedQuestions.has(id)
    );
    if (unaskedChildren.length > 0) {
      return unaskedChildren.map((id) => FAQ_GRAPH[id]);
    }

    // If all children were asked, show unasked siblings
    const parent = this.getParentNode(this.currentNodeId());
    const unaskedSiblings =
      parent?.children.filter((id) => !this.askedQuestions.has(id)) || [];
    if (unaskedSiblings.length > 0) {
      return unaskedSiblings.map((id) => FAQ_GRAPH[id]);
    }

    // If all siblings were asked, show unasked root questions
    const unaskedRootChildren = FAQ_GRAPH['0'].children.filter(
      (id) => !this.askedQuestions.has(id)
    );
    return unaskedRootChildren.map((id) => FAQ_GRAPH[id]);
  });

  selectNode(nodeId: string) {
    if (!this.history.includes(this.currentNodeId())) {
      this.history.push(this.currentNodeId());
    }

    // Mark the selected question as asked
    this.askedQuestions.add(nodeId);
    this.currentNodeId.set(nodeId);
  }

  goBack() {
    if (this.history.length > 0) {
      const prev = this.history.pop()!;
      this.currentNodeId.set(prev);
    } else {
      this.currentNodeId.set('0');
    }
  }

  reset() {
    this.history = [];
    this.askedQuestions.clear(); // Clear asked questions on reset
    this.currentNodeId.set('0');
  }

  private getParentNode(childId: string): FaqNode | null {
    return (
      Object.values(FAQ_GRAPH).find((n) => n.children.includes(childId)) || null
    );
  }

  findClosestFaq(input: string): FaqNode | null {
  if (!input?.trim()) return null;

  const STOP_WORDS = ['how','do','i','the','a','an','please','can','you','me','my','to','for'];
  const processedInput = input
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => !STOP_WORDS.includes(word))
    .join(' ');

  if (!processedInput) return null;

  const faqs = Object.values(FAQ_GRAPH);

  const fuse = new Fuse(faqs, {
    keys: ['question', 'keywords'],
    threshold: 0.5,
    // useExtendedSearch: true,
  });

  const result = fuse.search(processedInput);

  return result.length > 0 ? result[0].item : null;
}
}
