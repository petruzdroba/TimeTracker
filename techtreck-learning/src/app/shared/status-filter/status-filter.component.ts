import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { StatusFilter } from '../../model/status-filter.interface';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

@Component({
  selector: 'app-status-filter',
  standalone: true,
  imports: [FormsModule, MatButtonToggleModule],
  templateUrl: './status-filter.component.html',
  styleUrl: './status-filter.component.sass',
})
export class StatusFilterComponent implements OnChanges {
  @Input() omitted?: StatusFilter[];
  @Output() statusFilter = new EventEmitter<StatusFilter>();
  protected status: StatusFilter = { status: 'all' };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['status']) {
      this.status = changes['status'].currentValue;
      this.emitter();
    }
  }

  protected isOmitted(value: StatusFilter): boolean {
    if (!this.omitted) return false;
    return this.omitted.some((status) => status.status === value.status);
  }

  emitter() {
    this.statusFilter.emit(this.status);
  }
}
