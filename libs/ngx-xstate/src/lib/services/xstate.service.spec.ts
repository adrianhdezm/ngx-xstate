import { TestBed } from '@angular/core/testing';
import { XStateService } from './xstate.service';
import { StateFrom, createMachine } from 'xstate';

describe('XStateService', () => {
  let service: XStateService;

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

    // Use the machine with the service
    const { state$, send, stop } = service.useMachine<typeof testMachine>(testMachine);

    // Subscribe to state updates and check the transitions
    state$.subscribe((state) => {
      if (state.matches('idle')) {
        send({ type: 'START' });
      } else if (state.matches('running')) {
        send({ type: 'STOP' });
      } else if (state.matches('stopped')) {
        stop();
        done();
      }
    });
  });
});
