import { Component, inject } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgxXStateModule, XStateService } from 'ngx-xstate';
import { CommonModule } from '@angular/common';
import { dataListMachine } from './data-list.machine';

@Component({
  standalone: true,
  imports: [CommonModule, HttpClientModule, NgxXStateModule],
  selector: 'example-data-list',
  templateUrl: './data-list.component.html',
})
export class DataListComponent {
  http = inject(HttpClient);

  actor = inject(XStateService).useMachine<typeof dataListMachine>(dataListMachine, {
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
