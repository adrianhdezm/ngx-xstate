import { DataListComponent } from './data-list/data-list.component';
import { StopwatchComponent } from './stopwatch/stopwatch.component';
import { Component } from '@angular/core';

@Component({
  standalone: true,
  imports: [StopwatchComponent, DataListComponent],
  selector: 'example-app',
  templateUrl: './app.component.html',
})
export class AppComponent {}
