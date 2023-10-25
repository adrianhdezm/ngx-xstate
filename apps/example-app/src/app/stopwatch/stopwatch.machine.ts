import { createMachine } from 'xstate';

type StopwatchMachineEvent = { type: 'START' } | { type: 'STOP' };

export const stopwatchMachine = createMachine({
  id: 'stopwatchMachine',
  predictableActionArguments: true,
  schema: {
    context: {} as Record<string, unknown>,
    events: {} as StopwatchMachineEvent,
  },
  initial: 'idle',
  states: {
    idle: {
      on: {
        START: 'running',
      },
    },
    running: {
      on: {
        STOP: 'stopped',
      },
    },
    stopped: {
      on: {
        START: 'running',
      },
    },
  },
});
