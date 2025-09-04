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
      answer: 'Root Answer',
      children: ['1', '2'],
    },
    '1': {
      id: '1',
      question: 'Child Question 1',
      answer: 'Answer 1',
      children: [],
    },
    '2': {
      id: '2',
      question: 'Child Question 2',
      answer: 'Answer 2',
      children: [],
    }
  };

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('ChatbotService', [
      'currentNode',
      'availableChoices',
      'selectNode',
      'reset',
      'findClosestFaq'
    ]);
    spy.currentNode.and.returnValue(mockFaqGraph['0']);
    spy.availableChoices.and.returnValue([mockFaqGraph['1'], mockFaqGraph['2']]);
    spy.findClosestFaq.and.returnValue(null);

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

  // ------------------- Basic Component Tests -------------------

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
        scrollHeight: 100,
        clientHeight: 100
      }
    };

    component['messageContainer'] = mockElementRef as ElementRef;
    component['shouldScroll'] = true;
    component['scrollToBottom']();

    expect(mockElementRef.nativeElement.scrollTop)
      .toBe(mockElementRef.nativeElement.scrollHeight);
  });

  // ------------------- Input Form Tests -------------------

  describe('Input form (messageForm)', () => {

    it('should toggle the input form visibility via toggleInput()', () => {
      const formBefore = fixture.nativeElement.querySelector('form');
      expect(formBefore).toBeNull();

      component.toggleInput();
      fixture.detectChanges();
      const formAfter = fixture.nativeElement.querySelector('form');
      expect(formAfter).toBeTruthy();

      component.toggleInput();
      fixture.detectChanges();
      const formFinal = fixture.nativeElement.querySelector('form');
      expect(formFinal).toBeNull();
    });

    it('should render input and submit button when toggled', () => {
      component.toggleInput();
      fixture.detectChanges();

      const inputEl = fixture.nativeElement.querySelector('input[formControlName="message"]');
      expect(inputEl).toBeTruthy();

      const buttonEl = fixture.nativeElement.querySelector('button[type="submit"]');
      expect(buttonEl).toBeTruthy();
    });

    it('should disable submit button when input is empty', () => {
      component.toggleInput();
      fixture.detectChanges();

      const buttonEl: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');
      expect(buttonEl.disabled).toBeTrue();
    });

    it('should enable submit button when input has text', () => {
      component.toggleInput();
      fixture.detectChanges();

      const inputEl: HTMLInputElement = fixture.nativeElement.querySelector('input[formControlName="message"]');
      inputEl.value = 'Hello';
      inputEl.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const buttonEl: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');
      expect(buttonEl.disabled).toBeFalse();
    });

    it('should call findClosestFaq and update history on submit', () => {
      component.toggleInput();
      fixture.detectChanges();

      const faqNode = { id: '1', question: 'Q1', answer: 'A1', children: [] };
      chatbotService.findClosestFaq.and.returnValue(faqNode);

      const inputEl: HTMLInputElement = fixture.nativeElement.querySelector('input[formControlName="message"]');
      inputEl.value = 'Q1';
      inputEl.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const form: HTMLFormElement = fixture.nativeElement.querySelector('form');
      form.dispatchEvent(new Event('submit'));
      fixture.detectChanges();

      expect(chatbotService.findClosestFaq).toHaveBeenCalledWith('Q1');
      expect(component.history).toContain('Q1');
      expect(component.history).toContain('A1');
    });

    it('should show fallback message when findClosestFaq returns null', () => {
      component.toggleInput();
      fixture.detectChanges();

      chatbotService.findClosestFaq.and.returnValue(null);

      const inputEl: HTMLInputElement = fixture.nativeElement.querySelector('input[formControlName="message"]');
      inputEl.value = 'Unknown question';
      inputEl.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const form: HTMLFormElement = fixture.nativeElement.querySelector('form');
      form.dispatchEvent(new Event('submit'));
      fixture.detectChanges();

      expect(component.history).toContain(
        "I'm sorry, I don't understand that question. Please try rephrasing or select from the available options."
      );
    });

    it('should reset the form after submit', () => {
      component.toggleInput();
      fixture.detectChanges();

      const inputEl: HTMLInputElement = fixture.nativeElement.querySelector('input[formControlName="message"]');
      inputEl.value = 'Test';
      inputEl.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const form: HTMLFormElement = fixture.nativeElement.querySelector('form');
      form.dispatchEvent(new Event('submit'));
      fixture.detectChanges();

      expect(inputEl.value).toBe('');
    });

  });

});
