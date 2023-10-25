import { DestroyRef, Injectable, inject } from '@angular/core';
import { BehaviorSubject, Subject, from, takeUntil } from 'rxjs';
import { interpret, AnyStateMachine, StateFrom, State, InterpreterFrom } from 'xstate';
import { RestParams, UseMachineReturn } from './types';

@Injectable()
export class XStateService {
  destroyRef = inject(DestroyRef);

  useMachine<TMachine extends AnyStateMachine>(machine: TMachine, ...[options = {}]: RestParams<TMachine>): UseMachineReturn<TMachine> {
    const { context, guards, actions, activities, services, delays, state: rehydratedState, ...interpreterOptions } = options;
    const machineConfig = {
      context,
      guards,
      actions,
      activities,
      services,
      delays,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const _machine = machine.withConfig(machineConfig as any, () => ({
      ...machine.context,
      ...context,
    }));

    // Initialize the stateSubject with machine initial state
    const initialState = rehydratedState ? new State(rehydratedState) : _machine.initialState;
    const stateSubject = new BehaviorSubject(initialState as StateFrom<TMachine>);

    // Interpret the service
    const service = interpret(_machine, interpreterOptions) as InterpreterFrom<TMachine>;

    // Handle done and destroy events
    const destroyed = new Subject<void>();
    this.destroyRef.onDestroy(() => {
      destroyed.next();
      destroyed.complete();
    });

    service.onDone(() => {
      destroyed.next();
      destroyed.complete();
    });

    // send state updates to the subject
    from(service)
      .pipe(takeUntil(destroyed))
      .subscribe((state) => {
        if (state.changed) {
          stateSubject.next(state as StateFrom<TMachine>);
        }
      });

    // Start the service
    service.start(rehydratedState ? initialState : undefined);

    // Return the state$, send and stop functions
    return {
      state$: stateSubject.asObservable(),
      send: service.send,
      service,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
  }
}
