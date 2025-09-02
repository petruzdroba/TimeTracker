import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';

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
export class ChatbotComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Input() isPopup = false;
  protected chatbot = inject(ChatbotService);
  history: string[] = [];

  ngOnInit(): void {
    this.history.push(this.chatbot.currentNode().question);
  }

   choices(): FaqNode[] {
    return this.chatbot.availableChoices();
  }

  select(choice: FaqNode) {
  this.history.push(choice.question);

  this.chatbot.selectNode(choice.id);

  const answer = this.chatbot.currentNode().answer;
  if (answer) this.history.push(answer);
}


  reset() {
    this.history = [];
    this.chatbot.reset();

    this.history.push(this.chatbot.currentNode().question);
  }

  closeHelpWindow(){
    this.close.emit();
  }
}
