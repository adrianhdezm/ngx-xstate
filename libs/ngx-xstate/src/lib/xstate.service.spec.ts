import { TestBed } from '@angular/core/testing';
import { XStateService } from './xstate.service';
import { createMachine } from 'xstate';

const testMachine = createMachine({
  id: 'testMachine',
  predictableActionArguments: true,
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
      type: 'final',
    },
  },
});

describe('XStateService', () => {
  let service: XStateService<typeof testMachine>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [XStateService],
    });
    service = TestBed.inject(XStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should interpret the machine and provide state updates', (done) => {
    // Use the machine with the service
    const { state$, send, service: actor } = service.useMachine(testMachine);

    // Subscribe to state updates and check the transitions
    state$.subscribe((state) => {
      if (state.matches('idle')) {
        send({ type: 'START' });
      } else if (state.matches('running')) {
        send({ type: 'STOP' });
      } else if (state.matches('stopped')) {
        actor.stop();
        done();
      }
    });
  });
});
