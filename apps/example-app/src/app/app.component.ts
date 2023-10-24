import { Component, inject } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgxXStateModule, XStateService } from 'ngx-xstate';
import { dataMachine } from './app.machine';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule, HttpClientModule, NgxXStateModule],
  selector: 'ngx-xstate-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  http = inject(HttpClient);

  actor = inject(XStateService<typeof dataMachine>).useMachine(dataMachine, {
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
