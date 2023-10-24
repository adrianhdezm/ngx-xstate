import { Observable } from 'rxjs';
import {
  InterpreterFrom,
  AnyStateMachine,
  StateFrom,
  InterpreterOptions,
  StateConfig,
  EventObject,
  AreAllImplementationsAssumedToBeProvided,
  InternalMachineOptions,
} from 'xstate';

type Prop<T, K> = K extends keyof T ? T[K] : never;

interface UseMachineOptions<TContext extends object, TEvent extends EventObject> {
  /**
   * If provided, will be merged with machine's `context`.
   */
  context?: Partial<TContext>;
  /**
   * The state to rehydrate the machine to. The machine will
   * start at this state instead of its `initialState`.
   */
  state?: StateConfig<TContext, TEvent>;
}

export type RestParams<TMachine extends AnyStateMachine> = AreAllImplementationsAssumedToBeProvided<
  TMachine['__TResolvedTypesMeta']
> extends false
  ? [
      options: InterpreterOptions &
        UseMachineOptions<TMachine['__TContext'], TMachine['__TEvent']> &
        InternalMachineOptions<TMachine['__TContext'], TMachine['__TEvent'], TMachine['__TResolvedTypesMeta'], true>
    ]
  : [
      options?: InterpreterOptions &
        UseMachineOptions<TMachine['__TContext'], TMachine['__TEvent']> &
        InternalMachineOptions<TMachine['__TContext'], TMachine['__TEvent'], TMachine['__TResolvedTypesMeta']>
    ];

export type UseMachineReturn<TMachine extends AnyStateMachine, TInterpreter = InterpreterFrom<TMachine>> = {
  state$: Observable<StateFrom<TMachine>>;
  send: Prop<TInterpreter, 'send'>;
  service: TInterpreter;
};
