import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { interpret, InterpreterFrom, AnyStateMachine, StateFrom, EventFrom, MachineOptionsFrom, InterpreterOptions } from 'xstate';
import { NgxXstateModule } from '../ngx-xstate.module';

@Injectable({
  providedIn: NgxXstateModule,
})
export class XStateService {
  useMachine<T extends AnyStateMachine>(
    machine: T,
    options?: Partial<MachineOptionsFrom<T>> & Pick<Partial<InterpreterOptions>, 'devTools'>
  ) {
    // Initialize the stateSubject with machine initial state
    const _stateSubject = new BehaviorSubject<StateFrom<T>>(machine.initialState as StateFrom<T>);
    const state$ = _stateSubject.asObservable();

    // Create local machine using the machine and options
    const { devTools, ...machineOptions } = options || {};

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const _machine = machine.withConfig({ ...machineOptions } as any);
    // Interpret the service and send state updates to the subject
    const service = (interpret(_machine, { devTools }) as InterpreterFrom<T>).onTransition((state) => {
      _stateSubject.next(state as StateFrom<T>);
    });

    // Start the service
    service.start();

    // Return the state$, send and stop functions
    return {
      state$,
      send: (event: EventFrom<T>) => service.send(event),
      stop: () => service.stop(),
    };
  }
}
