import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatbotComponent } from './chatbot.component';
import { ChatbotService } from '../../service/chatbot.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ElementRef } from '@angular/core';
import { FaqNode } from '../../model/faq-node.interface';

describe('ChatbotComponent', () => {
  let component: ChatbotComponent;
  let fixture: ComponentFixture<ChatbotComponent>;
  let chatbotService: jasmine.SpyObj<ChatbotService>;

  // Mock FAQ data
  const mockFaqGraph: Record<string, FaqNode> = {
    '0': {
      id: '0',
      question: 'Root Question',
      answer: null,
      children: ['1', '2'],
      topic: 'basic'
    },
    '1': {
      id: '1',
      question: 'Child Question 1',
      answer: 'Answer 1',
      children: [],
      topic: 'basic'
    },
    '2': {
      id: '2',
      question: 'Child Question 2',
      answer: 'Answer 2',
      children: [],
      topic: 'basic'
    }
  };

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('ChatbotService', ['currentNode', 'availableChoices', 'selectNode', 'reset']);
    spy.currentNode.and.returnValue(mockFaqGraph['0']);
    spy.availableChoices.and.returnValue([mockFaqGraph['1'], mockFaqGraph['2']]);

    await TestBed.configureTestingModule({
      imports: [
        ChatbotComponent,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: ChatbotService, useValue: spy }
      ]
    }).compileComponents();

    chatbotService = TestBed.inject(ChatbotService) as jasmine.SpyObj<ChatbotService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatbotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with root node in history', () => {
    expect(component.history.length).toBe(1);
    expect(component.history[0]).toBe(mockFaqGraph['0'].question);
  });

  it('should display available choices', () => {
    const choices = component.choices();
    expect(choices.length).toBe(2);
    expect(choices.every(choice => choice.id !== '0')).toBeTrue();
    expect(chatbotService.availableChoices).toHaveBeenCalled();
  });

  it('should handle node selection', () => {
    const selectedNode = mockFaqGraph['1'];
    const initialHistoryLength = component.history.length;

    chatbotService.currentNode.and.returnValue(selectedNode);
    component.select(selectedNode);

    expect(component.history.length).toBeGreaterThan(initialHistoryLength);
    expect(chatbotService.selectNode).toHaveBeenCalledWith(selectedNode.id);
  });

  it('should reset to initial state', () => {
    // Add some history
    const selectedNode = mockFaqGraph['1'];
    component.select(selectedNode);

    component.reset();

    expect(component.history.length).toBe(0);
    expect(chatbotService.reset).toHaveBeenCalled();
  });

  it('should emit close event', () => {
    spyOn(component.close, 'emit');
    component.closeHelpWindow();
    expect(component.close.emit).toHaveBeenCalled();
  });

  it('should handle popup mode class', () => {
    component.isPopup = true;
    fixture.detectChanges();

    const container = fixture.nativeElement.querySelector('.chat-container');
    expect(container.classList.contains('popup-mode')).toBeTrue();
  });

  it('should handle scroll behavior', () => {
    const mockElementRef = {
      nativeElement: {
        scrollTop: 0,
        scrollHeight: 100
      }
    };

    component['messageContainer'] = mockElementRef as ElementRef;
    component['shouldScroll'] = true;
    component['scrollToBottom']();

    expect(mockElementRef.nativeElement.scrollTop)
      .toBe(mockElementRef.nativeElement.scrollHeight);
  });
});
