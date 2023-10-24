import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { interpret, AnyStateMachine, StateFrom, State } from 'xstate';
import { NgxXStateModule } from './ngx-xstate.module';
import { RestParams, UseMachineReturn } from './types';

@Injectable({
  providedIn: NgxXStateModule,
})
export class XStateService {
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
    const _stateSubject = new BehaviorSubject<StateFrom<TMachine>>(initialState as StateFrom<TMachine>);
    const state$ = _stateSubject.asObservable();

    // Interpret the service and send state updates to the subject
    const service = interpret(_machine, interpreterOptions)
      .onTransition((state) => {
        if (state.changed) {
          _stateSubject.next(state as StateFrom<TMachine>);
        }
      })
      .start(rehydratedState ? new State(rehydratedState) : undefined);

    // Return the state$, send and stop functions
    return {
      state$,
      send: service.send,
      service,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
  }
}
