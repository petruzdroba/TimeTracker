import { Component, ElementRef, EventEmitter, inject, Input, OnInit, Output, ViewChild, AfterViewChecked } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ChatbotService } from '../../service/chatbot.service';
import { FaqNode } from '../../model/faq-node.interface';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatTooltipModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css'],
})
export class ChatbotComponent implements OnInit, AfterViewChecked {
  @Output() close = new EventEmitter<void>();
  @Input() isPopup = false;
  @ViewChild('messageContainer') private messageContainer!: ElementRef;
  private shouldScroll = true;

  protected chatbot = inject(ChatbotService);
  history: string[] = [];
  protected messageForm: FormGroup;

  constructor(
    private fb: FormBuilder
  ) {
    this.messageForm = this.fb.group({
      message: ['']
    });
  }

  ngOnInit(): void {
    this.history.push(this.chatbot.currentNode().question);
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
    }
  }

  private scrollToBottom(): void {
    try {
      const element = this.messageContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    } catch (err) { }
  }

   choices(): FaqNode[] {
    return this.chatbot.availableChoices();
  }

  select(choice: FaqNode) {
    this.history.push(choice.question);

    this.chatbot.selectNode(choice.id);

    const answer = this.chatbot.currentNode().answer;
    if (answer) this.history.push(answer);
    this.shouldScroll = true;
  }


  reset() {
    this.history = [];
    this.chatbot.reset();
    this.shouldScroll = true;
  }

  onScroll(event: any): void {
    const element = this.messageContainer.nativeElement;
    const atBottom = element.scrollHeight - element.scrollTop === element.clientHeight;
    this.shouldScroll = atBottom;
  }

  onSubmit(): void {
    if (this.messageForm.valid && this.messageForm.value.message.trim()) {
      const userMessage = this.messageForm.value.message.trim();
      this.history.push(userMessage);

      const closestFaq = this.chatbot.findClosestFaq(userMessage);
      console.log('User message:', userMessage);
      console.log('Found FAQ:', closestFaq);

      if (closestFaq) {
        this.history.push(closestFaq.answer || "Error: No answer available.");
      } else {
        // Handle case when no matching FAQ is found
        this.history.push("I'm sorry, I don't understand that question. Please try rephrasing or select from the available options.");
      }

      this.messageForm.reset();
      this.shouldScroll = true;
    }
  }

  closeHelpWindow(){
    this.close.emit();
  }
}
