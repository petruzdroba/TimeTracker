import { Component, Input, OnInit } from '@angular/core';

interface Session {
  date: Date;
  timeWorked: number;
}
@Component({
  selector: 'app-work-log',
  standalone: true,
  imports: [],
  templateUrl: './work-log.component.html',
  styleUrl: './work-log.component.sass',
})
export class WorkLogComponent implements OnInit {
  @Input({ required: true }) workLog!: Session[];

  ngOnInit(): void {}
}
