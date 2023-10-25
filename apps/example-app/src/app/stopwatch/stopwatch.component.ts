import { Component, inject } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { NgxXStateModule, XStateService } from 'ngx-xstate';
import { CommonModule } from '@angular/common';
import { stopwatchMachine } from './stopwatch.machine';

@Component({
  standalone: true,
  imports: [CommonModule, HttpClientModule, NgxXStateModule],
  selector: 'example-stopwatch',
  templateUrl: './stopwatch.component.html',
})
export class StopwatchComponent {
  actor = inject(XStateService).useMachine<typeof stopwatchMachine>(stopwatchMachine, {
    devTools: true,
  });
}
