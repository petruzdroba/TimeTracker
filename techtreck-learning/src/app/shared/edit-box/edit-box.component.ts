import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-box',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatIconModule],
  templateUrl: './edit-box.component.html',
  styleUrls: ['./edit-box.component.css'],
})
export class EditBoxComponent {
  @Input({ required: true }) isOpen!: boolean;
  @Input({ required: true }) title!: string;
  @Output() close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }
}
