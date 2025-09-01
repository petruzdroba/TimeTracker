import { TestBed } from '@angular/core/testing';
import { ChatbotService } from './chatbot.service';
import { FAQ_GRAPH } from '../data/faq-graph.data';

describe('ChatbotService', () => {
  let service: ChatbotService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChatbotService]
    });
    service = TestBed.inject(ChatbotService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with root node (id: 0)', () => {
    expect(service.currentNode()).toBe(FAQ_GRAPH['0']);
  });

  it('should show children of current node as available choices', () => {
    // Root node should show its children
    const rootChoices = service.availableChoices();
    expect(rootChoices.length).toBe(FAQ_GRAPH['0'].children.length);
    expect(rootChoices).toEqual(FAQ_GRAPH['0'].children.map(id => FAQ_GRAPH[id]));
  });

  it('should navigate to selected node', () => {
    service.selectNode('1');
    expect(service.currentNode()).toBe(FAQ_GRAPH['1']);
  });

  it('should show siblings as choices when at leaf node', () => {
    // Navigate to a leaf node (node 11)
    service.selectNode('1');
    service.selectNode('11');

    const choices = service.availableChoices();
    const parent = FAQ_GRAPH['1'];
    expect(choices).toEqual(parent.children.map(id => FAQ_GRAPH[id]));
  });

  it('should maintain navigation history', () => {
    service.selectNode('1');
    service.selectNode('11');
    service.goBack();
    expect(service.currentNode()).toBe(FAQ_GRAPH['1']);
    service.goBack();
    expect(service.currentNode()).toBe(FAQ_GRAPH['0']);
  });

  it('should reset to root node when going back from root', () => {
    service.selectNode('1');
    service.goBack();
    service.goBack(); // Already at root, should stay at root
    expect(service.currentNode()).toBe(FAQ_GRAPH['0']);
  });

  it('should reset navigation to root node', () => {
    service.selectNode('1');
    service.selectNode('11');
    service.reset();
    expect(service.currentNode()).toBe(FAQ_GRAPH['0']);
  });
});
