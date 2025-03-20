import { Component, Input, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { Session } from '../../../model/session.interface';

@Component({
  selector: 'app-graph',
  standalone: true,
  imports: [],
  templateUrl: './graph.component.html',
  styleUrl: './graph.component.sass',
})
export class GraphComponent implements OnInit {
  @Input({ required: true }) workLog!: Session[];
  public chart: any;

  ngOnInit(): void {
    Chart.register(...registerables);
    this.createChart();
  }

  private getSortedData() {
    var data: number[] = [];
    const today = new Date();
    const daysInMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    ).getDate();
    for (let index = 1; index <= daysInMonth; index++) data.push(0);

    this.workLog.forEach((session) => {
      const dateA = new Date(session.date);
      if (dateA.getMonth() === today.getMonth()) {
        data[dateA.getDate()] += session.timeWorked / 3600000;
      }
    });
    return data;
  }

  createChart() {
    this.chart = new Chart('MyChart', {
      type: 'bar',
      data: {
        labels: Object.keys(this.getSortedData()).map(
          (index) => parseInt(index) + 1
        ),
        datasets: [
          {
            label: `Time Worked ${new Date().toLocaleString('default', {
              month: 'long',
            })}`,
            data: this.getSortedData(),
            backgroundColor: Object.keys(this.getSortedData()).map((index) => {
              const today = new Date();
              if (today.getDate() === parseInt(index)) {
                return 'rgba(192, 137, 75, 0.2)';
              } else {
                return 'rgba(75, 192, 192, 0.2)';
              }
            }),
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1.3,
            hoverBackgroundColor: 'rgba(75, 124, 192, 0.2)',
            normalized: true,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }
}
