import { Component, inject } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgxXstateModule, XStateService } from 'ngx-xstate';
import { dataMachine } from './app.machine';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule, HttpClientModule, NgxXstateModule],
  selector: 'ngx-xstate-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  http = inject(HttpClient);

  actor = inject(XStateService).useMachine<typeof dataMachine>(dataMachine, {
    services: {
      fetchData: () => (send) => {
        this.http.get<Record<string, string>[]>('https://jsonplaceholder.typicode.com/posts').subscribe((data) => {
          return send({
            type: 'LOADED',
            data,
          });
        });
      },
    },
    devTools: true,
  });
}
