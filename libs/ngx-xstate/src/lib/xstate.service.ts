import { DestroyRef, Injectable, inject } from '@angular/core';
import { BehaviorSubject, Subject, from, takeUntil } from 'rxjs';
import { interpret, AnyStateMachine, StateFrom, State, InterpreterFrom } from 'xstate';
import { NgxXStateModule } from './ngx-xstate.module';
import { RestParams, UseMachineReturn } from './types';

@Injectable({
  providedIn: NgxXStateModule,
})
export class XStateService<TMachine extends AnyStateMachine> {
  private service!: InterpreterFrom<TMachine>;
  private stateSubject!: BehaviorSubject<StateFrom<TMachine>>;
  destroyRef = inject(DestroyRef);

  useMachine(machine: TMachine, ...[options = {}]: RestParams<TMachine>): UseMachineReturn<TMachine> {
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
    this.stateSubject = new BehaviorSubject(initialState as StateFrom<TMachine>);

    // Interpret the service
    this.service = interpret(_machine, interpreterOptions) as InterpreterFrom<TMachine>;

    // send state updates to the subject
    const destroyed = new Subject<void>();
    this.destroyRef.onDestroy(() => {
      destroyed.next();
      destroyed.complete();
    });

    from(this.service)
      .pipe(takeUntil(destroyed))
      .subscribe((state) => {
        if (state.changed) {
          this.stateSubject.next(state as StateFrom<TMachine>);
        }
      });

    // Start the service
    this.service.start(rehydratedState ? initialState : undefined);

    // Return the state$, send and stop functions
    return {
      state$: this.stateSubject.asObservable(),
      send: this.service!.send,
      service: this.service,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
  }
}
