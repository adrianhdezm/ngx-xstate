import { createMachine, assign } from 'xstate';

interface DataListMachineContext {
  data: Record<string, unknown>[];
  error: Error | null;
}

type DataListMachineEvent =
  | { type: 'FETCH' }
  | { type: 'RETRY' }
  | { type: 'LOADED'; data: Record<string, unknown>[] }
  | { type: 'ERROR'; message: string };

export const dataListMachine = createMachine(
  {
    id: 'dataListMachine',
    predictableActionArguments: true,
    schema: {
      context: {} as DataListMachineContext,
      events: {} as DataListMachineEvent,
    },
    initial: 'idle',
    context: {
      data: [],
      error: null,
    },
    states: {
      idle: {
        on: {
          FETCH: 'loading',
        },
      },
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
      success: {
        initial: 'unknown',
        states: {
          unknown: {
            always: [
              {
                target: 'withData',
                cond: 'hasData',
              },
              {
                target: 'withoutData',
              },
            ],
          },
          withData: {},
          withoutData: {},
        },
      },
      failure: {
        on: {
          RETRY: 'loading',
        },
      },
    },
  },
  {
    guards: {
      hasData: (context) => context.data.length > 0,
    },
  }
);
