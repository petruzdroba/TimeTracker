import { TestBed } from '@angular/core/testing';
import { ChatbotService } from './chatbot.service';

describe('ChatbotService', () => {
  let service: ChatbotService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChatbotService],
    });
    service = TestBed.inject(ChatbotService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start at root node (id: 0)', () => {
    expect(service.currentNode().id).toBe('0');
  });

  it('should navigate to a child node', () => {
    service.selectNode('1');
    expect(service.currentNode().id).toBe('1');
  });

  it('should push history when navigating', () => {
    service.selectNode('1');
    service.selectNode('11');
    service.goBack();
    expect(service.currentNode().id).toBe('1');
    service.goBack();
    expect(service.currentNode().id).toBe('0');
  });

  it('should stay at root when going back from root', () => {
    service.goBack();
    expect(service.currentNode().id).toBe('0');
  });

  it('should clear history and asked questions on reset', () => {
    service.selectNode('1');
    service.selectNode('11');
    service.reset();

    expect(service.currentNode().id).toBe('0');
    service.goBack();
    expect(service.currentNode().id).toBe('0');
  });

  it('should filter out already asked questions from available choices', () => {
    service.selectNode('1');
    const firstChoices = service.availableChoices();
    const firstChoiceIds = firstChoices.map((c) => c.id);

    // select one of the children
    service.selectNode(firstChoiceIds[0]);
    const nextChoices = service.availableChoices().map((c) => c.id);

    expect(nextChoices).not.toContain(firstChoiceIds[0]);
  });

  it('should prefer children over siblings when available', () => {
    service.selectNode('3'); // parent node (children: 31, 32)
    service.selectNode('31'); // child (has child 311)

    const choices = service.availableChoices().map((c) => c.id);

    // Service should return child 311 first, not sibling 32
    expect(choices).toContain('311');
    expect(choices).not.toContain('32');
  });

  it('should fall back to root choices if all children and siblings are asked', () => {
    service.selectNode('1');
    service.selectNode('11'); // only child, now asked

    const choices = service.availableChoices().map((c) => c.id);

    // should jump back to unasked root-level ids (not include 1 anymore)
    expect(choices).toContain('2');
    expect(choices).toContain('3');
    expect(choices).not.toContain('1');
  });

  it('should not duplicate history entries when revisiting same node', () => {
    service.selectNode('1');
    service.selectNode('11');
    service.goBack(); // back to 1
    service.selectNode('11'); // go to 11 again

    // history should not blow up with duplicates
    service.goBack();
    expect(service.currentNode().id).toBe('1');
  });

  it('should allow navigating deep then fully back to root', () => {
    service.selectNode('3');
    service.selectNode('31');
    service.selectNode('311'); // deep child
    expect(service.currentNode().id).toBe('311');

    service.goBack();
    expect(service.currentNode().id).toBe('31');
    service.goBack();
    expect(service.currentNode().id).toBe('3');
    service.goBack();
    expect(service.currentNode().id).toBe('0');
  });

  describe('TestChatbotService - findClosestFaq', () => {

    it('should return null for empty input', () => {
      expect(service.findClosestFaq('')).toBeNull();
      expect(service.findClosestFaq('   ')).toBeNull();
    });

    it('should match exact question', () => {
      const node = service.findClosestFaq('Edit Time Entries');
      expect(node).toBeTruthy();
      expect(node?.id).toBe('22');
    });

    it('should match keywords', () => {
      const node = service.findClosestFaq('edit logs');
      expect(node).toBeTruthy();
      expect(node?.id).toBe('22');
    });

    it('should match longer natural input', () => {
      const node = service.findClosestFaq('how do I edit my time logs in the app?');
      expect(node).toBeTruthy();
      expect(node?.id).toBe('22');
    });

    it('should match root-level node', () => {
      const node = service.findClosestFaq('getting started guide');
      expect(node).toBeTruthy();
      expect(node?.id).toBe('0');
    });

    it('should return null for unrelated input', () => {
      expect(service.findClosestFaq('I want pizza')).toBeNull();
    });

    it('should match vacation-related keyword', () => {
      const node = service.findClosestFaq('submit vacation request');
      expect(node).toBeTruthy();
      expect(node?.id).toBe('41');
    });

    it('should handle input with stop words', () => {
      const node = service.findClosestFaq('Can you please show me the dashboard overview?');
      expect(node).toBeTruthy();
      expect(node?.id).toBe('11');
    });
  });
});
