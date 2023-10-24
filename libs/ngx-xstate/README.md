# ngx-xstate

This package contains utilities for using [XState](https://github.com/statelyai/xstate) with [Angular](https://github.com/angular/angular/).

## Requisites

- `ngx-xstate` requires Angular 15+. All tests were carried out using the standalone components approach. You can use Nx Angular Standalone Project or Angular CLI.

## Installation

To get started with `ngx-xstate`, simply install the library using NPM:

```bash
npm i xstate ngx-xstate
```

## Usage

To use `ngx-xstate` , create a new component inside your angular project. Create a statechart using the `createMachine` API and add it to your component using `inject(XStateService)`. For example:

```ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgxXstateModule, XStateService } from 'ngx-xstate';
import { createMachine } from 'xstate';

interface DataMachineContext {
  data: Record<string, unknown>[];
  error: Error | null;
}

type DataMachineEvent =
  | { type: 'FETCH' }
  | { type: 'RETRY' }
  | { type: 'LOADED'; data: Record<string, unknown>[] }
  | { type: 'ERROR'; message: string };

export const dataMachine = createMachine({
  id: 'dataMachine',
  predictableActionArguments: true,
  schema: {
    context: {} as DataMachineContext,
    events: {} as DataMachineEvent,
  },
  initial: 'idle',
  context: {
    data: [],
    error: null,
  },
  states: {
    idle: { on: { FETCH: 'loading' } },
    loading: {
      invoke: {
        src: 'fetchData',
        onError: {
          target: 'failure',
          actions: assign({
            error: (_, event) => new Error(event.data),
          }),
        },
      },
      on: {
        LOADED: {
          target: 'success',
          actions: [
            assign({
              data: (_, event) => event.data,
            }),
          ],
        },
      },
    },
    success: {},
    failure: { on: { RETRY: 'loading' } },
  },
});

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
```

## Contributing

If you're interested in contributing to `ngx-xstate`, please feel free to submit a pull request or open an issue on GitHub. We welcome all contributions and feedback!

## License

`ngx-xstate` is licensed under the MIT license. See the LICENSE file for more information.
