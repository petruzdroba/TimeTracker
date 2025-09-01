import { computed, Injectable, signal } from "@angular/core";
import { FAQ_GRAPH } from "../data/faq-graph.data";
import { FaqNode } from "../model/faq-node.interface";

@Injectable({
  providedIn: 'root'
})
export class ChatbotService{
  private currentNodeId = signal<string>('0');
  private history: string[] = [];

  readonly currentNode = computed(() => FAQ_GRAPH[this.currentNodeId()]);

  readonly availableChoices = computed(() => {
    const node = this.currentNode();
    if (node.children.length > 0) {
      return node.children.map(id => FAQ_GRAPH[id]);
    }
    // leaf - show siblings of current node
    const parent = this.getParentNode(this.currentNodeId());
    return parent ? parent.children.map(id => FAQ_GRAPH[id]) : [];
  });

  selectNode(nodeId: string) {
    this.history.push(this.currentNodeId());
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
    this.currentNodeId.set('0');
  }

  private getParentNode(childId: string): FaqNode | null {
    return Object.values(FAQ_GRAPH).find(n => n.children.includes(childId)) || null;
  }
}
