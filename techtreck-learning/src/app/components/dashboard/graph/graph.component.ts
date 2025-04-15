import {
  Component,
  inject,
  OnInit,
  AfterViewInit,
  HostListener,
  OnDestroy,
} from '@angular/core';
import { Chart, registerables, TooltipItem } from 'chart.js';
import { Session } from '../../../model/session.interface';
import { WorkLogService } from '../../../service/work-log.service';
import { formatMilliseconds } from '../../../shared/utils/time.utils';

@Component({
  selector: 'app-graph',
  standalone: true,
  imports: [],
  templateUrl: './graph.component.html',
  styleUrl: './graph.component.sass',
})
export class GraphComponent implements OnInit, AfterViewInit, OnDestroy {
  private workLogService = inject(WorkLogService);
  private workLog: Session[] = [];
  public chart: any;
  private monthOffset = 0;

  ngOnInit(): void {
    this.workLog = this.workLogService.getWorkLog;
    Chart.register(...registerables);
  }

  ngAfterViewInit(): void {
    this.createChart();
  }

  @HostListener('window:resize')
  onResize() {
    if (this.chart) {
      this.chart.resize();
    }
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  private getTargetDate(): Date {
    const date = new Date();
    date.setMonth(date.getMonth() + this.monthOffset);
    return date;
  }

  private getSortedData() {
    var data: number[] = [];
    const targetDate = this.getTargetDate();
    const daysInMonth = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth() + 1,
      0
    ).getDate();
    for (let index = 1; index <= daysInMonth; index++) data.push(0);

    this.workLog.forEach((session) => {
      const dateA = new Date(session.date);
      if (
        dateA.getMonth() === targetDate.getMonth() &&
        dateA.getFullYear() === targetDate.getFullYear()
      ) {
        data[dateA.getDate() - 1] += session.timeWorked;
      }
    });
    return data;
  }

  public nextMonth() {
    this.monthOffset++;
    this.updateChart();
  }

  public previousMonth() {
    this.monthOffset--;
    this.updateChart();
  }

  public get disabledNext(): boolean {
    const today = new Date();
    const targetDate = this.getTargetDate();

    return (
      targetDate.getMonth() === today.getMonth() &&
      targetDate.getFullYear() === today.getFullYear()
    );
  }

  private updateChart() {
    if (this.chart) {
      const targetDate = this.getTargetDate();
      this.chart.data.labels = Object.keys(this.getSortedData()).map(
        (index) => `${parseInt(index) + 1}/${targetDate.getMonth() + 1}`
      );
      this.chart.data.datasets[0].label = `Time Worked ${targetDate.toLocaleString(
        'default',
        {
          month: 'long',
          year: 'numeric',
        }
      )}`;
      this.chart.data.datasets[0].data = this.getSortedData();
      this.chart.update();
    }
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
              year: 'numeric',
            })}`,
            data: this.getSortedData(),
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
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
