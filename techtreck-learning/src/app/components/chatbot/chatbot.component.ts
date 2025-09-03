import { Component, ElementRef, EventEmitter, inject, Input, OnInit, Output, ViewChild, AfterViewChecked } from '@angular/core';

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
    MatTooltipModule,],
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

  closeHelpWindow(){
    this.close.emit();
  }
}
