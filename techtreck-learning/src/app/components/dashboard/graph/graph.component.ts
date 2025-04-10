import { Component, inject, Input, OnInit } from '@angular/core';
import { Chart, registerables, TooltipItem } from 'chart.js';
import { Session } from '../../../model/session.interface';
import { WorkLogService } from '../../../service/work-log.service';

@Component({
  selector: 'app-graph',
  standalone: true,
  imports: [],
  templateUrl: './graph.component.html',
  styleUrl: './graph.component.sass',
})
export class GraphComponent implements OnInit {
  private workLogService = inject(WorkLogService);
  private workLog: Session[] = [];
  public chart: any;

  ngOnInit(): void {
    this.workLog = this.workLogService.getWorkLog;
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
        data[dateA.getDate() - 1] += session.timeWorked;
      }
    });
    return data;
  }

  createChart() {
    this.chart = new Chart('MyChart', {
      type: 'bar',
      data: {
        labels: Object.keys(this.getSortedData()).map(
          (index) => `${parseInt(index) + 1}/${new Date().getMonth() + 1}`
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
            borderWidth: 1.3,
            borderColor: 'rgba(75, 192, 192, 1)',
            hoverBackgroundColor: 'rgba(75, 124, 192, 0.2)',
            normalized: true,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          tooltip: {
            callbacks: {
              label: function (tooltipItem: TooltipItem<'bar'>) {
                const value = tooltipItem.raw as number;
                return formatMilliseconds(value);
              },
            },
          },
        },
        scales: {
          y: {
            ticks: {
              callback: function (label) {
                const value = label as number;
                return formatMilliseconds(value);
              },
            },
          },
          x: {
            ticks: {
              callback: function (label) {
                const value = label as string;
                return `${parseInt(value) + 1}`;
              },
            },
          },
        },
      },
    });
  }
}

function formatMilliseconds(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  return `0${hours}:${minutes.toString().padStart(2, '0')}`;
}
