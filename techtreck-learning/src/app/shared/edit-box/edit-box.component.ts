import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-edit-box',
  standalone: true,
  imports: [],
  templateUrl: './edit-box.component.html',
  styleUrl: './edit-box.component.css',
})
export class EditBoxComponent {
  @Input({ required: true }) isOpen!: boolean;
  @Input({ required: true }) title!: string;
  @Output() close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }
}
